/**
 * CW-2 · Four-condition researcher-year event simulation (365-day cutoff)
 * Declared synthetic parameters — not calibrated to real grant portfolios.
 */
import { mulberry32 } from './digital-lab.mjs';
import {
  CALENDAR_HORIZON_DAYS,
  PRESPECIFIED_REPETITIONS,
  PRODUCTIVE_HOURS_BASE,
  DIGITAL_SEED,
  CONDITIONS,
} from './constants.mjs';

export const N_PROJECTS_PER_PORTFOLIO = 24;

/** Fully loaded researcher-year ($) — design assumption. */
export const RESEARCHER_YEAR_COST_USD = 220_000;
export const HOUR_COST = RESEARCHER_YEAR_COST_USD / PRODUCTIVE_HOURS_BASE;

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

/** Generate matched portfolio (same across A–D for repetition rep). */
function generatePortfolio(rng) {
  const projects = [];
  for (let i = 0; i < N_PROJECTS_PER_PORTFOLIO; i++) {
    const trulyValid = rng() < 0.22;
    projects.push({
      id: i,
      trulyValid,
      complexity: 0.3 + rng() * 0.7,
      implValue: 0.4 + rng() * 0.6,
      validationDifficulty: 0.2 + rng() * 0.5,
    });
  }
  return projects;
}

function envParams(condition) {
  const comp = condition.env === 'computation-first';
  const pipe = condition.pipeline;
  return {
    comp,
    pipe,
    candidateHours: comp ? 18 : 42,
    candidateCalendar: comp ? 4 : 11,
    candidateCostCompute: comp ? 850 : 120,
    candidateCostMaterials: comp ? 40 : 2800,
    candidateCostFacilities: comp ? 80 : 4200,
    substantivePassIfValid: comp ? 0.78 : 0.88,
    substantivePassIfInvalid: comp ? 0.08 : 0.03,
    validationDays: comp ? 14 : 22,
    validationCost: comp ? 4200 : 6800,
    validationSensitivity: comp ? 0.86 : 0.91,
    validationSpecificity: comp ? 0.84 : 0.9,
    fundingDelayDays: pipe ? 6 : 18,
    implDays: pipe ? 28 : 52,
    implCost: 12000 + (pipe ? 2000 : 0),
    pipelineOverheadPerProject: pipe ? 2400 : 0,
    measurableProb: pipe ? 0.72 : 0.58,
    overheadRate: 0.12,
  };
}

function simulateCondition(portfolio, condition, rng) {
  const p = envParams(condition);
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
    if (day >= CALENDAR_HORIZON_DAYS || hoursLeft <= 0) {
      counts.unfinished += 1;
      continue;
    }

    // Candidate generation
    if (hoursLeft < p.candidateHours) {
      counts.unfinished += 1;
      continue;
    }
    hoursLeft -= p.candidateHours;
    day += p.candidateCalendar;
    counts.candidates += 1;
    costs.researcher += p.candidateHours * HOUR_COST;
    if (p.comp) costs.compute += p.candidateCostCompute;
    else {
      costs.materials += p.candidateCostMaterials;
      costs.facilities += p.candidateCostFacilities;
    }

    const passSubstantive = project.trulyValid
      ? rng() < p.substantivePassIfValid
      : rng() < p.substantivePassIfInvalid;
    if (!passSubstantive) {
      costs.failed_work += p.comp ? 600 : 3200;
      if (day >= CALENDAR_HORIZON_DAYS) counts.unfinished += 1;
      continue;
    }
    counts.substantive += 1;
    const daySubstantive = day;
    times.toSubstantive.push(daySubstantive);

    day += p.validationDays;
    if (day > CALENDAR_HORIZON_DAYS) {
      counts.unfinished += 1;
      continue;
    }
    costs.validation += p.validationCost;
    costs.researcher += 8 * HOUR_COST;

    const valid =
      project.trulyValid
        ? rng() < p.validationSensitivity
        : rng() > p.validationSpecificity;
    if (!valid) {
      costs.failed_work += p.validationCost * 0.35;
      if (day >= CALENDAR_HORIZON_DAYS) counts.unfinished += 1;
      continue;
    }
    counts.validated += 1;
    if (!project.trulyValid) counts.falseAccepted += 1;
    times.toValidated.push(day);

    day += p.fundingDelayDays;
    if (day > CALENDAR_HORIZON_DAYS) {
      counts.unfinished += 1;
      continue;
    }

    day += p.implDays;
    if (day > CALENDAR_HORIZON_DAYS) {
      counts.unfinished += 1;
      continue;
    }
    costs.implementation += p.implCost;
    costs.researcher += 12 * HOUR_COST;
    if (p.pipe) costs.pipeline += p.pipelineOverheadPerProject;
    counts.implemented += 1;
    times.toImplemented.push(day);

    if (rng() < p.measurableProb) {
      counts.measurable += 1;
      times.toMeasurable.push(day + 8);
    }
  }

  costs.overhead = totalCost(costs) * p.overheadRate;
  const total = totalCost(costs);

  return {
    condition: condition.id,
    counts,
    costs,
    totalCostUsd: total,
    hoursUsed: PRODUCTIVE_HOURS_BASE - hoursLeft,
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

function meanField(runs, condId, pathFn) {
  const vals = runs.filter((r) => r.condition === condId).map(pathFn);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
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
      unfinished_projects: mean((r) => r.counts.unfinished),
      total_expenditure_usd: mean((r) => r.totalCostUsd),
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

  // Pipeline incremental (B vs A, D vs C)
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
      measurable_comp_no_pipe_minus_wet:
        summary.A.measurable_outcomes - summary.C.measurable_outcomes,
    },
    honesty:
      'CW-2 synthetic event simulation with declared cost/time parameters (seed 20261013, 200 reps). Illustrates factorial contrasts under model assumptions — not calibration to real labs or grants.',
    findingsEstablished: true,
    syntheticOnly: true,
  };
}
