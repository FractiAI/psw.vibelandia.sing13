/**
 * CW-1 — Design locks + infrastructure pilot
 * CW-2 — Four-condition 200-rep synthetic simulation (Appendix B)
 */
import {
  CONDITIONS,
  COST_CATEGORIES,
  PRIMARY_ENDPOINTS,
  CALENDAR_HORIZON_DAYS,
  PRESPECIFIED_REPETITIONS,
  PRODUCTIVE_HOURS_BASE,
  PILOT_REPETITIONS,
  DIGITAL_SEED,
  FINDINGS_NOT_ESTABLISHED,
  NOT_COMPLETED_SIMULATION,
  SIMULATION_EXECUTED,
  SYNTHETIC_ONLY,
} from './constants.mjs';
import { runFourConditionSimulation } from './simulation.mjs';

export const APPENDIX_B_PLACEHOLDER = 'To be calculated';

/** Deterministic PRNG (Mulberry32). */
export function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function verifyDesignLocks() {
  const factorial =
    CONDITIONS.length === 4 &&
    CONDITIONS.some((c) => c.id === 'A' && !c.pipeline) &&
    CONDITIONS.some((c) => c.id === 'B' && c.pipeline) &&
    CONDITIONS.some((c) => c.id === 'C' && !c.pipeline && c.env === 'wet-lab-first') &&
    CONDITIONS.some((c) => c.id === 'D' && c.pipeline && c.env === 'wet-lab-first');
  return {
    four_condition_factorial: factorial,
    calendar_horizon_365: CALENDAR_HORIZON_DAYS === 365,
    prespecified_reps_200: PRESPECIFIED_REPETITIONS >= 200,
    productive_hours_declared: PRODUCTIVE_HOURS_BASE === 1760,
    cost_categories_complete: COST_CATEGORIES.length >= 10,
    primary_endpoints_declared: PRIMARY_ENDPOINTS.length >= 5,
    simulation_executed_flag: SIMULATION_EXECUTED === true,
    synthetic_only_flag: SYNTHETIC_ONLY === true,
    findings_not_established_flag: FINDINGS_NOT_ESTABLISHED === false,
    not_completed_simulation_flag: NOT_COMPLETED_SIMULATION === false,
  };
}

/** Infrastructure pilot — event skeleton only; outputs explicitly non-decisive. */
export function runInfrastructurePilot({ seed = DIGITAL_SEED, reps = PILOT_REPETITIONS } = {}) {
  const rnd = mulberry32(seed);
  const byCondition = Object.fromEntries(CONDITIONS.map((c) => [c.id, { reps: 0, unfinished_at_365: 0 }]));
  for (let r = 0; r < reps; r++) {
    for (const c of CONDITIONS) {
      byCondition[c.id].reps += 1;
      if (rnd() > 0.35) byCondition[c.id].unfinished_at_365 += 1;
    }
  }
  return {
    seed,
    reps,
    infrastructureOnly: true,
    findingsEstablished: false,
    byCondition,
    honesty:
      'Pilot counts unfinished-at-365 placeholders only — not calibrated science productivity; do not use for superiority claims.',
  };
}

export function runCw2Simulation(options = {}) {
  return runFourConditionSimulation({
    seed: DIGITAL_SEED,
    repetitions: PRESPECIFIED_REPETITIONS,
    ...options,
  });
}

export function runComputationalLabBattery() {
  const plainChecks = verifyDesignLocks();
  const pilot = runInfrastructurePilot();
  const cw2 = runCw2Simulation();
  const appendixPopulated =
    cw2.findingsEstablished === true &&
    cw2.repetitions >= 200 &&
    cw2.summary?.A?.validated_discoveries > 0;
  const allPlainPass =
    Object.values(plainChecks).every(Boolean) &&
    pilot.findingsEstablished === false &&
    pilot.infrastructureOnly === true &&
    appendixPopulated === true &&
    cw2.syntheticOnly === true;
  return {
    designLocks: plainChecks,
    pilot,
    cw2,
    plainChecks: {
      ...plainChecks,
      pilot_non_decisive: pilot.findingsEstablished === false,
      cw2_appendix_populated: appendixPopulated,
    },
    allPlainPass,
    honesty:
      'CW-1 verifies prespecified design; CW-2 populates Appendix B under declared synthetic parameters — not real-world calibration.',
  };
}
