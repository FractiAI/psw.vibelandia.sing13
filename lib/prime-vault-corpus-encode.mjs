/**
 * Prime Vault Chat · corpus encode v0
 * Auto-file markdown into prime-indexed knowledge cells (Seed layer).
 * Speech-act planner (Edge) still composes replies — $0 training, no BYOK mouth.
 * Application companion · not engine pin · not open-world LLM parity.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DEFAULT_CORPUS_SOURCE =
  'docs/SYNTHOBS_SS_VIBELANDIA_OFFICIAL_PROSPECTUS_NARRATIVE_FOUNDATION_2026-08.md';

const SKIP_HEADINGS = /document control|methods|keywords|^authors$|fair exchange clause/i;

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
  return base.slice(0, 72) || 'Corpus cell';
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
      // Lead matter before first ## — treat as abstract if substantial
      if (/^#\s+/.test(line)) continue;
      cur = { heading: 'Prospectus lead', body: '', level: 1 };
    }
    cur.body += `${line}\n`;
  }
  if (cur) sections.push(cur);
  return sections.filter((s) => stripMd(s.body).length >= 40 && !SKIP_HEADINGS.test(stripMd(s.heading)));
}

/**
 * Encode markdown corpus into chat knowledge cells + volumetric vault metadata.
 * @param {string} markdown
 * @param {{ source?: string, maxCells?: number, maxSpeak?: number }} [opts]
 */
export function encodeCorpusToCells(markdown, opts = {}) {
  const source = opts.source || DEFAULT_CORPUS_SOURCE;
  const maxCells = Math.max(1, Math.min(48, Number(opts.maxCells) || 16));
  const maxSpeak = Math.max(120, Math.min(480, Number(opts.maxSpeak) || 320));
  const chunks = chunkMarkdown(markdown).slice(0, maxCells);
  const primes = generatePrimes(Math.max(chunks.length, 1));
  /** @type {Record<string, object>} */
  const cells = {};
  const vaults = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const title = slugTitle(chunk.heading);
    // Prefix avoids colliding with hand-authored Miracle-2 cells
    let name = `Corpus · ${title}`;
    let n = 2;
    while (cells[name]) {
      name = `Corpus · ${title} (${n++})`;
    }
    const speak = firstSentences(chunk.body, maxSpeak);
    const gist = firstSentences(chunk.body, 160) || speak;
    const atoms = sentenceAtoms(chunk.body, 8);
    const pk = primes[i];
    const volumetricRadius = PHI_EGS ** i / (pk * Math.log(pk));
    const phaseSignature = (2 * Math.PI * pk) / PHI_EGS;
    const metaProtein = /genesis|borik|reno|arc|voyage|prospectus|brochure|captain|abstract|honesty|pillar/i.test(
      title,
    )
      ? 'voyage-meta'
      : 'corpus-meta';
    cells[name] = {
      primeIndex: i,
      tags: ['corpus', 'prospectus', 'voyage', ...(title.toLowerCase().split(/\s+/).slice(0, 4))],
      gist,
      speak,
      atoms: atoms.length ? atoms : [speak].filter(Boolean),
      metaProtein,
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
    });
  }

  return {
    cells,
    vaults,
    source,
    nCells: Object.keys(cells).length,
    trainingCostUsd: 0,
    encode: 'prime-vault-corpus-v1-fold',
  };
}

/**
 * Merge hand-authored cells with corpus cells (corpus wins on name clash after prefix).
 * @param {Record<string, object>} hand
 * @param {Record<string, object>} corpus
 */
export function mergeCellBanks(hand, corpus) {
  return { ...hand, ...corpus };
}

/**
 * Load default prospectus encode (fixture JSON if present, else live encode from docs/).
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
      source: raw.source || DEFAULT_CORPUS_SOURCE,
      nCells: raw.nCells || Object.keys(raw.cells || {}).length,
      trainingCostUsd: 0,
      encode: raw.encode || 'prime-vault-corpus-v0',
      from: 'json',
    };
  }
  const mdPath = join(root, DEFAULT_CORPUS_SOURCE);
  if (!existsSync(mdPath)) {
    return { cells: {}, vaults: [], source: DEFAULT_CORPUS_SOURCE, nCells: 0, trainingCostUsd: 0, encode: 'prime-vault-corpus-v0', from: 'empty' };
  }
  const encoded = encodeCorpusToCells(readFileSync(mdPath, 'utf8'), {
    source: DEFAULT_CORPUS_SOURCE,
    maxCells: 16,
  });
  return { ...encoded, from: 'markdown' };
}
