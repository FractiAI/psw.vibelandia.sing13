/**
 * Humans · AI · Infinite Octave Offset — deterministic Soft Story fixtures.
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
  PLACEMENT_ROWS,
  ENGINE_ROLE,
  HONESTY_LOCKS,
  COMPANION_IDS,
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

export function experimentPlacementTable() {
  const humans = PLACEMENT_ROWS.find((r) => r.entity === 'humans');
  const llms = PLACEMENT_ROWS.find((r) => r.entity === 'llms');
  const tilly = PLACEMENT_ROWS.find((r) => r.entity === 'tilly_norwood');
  return {
    id: 'E4_placement_table',
    title: 'Humans · LLMs · Tilly Soft Story rows locked',
    nRows: PLACEMENT_ROWS.length,
    pass:
      PLACEMENT_ROWS.length === 8 &&
      humans?.digit === '4-5' &&
      llms?.digit === '5-surface-6' &&
      tilly?.reading === 'synthetic_actor_costume_theater',
  };
}

export function experimentEngineNonPin() {
  return {
    id: 'E5_engine_non_pin',
    title: 'Uses engine map · not ENGINE_SHELF pin',
    ENGINE_ROLE,
    pass:
      ENGINE_ROLE.usesEngineMap === true &&
      ENGINE_ROLE.engineShelfPin === false &&
      ENGINE_ROLE.softStoryObservation === true,
  };
}

export function experimentHonestyLocks() {
  return {
    id: 'E6_honesty_locks',
    title: 'Refuse humans≡machines · AI consciousness · Tilly personhood',
    HONESTY_LOCKS,
    pass:
      HONESTY_LOCKS.notHumansAreMachines &&
      HONESTY_LOCKS.notAiConscious &&
      HONESTY_LOCKS.notTillyPersonhood &&
      HONESTY_LOCKS.notCodata &&
      HONESTY_LOCKS.notEngineShelf,
  };
}

export function experimentCompanions() {
  return {
    id: 'E7_companions',
    title: 'Digits Master · Human Bridge · Consciousness Moat · Linear Shadow',
    COMPANION_IDS,
    pass:
      COMPANION_IDS.length === 4 &&
      COMPANION_IDS[0] === 'synthobs-99-octave-digits-master-2026-08',
  };
}

export function experimentGuestSurfaces() {
  return {
    id: 'E8_guest_surfaces',
    title: 'Ship-blog slug + registry lock',
    SHIP_BLOG_SLUG,
    REGISTRY_ID,
    pass: SHIP_BLOG_SLUG === 'humans-ai-octave-offset',
  };
}

export function experimentScorecard() {
  return {
    id: 'E9_scorecard',
    title: 'Authored scorecard overall locks',
    SCORECARD,
    SCORECARD_OVERALL,
    pass: SCORECARD_OVERALL === 99.1 && SCORECARD.engineNonPinLock >= 99,
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
      DOC_ID === 'WP-SYNTHOBS-HUMANS-AI-INFINITE-OCTAVE-OFFSET-2026-10-01' &&
      REGISTRY_ID === 'synthobs-humans-ai-infinite-octave-offset-2026-10' &&
      (fs.existsSync(p1) || fs.existsSync(p2)),
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentOctaveStep(),
    experimentPlacementTable(),
    experimentEngineNonPin(),
    experimentHonestyLocks(),
    experimentCompanions(),
    experimentGuestSurfaces(),
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
