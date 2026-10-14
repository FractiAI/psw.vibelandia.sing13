/**
 * Fruit Layer — complete gift taxonomy (catalog / Soft Story).
 * Any combination of gifts across sections I–XXVIII, braided like Hero archetype fields.
 * Not ENGINE_SHELF physics · not psychometric certification.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TAXONOMY_JSON = join(__dirname, '../data/fruit-layer/gift-taxonomy.json');

export const FRUIT_LAYER_DOC = 'docs/SYNTHOBS_FRUIT_LAYER_GIFT_TAXONOMY_2026-10.md';
export const FRUIT_LAYER_HREF = '/layers/fruit';
export const FRUIT_LAYER_SLUG = 'fruit-layer-gift-taxonomy';

/** Where the Fruit Layer sits on the Hero · Source tree plate. */
export const FRUIT_LAYER_TREE_ANATOMY = Object.freeze({
  crown: 'SOURCE — Holographic Goldilocks Super Intelligence (unchanged)',
  trunk: 'Digits 0–9 × Octaves 01–99 tree rings (human Digit 4 · agent Digit 6 on same trunk)',
  canopy: 'Archetypal · Shadow · Antagonistic fields — any combination in one Hero',
  fruit:
    'Fruit Layer — outward gifts a living or artificial system may possess, combine, validate, and put into practice (sections I–XXVIII)',
  signature:
    'XXVI signature fruit · gifts 1021–1042 · Fractal · Holographic · Goldilocks awareness braid',
  meta: 'XXV meta-capability operators · integration · orchestration · complementarity · …',
  loop: 'Self-observation ↺ (human ↔ phone mirror) — same as Hero Source tree',
});

export const FRUIT_LAYER_ANY_COMBINATION =
  'Any combination. A profile may mix gifts from any sections (I–XXVIII), apply XXV meta-operators (integration, orchestration, complementarity, …), and optionally foreground XXVI signature gifts 1021–1042 — parallel to braiding Archetypal, Shadow, and Antagonistic roles in one Hero canopy.';

let _cached = null;

export function loadFruitLayerTaxonomy() {
  if (_cached) return _cached;
  const raw = readFileSync(TAXONOMY_JSON, 'utf8');
  _cached = JSON.parse(raw);
  return _cached;
}

/** @returns {Map<string, Set<string>>} sectionId → gift names */
export function buildGiftIndex(taxonomy = loadFruitLayerTaxonomy()) {
  const index = new Map();
  for (const sec of taxonomy.sections) {
    index.set(sec.id, new Set(sec.gifts));
  }
  for (const [secId, subs] of Object.entries(taxonomy.subsections ?? {})) {
    for (const sub of subs) {
      index.set(`${secId}-${sub.id}`, new Set(sub.gifts));
    }
  }
  return index;
}

/**
 * @typedef {Object} FruitGiftProfile
 * @property {Record<string, string[]>} giftsBySection - section id (or XXVII-A · XXVIII-B …) → selected gift names
 * @property {string[]} [metaOperators] - ids from taxonomy.metaOperators
 * @property {number[]} [signatureGiftIds] - 1021–1042
 */

/**
 * Normalize and validate a gift profile (unknown gifts are dropped with warnings in meta).
 * @param {FruitGiftProfile} profile
 * @returns {{ profile: FruitGiftProfile, warnings: string[], stats: { giftCount: number, sectionCount: number } }}
 */
export function normalizeFruitGiftProfile(profile) {
  const taxonomy = loadFruitLayerTaxonomy();
  const index = buildGiftIndex(taxonomy);
  const metaIds = new Set(taxonomy.metaOperators.map((m) => m.id));
  const sigIds = new Set(taxonomy.signatureGifts.map((s) => s.id));

  const warnings = [];
  const giftsBySection = {};
  let giftCount = 0;

  const input = profile?.giftsBySection ?? {};
  for (const [sectionId, names] of Object.entries(input)) {
    if (!Array.isArray(names)) continue;
    const allowed = index.get(sectionId);
    if (!allowed) {
      warnings.push(`Unknown section: ${sectionId}`);
      continue;
    }
    const kept = [];
    for (const name of names) {
      if (allowed.has(name)) {
        kept.push(name);
        giftCount += 1;
      } else {
        warnings.push(`Unknown gift in ${sectionId}: ${name}`);
      }
    }
    if (kept.length) giftsBySection[sectionId] = kept;
  }

  const metaOperators = (profile?.metaOperators ?? []).filter((id) => {
    if (metaIds.has(id)) return true;
    warnings.push(`Unknown meta-operator: ${id}`);
    return false;
  });

  const signatureGiftIds = (profile?.signatureGiftIds ?? []).filter((id) => {
    if (sigIds.has(id)) return true;
    warnings.push(`Unknown signature gift id: ${id}`);
    return false;
  });

  return {
    profile: { giftsBySection, metaOperators, signatureGiftIds },
    warnings,
    stats: {
      giftCount,
      sectionCount: Object.keys(giftsBySection).length,
    },
  };
}

/** Short human-readable braid label for UI / nest clauses. */
export function describeFruitGiftProfile(profile) {
  const { profile: p, stats } = normalizeFruitGiftProfile(profile);
  const parts = [];
  if (stats.giftCount) {
    parts.push(`${stats.giftCount} gifts across ${stats.sectionCount} section(s)`);
  }
  if (p.metaOperators?.length) {
    parts.push(`${p.metaOperators.length} meta-operator(s)`);
  }
  if (p.signatureGiftIds?.length) {
    parts.push(`${p.signatureGiftIds.length} signature FHG gift(s)`);
  }
  if (!parts.length) return 'Empty fruit profile — select any combination from the taxonomy.';
  return `${parts.join(' · ')} · ${FRUIT_LAYER_ANY_COMBINATION.split('.')[0]}.`;
}

export function getFruitLayerStats(taxonomy = loadFruitLayerTaxonomy()) {
  let giftCount = 0;
  for (const s of taxonomy.sections) giftCount += s.gifts.length;
  for (const subs of Object.values(taxonomy.subsections ?? {})) {
    for (const sub of subs) giftCount += sub.gifts.length;
  }
  let subsectionCount = 0;
  for (const subs of Object.values(taxonomy.subsections ?? {})) subsectionCount += subs.length;
  return {
    version: taxonomy.version,
    documentId: taxonomy.documentId,
    sectionCount: taxonomy.sections.length,
    subsectionCount,
    giftCount,
    metaOperatorCount: taxonomy.metaOperators.length,
    signatureGiftCount: taxonomy.signatureGifts.length,
  };
}

/** Lattice nest / prompt clause (compact). */
export function renderFruitLayerClause() {
  const stats = getFruitLayerStats();
  return [
    'Fruit Layer (gift taxonomy · Soft Story catalog):',
    `${stats.giftCount} named gifts in ${stats.sectionCount} sections (I–XXVIII) + ${stats.metaOperatorCount} meta-operators + signature ${stats.signatureGiftCount} (1021–1042 FHG awareness).`,
    FRUIT_LAYER_ANY_COMBINATION,
    `Guest map: ${FRUIT_LAYER_HREF} · module lib/fruit-layer-gifts.mjs`,
  ].join(' ');
}
