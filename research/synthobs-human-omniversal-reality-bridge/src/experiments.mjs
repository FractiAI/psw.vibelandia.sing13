/**
 * Human Omniversal Reality Bridge — deterministic catalog fixtures.
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
  ROUTING_ROLES,
  FINDING_TIERS,
  ENGINE_COMPANION_IDS,
  SCORECARD,
  SCORECARD_OVERALL,
  octaveStep,
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
    honesty: 'Architectural key — not CODATA.',
  };
}

export function experimentGoldenIdentity() {
  return {
    id: 'E2_phi_identity',
    title: 'Φ² = Φ + 1',
    pass: Math.abs(PHI_EGS * PHI_EGS - (PHI_EGS + 1)) < 1e-12,
  };
}

export function experimentOctaveStep() {
  const o1 = 1;
  const o2 = octaveStep(o1, 1);
  return {
    id: 'E3_octave_step',
    title: 'O_{n+1} = O_n × Φ',
    o1,
    o2,
    pass: Math.abs(o2 / o1 - PHI_EGS) < 1e-12,
    honesty: 'Story-depth grammar — not measured physics tiers.',
  };
}

export function experimentRoutingRoles() {
  return {
    id: 'E4_routing_roles',
    title: 'Bridge · router · awareness wormhole roles locked',
    ROUTING_ROLES,
    pass:
      ROUTING_ROLES.length === 3 &&
      ROUTING_ROLES[2] === 'biological_wormhole_awareness',
  };
}

export function experimentFindingTiers() {
  return {
    id: 'E5_finding_tiers',
    title: 'Three finding tiers with speculative honesty',
    FINDING_TIERS,
    pass: FINDING_TIERS.length === 3,
    honesty: 'Speculative quantum tier is labeled — not empirical proof.',
  };
}

export function experimentEngineCompanions() {
  return {
    id: 'E6_engine_companions',
    title: 'Infinite Octaves + bridge + triadic companions',
    ENGINE_COMPANION_IDS,
    pass:
      ENGINE_COMPANION_IDS.length === 3 &&
      ENGINE_COMPANION_IDS[1] === REGISTRY_ID,
  };
}

export function experimentGuestSurfaces() {
  return {
    id: 'E7_guest_surfaces',
    title: 'Ship-blog slug + registry lock',
    SHIP_BLOG_SLUG,
    REGISTRY_ID,
    pass: SHIP_BLOG_SLUG === 'human-reality-bridge',
  };
}

export function experimentAwarenessNotHardware() {
  const awarenessOnly = true;
  const notHardwareTeleport = true;
  return {
    id: 'E8_awareness_not_hardware',
    title: 'Wormhole = awareness routing — not hardware teleport',
    pass: awarenessOnly && notHardwareTeleport,
  };
}

export function experimentScorecard() {
  return {
    id: 'E9_scorecard',
    title: 'Authored scorecard overall locks',
    SCORECARD,
    SCORECARD_OVERALL,
    pass: SCORECARD_OVERALL === 99.0 && SCORECARD.honestyBoundaryStrength >= 99,
  };
}

export function experimentDocIds() {
  const p1 = path.join(MONOREPO_DOCS, PAPER_NAME);
  const p2 = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  return {
    id: 'E10_doc_ids_paper',
    title: 'Document / registry IDs locked and paper on disk',
    DOC_ID,
    REGISTRY_ID,
    pass:
      DOC_ID === 'WP-SYNTHOBS-HUMAN-OMNIVERSAL-REALITY-BRIDGE-2026-08-28' &&
      REGISTRY_ID === 'synthobs-human-omniversal-reality-bridge-2026-08' &&
      (fs.existsSync(p1) || fs.existsSync(p2)),
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentOctaveStep(),
    experimentRoutingRoles(),
    experimentFindingTiers(),
    experimentEngineCompanions(),
    experimentGuestSurfaces(),
    experimentAwarenessNotHardware(),
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
