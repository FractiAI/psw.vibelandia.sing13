#!/usr/bin/env node
/**
 * Build unified discovery catalogs for protein-folding rhyme + LLM rhyme
 * across theaters used in rhyme testing (protein, knowledge, macro, collab,
 * cosmic, genome). Discoveries are named findings — not pass/fail alone.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withLikelyFunction } from '../lib/rhyme-partner-likely-function.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function readJsonl(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

function uniqueBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const k = keyFn(x);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
}


const pilotPath = join(
  ROOT,
  'research/synthobs-pilot-rhyme-expedition/data/DISCOVERY_CATALOG.json',
);
let pilotDiscoveries = [];
if (existsSync(pilotPath)) {
  const pilot = readJson(pilotPath);
  const enrichedPilotDiscoveries = (pilot.discoveries || []).map((d) =>
    withLikelyFunction({
      ...d,
      rhyme: d.rhyme || 'pilot-rhyme',
    }),
  );
  // Keep source Pilot catalog annotated so theater exports carry likelyFunction.
  writeFileSync(
    pilotPath,
    JSON.stringify(
      {
        ...pilot,
        discoveries: enrichedPilotDiscoveries,
      },
      null,
      2,
    ),
  );
  pilotDiscoveries = enrichedPilotDiscoveries.map((d) => ({
    rhyme: 'pilot-rhyme',
    theater: d.theater,
    discoveryId: d.discoveryId,
    kind: d.kind,
    coupling: d.coupling,
    detail: d.detail,
    likelyFunction: d.likelyFunction,
    partnerAFunction: d.partnerAFunction,
    partnerBFunction: d.partnerBFunction,
    source: 'synthobs-pilot-rhyme-expedition/data/DISCOVERY_CATALOG.json',
  }));
}

const nvidia = join(ROOT, 'research/synthobs-nvidia-goldilocks-awareness-expedition/data');
const cosmicPath = join(
  ROOT,
  'research/synthobs-cosmic-rhyme-expedition/data/empirical_report.json',
);
const llmPath = join(
  ROOT,
  'research/synthobs-llm-rhyme-cosmic-genome-expedition/data/DISCOVERY_CATALOG.json',
);

const proteinFoldDiscoveries = [];

// E9 protein contacts recovered by AWARE only
{
  const rows = readJsonl(join(nvidia, 'e9_real/allam_2_7b.jsonl'));
  for (const r of rows) {
    const aware = r.arms?.AWARE?.exact === true;
    const linear = r.arms?.LINEAR?.exact === true;
    const flat = r.arms?.FLAT_MSA?.exact === true;
    if (aware && !linear && !flat) {
      proteinFoldDiscoveries.push({
        rhyme: 'protein-folding',
        theater: 'protein (E9 · PDB+Pfam)',
        discoveryId: `${r.pdb_id} contact ${r.gold}`,
        kind: 'aware_only_long_range_contact',
        detail: `PDB ${r.pdb_id} / Pfam ${r.pfam}: AWARE recovered contact ${r.gold}; LINEAR/FLAT_MSA missed`,
        source: 'e9_real/allam_2_7b.jsonl',
      });
    }
  }
}

// E10 knowledge title pairs
{
  const rows = readJsonl(join(nvidia, 'e10_e11/E10_allam_2_7b.jsonl'));
  const hits = rows.filter((r) => r.arms?.AWARE?.exact === true && !r.arms?.LINEAR?.exact);
  for (const r of uniqueBy(hits, (x) => x.gold).slice(0, 16)) {
    proteinFoldDiscoveries.push({
      rhyme: 'protein-folding',
      theater: 'knowledge (E10 · HotpotQA bridge)',
      discoveryId: r.gold,
      kind: 'aware_only_title_pair',
      detail: `AWARE recovered supporting title pair ${r.gold}`,
      source: 'e10_e11/E10_allam_2_7b.jsonl',
    });
  }
}

// E11 macro teleconnections
{
  const rows = readJsonl(join(nvidia, 'e10_e11/E11_allam_2_7b.jsonl'));
  const hits = rows.filter((r) => r.arms?.AWARE?.exact === true && !r.arms?.LINEAR?.exact);
  const counts = new Map();
  for (const r of hits) {
    counts.set(r.gold, (counts.get(r.gold) || 0) + 1);
  }
  for (const [gold, n] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
    proteinFoldDiscoveries.push({
      rhyme: 'protein-folding',
      theater: 'macro teleconnection (E11 · FRED)',
      discoveryId: gold,
      kind: 'aware_only_teleconnection',
      detail: `AWARE recovered FRED teleconnection ${gold} (${n} tasks)`,
      n,
      source: 'e10_e11/E11_allam_2_7b.jsonl',
    });
  }
}

// E12 collab synergy finding
{
  const resultsPath = join(nvidia, 'e12_collab/RESULTS.md');
  if (existsSync(resultsPath)) {
    proteinFoldDiscoveries.push({
      rhyme: 'protein-folding',
      theater: 'collaboration (E12 · HotpotQA)',
      discoveryId: 'COLLAB_AWARE title-pair synergy',
      kind: 'collab_synergy_discovery',
      detail:
        'Whole > OR of solos on title-pair recovery under COLLAB_AWARE join (see E12 RESULTS)',
      source: 'e12_collab/RESULTS.md',
    });
  }
}

// Cosmic fold motifs + residual physics
if (existsSync(cosmicPath)) {
  const cosmic = readJson(cosmicPath);
  for (const m of cosmic.summary?.motifHits || []) {
    proteinFoldDiscoveries.push({
      rhyme: 'protein-folding',
      theater: `cosmic · ${m.layer || m.domain}`,
      discoveryId: m.pair || m.signature,
      kind: 'open_motif_survivor',
      detail: m.audit || 'Open motif survivor (held-out + FDR)',
      heldOut: m.heldOutRate ?? m.held_out,
      source: 'synthobs-cosmic-rhyme-expedition/data/empirical_report.json',
    });
  }
  for (const h of cosmic.summary?.novelPhysicsHits || []) {
    proteinFoldDiscoveries.push({
      rhyme: 'protein-folding',
      theater: 'cosmic · WMAP residual (C4)',
      discoveryId: `WMAP residual lag ${h.lag}`,
      kind: 'candidate_novel_physics',
      detail: `Two-candidate residual sieve: lag ${h.lag} corr=${Number(h.corr).toFixed(3)} — candidate for new physics under protocol`,
      coupling: h.corr,
      source: 'synthobs-cosmic-rhyme-expedition/data/empirical_report.json',
    });
  }
  for (const h of cosmic.summary?.knownPhysicsHits || []) {
    const id =
      h.pair ||
      h.signature ||
      (h.lag != null ? `WMAP residual lag ${h.lag}` : null) ||
      h.id ||
      'known-residual';
    proteinFoldDiscoveries.push({
      rhyme: 'protein-folding',
      theater: `cosmic · ${h.layer || 'residual'}`,
      discoveryId: id,
      kind: 'known_physics_rediscovery',
      detail: h.note || 'Known-template rediscovery in residual search (control)',
      source: 'synthobs-cosmic-rhyme-expedition/data/empirical_report.json',
    });
  }
}

// LLM discoveries from regenerated catalog if present
let llmDiscoveries = [];
if (existsSync(llmPath)) {
  const llm = readJson(llmPath);
  llmDiscoveries = (llm.listedDiscoveries || []).map((d) => ({
    ...d,
    rhyme: 'LLM language-pack',
  }));
}

const catalog = {
  generatedAt: new Date().toISOString(),
  purpose:
    'Named discoveries from protein-folding, LLM, and Pilot rhymes across theaters — not pass/fail alone.',
  theaters: [
    'protein (E9)',
    'knowledge (E10)',
    'macro (E11)',
    'collaboration (E12)',
    'cosmic (exoplanet, NEO, OpenNGC, WMAP)',
    'genome (exon, chrM)',
  ],
  proteinFoldingRhyme: {
    n: proteinFoldDiscoveries.length,
    discoveries: proteinFoldDiscoveries.map(withLikelyFunction),
  },
  llmRhyme: {
    n: llmDiscoveries.length,
    discoveries: llmDiscoveries.map(withLikelyFunction),
  },
  pilotRhyme: {
    n: pilotDiscoveries.length,
    discoveries: pilotDiscoveries.map(withLikelyFunction),
  },
};

const outDirs = [
  join(ROOT, 'research/synthobs-llm-rhyme-cosmic-genome-expedition/data'),
  join(ROOT, 'research/synthobs-cosmic-rhyme-expedition/data'),
  join(ROOT, 'data'),
];

function toMd(cat) {
  const lines = [];
  lines.push('# Rhyme Discovery Catalog · Protein Folding + LLM + Pilot');
  lines.push('');
  lines.push(`Generated: ${cat.generatedAt}`);
  lines.push('');
  lines.push(
    'Rhymes must produce **named discoveries** with awareness — not merely pass H1/H2 tests. Catalogued by theater.',
  );
  lines.push('');
  lines.push('## Protein-folding rhyme discoveries');
  lines.push('');
  lines.push(`Count: **${cat.proteinFoldingRhyme.n}**`);
  lines.push('');
  lines.push('| Theater | Discovery | Kind | Likely function |');
  lines.push('|---|---|---|---|');
  for (const d of cat.proteinFoldingRhyme.discoveries) {
    lines.push(
      `| ${d.theater} | \`${d.discoveryId}\` | ${d.kind} | ${d.likelyFunction || ''} |`,
    );
  }
  lines.push('');
  lines.push('## LLM language-pack rhyme discoveries');
  lines.push('');
  lines.push(`Count: **${cat.llmRhyme.n}**`);
  lines.push('');
  if (!cat.llmRhyme.n) {
    lines.push('_Run `npm run research:synthobs-llm-rhyme-cosmic-genome-expedition` first._');
  } else {
    lines.push('| Theater | Discovery | Kind | Coupling | Likely function |');
    lines.push('|---|---|---|---:|---|');
    for (const d of cat.llmRhyme.discoveries.slice(0, 100)) {
      lines.push(
        `| ${d.theater} | \`${d.discoveryId}\` | ${d.kind} | ${d.coupling ?? ''} | ${d.likelyFunction || ''} |`,
      );
    }
  }
  lines.push('');
  lines.push('## Pilot rhyme discoveries');
  lines.push('');
  lines.push(`Count: **${cat.pilotRhyme?.n || 0}**`);
  lines.push('');
  if (!cat.pilotRhyme?.n) {
    lines.push('_Run `npm run research:synthobs-pilot-rhyme-expedition` first._');
  } else {
    lines.push(
      'Held-out partners recovered by Director map + Pilot local slices where flat peers (local windows only) missed.',
    );
    lines.push('');
    lines.push('| Theater | Discovery | Kind | Coupling | Likely function |');
    lines.push('|---|---|---|---:|---|');
    for (const d of cat.pilotRhyme.discoveries.slice(0, 120)) {
      lines.push(
        `| ${d.theater} | \`${d.discoveryId}\` | ${d.kind} | ${d.coupling ?? ''} | ${d.likelyFunction || ''} |`,
      );
    }
    if (cat.pilotRhyme.n > 120) {
      lines.push(`| … | +${cat.pilotRhyme.n - 120} more in JSON | | |`);
    }
  }
  lines.push('');
  lines.push('## Honesty');
  lines.push('');
  lines.push(
    'Soft Story / computational expedition catalogs. Candidate novel physics rows are candidates under nulls, not finished laws. Genome rows are public-panel demonstrations, not clinical genetics. Pilot rows are fixture coupling partners under Director/Pilot seats, not finished astrophysical or clinical discoveries. Φ_EGS is filing grammar only.',
  );
  lines.push('');
  lines.push('→ ∞^∞');
  return lines.join('\n');
}

for (const dir of outDirs) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'RHYME_DISCOVERY_CATALOG.json'), JSON.stringify(catalog, null, 2));
  writeFileSync(join(dir, 'RHYME_DISCOVERY_CATALOG.md'), toMd(catalog));
}

console.log(
  JSON.stringify(
    {
      proteinFold: catalog.proteinFoldingRhyme.n,
      llm: catalog.llmRhyme.n,
      pilot: catalog.pilotRhyme.n,
      wrote: outDirs.map((d) => join(d, 'RHYME_DISCOVERY_CATALOG.md')),
    },
    null,
    2,
  ),
);
