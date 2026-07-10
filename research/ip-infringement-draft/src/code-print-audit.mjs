import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GITHUB_USER_AGENT, NEURONPEDIA_SEARCH_URL } from './constants.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, '..', 'config', 'fractiai_code_print_schema.json');

const SCHEMA_MARKERS = [
  { key: 'egs_phi', patterns: [/1\.618/, /\\phi/, /φ/, /golden ratio/i] },
  { key: 'workspace_bottleneck', patterns: [/workspace/i, /bottleneck/i, /j-space/i, /j space/i] },
  { key: 'scratchpad', patterns: [/scratchpad/i, /internal/i, /clearinghouse/i] },
  { key: 'nodal_lattice', patterns: [/nodal lattice/i, /EGS/i, /King Bee/i] },
  { key: 'mid_layer', patterns: [/mid-layer/i, /mid layer/i, /intermediate hidden/i] },
  { key: 'selectivity', patterns: [/10%/, /< 10%/, /selectiv/i] },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchRawGithub(owner, repo, branch, path) {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  const r = await fetch(url, { headers: { 'User-Agent': GITHUB_USER_AGENT } });
  if (!r.ok) return { path, ok: false, status: r.status, text: '' };
  return { path, ok: true, status: r.status, text: await r.text() };
}

function extractSchemaHits(text, path) {
  const hits = [];
  for (const marker of SCHEMA_MARKERS) {
    const matched = marker.patterns.filter((p) => p.test(text)).map((p) => p.source);
    if (matched.length) {
      hits.push({ marker: marker.key, patternHits: matched });
    }
  }
  const contractLines = text
    .split('\n')
    .filter((line) => /`[a-z_]+:`|bus_primary|telemetry_role|phi|workspace|scratchpad/i.test(line))
    .slice(0, 12)
    .map((l) => l.trim());
  return { path, markerHits: hits, contractSnippetLines: contractLines };
}

async function fetchNeuronpediaFeatures(config) {
  const np = config.neuronpediaCrosswalk;
  const body = {
    modelId: np.modelId,
    source: np.source,
    text: np.probeText,
    densityThreshold: 0.0075,
    ignoreBos: true,
    sortBy: 'frequency',
    numResults: 8,
  };
  const r = await fetch(NEURONPEDIA_SEARCH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': GITHUB_USER_AGENT },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    return { ok: false, status: r.status, error: `Neuronpedia HTTP ${r.status}` };
  }
  const data = await r.json();
  const tokens = (data.results || []).map((row) => ({
    token: row.token,
    position: row.position,
    topFeatures: (row.topFeatures || []).slice(0, 3).map((f) => ({
      featureIndex: f.featureIndex,
      activationValue: f.activationValue,
      layer: f.feature?.layer,
      sourceSetName: f.feature?.sourceSetName,
      maxActApprox: f.feature?.maxActApprox,
      topkCosSimPrimary: f.feature?.topkCosSimValues?.[0],
    })),
  }));
  return { ok: true, source: data.source, probeText: np.probeText, tokens };
}

function buildCrosswalk(config, repoExtractions, neuronpedia) {
  const fractiaiFields = Object.keys(config.workspaceTokens);
  const npFeatureCount = (neuronpedia.tokens || []).reduce(
    (n, t) => n + (t.topFeatures?.length || 0),
    0,
  );
  const repoMarkerUnion = new Set();
  for (const repo of Object.values(repoExtractions)) {
    for (const file of repo.files || []) {
      for (const hit of file.markerHits || []) repoMarkerUnion.add(hit.marker);
    }
  }
  const mapped = config.neuronpediaCrosswalk.mappedFields.map((row) => ({
    fractiaiField: row.fractiai,
    neuronpediaField: row.neuronpedia,
    repoMarkersPresent: [...repoMarkerUnion],
    structuralAlignment:
      repoMarkerUnion.has('workspace_bottleneck') && repoMarkerUnion.has('scratchpad')
        ? 'partial_public_crosswalk'
        : 'incomplete',
  }));
  const alignmentScore =
    repoMarkerUnion.size >= 4 && npFeatureCount >= 3 ? 'support' : 'weak_support';
  return {
    fractiaiTokenFields: fractiaiFields,
    neuronpediaFeatureCount: npFeatureCount,
    repoMarkerUnion: [...repoMarkerUnion],
    mappedFields: mapped,
    result: alignmentScore,
    internalTierGate: config.internalTierAccessGate,
    honesty:
      'Public code-print crosswalk only. Full token-schema identity proof requires Anthropic internal tier labels + Jacobian Lens receipts.',
  };
}

export async function runCodePrintAudit() {
  const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
  const repoExtractions = {};

  for (const [repoKey, paths] of Object.entries(config.repoSchemaPaths)) {
    const [owner, repo] = repoKey.split('/');
    repoExtractions[repoKey] = { owner, repo, files: [] };
    for (const path of paths) {
      const raw = await fetchRawGithub(owner, repo, 'main', path);
      if (raw.ok) {
        repoExtractions[repoKey].files.push(extractSchemaHits(raw.text, path));
      } else {
        repoExtractions[repoKey].files.push({ path, ok: false, status: raw.status, markerHits: [] });
      }
      await sleep(300);
    }
  }

  let neuronpedia;
  try {
    neuronpedia = await fetchNeuronpediaFeatures(config);
  } catch (e) {
    neuronpedia = { ok: false, error: String(e.message || e) };
  }

  const crosswalk = buildCrosswalk(config, repoExtractions, neuronpedia);

  return {
    recommendation: 'R1_code_print_audit',
    statement:
      'Cross-reference FractiAI sing4/sing9 token schemas against Neuronpedia published latent feature maps',
    configSchema: config.schema,
    repoExtractions,
    neuronpedia,
    crosswalk,
    result: crosswalk.result,
    dataTier: 'public_github_raw + neuronpedia_api',
    reproduce: 'npm run research:ip-infringement-draft',
  };
}
