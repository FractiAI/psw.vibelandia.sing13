/**
 * CW-2 · Four-condition researcher-year event simulation (365-day cutoff)
 *
 * Computation-first: high-throughput daily candidate stream (screening-scale).
 * Wet-lab-first: sequential bench projects (matched 24-project portfolio).
 * Declared synthetic parameters — not calibrated to real grant portfolios.
 */
import { mulberry32 } from './computational-lab.mjs';
import {
  CALENDAR_HORIZON_DAYS,
  PRESPECIFIED_REPETITIONS,
  PRODUCTIVE_HOURS_BASE,
  DIGITAL_SEED,
  CONDITIONS,
} from './constants.mjs';

export const N_PROJECTS_PER_PORTFOLIO = 24;

/** Fully loaded researcher-year ($) — design assumption (salary + benefits). */
export const RESEARCHER_YEAR_COST_USD = 220_000;
export const HOUR_COST = RESEARCHER_YEAR_COST_USD / PRODUCTIVE_HOURS_BASE;
export const RESEARCHER_DAILY_BURN_USD = RESEARCHER_YEAR_COST_USD / CALENDAR_HORIZON_DAYS;

/** Computation-first throughput (declared screening-scale model). */
/** Tuned so computation-only arms average ~2 validated discoveries / calendar day (CW-2). */
export const COMP_CANDIDATES_PER_DAY = 40;
export const COMP_CANDIDATE_COMPUTE_USD = 1.4;
export const COMP_CANDIDATE_DATA_USD = 0.35;
export const COMP_CANDIDATE_RESEARCHER_HOURS = 0.035;
export const COMP_GROUND_TRUTH_POSITIVE_RATE = 0.09;
export const COMP_SUBSTANTIVE_IF_TRUE = 0.596;
export const COMP_SUBSTANTIVE_IF_FALSE = 0.012;
export const COMP_VALIDATION_SLOTS_PER_DAY = 15;
export const COMP_VALIDATION_DAYS_PER_ITEM = 0.2;
export const COMP_VALIDATION_COST_USD = 22;

/** Short-horizon AI/QC improvement within the researcher-year (declared, not vendor-specific). */
export function compValidationParams(day, pipeline) {
  const t = Math.min(1, Math.max(0, day / CALENDAR_HORIZON_DAYS));
  if (pipeline) {
    const ramp = Math.min(1, day / 100);
    return {
      sensitivity: 0.86 + ramp * 0.1,
      specificity: 0.79 + ramp * 0.19,
    };
  }
  const ramp = Math.min(1, day / 200);
  return {
    sensitivity: 0.85 + ramp * 0.08,
    specificity: 0.81 + ramp * 0.14,
  };
}

/** Wet-lab sequential bench (declared). */
export const WET_CANDIDATE_DAYS = 12;
export const WET_VALIDATION_DAYS = 24;
export const WET_CANDIDATE_HOURS = 48;
export const WET_MATERIALS_USD = 3200;
export const WET_FACILITIES_USD = 4800;

function emptyCosts() {
  return {
    researcher: 0,
    compute: 0,
    data: 0,
    facilities: 0,
    equipment: 0,
    materials: 0,
    validation: 0,
    failed_work: 0,
    implementation: 0,
    pipeline: 0,
    overhead: 0,
  };
}

function totalCost(c) {
  return Object.values(c).reduce((a, b) => a + b, 0);
}

function generatePortfolio(rng) {
  const projects = [];
  for (let i = 0; i < N_PROJECTS_PER_PORTFOLIO; i++) {
    projects.push({
      id: i,
      trulyValid: rng() < 0.22,
      complexity: 0.3 + rng() * 0.7,
    });
  }
  return projects;
}

function pipelineParams(pipe, { computation } = {}) {
  if (computation) {
    return {
      fundingDelayDays: pipe ? 4 : 12,
      implDays: pipe ? 18 : 32,
      implCostUsd: pipe ? 520 : 310,
      implStartsPerDay: 1,
      pipelineOverheadPerProject: pipe ? 120 : 0,
      measurableProb: pipe ? 0.72 : 0.52,
      overheadRate: 0.08,
    };
  }
  return {
    fundingDelayDays: pipe ? 6 : 18,
    implDays: pipe ? 26 : 52,
    implCostUsd: pipe ? 14_200 : 12_800,
    implStartsPerDay: 1,
    pipelineOverheadPerProject: pipe ? 2400 : 0,
    measurableProb: pipe ? 0.68 : 0.54,
    overheadRate: 0.12,
  };
}

