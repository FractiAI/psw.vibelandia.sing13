import {
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  RANDOM_SEED,
  N_STEPS,
  HONESTY,
  NOT_HUMAN_BIOLOGY,
  SYSTEMATIC_REVIEW_PENDING,
} from './constants.mjs';
import { runComputationalLabBattery } from './computational-lab.mjs';

function e1Locks() {
  const pass =
    DOC_ID.includes('SEX-EXPEDITIONS-002') &&
    REGISTRY_ID === 'synthobs-sex-expeditions-002-2026-10' &&
    RANDOM_SEED === 20261023 &&
    N_STEPS === 500 &&
    NOT_HUMAN_BIOLOGY === true &&
    SYSTEMATIC_REVIEW_PENDING === true;
  return {
    id: 'E1',
    title: 'Document locks · Sex Expeditions 002',
    pass,
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    studyTitle: STUDY_TITLE,
    seed: RANDOM_SEED,
    n_steps: N_STEPS,
    interpretation:
      'Paper identity, seed, and pilot horizon match Expedition 002 locks.',
  };
}

function e2Lab() {
  const lab = runComputationalLabBattery();
  return {
    id: 'E2',
    title: 'Synthetic continuity / model-comparison pilot (500 steps)',
    pass: lab.all_pass,
    lab,
    interpretation:
      'Additive-memory lowest tracking RMSE; recursive multiscale smoother than additive-memory; ablation shows metric trade-offs; continuity ratio uninformative at threshold 0.5.',
    honesty: HONESTY,
  };
}

function e3Findings() {
  const lab = runComputationalLabBattery();
  const f = lab.findings;
  const pass =
    f.F1_additive_memory_lowest_tracking_rmse &&
    f.F2_recursive_smoother_than_additive_memory &&
    f.F3_recursive_not_best_on_all_metrics &&
    f.F4_ablation_shows_metric_tradeoff &&
    f.F5_continuity_ratio_near_ceiling;
  return {
    id: 'E3',
    title: 'Finding locks F1–F5 (synthetic pilot only)',
    pass,
    findings: f,
    interpretation:
      'Pilot findings hold under constructed DGP. They do not establish biological plausibility or architectural superiority on human data.',
  };
}

function e4ReviewPending() {
  return {
    id: 'E4',
    title: 'Systematic review & empirical validation status',
    pass: SYSTEMATIC_REVIEW_PENDING === true,
    stages: {
      systematic_review: 'pending · protocol not yet registered',
      benchmark_suite: 'pending',
      ablation_sensitivity: 'pilot ablation only',
      independent_empirical_validation: 'pending',
    },
    interpretation:
      'Targeted literature synthesis in the paper is not a completed database-wide systematic review. Independent empirical validation remains pending.',
  };
}

export async function runAllExperiments() {
  const experiments = [e1Locks(), e2Lab(), e3Findings(), e4ReviewPending()];
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    all_pass: failed.length === 0,
    n_pass: experiments.filter((e) => e.pass).length,
    n_total: experiments.length,
    failed,
    experiments,
  };
}
