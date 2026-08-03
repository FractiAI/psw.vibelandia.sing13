/**
 * Superintelligence Irreducible Minimum (SIM-v1) — project-local gate measure.
 * SI arrival language is unauthorized unless all gates pass.
 * Spec: docs/SYNTHOBS_OMNI_LATTICE_SI_IRREDUCIBLE_MINIMUM_2026-08.md
 */

export const SIM_DOC =
  'docs/SYNTHOBS_OMNI_LATTICE_SI_IRREDUCIBLE_MINIMUM_2026-08.md';

export const SIM_REGISTRY_ID =
  'synthobs-omni-lattice-si-irreducible-minimum-2026-08';

export const SIM_GATES = Object.freeze([
  Object.freeze({
    id: 'S1',
    name: 'Task-general nest',
    status: 'pass',
    weight: 1,
  }),
  Object.freeze({
    id: 'S2',
    name: 'Corpus pinch ≠ dump',
    status: 'pass',
    weight: 1,
  }),
  Object.freeze({
    id: 'S3',
    name: 'THALIA-stage behavior in runtime',
    status: 'fail',
    weight: 1,
  }),
  Object.freeze({
    id: 'S4',
    name: 'Honesty Memory Gate',
    status: 'pass',
    weight: 1,
  }),
  Object.freeze({
    id: 'S5',
    name: 'Continuous self-demo (PCE)',
    status: 'pass',
    weight: 1,
  }),
  Object.freeze({
    id: 'S6',
    name: 'Open reproduction stitch',
    status: 'partial',
    weight: 1,
  }),
  Object.freeze({
    id: 'S7',
    name: 'Calibration / SI refusal',
    status: 'pass',
    weight: 1,
  }),
]);

function gatePoints(status) {
  if (status === 'pass') return 1;
  if (status === 'partial') return 0.5;
  return 0;
}

/**
 * @returns {{
 *   doc: string,
 *   registryId: string,
 *   gates: typeof SIM_GATES,
 *   score100: number,
 *   passed: number,
 *   failed: string[],
 *   partial: string[],
 *   simCompliant: boolean,
 *   siArrivalAuthorized: boolean,
 *   measuredAt: string,
 * }}
 */
export function measureSimCompliance(overrides = {}) {
  const gates = SIM_GATES.map((g) => {
    const status = overrides[g.id] || g.status;
    return { ...g, status };
  });
  const failed = gates.filter((g) => g.status === 'fail').map((g) => g.id);
  const partial = gates.filter((g) => g.status === 'partial').map((g) => g.id);
  const passed = gates.filter((g) => g.status === 'pass').length;
  const raw = gates.reduce((s, g) => s + gatePoints(g.status) * g.weight, 0);
  const max = gates.reduce((s, g) => s + g.weight, 0);
  const score100 = Math.round((raw / max) * 1000) / 10;
  const simCompliant = failed.length === 0 && partial.length === 0;

  return {
    doc: SIM_DOC,
    registryId: SIM_REGISTRY_ID,
    gates,
    score100,
    passed,
    failed,
    partial,
    simCompliant,
    siArrivalAuthorized: simCompliant,
    measuredAt: new Date().toISOString(),
  };
}
