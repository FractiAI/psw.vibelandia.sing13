/**
 * CW-1 — Design locks + optional infrastructure pilot (no established comparative findings)
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
} from './constants.mjs';

export const APPENDIX_B_PLACEHOLDER = 'To be calculated';

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
    findings_not_established_flag: FINDINGS_NOT_ESTABLISHED === true,
    not_completed_simulation_flag: NOT_COMPLETED_SIMULATION === true,
    appendix_tables_placeholder: APPENDIX_B_PLACEHOLDER === 'To be calculated',
  };
}

/** Infrastructure pilot — event skeleton only; outputs explicitly non-decisive. */
export function runInfrastructurePilot({ seed = DIGITAL_SEED, reps = PILOT_REPETITIONS } = {}) {
  let t = seed >>> 0;
  const rnd = () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
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

export function runDigitalLabBattery() {
  const plainChecks = verifyDesignLocks();
  const pilot = runInfrastructurePilot();
  const allPlainPass =
    Object.values(plainChecks).every(Boolean) &&
    pilot.findingsEstablished === false &&
    pilot.infrastructureOnly === true;
  return {
    designLocks: plainChecks,
    pilot,
    plainChecks: { ...plainChecks, pilot_non_decisive: pilot.findingsEstablished === false },
    allPlainPass,
    honesty:
      'CW-1 verifies prespecified four-condition design and cost endpoints; comparative numerical findings await full execution per Appendix B.',
  };
}