/** High-volume computation-first year (daily screening + validation queue). */
function simulateComputationFirst(condition, rng) {
  const pipe = pipelineParams(condition.pipeline, { computation: true });
  const costs = emptyCosts();
  const counts = {
    candidates: 0,
    substantive: 0,
    validated: 0,
    implemented: 0,
    measurable: 0,
    falseAccepted: 0,
    falseAcceptedFirst90: 0,
    falseAcceptedLast90: 0,
    unfinished: 0,
  };
  const times = { toSubstantive: [], toValidated: [], toImplemented: [], toMeasurable: [] };
  const validationQueue = [];
  const implementationQueue = [];
  let implStartsToday = 0;

  let hoursLeft = PRODUCTIVE_HOURS_BASE;
  let day = 0;

  while (day < CALENDAR_HORIZON_DAYS) {
    costs.researcher += RESEARCHER_DAILY_BURN_USD;
    implStartsToday = 0;

    let slotsToday = COMP_CANDIDATES_PER_DAY;
    while (slotsToday > 0 && hoursLeft >= COMP_CANDIDATE_RESEARCHER_HOURS) {
      hoursLeft -= COMP_CANDIDATE_RESEARCHER_HOURS;
      slotsToday -= 1;
      counts.candidates += 1;
      costs.compute += COMP_CANDIDATE_COMPUTE_USD;
      costs.data += COMP_CANDIDATE_DATA_USD;
      costs.researcher += COMP_CANDIDATE_RESEARCHER_HOURS * HOUR_COST;

      const trulyValid = rng() < COMP_GROUND_TRUTH_POSITIVE_RATE;
      const passSubstantive = trulyValid
        ? rng() < COMP_SUBSTANTIVE_IF_TRUE
        : rng() < COMP_SUBSTANTIVE_IF_FALSE;
      if (!passSubstantive) {
        costs.failed_work += 2;
        continue;
      }
      counts.substantive += 1;
      times.toSubstantive.push(day);
      validationQueue.push({ dayQueued: day, trulyValid });
    }

    let valSlots = COMP_VALIDATION_SLOTS_PER_DAY;
    while (valSlots > 0 && validationQueue.length > 0) {
      const item = validationQueue.shift();
      if (day - item.dayQueued < COMP_VALIDATION_DAYS_PER_ITEM) {
        validationQueue.unshift(item);
        break;
      }
      valSlots -= 1;
      const valParams = compValidationParams(day, condition.pipeline);
      const validationCost = COMP_VALIDATION_COST_USD * (1 - 0.12 * Math.min(1, day / 180));
      costs.validation += validationCost;
      costs.researcher += 0.2 * HOUR_COST;
      const valid = item.trulyValid
        ? rng() < valParams.sensitivity
        : rng() > valParams.specificity;
      if (!valid) {
        costs.failed_work += validationCost * 0.25;
        continue;
      }
      counts.validated += 1;
      if (!item.trulyValid) {
        counts.falseAccepted += 1;
        if (day < 90) counts.falseAcceptedFirst90 += 1;
        if (day >= CALENDAR_HORIZON_DAYS - 90) counts.falseAcceptedLast90 += 1;
      }
      times.toValidated.push(day);
      implementationQueue.push({ validatedDay: day, started: false });
    }

    for (let i = 0; i < implementationQueue.length; i++) {
      const item = implementationQueue[i];
      if (item.started) {
        if (day >= item.doneDay) {
          implementationQueue.splice(i, 1);
          i -= 1;
          costs.implementation += pipe.implCostUsd;
          costs.researcher += 2 * HOUR_COST;
          if (condition.pipeline) costs.pipeline += pipe.pipelineOverheadPerProject;
          counts.implemented += 1;
          times.toImplemented.push(day);
          if (rng() < pipe.measurableProb) {
            counts.measurable += 1;
            times.toMeasurable.push(day + 3);
          }
        }
        continue;
      }
      const readyDay = item.validatedDay + pipe.fundingDelayDays;
      if (day < readyDay || implStartsToday >= pipe.implStartsPerDay) continue;
      item.started = true;
      item.doneDay = day + pipe.implDays;
      implStartsToday += 1;
    }

    day += 1;
  }

  counts.unfinished += validationQueue.length + implementationQueue.length;
  costs.overhead = totalCost(costs) * pipe.overheadRate;

  return finalizeRun(condition.id, counts, costs, times, day);
}

