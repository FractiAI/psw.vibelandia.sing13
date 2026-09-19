/**
 * Linear Shadow of Fractal — catalog suite fixtures.
 * Cast = linear · body = fractal_holographic · instruments retained.
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
  CAST_ROLE,
  BODY_ROLE,
  PROJECTION_RELATION,
  LINEAR_SILHOUETTE,
  INSTRUMENT_LOCK,
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
    interpretation: 'Architectural golden key for projection / nesting grammar.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentCastRole() {
  return {
    id: 'E2_cast_role',
    title: 'Cast role = linear',
    CAST_ROLE,
    pass: CAST_ROLE === 'linear',
    interpretation: 'Silhouette / one-axis projection role frozen.',
    honesty: 'Catalog role — not a claim that linear algebra is false.',
  };
}

function experimentBodyRole() {
  return {
    id: 'E3_body_role',
    title: 'Body role = fractal_holographic',
    BODY_ROLE,
    pass: BODY_ROLE === 'fractal_holographic',
    interpretation: 'Recursive nesting body that casts the silhouette.',
    honesty: 'Soft Story architecture — not unfinished QG proof.',
  };
}

function experimentProjectionRelation() {
  return {
    id: 'E4_projection_relation',
    title: 'Cast = projection_of(body)',
    PROJECTION_RELATION,
    CAST_ROLE,
    BODY_ROLE,
    pass:
      PROJECTION_RELATION === 'cast = projection_of(body)' &&
      CAST_ROLE === 'linear' &&
      BODY_ROLE === 'fractal_holographic' &&
      CAST_ROLE !== BODY_ROLE,
    interpretation: 'Dual lock — silhouette is not the body.',
    honesty: 'Geometry Soft Story — not laboratory optics.',
  };
}

function experimentLinearSilhouette() {
  const expected = ['flops_axis', 'cluster_scale', 'market_share', 'single_axis_risk'];
  const pass =
    LINEAR_SILHOUETTE.length === expected.length &&
    LINEAR_SILHOUETTE.every((s, i) => s === expected[i]);
  return {
    id: 'E5_linear_silhouette',
    title: 'Linear AI-race silhouette axis (4 steps)',
    LINEAR_SILHOUETTE: [...LINEAR_SILHOUETTE],
    pass,
    interpretation: 'One-axis race story as navigable silhouette — not whole map.',
    honesty: 'Catalog silhouette — not exhaustive intelligence ontology.',
  };
}

function experimentInstrumentLock() {
  const pass =
    INSTRUMENT_LOCK.linearInstrumentsRetained === true &&
    INSTRUMENT_LOCK.discardLinearTooling === false;
  return {
    id: 'E6_instrument_lock',
    title: 'Linear instruments retained (CMOS pin)',
    INSTRUMENT_LOCK,
    pass,
    interpretation: 'Shadows navigate — do not discard silicon linear dialect.',
    honesty: 'Engineering discipline lock — not fab certification.',
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
    hasCast: /CAST_ROLE|linear.*cast|cast.*linear|Linear = cast/i.test(paper),
    hasBody: /fractal|BODY_ROLE|holographic/i.test(paper),
    hasShadow: /shadow|silhouette|projection/i.test(paper),
    hasFair: /Fair Exchange/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasEngine: /ENGINE_SHELF|engine pin|Infinite Octaves/i.test(paper),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E7_paper_locks',
    title: 'Paper narrative locks (cast · body · shadow · engine)',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    ...checks,
    pass,
    interpretation: 'Paper must keep honesty rails and dual cast/body lock.',
    honesty: 'Structural text locks — not market validation.',
  };
}

function experimentShipBlogLock() {
  const exists = fs.existsSync(MONOREPO_BLOG);
  const body = exists ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const hasSlug =
    body.includes(`/ship-blog/${SHIP_BLOG_SLUG}`) || body.includes('linear-shadow-fractal');
  const hasWhitepaper =
    body.includes('/whitepaper/linear-shadow-fractal') ||
    body.includes('synthobs-linear-shadow-fractal-2026-09');
  const hasThesis = /shadow of fractal|linear.*shadow|cast|silhouette|fractal/i.test(body);
  return {
    id: 'E8_ship_blog_lock',
    title: 'Ship-blog surfaces linear-shadow-fractal + full paper link',
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
    id: 'E9_phi_squared_identity',
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
    experimentCastRole(),
    experimentBodyRole(),
    experimentProjectionRelation(),
    experimentLinearSilhouette(),
    experimentInstrumentLock(),
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
