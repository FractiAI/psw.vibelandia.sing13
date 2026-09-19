/**
 * Digit 4 · Be–O Periodic Rhyme — catalog suite fixtures.
 * Address = 4 · glyph = 8 · Be Z=4 · O Z=8 · 3^4=81 · refusal lock.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SHIP_BLOG_FILE,
  SHIP_BLOG_SLUG,
  DIGIT_ADDRESS,
  DIGIT_GLYPH,
  MANTISSA_RELATION,
  ELEMENT_BE_Z,
  ELEMENT_O_Z,
  REGISTER_BASE,
  REGISTER_EXPONENT,
  REGISTER_81,
  REFUSAL_LOCK,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);

function experimentPhiEgs() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    expected,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    interpretation: 'Architectural golden key for Digit × Octave nesting grammar.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentDigitAddress() {
  return {
    id: 'E2_digit_address',
    title: 'Digit address = 4',
    DIGIT_ADDRESS,
    pass: DIGIT_ADDRESS === 4,
    interpretation: 'Container / Biological Switch address frozen.',
    honesty: 'Catalog address — not a claim Be is Digit 4 in nature.',
  };
}

function experimentDigitGlyph() {
  return {
    id: 'E3_digit_glyph',
    title: 'Digit glyph = 8',
    DIGIT_GLYPH,
    pass: DIGIT_GLYPH === 8,
    interpretation: 'Glyph at Φ mantissa address 4 frozen.',
    honesty: 'Catalog glyph — not a claim Φ predicted oxygen.',
  };
}

function experimentMantissaRelation() {
  // Significant digits left→right including leading 1: 1.618… → 1,6,1,8
  const significantDigits = String(PHI_EGS).replace('.', '');
  const glyphAt4 = Number(significantDigits[DIGIT_ADDRESS - 1]);
  return {
    id: 'E4_mantissa_relation',
    title: 'glyph_at(address_4) = 8',
    MANTISSA_RELATION,
    DIGIT_ADDRESS,
    DIGIT_GLYPH,
    significantDigits: significantDigits.slice(0, 8),
    glyphAt4,
    pass:
      MANTISSA_RELATION === 'glyph_at(address_4) = 8' &&
      DIGIT_ADDRESS === 4 &&
      DIGIT_GLYPH === 8 &&
      glyphAt4 === 8 &&
      DIGIT_ADDRESS !== DIGIT_GLYPH,
    interpretation: 'Dual lock — address and glyph are distinct Soft Story labels.',
    honesty: 'Mantissa Soft Story — not unfinished chemistry ontology.',
  };
}

function experimentBerylliumZ() {
  return {
    id: 'E5_beryllium_z',
    title: 'Be Z = 4 (address rhyme label)',
    ELEMENT_BE_Z,
    DIGIT_ADDRESS,
    pass: ELEMENT_BE_Z === 4 && ELEMENT_BE_Z === DIGIT_ADDRESS,
    interpretation: 'Shared label “4” as scaffold/container Soft Story.',
    honesty: 'Label rhyme — not spectroscopic identity.',
  };
}

function experimentOxygenZ() {
  return {
    id: 'E6_oxygen_z',
    title: 'O Z = 8 (value rhyme label)',
    ELEMENT_O_Z,
    DIGIT_GLYPH,
    pass: ELEMENT_O_Z === 8 && ELEMENT_O_Z === DIGIT_GLYPH,
    interpretation: 'Shared label “8” as life-support / octet Soft Story.',
    honesty: 'Label rhyme — not Φ prediction of oxygen.',
  };
}

function experimentRegister81() {
  const computed = REGISTER_BASE ** REGISTER_EXPONENT;
  return {
    id: 'E7_register_81',
    title: '3^4 = 81 register rhyme',
    REGISTER_BASE,
    REGISTER_EXPONENT,
    REGISTER_81,
    computed,
    pass:
      computed === REGISTER_81 &&
      REGISTER_EXPONENT === DIGIT_ADDRESS &&
      REGISTER_81 === 81,
    interpretation: 'Quaternary index uses address 4 as exponent of closed digit lattice.',
    honesty: 'Architectural register — not IUPAC derivation from Φ.',
  };
}

function experimentRefusalLock() {
  const pass =
    REFUSAL_LOCK.periodicTableDerivedFromPhi === false &&
    REFUSAL_LOCK.softStoryRhyme === true;
  return {
    id: 'E8_refusal_lock',
    title: 'Periodic table not derived from Φ (refusal)',
    REFUSAL_LOCK,
    pass,
    interpretation: 'Goldilocks seatbelt — Soft Story rhyme without law upgrade.',
    honesty: 'Explicit refusal — 81-electron peer honesty retained.',
  };
}

function experimentPaperLocks() {
  const paperPath = path.join(MONOREPO_DOCS, PAPER_NAME);
  const localPaper = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const paper =
    (fs.existsSync(paperPath) && fs.readFileSync(paperPath, 'utf8')) ||
    (fs.existsSync(localPaper) && fs.readFileSync(localPaper, 'utf8')) ||
    '';
  const checks = {
    hasHonesty: /Honesty boundary/i.test(paper),
    hasDocId: paper.includes(DOC_ID) || paper.includes(REGISTRY_ID),
    hasAddress: /DIGIT_ADDRESS|address.*4|Address = 4/i.test(paper),
    hasGlyph: /DIGIT_GLYPH|glyph.*8|Glyph = 8/i.test(paper),
    hasBe: /beryllium|Be,\s*Z\s*=\s*4|Be \(Z=4\)/i.test(paper),
    hasO: /oxygen|O,\s*Z\s*=\s*8|O \(Z=8\)/i.test(paper),
    hasFair: /Fair Exchange/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasEngine: /ENGINE_SHELF|engine pin|Infinite Octaves/i.test(paper),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E9_paper_locks',
    title: 'Paper narrative locks (address · glyph · Be · O · engine)',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    ...checks,
    pass,
    interpretation: 'Paper must keep honesty rails and Be–O Soft Story locks.',
    honesty: 'Structural text locks — not market validation.',
  };
}

function experimentShipBlogLock() {
  const exists = fs.existsSync(MONOREPO_BLOG);
  const body = exists ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const hasSlug =
    body.includes(`/ship-blog/${SHIP_BLOG_SLUG}`) || body.includes('digit4-be-o-rhyme');
  const hasWhitepaper =
    body.includes('/whitepaper/digit4-be-o-rhyme') ||
    body.includes('synthobs-digit4-be-o-periodic-rhyme-2026-09');
  const hasThesis = /beryllium|oxygen|digit 4|glyph 8|Be–O|Be-O|periodic/i.test(body);
  return {
    id: 'E10_ship_blog_lock',
    title: 'Ship-blog surfaces digit4-be-o-rhyme + full paper link',
    path: MONOREPO_BLOG,
    exists,
    hasSlug,
    hasWhitepaper,
    hasThesis,
    pass: exists && hasSlug && hasWhitepaper && hasThesis,
    interpretation: 'Guest note must link the full paper and keep Soft Story copy.',
    honesty: 'Surface copy lock only.',
  };
}

function experimentGoldenIdentity() {
  const lhs = PHI_EGS * PHI_EGS;
  const rhs = PHI_EGS + 1;
  return {
    id: 'E11_phi_squared_identity',
    title: 'Φ² = Φ + 1',
    lhs,
    rhs,
    pass: Math.abs(lhs - rhs) < 1e-12,
    interpretation: 'Harmony grammar identity for cross-octave sync framing.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentDigitAddress(),
    experimentDigitGlyph(),
    experimentMantissaRelation(),
    experimentBerylliumZ(),
    experimentOxygenZ(),
    experimentRegister81(),
    experimentRefusalLock(),
    experimentPaperLocks(),
    experimentShipBlogLock(),
    experimentGoldenIdentity(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    all_pass: n_pass === experiments.length,
    n_pass,
    n_total: experiments.length,
    failed,
    experiments,
  };
}
