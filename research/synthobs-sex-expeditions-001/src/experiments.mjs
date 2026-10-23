import {
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  RANDOM_SEED,
  N_TOTAL,
  N_PER_SCENARIO,
  N_SCENARIOS,
  TRAIN_FRAC,
  HONESTY,
  NOT_HUMAN_TRAIT_ESTIMATES,
  REAL_DATA_PENDING,
} from './constants.mjs';
import { runComputationalLabBattery, TARGET_R2 } from './computational-lab.mjs';

function e1Locks() {
  const pass =
    DOC_ID.includes('SEX-EXPEDITIONS-001') &&
    REGISTRY_ID === 'synthobs-sex-expeditions-001-2026-10' &&
    RANDOM_SEED === 20261023 &&
    N_TOTAL === 28000 &&
    N_PER_SCENARIO === 4000 &&
    N_SCENARIOS === 7 &&
    TRAIN_FRAC === 0.7 &&
    NOT_HUMAN_TRAIT_ESTIMATES === true &&
    REAL_DATA_PENDING === true;
  return {
    id: 'E1',
    title: 'Document locks · Sex Expeditions 001',
    pass,
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    studyTitle: STUDY_TITLE,
    seed: RANDOM_SEED,
    n_total: N_TOTAL,
    interpretation:
      'Paper identity, seed, and synthetic sample sizes match Expedition 001 · Paper 001 locks.',
  };
}

function e2Lab() {
  const lab = runComputationalLabBattery();
  return {
    id: 'E2',
    title: 'Synthetic biology↔experience laboratory (28k · 7 scenarios)',
    pass: lab.all_pass,
    lab,
    target_means: TARGET_R2.means,
    interpretation:
      'Combined predictors improve mean held-out R² vs single predictors; interaction term helps when DGP includes interaction; noise and irrelevant predictors behave as designed.',
    honesty: HONESTY,
  };
}

function e3Findings() {
  const lab = runComputationalLabBattery();
  const f = lab.findings;
  const pass =
    f.F1_combined_improves &&
    f.F2_dominant_varies_by_trait &&
    f.F3_interactions_can_matter &&
    f.F4_noise_limits_prediction &&
    f.F5_complexity_not_always_better;
  return {
    id: 'E3',
    title: 'Finding locks F1–F5 (synthetic only)',
    pass,
    findings: f,
    interpretation:
      'Five methodological findings hold under constructed DGPs. They do not establish human trait biology/experience proportions.',
  };
}

function e4RealDataPending() {
  return {
    id: 'E4',
    title: 'Real-data program status (WVS/EVS · HARP · Add Health)',
    pass: REAL_DATA_PENDING === true,
    experiments: {
      A_wvs_evs: 'specified · raw analysis pending',
      B_harp: 'specified · raw analysis pending',
      C_add_health: 'specified · raw analysis pending',
      D_cross_dataset: 'specified · pending A–C',
    },
    interpretation:
      'Dataset documentation existence is not completion. No coefficients from raw WVS/EVS, HARP, or Add Health are claimed in this paper.',
  };
}

export async function runAllExperiments() {
  const experiments = [e1Locks(), e2Lab(), e3Findings(), e4RealDataPending()];
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    all_pass: failed.length === 0,
    n_pass: experiments.filter((e) => e.pass).length,
    n_total: experiments.length,
    failed,
    experiments,
  };
}
