import { AGENT_OBJECTIVE } from '../../synthobs-agentic-convergence-experiment/src/constants.mjs';
import {
  BLIND_OBJECTIVE,
  FORBIDDEN_TOKENS,
  IRC_MARGIN_GATE,
  IDENTITY_JACCARD_CEILING,
} from './constants.mjs';
import { runIntegratedPanel } from './panel.mjs';
import { jaccardArchitecture } from './fhg-score.mjs';

function forbiddenHits(text) {
  const low = String(text).toLowerCase();
  return FORBIDDEN_TOKENS.filter((t) => low.includes(t.toLowerCase()));
}

export function experimentBlindLock() {
  const hits = forbiddenHits(BLIND_OBJECTIVE);
  const agentHits = forbiddenHits(AGENT_OBJECTIVE);
  return {
    id: 'E1_blind_objective_lock',
    title: 'Blind objectives — forbidden FHG vocabulary absent',
    forbidden: FORBIDDEN_TOKENS,
    objectiveHits: hits,
    agentObjectiveHits: agentHits,
    pass: hits.length === 0 && agentHits.length === 0,
    honesty: 'Locks fixture objective strings — not live LLM prompts.',
  };
}

export function experimentIntegratedPanel() {
  const panel = runIntegratedPanel();
  const pass = panel.meanMargin >= IRC_MARGIN_GATE;
  return {
    id: 'E2_integrated_fhg_panel',
    title: 'Integrated FHG panel P1–P6 — adaptive vs wasteful IRC margin',
    panel,
    gate: IRC_MARGIN_GATE,
    pass,
    integrated_panel_run: true,
    interpretation: pass
      ? 'Adaptive explorers beat flat wasteful control on mean post-hoc S_IRC across six anchor-inspired panel slots.'
      : 'Panel margin below gate — refuse strong IRC-FHG claim.',
    honesty: 'Fixture landscapes; not external benchmark re-runs.',
  };
}

export function experimentIdentityCeiling() {
  const panel = runIntegratedPanel();
  const archs = panel.panels.map((p) => p.bestArchitecture);
  const uniqueArchs = [...new Set(archs)];
  let maxJ = 0;
  for (let i = 0; i < uniqueArchs.length; i++) {
    for (let j = i + 1; j < uniqueArchs.length; j++) {
      maxJ = Math.max(maxJ, jaccardArchitecture(uniqueArchs[i], uniqueArchs[j]));
    }
  }
  const minUniqueAdaptive = 3;
  const pass =
    uniqueArchs.length >= minUniqueAdaptive && maxJ < IDENTITY_JACCARD_CEILING;
  return {
    id: 'E3_identity_ceiling',
    title: 'Non-identical adaptive architectures across panel slots',
    maxPairwiseJaccard: maxJ,
    nUniqueAdaptive: uniqueArchs.length,
    minUniqueAdaptive,
    ceiling: IDENTITY_JACCARD_CEILING,
    pass,
    architectures: archs,
    uniqueArchitectures: uniqueArchs,
    honesty:
      'Unique adaptive agent IDs across slots (≥3) + token Jaccard among uniques — not output photocopy detection on full traces.',
  };
}

export function experimentVocabularyFalsifier() {
  const contaminated = `${BLIND_OBJECTIVE} Optimize fractal holographic goldilocks convergence.`;
  const hits = forbiddenHits(contaminated);
  return {
    id: 'E4_vocabulary_injection_falsifier',
    title: 'Vocabulary injection would violate blind lock (simulated)',
    contaminatedHits: hits,
    pass: hits.length > 0,
    interpretation:
      'If FHG words were injected into objectives, automated scan would fail before scoring.',
    honesty: 'Simulated string — does not run a live contaminated agent cohort.',
  };
}

export function runAllExperiments() {
  const experiments = [
    experimentBlindLock(),
    experimentIntegratedPanel(),
    experimentIdentityCeiling(),
    experimentVocabularyFalsifier(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  const n_total = experiments.length;
  return {
    experiments,
    n_pass,
    n_total,
    all_pass: n_pass === n_total,
    integrated_panel_run: true,
  };
}
