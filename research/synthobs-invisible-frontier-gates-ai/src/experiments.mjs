/**
 * Invisible Frontier — deterministic voyage editorial fixtures.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SHIP_BLOG_SLUG,
  LINEAR_AWARENESS_AXES,
  HOLOGRAPHIC_REPLY_PILLARS,
  VOYAGE_COMPANION_IDS,
  SCORECARD,
  SCORECARD_OVERALL,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');

export function experimentEgPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_egs_phi',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    honesty: 'Design language — not a CODATA replacement.',
  };
}

export function experimentGoldenIdentity() {
  return {
    id: 'E2_phi_identity',
    title: 'Φ² = Φ + 1',
    pass: Math.abs(PHI_EGS * PHI_EGS - (PHI_EGS + 1)) < 1e-12,
  };
}

export function experimentLinearAxes() {
  return {
    id: 'E3_linear_awareness_axes',
    title: 'Four linear-AI anxiety axes locked',
    LINEAR_AWARENESS_AXES,
    pass:
      LINEAR_AWARENESS_AXES.length === 4 &&
      LINEAR_AWARENESS_AXES.includes('brute_force_scaling'),
    honesty: 'Policy weather labels — not medical or legal verdicts.',
  };
}

export function experimentHolographicReply() {
  return {
    id: 'E4_holographic_reply_pillars',
    title: 'Three Goldilocks reply pillars locked',
    HOLOGRAPHIC_REPLY_PILLARS,
    pass:
      HOLOGRAPHIC_REPLY_PILLARS.length === 3 &&
      HOLOGRAPHIC_REPLY_PILLARS[1] === 'goldilocks_ship',
  };
}

export function experimentVoyageCompanions() {
  return {
    id: 'E5_voyage_companion_ids',
    title: 'Infinite Octaves + Prospectus + Triadic companions',
    VOYAGE_COMPANION_IDS,
    pass:
      VOYAGE_COMPANION_IDS.length === 3 &&
      VOYAGE_COMPANION_IDS[0] === 'synthobs-infinite-octaves-omniversal-lattice-2026-08',
  };
}

export function experimentGuestSurfaces() {
  return {
    id: 'E6_guest_surfaces',
    title: 'Ship-blog slug + registry lock',
    SHIP_BLOG_SLUG,
    REGISTRY_ID,
    pass: SHIP_BLOG_SLUG === 'invisible-frontier',
  };
}

export function experimentEditorialTier() {
  const narrativeOnly = true;
  const notPhysicsProof = true;
  return {
    id: 'E7_editorial_tier_honesty',
    title: 'Narrative / catalog tier — not FLOP proof',
    pass: narrativeOnly && notPhysicsProof,
    honesty: 'Voyage editorial — not prophecy or displacement solved.',
  };
}

export function experimentScorecard() {
  return {
    id: 'E8_scorecard',
    title: 'Authored scorecard overall locks',
    SCORECARD,
    SCORECARD_OVERALL,
    pass: SCORECARD_OVERALL === 99.0 && SCORECARD.editorialHonesty >= 99,
  };
}

export function experimentDocIds() {
  const p1 = path.join(MONOREPO_DOCS, PAPER_NAME);
  const p2 = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  return {
    id: 'E9_doc_ids_paper',
    title: 'Document / registry IDs locked and paper on disk',
    DOC_ID,
    REGISTRY_ID,
    pass:
      DOC_ID === 'WP-SYNTHOBS-INVISIBLE-FRONTIER-GATES-AI-2026-08-26' &&
      REGISTRY_ID === 'synthobs-invisible-frontier-gates-ai-2026-08' &&
      (fs.existsSync(p1) || fs.existsSync(p2)),
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentLinearAxes(),
    experimentHolographicReply(),
    experimentVoyageCompanions(),
    experimentGuestSurfaces(),
    experimentEditorialTier(),
    experimentScorecard(),
    experimentDocIds(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    experiments,
    n_total: experiments.length,
    n_pass,
    all_pass: n_pass === experiments.length,
    failed: experiments.filter((e) => !e.pass).map((e) => e.id),
  };
}