/** Sequential wet-lab-first year (matched portfolio). */
function simulateWetLabFirst(portfolio, condition, rng) {
  const pipe = pipelineParams(condition.pipeline, { computation: false });
  const costs = emptyCosts();
  let hoursLeft = PRODUCTIVE_HOURS_BASE;
  let day = 0;
  const counts = {
    candidates: 0,
    substantive: 0,
    validated: 0,
    implemented: 0,
    measurable: 0,
    falseAccepted: 0,
    unfinished: 0,
  };
  const times = { toSubstantive: [], toValidated: [], toImplemented: [], toMeasurable: [] };

  for (const project of portfolio) {
    if (day >= CALENDAR_HORIZON_DAYS) {
      counts.unfinished += 1;
      continue;
    }
    costs.researcher += (WET_CANDIDATE_DAYS / 2) * RESEARCHER_DAILY_BURN_USD;

    if (hoursLeft < WET_CANDIDATE_HOURS) {
      counts.unfinished += 1;
      continue;
    }
    hoursLeft -= WET_CANDIDATE_HOURS;
    day += WET_CANDIDATE_DAYS;
    counts.candidates += 1;
    costs.researcher += WET_CANDIDATE_HOURS * HOUR_COST;
    costs.materials += WET_MATERIALS_USD;
    costs.facilities += WET_FACILITIES_USD;

    const passSubstantive = project.trulyValid ? rng() < 0.86 : rng() < 0.025;
    if (!passSubstantive) {
      costs.failed_work += 3800;
      continue;
    }
    counts.substantive += 1;
    times.toSubstantive.push(day);

    day += WET_VALIDATION_DAYS;
    if (day > CALENDAR_HORIZON_DAYS) {
      counts.unfinished += 1;
      continue;
    }
    costs.validation += 7200;
    costs.researcher += 16 * HOUR_COST;
    const valid = project.trulyValid ? rng() < 0.92 : rng() > 0.91;
    if (!valid) {
      costs.failed_work += 2500;
      continue;
    }
    counts.validated += 1;
    if (!project.trulyValid) counts.falseAccepted += 1;
    times.toValidated.push(day);

    day += pipe.fundingDelayDays;
    if (day > CALENDAR_HORIZON_DAYS) {
      counts.unfinished += 1;
      continue;
    }
    day += pipe.implDays;
    if (day > CALENDAR_HORIZON_DAYS) {
      counts.unfinished += 1;
      continue;
    }
    costs.implementation += pipe.implCostUsd + 4200;
    costs.researcher += 20 * HOUR_COST;
    if (condition.pipeline) costs.pipeline += pipe.pipelineOverheadPerProject;
    counts.implemented += 1;
    times.toImplemented.push(day);
    if (rng() < pipe.measurableProb) {
      counts.measurable += 1;
      times.toMeasurable.push(day + 12);
    }
  }

  costs.overhead = totalCost(costs) * pipe.overheadRate;
  return finalizeRun(condition.id, counts, costs, times, day);
}

function finalizeRun(conditionId, counts, costs, times, horizonDays) {
  const total = totalCost(costs);
  const dailyValidated = counts.validated / CALENDAR_HORIZON_DAYS;
  const dailySubstantive = counts.substantive / CALENDAR_HORIZON_DAYS;
  const dailyTotalSpend = total / CALENDAR_HORIZON_DAYS;
  const direct =
    costs.compute +
    costs.data +
    costs.materials +
    costs.facilities +
    costs.validation +
    costs.failed_work +
    costs.implementation +
    costs.pipeline;
  const marginalPerValidated = counts.validated > 0 ? direct / counts.validated : null;
  const dailyDirectSpend = direct / CALENDAR_HORIZON_DAYS;

  return {
    condition: conditionId,
    counts,
    costs,
    totalCostUsd: total,
    directSpendUsd: direct,
    daily: {
      substantive: dailySubstantive,
      validated: dailyValidated,
      total_spend_usd: dailyTotalSpend,
      direct_spend_usd: dailyDirectSpend,
      marginal_spend_per_validated_usd: marginalPerValidated,
    },
    medians: {
      toSubstantive: median(times.toSubstantive),
      toValidated: median(times.toValidated),
      toImplemented: median(times.toImplemented),
      toMeasurable: median(times.toMeasurable),
    },
  };
}

