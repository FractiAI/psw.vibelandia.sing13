import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SHIP_BLOG_FILE,
  SOLAR_FILING,
  FRACTISKILLS,
  HONESTY,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_ROOT = path.resolve(PKG_ROOT, '..', '..');
const MONOREPO_DOCS = path.join(MONOREPO_ROOT, 'docs');
const MONOREPO_BLOG = path.join(MONOREPO_ROOT, 'interfaces', SHIP_BLOG_FILE);
const SKILLS_INDEX = path.join(MONOREPO_ROOT, FRACTISKILLS.indexRel);

const LP_MANTISSA = 1.616255;
const CLUTCH = Math.abs(PHI_EGS - LP_MANTISSA);

function experimentPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    title: 'Φ_EGS nesting grammar seed',
    PHI_EGS,
    expected,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    interpretation: 'FractiSkills nesting grammar under catalog layer.',
    honesty: 'Architectural key — not GPU physics.',
  };
}

function experimentIdentity() {
  const lhs = PHI_EGS * PHI_EGS;
  const rhs = PHI_EGS + 1;
  return {
    id: 'E2_phi_squared_identity',
    title: 'Φ² = Φ + 1',
    lhs,
    rhs,
    pass: Math.abs(lhs - rhs) < 1e-12,
    interpretation: 'Catalog ladder identity.',
    honesty: 'Algebra fixture.',
  };
}

function experimentClutch() {
  return {
    id: 'E3_clutch_delta',
    title: 'Clutch Δ ≈ 0.001779 (SI mantissa slip)',
    clutch: CLUTCH,
    expectedApprox: 0.001779,
    pass: Math.abs(CLUTCH - 0.001779) < 5e-6,
    interpretation: 'Filed near-miss between Φ and l_P·10^35 mantissa.',
    honesty: 'SI/base-10 dependent — not a discovery of nature.',
  };
}

function experimentCorpusIndex() {
  let skillCount = 0;
  let exists = false;
  if (fs.existsSync(SKILLS_INDEX)) {
    exists = true;
    try {
      const raw = JSON.parse(fs.readFileSync(SKILLS_INDEX, 'utf8'));
      skillCount = Number(raw.skillCount) || (Array.isArray(raw.skills) ? raw.skills.length : 0);
    } catch {
      skillCount = 0;
    }
  }
  const floor = FRACTISKILLS.skillCountFloor;
  return {
    id: 'E4_corpus_index_skill_count',
    title: 'skills/index.json exists · skillCount ≥ floor',
    exists,
    skillCount,
    floor,
    expectedMin: FRACTISKILLS.skillCountExpected,
    pass: exists && skillCount >= floor,
    interpretation: 'Local FractiSkills corpus index present at Tier B floor.',
    honesty: 'Structural presence — not a live public crawl certificate.',
  };
}

function experimentPointerBudget() {
  const { maxPointers, maxPinches } = FRACTISKILLS.pointerBudget;
  return {
    id: 'E5_pointer_budget',
    title: 'Pointer-first budget · maxPointers=8 · maxPinches=2',
    maxPointers,
    maxPinches,
    pass: maxPointers === 8 && maxPinches === 2,
    interpretation: 'Goldilocks load law for Lattice Chat skill packs.',
    honesty: 'Budget labels — not infinite context claims.',
  };
}

function experimentSolar() {
  return {
    id: 'E6_solar_filing_ar4524_ar4530',
    title: 'AR4524 · AR4530 catalog wet-lab anchors',
    solAlpha: SOLAR_FILING.solAlpha,
    solBeta: SOLAR_FILING.solBeta,
    pass:
      SOLAR_FILING.solAlpha === 'AR4524' && SOLAR_FILING.solBeta === 'AR4530',
    interpretation: 'Sol-Alpha / Sol-Beta locked for telemetry filing.',
    honesty: 'Filing characters — not derivation of constants from sunspots.',
  };
}

function experimentHonestyRefusals() {
  const lower = HONESTY.toLowerCase();
  const refusesEnginePin = lower.includes('engine pin') || lower.includes('not an engine pin');
  const refusesLiveCrawl = lower.includes('live') && lower.includes('crawl');
  const refusesSkillarum = lower.includes('skillarum');
  return {
    id: 'E7_honesty_refuse_engine_pin_live_crawl',
    title: 'Honesty refuses engine-pin / live-crawl / Skillarum',
    honestySnippet: HONESTY,
    pass: refusesEnginePin && refusesLiveCrawl && refusesSkillarum,
    interpretation: 'Explicit refusal of overclaim rails.',
    honesty: 'Softens draft claims to application companion only.',
  };
}

function experimentPaperPresent() {
  const local = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const mono = path.join(MONOREPO_DOCS, PAPER_NAME);
  const text = fs.existsSync(mono) ? fs.readFileSync(mono, 'utf8') : '';
  const ok =
    fs.existsSync(local) &&
    fs.existsSync(mono) &&
    text.includes('Honesty boundary') &&
    text.includes(DOC_ID) &&
    text.includes('Fair Exchange') &&
    text.includes('pointer-first') &&
    !text.toLowerCase().includes('proves infinite gpu');
  return {
    id: 'E8_paper_present',
    title: 'Paper present with Document ID + honesty + Fair Exchange',
    pass: ok,
    interpretation: 'Suite docs mirror monorepo paper.',
    honesty: 'Structural presence check.',
  };
}

function experimentShipBlog() {
  const ok =
    fs.existsSync(MONOREPO_BLOG) &&
    fs.readFileSync(MONOREPO_BLOG, 'utf8').includes(REGISTRY_ID);
  return {
    id: 'E9_ship_blog',
    title: 'Ship-blog note references registry id',
    pass: ok,
    interpretation: 'Plain-language note wired to paper.',
    honesty: 'Presence check.',
  };
}

function experimentCompanionIdentity() {
  return {
    id: 'E10_application_companion_identity',
    title: 'Application companion identity · not engine pin',
    corpusId: FRACTISKILLS.id,
    enginePin: FRACTISKILLS.enginePin,
    pass:
      FRACTISKILLS.id === 'fractiskills-full-local-corpus' &&
      FRACTISKILLS.enginePin === false &&
      FRACTISKILLS.skillCountExpected >= 400,
    interpretation: 'Companion identity locked for registry / shelf sync.',
    honesty: 'Identity labels — not marketplace or physics claims.',
  };
}

export function runAllExperiments() {
  const experiments = [
    experimentPhi(),
    experimentIdentity(),
    experimentClutch(),
    experimentCorpusIndex(),
    experimentPointerBudget(),
    experimentSolar(),
    experimentHonestyRefusals(),
    experimentPaperPresent(),
    experimentShipBlog(),
    experimentCompanionIdentity(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    all_pass: n_pass === experiments.length,
    n_pass,
    n_total: experiments.length,
    experiments,
  };
}
