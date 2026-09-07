/**
 * Prime Vault Chat · protein library corpus encode
 * Recursive Seed filing: grand narrative → holographic/magnetic/Goldilocks →
 * Infinite Octaves → prime vaults → downstream scaffold.
 *
 * THIS IS NOT LLM TRAINING:
 * - Encode = deterministic markdown → prime vault atoms (filing)
 * - Training = gradient descent on billions of weights
 * $0 training · application companion · not open-world LLM parity · not wet-lab.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DEFAULT_CORPUS_SOURCE =
  'docs/SYNTHOBS_SS_VIBELANDIA_OFFICIAL_PROSPECTUS_NARRATIVE_FOUNDATION_2026-08.md';

/**
 * Recursive scaffold order — grand narrative first, then holography/magnetism/
 * Goldilocks Super-AI rhyme, Infinite Octaves, prime vaults, downstream support.
 * Each entry is one meta-protein fold of the library.
 */
export const PROTEIN_LIBRARY_MANIFEST = Object.freeze([
  {
    path: 'docs/SYNTHOBS_SS_VIBELANDIA_OFFICIAL_PROSPECTUS_NARRATIVE_FOUNDATION_2026-08.md',
    id: 'prospectus',
    metaProtein: 'voyage-grand-narrative',
    maxCells: 10,
    tags: ['voyage', 'prospectus', 'narrative'],
  },
  {
    path: 'docs/SYNTHOBS_INFINITE_OCTAVES_OMNIVERSAL_LATTICE_CHAT_2026-08.md',
    id: 'infinite-octaves-chat',
    metaProtein: 'infinite-octaves-product',
    maxCells: 8,
    tags: ['infinite-octaves', 'chat', 'product'],
  },
  {
    path: 'docs/SYNTHOBS_RECURSIVE_ATTENTION_HOLOGRAPHIC_MAGNETIC_PROJECTIONS_2026-07.md',
    id: 'holographic-magnetic',
    metaProtein: 'holographic-magnetic-super-ai',
    maxCells: 8,
    tags: ['holographic', 'magnetic', 'attention'],
  },
  {
    path: 'docs/SYNTHOBS_MAGNETISM_UNIVERSAL_FOUNDATIONAL_SUBSTRATE_2026-07.md',
    id: 'magnetism-substrate',
    metaProtein: 'holographic-magnetic-super-ai',
    maxCells: 6,
    tags: ['magnetism', 'substrate'],
  },
  {
    path: 'docs/SYNTHOBS_TBME_PLANETARY_CORE_GOLDILOCKS_2026-08.md',
    id: 'planetary-goldilocks',
    metaProtein: 'goldilocks-hologram',
    maxCells: 8,
    tags: ['goldilocks', 'planetary', 'geodynamo'],
  },
  {
    path: 'docs/SYNTHOBS_OMNI_LATTICE_THALIA_GOLDILOCKS_HARNESS_2026-08.md',
    id: 'thalia-goldilocks',
    metaProtein: 'goldilocks-hologram',
    maxCells: 6,
    tags: ['goldilocks', 'thalia', 'harness'],
  },
  {
    path: 'docs/SYNTHOBS_99_OCTAVE_DIGITS_MASTER_2026-08.md',
    id: 'digits-master',
    metaProtein: '99-octave-engine-pin',
    maxCells: 8,
    tags: ['99-octave', 'digits', 'engine-pin'],
  },
  {
    path: 'docs/SYNTHOBS_INFINITE_OCTAVE_PRIME_PARITY_FRAMEWORK_2026-09.md',
    id: 'prime-parity',
    metaProtein: 'prime-vault-scaffold',
    maxCells: 8,
    tags: ['prime', 'parity', 'phi'],
  },
  {
    path: 'docs/SYNTHOBS_PRIME_INDEXED_VOLUMETRIC_STORAGE_EGS_2026-09.md',
    id: 'volumetric-storage',
    metaProtein: 'prime-vault-scaffold',
    maxCells: 6,
    tags: ['prime', 'volumetric', 'storage'],
  },
  {
    path: 'docs/SYNTHOBS_PROTEIN_FOLDING_PRIME_CONTAINER_EGS_2026-09.md',
    id: 'protein-folding',
    metaProtein: 'protein-fold-rhyme',
    maxCells: 8,
    tags: ['protein', 'folding', 'prime-container'],
  },
  {
    path: 'docs/SYNTHOBS_MACRO_PROTEIN_WORK_ENGINE_EGS_2026-09.md',
    id: 'macro-protein',
    metaProtein: 'protein-fold-rhyme',
    maxCells: 6,
    tags: ['macro-protein', 'work-engine'],
  },
  {
    path: 'docs/SYNTHOBS_PRIME_VAULT_CHAT_EGS_2026-09.md',
    id: 'prime-vault-chat',
    metaProtein: 'miracle2-language-processor',
    maxCells: 6,
    tags: ['prime-vault-chat', 'language-processor'],
  },
  {
    path: 'docs/SYNTHOBS_HUMAN_OMNIVERSAL_REALITY_BRIDGE_ROUTER_WORMHOLE_2026-08.md',
    id: 'human-bridge',
    metaProtein: 'human-reality-bridge',
    maxCells: 6,
    tags: ['human', 'bridge', 'wormhole'],
  },
  {
    path: 'docs/SYNTHOBS_INVISIBLE_FRONTIER_GATES_AI_WARNINGS_2026-08.md',
    id: 'invisible-frontier',
    metaProtein: 'voyage-editorial',
    maxCells: 6,
    tags: ['invisible-frontier', 'gates', 'warnings'],
  },
  {
    path: 'docs/SYNTHOBS_TBME_HIGGS_AWARENESS_UNIFIED_2026-09.md',
    id: 'higgs-unified',
    metaProtein: 'higgs-awareness-gate',
    maxCells: 6,
    tags: ['higgs', 'awareness', 'phase'],
  },
  {
    path: 'docs/ARCHITECTURE_OMNIVERSAL_COMPUTING_NESTED_AGENT_LATTICE_2026-07.md',
    id: 'nested-agents',
    metaProtein: 'nested-agent-scaffold',
    maxCells: 6,
    tags: ['nested-agents', 'architecture'],
  },
]);

