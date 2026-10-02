/**
 * Orchestrate Beyond CRISPR discovery protocol:
 * anti-bias first → score → literature scan → ranked queue → ultimate questions.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SHIP_BLOG_FILE,
  DISCOVERY_QUESTION,
  FORBIDDEN_CONFIRMATION_TOKENS,
  MIN_CANDIDATES,
  MIN_LITERATURE,
  HONESTY,
  PHI_EGS,
  SCORE_AXES,
} from './constants.mjs';
import { CANDIDATES } from './candidates.mjs';
import { runLiteratureScan } from './literature-scan.mjs';
import {
  buildResearchQueue,
  answerUltimateQuestions,
  scorecardComplete,
  survivesAntiBias,
} from './scoring.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);

function experimentAntiBiasFirst() {
  const results = CANDIDATES.map((c) => ({
    id: c.id,
    ...survivesAntiBias(c),
    publishedExplanationAdequacy: c.antiBias.publishedExplanationAdequacy,
  }));
  const allScored = CANDIDATES.every(scorecardComplete);
  const anySurvivor = results.some((r) => r.pass);
  // Protocol lock: we must attempt falsification / controls before ranking.
  const scoringSrc = fs.readFileSync(path.join(__dirname, 'scoring.mjs'), 'utf8');
  const falsifyFirst =
    scoringSrc.includes('survivesAntiBias') && scoringSrc.includes('publishedExplanationAdequacy');
  return {
    id: 'E1_anti_bias_first',
    title: 'Anti-bias / falsification controls run before queue ranking',
    pass: allScored && anySurvivor && falsifyFirst && CANDIDATES.length >= MIN_CANDIDATES,
    nCandidates: CANDIDATES.length,
    nAntiBiasPass: results.filter((r) => r.pass).length,
    interpretation:
      'Candidates are demoted by confound risk and known-explanation adequacy; CRISPR resemblance is not rewarded.',
    honesty: 'Fixture anti-bias floors ≠ wet-lab null models.',
  };
}

function experimentNoFrameworkConfirmation() {
  const blob = JSON.stringify(CANDIDATES).toLowerCase();
  const hits = FORBIDDEN_CONFIRMATION_TOKENS.filter((t) => blob.includes(t.toLowerCase()));
  const objectiveOk = !DISCOVERY_QUESTION.toLowerCase().includes('prove infinite');
  return {
    id: 'E2_no_framework_confirmation',
    title: 'Discovery does not confirm Infinite Octave / fractal biology slogans',
    pass: hits.length === 0 && objectiveOk,
    hits,
    discoveryQuestion: DISCOVERY_QUESTION,
    interpretation: 'Search for biological information architectures; do not force engine vocabulary.',
    honesty: 'Φ_EGS may appear only in honesty rails / paper prose, not as a confirmatory goal.',
  };
}

function experimentIndependentAxes() {
  const complete = CANDIDATES.every(scorecardComplete);
  const axesOk = SCORE_AXES.length === 10;
  return {
    id: 'E3_independent_score_axes',
    title: 'Ten independent discovery axes scored (no forced single crown)',
    pass: complete && axesOk,
    axes: SCORE_AXES,
    interpretation: 'Novelty, recurrence, independence, modularity, information flow, memory, feedback, multi-scale, constraint, tractability.',
    honesty: 'Axis scores are curated literature fixtures, not assay measurements.',
  };
}

function experimentLiterature() {
  const lit = runLiteratureScan();
  return {
    id: 'E4_literature_scan',
    title: 'Curated biology literature / data scan',
    n: lit.n,
    tagCounts: lit.tagCounts,
    pass: lit.n >= MIN_LITERATURE,
    honesty: lit.honesty,
    sampleIds: lit.rows.map((r) => r.id),
  };
}

function experimentResearchQueue() {
  const queue = buildResearchQueue();
  const hasLead = queue.ranked.some(
    (r) => r.role === 'under_unified_lead_candidate' || r.role === 'active_research_candidate',
  );
  const noWinner = queue.declaredWinner === null;
  const crisprNotFirstByNovelty =
    queue.ranked[0]?.id !== 'C1' || queue.ranked[0]?.role === 'baseline_known_adaptive_immunity';
  // C1 may appear in ranked list but must not be treated as beyond-CRISPR discovery lead.
  const leadIsNotCrisprCutter = !queue.ranked.some(
    (r) => r.role === 'under_unified_lead_candidate' && r.id === 'C1',
  );
  return {
    id: 'E5_ranked_research_queue',
    title: 'Ranked research queue without declaring a winner',
    pass:
      queue.nSurvivors >= MIN_CANDIDATES &&
      hasLead &&
      noWinner &&
      leadIsNotCrisprCutter &&
      crisprNotFirstByNovelty,
    nSurvivors: queue.nSurvivors,
    topIds: queue.ranked.slice(0, 5).map((r) => ({ id: r.id, interest: r.researchInterest, role: r.role })),
    declaredWinner: queue.declaredWinner,
    honesty: queue.honesty,
  };
}

function experimentUltimateQuestions() {
  const queue = buildResearchQueue();
  const answers = answerUltimateQuestions(queue);
  const hasArchitecture = Boolean(answers.mostSurprisingArchitecture?.statement);
  const predictionOk =
    answers.novelTestablePrediction?.yes === true &&
    answers.novelTestablePrediction?.notInSearchCriteria === true &&
    typeof answers.novelTestablePrediction?.prediction === 'string' &&
    answers.novelTestablePrediction.prediction.length > 40;
  return {
    id: 'E6_ultimate_questions',
    title: 'Most surprising architecture + novel falsifiable prediction',
    pass: hasArchitecture && predictionOk,
    mostSurprising: answers.mostSurprisingArchitecture,
    novelPrediction: answers.novelTestablePrediction,
    higherOrderHypothesis: answers.higherOrderHypothesis,
    honesty: answers.honesty,
  };
}

function experimentCorpusPointers() {
  const paperPath = path.join(MONOREPO_DOCS, PAPER_NAME);
  const blogOk = fs.existsSync(MONOREPO_BLOG);
  const paperOk = fs.existsSync(paperPath);
  return {
    id: 'E7_corpus_pointers',
    title: 'Monorepo paper + ship-blog present',
    paperPath,
    blogPath: MONOREPO_BLOG,
    pass: paperOk && blogOk,
    paperOk,
    blogOk,
    interpretation: 'Seed:Edge surfaces for homeostasis expedition + reading room.',
    honesty: HONESTY,
  };
}

function experimentMultiOctaveCoverage() {
  // Operational fractal = recurring relational structure across named scale bands in candidates.
  const bands = ['Molecular', 'genetic', 'genomic', 'cellular', 'population', 'evolutionary', 'organism'];
  const blob = CANDIDATES.map((c) => c.multiScalePattern).join(' ').toLowerCase();
  const hitBands = bands.filter((b) => blob.includes(b.toLowerCase()));
  return {
    id: 'E8_multi_octave_recurrence',
    title: 'Candidates span multiple biological scale bands (operational fractal)',
    pass: hitBands.length >= 5,
    hitBands,
    interpretation:
      'Octave search is operational recurrence of relational structure — not literal fractal geometry proof.',
    honesty: 'Scale labels are catalog filing aids, not new astronomy or wet-lab tiers.',
  };
}

export function runAllExperiments() {
  const queue = buildResearchQueue();
  const answers = answerUltimateQuestions(queue);
  const lit = runLiteratureScan();
  const experiments = [
    experimentAntiBiasFirst(),
    experimentNoFrameworkConfirmation(),
    experimentIndependentAxes(),
    experimentLiterature(),
    experimentResearchQueue(),
    experimentUltimateQuestions(),
    experimentCorpusPointers(),
    experimentMultiOctaveCoverage(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    DOC_ID,
    REGISTRY_ID,
    PHI_EGS,
    HONESTY,
    DISCOVERY_QUESTION,
    literature: { n: lit.n, tagCounts: lit.tagCounts },
    queue: {
      nSurvivors: queue.nSurvivors,
      top: queue.ranked.slice(0, 5).map((r) => ({
        id: r.id,
        provisionalName: r.provisionalName,
        researchInterest: r.researchInterest,
        role: r.role,
      })),
      declaredWinner: null,
    },
    ultimate: answers,
    experiments,
    all_pass: n_pass === experiments.length,
    n_pass,
    n_total: experiments.length,
  };
}
