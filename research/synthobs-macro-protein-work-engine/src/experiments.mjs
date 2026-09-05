/**
 * Macro-Protein Work Engine — catalog suite.
 * Replayable algebraic / filing locks — not wet-lab physiology benches.
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
  THETA_BIO,
  KLEIBER_ALPHA,
  FIXTURE_SCALES,
  SOLAR_CHARACTERS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);

export function workCapacity(n, W0 = 1.0, EActiv = 1.0) {
  return W0 * PHI_EGS ** n * Math.exp(-EActiv / PHI_EGS ** n);
}

export function thetaBio(lambdaOrganism, lambdaPe) {
  return Math.log(lambdaOrganism / lambdaPe) / Math.log(PHI_EGS);
}

function experimentPhiEgs() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    expected,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    interpretation: 'Architectural golden key for macro-protein octave recursion.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentGoldenIdentity() {
  const lhs = PHI_EGS * PHI_EGS;
  const rhs = PHI_EGS + 1;
  return {
    id: 'E2_phi_squared_identity',
    title: 'Φ² = Φ + 1',
    lhs,
    rhs,
    pass: Math.abs(lhs - rhs) < 1e-12,
    interpretation: 'Golden-key identity closing biological scale ladders.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

function experimentThetaBioBand() {
  const theta = thetaBio(FIXTURE_SCALES.Lambda_organism, FIXTURE_SCALES.Lambda_pe);
  const pass =
    Number.isFinite(theta) && theta >= THETA_BIO.lo && theta <= THETA_BIO.hi;
  return {
    id: 'E3_theta_bio_band',
    title: 'Fixture organism length lands θ_bio in [13, 17]',
    theta,
    band: THETA_BIO,
    scales: FIXTURE_SCALES,
    pass,
    interpretation: 'Catalog logarithmic ratio → biological octave filing band.',
    honesty: 'Fixture length pair — not a CODATA biological octave certificate.',
  };
}

function experimentWorkTensor() {
  const samples = [13, 14, 15, 16, 17].map((n) => ({ n, W: workCapacity(n) }));
  const pass = samples.every((s) => Number.isFinite(s.W) && s.W > 0);
  return {
    id: 'E4_work_tensor',
    title: 'W(n) finite and positive on bio tiers 13–17',
    samples,
    pass,
    interpretation: 'Macro-protein work tensor fixture across θ_bio integers.',
    honesty: 'Algebraic W(n) — not measured BMR calorimetry.',
  };
}

function experimentThetaDerivationMonotone() {
  const small = thetaBio(0.01, FIXTURE_SCALES.Lambda_pe);
  const large = thetaBio(2.0, FIXTURE_SCALES.Lambda_pe);
  const pass = Number.isFinite(small) && Number.isFinite(large) && large > small;
  return {
    id: 'E5_theta_monotone',
    title: 'θ_bio increases with organism length (fixed Λ_pe)',
    small,
    large,
    pass,
    interpretation: 'Logarithmic fractal ratio is monotone in Λ_organism.',
    honesty: 'Math lock — not a claim about all taxa.',
  };
}

function experimentKleiberAlpha() {
  return {
    id: 'E6_kleiber_alpha',
    title: 'Kleiber α ≈ 3/4 framing lock',
    KLEIBER_ALPHA,
    pass: Math.abs(KLEIBER_ALPHA - 0.75) < 1e-12,
    interpretation: 'Allometric exponent filed as WBE-compatible catalog lock.',
    honesty: 'Literature framing — not a new physiology derivation.',
  };
}

function experimentSolarCharacters() {
  const h = SOLAR_CHARACTERS.heliosPrime;
  const b = SOLAR_CHARACTERS.borealis;
  const pass =
    h.ar === 'AR3664' &&
    h.alias === 'Helios-Prime' &&
    b.ar === 'AR3590' &&
    b.alias === 'Borealis';
  return {
    id: 'E7_solar_characters',
    title: 'AR3664 Helios-Prime · AR3590 Borealis catalog lock',
    SOLAR_CHARACTERS,
    pass,
    interpretation: 'Ephemeral heliospheric filing labels for Φ-recursive narrative.',
    honesty: 'Not astronomy proof that stars write metabolism.',
  };
}

function experimentPaperAndBlogLocks() {
  const paperPath = path.join(MONOREPO_DOCS, PAPER_NAME);
  const localPaper = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const paper =
    (fs.existsSync(paperPath) && fs.readFileSync(paperPath, 'utf8')) ||
    (fs.existsSync(localPaper) && fs.readFileSync(localPaper, 'utf8')) ||
    '';
  const blog = fs.existsSync(MONOREPO_BLOG) ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const checks = {
    hasHonesty: /Honesty boundary/i.test(paper),
    hasDocId: paper.includes(DOC_ID) || paper.includes(REGISTRY_ID),
    hasFair: /Fair Exchange/i.test(paper),
    hasPhi: /Φ|PHI_EGS|1\.618|EGS Fractal/i.test(paper),
    hasTheta: /theta_\{?\\mathrm\{bio\}\}?|θ_\{?\\mathrm\{bio\}\}?|\\theta_\{?\\mathrm\{bio\}\}?|theta_bio|θ_bio|\[13,\s*17\]/i.test(
      paper,
    ) || paper.includes('[13, 17]') || paper.includes('[13,17]'),
    hasKleiber: /Kleiber|WBE|allometr/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasWork: /W\(n\)|work capacity|macro-protein/i.test(paper),
    blogExists: Boolean(blog),
    blogSlug: blog.includes(SHIP_BLOG_SLUG) || blog.includes('macro-protein-work-engine'),
    blogHonesty: /Honesty/i.test(blog),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E8_paper_blog_locks',
    title: 'Paper + ship-blog honesty / Fair Exchange / θ_bio locks',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    blogPath: MONOREPO_BLOG,
    ...checks,
    pass,
    interpretation: 'Surfaces must carry catalog framing + allometric contrast, not wet-lab overclaim.',
    honesty: 'Structural text locks — not physiology validation.',
  };
}

function experimentRegistryId() {
  return {
    id: 'E9_registry_id',
    title: 'Registry id + engine shelf fixture',
    REGISTRY_ID,
    DOC_ID,
    pass: REGISTRY_ID === 'synthobs-macro-protein-work-engine-2026-09',
    interpretation: 'Canonical registry id for macro-protein application companion (not engine pin).',
    honesty: 'Naming lock.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentGoldenIdentity(),
    experimentThetaBioBand(),
    experimentWorkTensor(),
    experimentThetaDerivationMonotone(),
    experimentKleiberAlpha(),
    experimentSolarCharacters(),
    experimentPaperAndBlogLocks(),
    experimentRegistryId(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    experiments,
    n_pass,
    n_total: experiments.length,
    all_pass: failed.length === 0,
    failed,
  };
}