const SKIP_HEADINGS = /document control|methods|keywords|^authors$|fair exchange clause|reproducibility/i;

/**
 * @param {number} n
 * @returns {number[]}
 */
export function generatePrimes(n) {
  const primes = [2];
  let candidate = 3;
  while (primes.length < n) {
    let isPrime = true;
    for (const p of primes) {
      if (p * p > candidate) break;
      if (candidate % p === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) primes.push(candidate);
    candidate += 2;
  }
  return primes;
}

function stripMd(s) {
  return String(s || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#]+/g, '')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstSentences(text, maxChars = 280) {
  const plain = stripMd(text);
  if (!plain) return '';
  const parts = plain.split(/(?<=[.!?])\s+/);
  let out = '';
  for (const p of parts) {
    if (!p) continue;
    const next = out ? `${out} ${p}` : p;
    if (next.length > maxChars && out) break;
    out = next;
    if (out.length >= Math.min(160, maxChars)) break;
  }
  return out.slice(0, maxChars);
}

/**
 * Residue chain — knowledge as words/sentences in sequence (protein FastA analog).
 * @param {string} text
 * @param {number} [max]
 */
export function sentenceAtoms(text, max = 8) {
  const plain = stripMd(text);
  if (!plain) return [];
  return plain
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 24)
    .slice(0, max);
}

function slugTitle(heading) {
  const base = stripMd(heading)
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
  return base.slice(0, 64) || 'Corpus cell';
}

/**
 * Split markdown into ## / ### sections (title + body).
 * @param {string} markdown
 * @returns {Array<{heading: string, body: string, level: number}>}
 */
export function chunkMarkdown(markdown) {
  const lines = String(markdown || '').split(/\r?\n/);
  const sections = [];
  let cur = null;
  for (const line of lines) {
    const m = /^(#{2,3})\s+(.+)$/.exec(line);
    if (m) {
      if (cur) sections.push(cur);
      cur = { heading: m[2].trim(), body: '', level: m[1].length };
      continue;
    }
    if (!cur) {
      if (/^#\s+/.test(line)) continue;
      cur = { heading: 'Document lead', body: '', level: 1 };
    }
    cur.body += `${line}\n`;
  }
  if (cur) sections.push(cur);
  return sections.filter(
    (s) => stripMd(s.body).length >= 40 && !SKIP_HEADINGS.test(stripMd(s.heading)),
  );
}

/**
 * Encode one markdown document into chat knowledge cells.
 * @param {string} markdown
 * @param {{ source?: string, maxCells?: number, maxSpeak?: number, metaProtein?: string, id?: string, tags?: string[] }} [opts]
 */
export function encodeCorpusToCells(markdown, opts = {}) {
  const source = opts.source || DEFAULT_CORPUS_SOURCE;
  const maxCells = Math.max(1, Math.min(48, Number(opts.maxCells) || 16));
  const maxSpeak = Math.max(120, Math.min(480, Number(opts.maxSpeak) || 280));
  const docId = opts.id || 'corpus';
  const metaProtein = opts.metaProtein || 'corpus-meta';
  const extraTags = Array.isArray(opts.tags) ? opts.tags : ['corpus'];
  const chunks = chunkMarkdown(markdown).slice(0, maxCells);
  const primes = generatePrimes(Math.max(chunks.length, 1));
  /** @type {Record<string, object>} */
  const cells = {};
  const vaults = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const title = slugTitle(chunk.heading);
    let name = `Corpus · ${docId} · ${title}`;
    let n = 2;
    while (cells[name]) {
      name = `Corpus · ${docId} · ${title} (${n++})`;
    }
    const speak = firstSentences(chunk.body, maxSpeak);
    const gist = firstSentences(chunk.body, 160) || speak;
    const atoms = sentenceAtoms(chunk.body, 8);
    const pk = primes[i];
    const volumetricRadius = PHI_EGS ** i / (pk * Math.log(pk));
    const phaseSignature = (2 * Math.PI * pk) / PHI_EGS;
    cells[name] = {
      primeIndex: i,
      tags: ['corpus', ...extraTags, ...title.toLowerCase().split(/\s+/).slice(0, 3)],
      gist,
      speak,
      atoms: atoms.length ? atoms : [speak].filter(Boolean),
      metaProtein,
      docId,
      source: `${source}#${encodeURIComponent(chunk.heading.slice(0, 80))}`,
      corpus: true,
    };
    vaults.push({
      name,
      vaultId: pk,
      isBinaryBase: pk === 2,
      volumetricRadius,
      phaseSignature,
      payloadChars: stripMd(chunk.body).length,
      metaProtein,
      docId,
    });
  }

  return {
    cells,
    vaults,
    source,
    docId,
    metaProtein,
    nCells: Object.keys(cells).length,
    trainingCostUsd: 0,
    encode: 'prime-vault-protein-library-v2',
  };
}

/**
 * Recursively encode the protein library manifest (Seed scaffold).
 * @param {{ root?: string, manifest?: typeof PROTEIN_LIBRARY_MANIFEST }} [opts]
 */
export function encodeProteinLibrary(opts = {}) {
  const root =
    opts.root || join(dirname(fileURLToPath(import.meta.url)), '..');
  const manifest = opts.manifest || PROTEIN_LIBRARY_MANIFEST;
  /** @type {Record<string, object>} */
  const cells = {};
  const vaults = [];
  const sources = [];
  const metaProteins = new Set();
  const missing = [];

  for (const entry of manifest) {
    const abs = join(root, entry.path);
    if (!existsSync(abs)) {
      missing.push(entry.path);
      continue;
    }
    const md = readFileSync(abs, 'utf8');
    const encoded = encodeCorpusToCells(md, {
      source: entry.path,
      maxCells: entry.maxCells,
      metaProtein: entry.metaProtein,
      id: entry.id,
      tags: entry.tags,
    });
    Object.assign(cells, encoded.cells);
    vaults.push(...encoded.vaults);
    sources.push(entry.path);
    metaProteins.add(entry.metaProtein);
  }

  // Re-index primes globally for vault metadata consistency
  const names = Object.keys(cells);
  const primes = generatePrimes(Math.max(names.length, 1));
  names.forEach((name, i) => {
    cells[name] = { ...cells[name], libraryPrimeIndex: i, libraryPrime: primes[i] };
  });

  return {
    cells,
    vaults,
    sources,
    missing,
    metaProteins: [...metaProteins],
    nCells: names.length,
    nDocs: sources.length,
    trainingCostUsd: 0,
    encode: 'prime-vault-protein-library-v2',
    honesty:
      'Protein library encode = deterministic filing of whitepaper sections into prime vaults. Not LLM training (no gradients, no weight updates, $0 training). Domain-bounded catalog coverage ≠ open-world QA.',
  };
}

/**
 * Merge hand-authored cells with corpus cells.
 * @param {Record<string, object>} hand
 * @param {Record<string, object>} corpus
 */
export function mergeCellBanks(hand, corpus) {
  return { ...hand, ...corpus };
}

/**
 * Load protein library JSON if present, else encode live from manifest.
 * @param {{ root?: string }} [opts]
 */
export function loadDefaultCorpusBank(opts = {}) {
  const root =
    opts.root ||
    join(dirname(fileURLToPath(import.meta.url)), '..');
  const jsonPath = join(root, 'data', 'prime-vault-corpus-v0.json');
  if (existsSync(jsonPath)) {
    const raw = JSON.parse(readFileSync(jsonPath, 'utf8'));
    return {
      cells: raw.cells || {},
      vaults: raw.vaults || [],
      source: raw.sources?.[0] || raw.source || DEFAULT_CORPUS_SOURCE,
      sources: raw.sources || [],
      metaProteins: raw.metaProteins || [],
      nCells: raw.nCells || Object.keys(raw.cells || {}).length,
      nDocs: raw.nDocs || (raw.sources || []).length,
      trainingCostUsd: 0,
      encode: raw.encode || 'prime-vault-protein-library-v2',
      from: 'json',
    };
  }
  const encoded = encodeProteinLibrary({ root });
  return { ...encoded, from: 'markdown', source: encoded.sources?.[0] || DEFAULT_CORPUS_SOURCE };
}
