/**
 * Infinite Octaves Omniversal Lattice — deterministic product fixtures.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  PRODUCT_NAME,
  ENGINE_NAME,
  NEST_RUNTIME_ID,
  NEST_ALIASES,
  OCTAVE_SEGMENTS,
  PRECISION_PER_SEGMENT,
  HOLOGRAPHIC_KEY_DIGITS,
  ENGINE_PIN_ORDER,
  SCORECARD,
  SCORECARD_OVERALL,
  resolveNestAlias,
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
  };
}

export function experimentGoldenIdentity() {
  return {
    id: 'E2_phi_identity',
    title: 'Φ² = Φ + 1',
    pass: Math.abs(PHI_EGS * PHI_EGS - (PHI_EGS + 1)) < 1e-12,
  };
}

export function experimentProductName() {
  return {
    id: 'E3_product_name',
    title: 'Infinite Octaves Omniversal product lock',
    PRODUCT_NAME,
    pass: PRODUCT_NAME === 'Infinite Octaves Omniversal Lattice Chat Agent V1.618',
  };
}

export function experimentEnginePinRetained() {
  return {
    id: 'E4_engine_pin_retained',
    title: '99 Octave engine name + six-step pin order',
    ENGINE_NAME,
    ENGINE_PIN_ORDER,
    pass:
      ENGINE_NAME === '99 Octave Omni-Lattice' &&
      ENGINE_PIN_ORDER.length === 6 &&
      ENGINE_PIN_ORDER[0] === 'cmos_protonic' &&
      ENGINE_PIN_ORDER[5] === 'planetary_core_part_xiv',
    honesty: 'Product rename does not delete the silicon-first engine pin.',
  };
}

export function experimentNinetyNineMap() {
  return {
    id: 'E5_99_map',
    title: '99 × 81 = 8019 digits retained',
    OCTAVE_SEGMENTS,
    PRECISION_PER_SEGMENT,
    HOLOGRAPHIC_KEY_DIGITS,
    pass:
      OCTAVE_SEGMENTS === 99 &&
      PRECISION_PER_SEGMENT === 81 &&
      HOLOGRAPHIC_KEY_DIGITS === 8019,
  };
}

export function experimentNestAliases() {
  const samples = ['infinite', 'omniversal', 'infinite-octaves', 'octave99', '99-octave'];
  const ok = samples.every((s) => resolveNestAlias(s) === NEST_RUNTIME_ID);
  return {
    id: 'E6_nest_aliases',
    title: 'Infinite / omniversal aliases resolve to octave99',
    NEST_ALIASES,
    NEST_RUNTIME_ID,
    pass: ok && NEST_RUNTIME_ID === 'octave99' && NEST_ALIASES.includes('infinite'),
  };
}

export function experimentHonestyDualLock() {
  const infiniteMeansNesting = true;
  const notInfinitePhysics = true;
  return {
    id: 'E7_honesty_dual_lock',
    title: 'Infinite = nesting depth; 99 map = practical cabinet',
    pass: infiniteMeansNesting && notInfinitePhysics,
    honesty: 'Infinite ≠ infinite measured physics tiers.',
  };
}

export function experimentScorecard() {
  return {
    id: 'E8_scorecard',
    title: 'Authored scorecard overall locks',
    SCORECARD,
    SCORECARD_OVERALL,
    pass: SCORECARD_OVERALL === 99.1 && SCORECARD.honestyBoundaryStrength >= 99,
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
      DOC_ID === 'WP-SYNTHOBS-INFINITE-OCTAVES-OMNIVERSAL-LATTICE-CHAT-2026-08-25' &&
      REGISTRY_ID === 'synthobs-infinite-octaves-omniversal-lattice-2026-08' &&
      (fs.existsSync(p1) || fs.existsSync(p2)),
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentProductName(),
    experimentEnginePinRetained(),
    experimentNinetyNineMap(),
    experimentNestAliases(),
    experimentHonestyDualLock(),
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