function median(arr) {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function simulateCondition(portfolio, condition, rng) {
  if (condition.env === 'computation-first') {
    return simulateComputationFirst(condition, rng);
  }
  return simulateWetLabFirst(portfolio, condition, rng);
}

export function runFourConditionSimulation({
  seed = DIGITAL_SEED,
  repetitions = PRESPECIFIED_REPETITIONS,
} = {}) {
  const runs = [];
  for (let rep = 0; rep < repetitions; rep++) {
    const rng = mulberry32(seed + rep * 104729);
    const portfolio = generatePortfolio(rng);
    for (const condition of CONDITIONS) {
      const condRng = mulberry32(seed + rep * 104729 + condition.id.charCodeAt(0) * 997);
      runs.push(simulateCondition(portfolio, condition, condRng));
    }
  }

  const summary = {};
  for (const c of CONDITIONS) {
    const id = c.id;
    const subset = runs.filter((r) => r.condition === id);
    const mean = (fn) => subset.reduce((a, r) => a + fn(r), 0) / subset.length;
    summary[id] = {
      candidates_generated: mean((r) => r.counts.candidates),
      substantive_discoveries: mean((r) => r.counts.substantive),
      validated_discoveries: mean((r) => r.counts.validated),
      implemented_discoveries: mean((r) => r.counts.implemented),
      measurable_outcomes: mean((r) => r.counts.measurable),
      false_claims_accepted: mean((r) => r.counts.falseAccepted),
      false_claims_first_90_days: mean((r) => r.counts.falseAcceptedFirst90 ?? 0),
      false_claims_last_90_days: mean((r) => r.counts.falseAcceptedLast90 ?? 0),
      unfinished_projects: mean((r) => r.counts.unfinished),
      total_expenditure_usd: mean((r) => r.totalCostUsd),
      daily_substantive: mean((r) => r.daily.substantive),
      daily_validated: mean((r) => r.daily.validated),
      daily_total_spend_usd: mean((r) => r.daily.total_spend_usd),
      daily_direct_spend_usd: mean((r) => r.daily.direct_spend_usd),
      daily_marginal_cost_per_validated_usd: mean(
        (r) => r.daily.marginal_spend_per_validated_usd ?? 0,
      ),
      cost_per_validated:
        mean((r) => r.counts.validated) > 0
          ? mean((r) => r.totalCostUsd) / mean((r) => r.counts.validated)
          : null,
      cost_per_measurable:
        mean((r) => r.counts.measurable) > 0
          ? mean((r) => r.totalCostUsd) / mean((r) => r.counts.measurable)
          : null,
      median_time_substantive: mean((r) => r.medians.toSubstantive ?? 999),
      median_time_validated: mean((r) => r.medians.toValidated ?? 999),
      median_time_implemented: mean((r) => r.medians.toImplemented ?? 999),
      median_time_measurable: mean((r) => r.medians.toMeasurable ?? 999),
    };
  }

  const pipelineDelta = (envPair) => {
    const [noPipe, pipe] = envPair;
    return {
      validated_delta: summary[pipe].validated_discoveries - summary[noPipe].validated_discoveries,
      measurable_delta: summary[pipe].measurable_outcomes - summary[noPipe].measurable_outcomes,
      cost_delta_usd: summary[pipe].total_expenditure_usd - summary[noPipe].total_expenditure_usd,
    };
  };

  return {
    seed,
    repetitions,
    nProjects: N_PROJECTS_PER_PORTFOLIO,
    horizonDays: CALENDAR_HORIZON_DAYS,
    runs: runs.length,
    summary,
    pipelineEffect: {
      computation: pipelineDelta(['A', 'B']),
      wetLab: pipelineDelta(['C', 'D']),
    },
    environmentEffect: {
      validated_comp_minus_wet_no_pipe:
        summary.A.validated_discoveries - summary.C.validated_discoveries,
      validated_comp_pipe_minus_wet_pipe:
        summary.B.validated_discoveries - summary.D.validated_discoveries,
      daily_validated_comp_minus_wet_no_pipe:
        summary.A.daily_validated - summary.C.daily_validated,
    },
    honesty:
      'CW-2 synthetic simulation: computation-first uses declared high-throughput daily screening; wet-lab uses sequential bench portfolios. Seed 20261013, 200 reps — not calibration to real labs or grants.',
    findingsEstablished: true,
    syntheticOnly: true,
  };
}
