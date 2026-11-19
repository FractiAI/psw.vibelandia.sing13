import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXON_FEATURE_KEYS } from './constants.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const FIXTURES = join(root, 'fixtures');

function chromToNum(chrom) {
  const s = String(chrom).replace(/^chr/i, '');
  if (s === 'X') return 23;
  if (s === 'Y') return 24;
  if (s === 'M' || s === 'MT') return 0;
  return Number(s) || 0;
}

export function loadGenes() {
  const panel = JSON.parse(readFileSync(join(FIXTURES, 'genes.panel.json'), 'utf8'));
  return panel.genes;
}

export function loadExonsRaw() {
  const panel = JSON.parse(readFileSync(join(FIXTURES, 'exons.panel.json'), 'utf8'));
  return panel.exons;
}

/**
 * Exon feature vectors for rhyme coupling.
 * Keys: chrom_num, start, end, log_len, exon_index, strand, gene_span, tss_dist
 */
export function loadExonFeatureObjects(symbols = null) {
  const genes = loadGenes();
  const geneBySym = Object.fromEntries(genes.map((g) => [g.symbol, g]));
  const exons = loadExonsRaw();
  const out = [];
  for (const e of exons) {
    if (symbols && !symbols.includes(e.symbol)) continue;
    const g = geneBySym[e.symbol];
    const length = Math.max(1, e.exonEnd - e.exonStart);
    const features = {
      chrom_num: chromToNum(e.chrom),
      start: e.exonStart,
      end: e.exonEnd,
      log_len: Math.log(length),
      exon_index: e.exonIndex,
      strand: e.strand === '-' ? -1 : 1,
      gene_span: g ? Math.log(Math.max(1, g.end - g.start)) : 0,
      tss_dist: g ? Math.log(Math.abs(e.exonStart - g.tss) + 1) : 0,
    };
    // lock key order
    const ordered = {};
    for (const k of EXON_FEATURE_KEYS) ordered[k] = features[k];
    out.push({
      id: `${e.symbol}:ex${e.exonIndex}@${e.chrom}:${e.exonStart}`,
      symbol: e.symbol,
      chrom: e.chrom,
      exonIndex: e.exonIndex,
      features: ordered,
    });
  }
  return out;
}

export function loadStringFixture() {
  return JSON.parse(readFileSync(join(FIXTURES, 'string_ins_pomc.json'), 'utf8'));
}

export function loadOpenTargetsFixture() {
  return JSON.parse(readFileSync(join(FIXTURES, 'opentargets_ins_pomc.json'), 'utf8'));
}

export function loadProvenance() {
  return JSON.parse(readFileSync(join(FIXTURES, 'PROVENANCE.json'), 'utf8'));
}

/** Lookup STRING combined score for a gene pair (order-insensitive). Empty → score 0 / empty flag. */
export function stringPairScore(stringDoc, geneA, geneB) {
  const pairs = stringDoc.pairs || [];
  const hit = pairs.find((p) => {
    const a = p.a || p.preferredName_A;
    const b = p.b || p.preferredName_B;
    return (a === geneA && b === geneB) || (a === geneB && b === geneA);
  });
  if (!hit) return { empty: true, score: 0, tscore: 0, ascore: 0, interactions: [] };
  const interactions = hit.interactions || [];
  if (hit.empty || interactions.length === 0) {
    return {
      empty: true,
      score: 0,
      tscore: 0,
      ascore: 0,
      interactions: [],
      a: geneA,
      b: geneB,
    };
  }
  const top = interactions[0];
  return {
    empty: false,
    score: Number(top.score ?? hit.score ?? 0),
    tscore: Number(top.tscore ?? 0),
    ascore: Number(top.ascore ?? 0),
    nscore: Number(top.nscore ?? 0),
    fscore: Number(top.fscore ?? 0),
    pscore: Number(top.pscore ?? 0),
    escore: Number(top.escore ?? 0),
    dscore: Number(top.dscore ?? 0),
    interactions,
    a: geneA,
    b: geneB,
  };
}
