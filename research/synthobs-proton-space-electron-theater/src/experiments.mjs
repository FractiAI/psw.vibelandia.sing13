/**
 * Proton Space · Electron Theater Duality — catalog suite.
 * Replayable algebraic / filing locks — not CODATA replacement or QED proof.
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
  LEADING_ONE_FIXTURES,
  STRUCTURAL_TWO_FIXTURES,
  SOLAR_CHARACTERS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);

function leadingDigit(x) {
  return Number(Math.abs(x).toExponential()[0]);
}

function experimentPhiEgs() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    expected,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    interpretation: 'Architectural golden key for 1/2 duality octave recursion.',
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
    interpretation: 'Golden-key identity closing duality scale ladders.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

function experimentLeadingOneProtonSpace() {
  const digits = LEADING_ONE_FIXTURES.map((f) => leadingDigit(f.value));
  const pass = digits.every((d) => d === 1) && LEADING_ONE_FIXTURES.length >= 2;
  return {
    id: 'E3_leading_one_proton_space',
    title: 'Leading digit 1 fixtures map to Proton Space filing',
    digits,
    fixtures: LEADING_ONE_FIXTURES.map((f) => f.name),
    pass,
    interpretation: 'Φ and ℏ-mantissa talk share leading-1 Proton Space filing.',
    honesty: 'Catalog digit filing — not CODATA causation.',
  };
}

function experimentStructuralTwoElectronTheater() {
  const binary = STRUCTURAL_TWO_FIXTURES.find((f) => f.name === 'binary_prime_base');
  const angular = STRUCTURAL_TWO_FIXTURES.find((f) => f.name === 'angular_factor');
  const pass =
    binary?.value === 2 && Math.abs((angular?.value ?? 0) - 2 * Math.PI) < 1e-12;
  return {
    id: 'E4_structural_two_electron_theater',
    title: 'Structural 2 fixtures map to Electron Theater filing',
    binary: binary?.value,
    angular: angular?.value,
    pass,
    interpretation: 'Sole-even prime 2 + 2π factor as Electron Theater anchors.',
    honesty: 'Catalog structural filing — not QED orbital proof.',
  };
}

function experimentPsiCore() {
  const phase = (2 * Math.PI) / PHI_EGS;
  const pass = Number.isFinite(phase) && phase > 0;
  return {
    id: 'E5_psi_core_proton_space',
    title: 'Ψ_core(1) catalog evaluate is finite',
    mag: 1,
    phase,
    pass,
    interpretation: 'Proton Space core wave filing under Φ phase.',
    honesty: 'Algebraic catalog evaluate — not measured spinors.',
  };
}

function experimentV2Theater() {
  const N = 24;
  let sum = 0;
  for (let n = 1; n <= N; n++) {
    sum += PHI_EGS ** n / (2 * Math.log(2));
  }
  return {
    id: 'E6_v2_electron_theater',
    title: 'V₂ Electron Theater partial sum is finite and positive',
    N,
    sum,
    pass: Number.isFinite(sum) && sum > 0,
    interpretation: 'Electron Theater volumetric capacity catalog sum.',
    honesty: 'Truncated series fixture — not infinite physical volume.',
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
    honesty: 'Not astronomy proof that stars rewrite SI digits.',
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
    hasProton: /Proton Space|leading digit/i.test(paper),
    hasElectron: /Electron Theater|structural/i.test(paper),
    hasHbar: /hbar|\\hbar|ℏ|Planck/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    blogExists: Boolean(blog),
    blogSlug:
      blog.includes(SHIP_BLOG_SLUG) || blog.includes('proton-space-electron-theater'),
    blogHonesty: /Honesty/i.test(blog),
  };
  return {
    id: 'E8_paper_blog_locks',
    title: 'Paper + ship-blog honesty / Fair Exchange / 1↔2 duality locks',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    blogPath: MONOREPO_BLOG,
    ...checks,
    pass: Boolean(paper) && Object.values(checks).every(Boolean),
    interpretation: 'Surfaces must carry catalog framing + 1/2 duality, not CODATA overclaim.',
    honesty: 'Structural text locks — not metrology validation.',
  };
}

function experimentRegistryId() {
  return {
    id: 'E9_registry_id',
    title: 'Registry id + engine shelf fixture',
    REGISTRY_ID,
    DOC_ID,
    pass: REGISTRY_ID === 'synthobs-proton-space-electron-theater-2026-09',
    interpretation: 'Canonical registry id for Infinite Octaves engine pin #16.',
    honesty: 'Naming lock.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentGoldenIdentity(),
    experimentLeadingOneProtonSpace(),
    experimentStructuralTwoElectronTheater(),
    experimentPsiCore(),
    experimentV2Theater(),
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
