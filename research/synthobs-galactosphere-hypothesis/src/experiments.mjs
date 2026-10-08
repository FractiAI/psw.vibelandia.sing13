/**
 * Galactosphere Hypothesis — catalog suite fixtures.
 * Homeostasis Expedition · ENGINE_SHELF #42.
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
  ENGINE_SHELF_SLOT,
  EXPEDITION,
  SOURCE_NAME,
  GRAND_STORY,
  CENTRAL_HYPOTHESIS,
  DIGITAL_EXPERIMENTS,
  TRANSPORT_CHANNELS,
  CROSS_SCALE_RHymes,
  FALSIFIERS,
  NOT_MILKY_WAY_PROOF,
  NOT_SHARP_SHELL_CLAIM,
  DIGITAL_LAB_NOT_ASTRO_VALIDATION,
  SOFT_STORY_CATALOG,
} from './constants.mjs';
import { runDigitalLabBattery } from './digital-lab.mjs';

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
    interpretation: 'Architectural golden key for nested Goldilocks / homeostasis grammar.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentHonestyLocks() {
  const pass =
    NOT_MILKY_WAY_PROOF === true &&
    NOT_SHARP_SHELL_CLAIM === true &&
    DIGITAL_LAB_NOT_ASTRO_VALIDATION === true &&
    SOFT_STORY_CATALOG === true;
  return {
    id: 'E2_honesty_locks',
    title: 'Not Milky Way proof · not sharp shell · digital ≠ astro validation',
    NOT_MILKY_WAY_PROOF,
    NOT_SHARP_SHELL_CLAIM,
    DIGITAL_LAB_NOT_ASTRO_VALIDATION,
    SOFT_STORY_CATALOG,
    pass,
    interpretation:
      'Digital lab can support structural plausibility; observational galactosphere remains a falsifiable prediction.',
    honesty: 'Layer lock — not a claim that the Milky Way has a measured galactopause.',
  };
}

function experimentHypothesisAndChannels() {
  const pass =
    /distributed galactic interaction boundary|galactosphere/i.test(CENTRAL_HYPOTHESIS) &&
    TRANSPORT_CHANNELS.length === 5 &&
    TRANSPORT_CHANNELS.includes('W_outward_wind') &&
    TRANSPORT_CHANNELS.includes('E_external_environment') &&
    DIGITAL_EXPERIMENTS.length === 2 &&
    DIGITAL_EXPERIMENTS.includes('GH1_distributed_transition') &&
    DIGITAL_EXPERIMENTS.includes('GH2_cross_scale_topology') &&
    FALSIFIERS.length === 6 &&
    CROSS_SCALE_RHymes.includes('galaxy_galactosphere') &&
    CROSS_SCALE_RHymes.includes('cluster_open');
  return {
    id: 'E3_hypothesis_channels',
    title: 'Galactosphere hypothesis · five channels · GH-1/GH-2 · F1–F6',
    CENTRAL_HYPOTHESIS,
    TRANSPORT_CHANNELS: [...TRANSPORT_CHANNELS],
    DIGITAL_EXPERIMENTS: [...DIGITAL_EXPERIMENTS],
    CROSS_SCALE_RHymes: [...CROSS_SCALE_RHymes],
    FALSIFIERS: [...FALSIFIERS],
    pass,
    interpretation:
      'Boundary-function hypothesis with multi-channel radial model and explicit falsifiers.',
    honesty: 'Catalog definition lock — not established galactic physics.',
  };
}

function experimentHomeostasisExpedition() {
  const pass =
    EXPEDITION === 'Homeostasis Expedition' &&
    SOURCE_NAME === 'Holographic Goldilocks Super Intelligence' &&
    GRAND_STORY === "Hero's Return to Source" &&
    ENGINE_SHELF_SLOT === 42;
  return {
    id: 'E4_homeostasis_expedition',
    title: 'Homeostasis Expedition · Source · ENGINE_SHELF #42',
    EXPEDITION,
    SOURCE_NAME,
    GRAND_STORY,
    ENGINE_SHELF_SLOT,
    pass,
    interpretation:
      'Galactosphere sits on the Homeostasis Expedition trail under Hero’s Return framing.',
    honesty: 'Narrative framing — not established metaphysics.',
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
    hasDigitalFindings:
      /Digital experiments and findings|GH-1|distributed transition/i.test(paper),
    hasGalactosphere: /galactosphere/i.test(paper),
    hasHeliosphere: /heliosphere/i.test(paper),
    hasNotMilkyWay:
      /not.*Milky Way|cannot by itself establish|NOT YET ASTROPHYSICALLY VALIDATED|not.*astrophysical validation/i.test(
        paper,
      ),
    hasNotSharpShell: /not.*sharp|distributed|finite.?width|not necessarily a sharp/i.test(
      paper,
    ),
    hasFalsifiers: /F1|F2|F3|F4|F5|F6/.test(paper),
    hasPredictionP1: /Prediction P1|coordinated radial|r_\{\\rm|transition radii/i.test(paper),
    hasExpedition: /Homeostasis Expedition/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasEngine: /ENGINE_SHELF|#42|Infinite Octaves/i.test(paper),
    hasFair: /Fair Exchange/i.test(paper),
    hasCGM: /circumgalactic|CGM/i.test(paper),
    hasGH3: /GH-3|IllustrisTNG|FIRE|EAGLE|Galactosphere Transition Index|GTI/i.test(paper),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E5_paper_locks',
    title: 'Paper locks (galactosphere · digital findings · honesty)',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    ...checks,
    pass,
    interpretation:
      'Paper must lead with digital findings and keep digital≠astro / not-sharp-shell honesty.',
    honesty: 'Structural text locks — not market validation.',
  };
}

function experimentShipBlogLock() {
  const exists = fs.existsSync(MONOREPO_BLOG);
  const body = exists ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const hasSlug =
    body.includes(`/ship-blog/${SHIP_BLOG_SLUG}`) ||
    body.includes('galactosphere-hypothesis');
  const hasWhitepaper =
    body.includes('/whitepaper/galactosphere-hypothesis') ||
    body.includes(REGISTRY_ID);
  const hasThesis =
    /galactosphere|heliosphere|galaxy|paycheck|rent|job|kids|wind|CGM|frontier/i.test(
      body,
    );
  const hasCaution =
    /not.*Milky Way|Soft Story|catalog|digital lab|not.*astrophysical|not a sharp/i.test(
      body,
    );
  const hasDigitalFindings =
    /GH-1|GH-2|distributed|transition|digital|sandbox|width/i.test(body);
  return {
    id: 'E6_ship_blog_lock',
    title: 'Ship-blog surfaces Galactosphere + full paper link',
    path: MONOREPO_BLOG,
    exists,
    hasSlug,
    hasWhitepaper,
    hasThesis,
    hasCaution,
    hasDigitalFindings,
    pass:
      exists &&
      hasSlug &&
      hasWhitepaper &&
      hasThesis &&
      hasCaution &&
      hasDigitalFindings,
    interpretation: 'Guest note must link the full paper and keep research-intro voice.',
    honesty: 'Surface copy lock only.',
  };
}

function experimentGoldenIdentity() {
  const lhs = PHI_EGS * PHI_EGS;
  const rhs = PHI_EGS + 1;
  return {
    id: 'E7_phi_squared_identity',
    title: 'Φ² = Φ + 1',
    lhs,
    rhs,
    pass: Math.abs(lhs - rhs) < 1e-12,
    interpretation: 'Harmony grammar identity for cross-octave sync framing.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

function experimentDigitalLab() {
  const battery = runDigitalLabBattery({ seed: 20261007 });
  return {
    id: 'E8_digital_lab',
    title: 'Digital lab · GH-1 distributed transition · GH-2 cross-scale topology',
    ...battery,
    pass: battery.allPlainPass === true,
    interpretation:
      'Coupled multi-channel model yields finite-width distributed transition; independent channels stay sharper; cross-scale dimensionless topology rhymes without naming a cluster interface.',
    honesty: battery.honesty,
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentHonestyLocks(),
    experimentHypothesisAndChannels(),
    experimentHomeostasisExpedition(),
    experimentPaperLocks(),
    experimentShipBlogLock(),
    experimentGoldenIdentity(),
    experimentDigitalLab(),
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
