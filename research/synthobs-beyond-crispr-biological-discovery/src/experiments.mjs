/**
 * Orchestrate Beyond CRISPR discovery protocol:
 * anti-bias first → score → literature scan → blind phases → ranked queue → ultimate questions.
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
import { runBlindDiscoveryProtocol } from './blind-discovery.mjs';
import { exportPhase2bBundle, phase2bPromptAudit } from './phase-2b-lattice.mjs';
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
const PHASE_2B_DOC = path.join(PKG_ROOT, 'docs', 'PHASE_2B_LATTICE_BLIND_DISCOVERY_PROTOCOL_2026-10.md');
const C11_LAB_BRIEF = path.join(PKG_ROOT, 'docs', 'C11_ART_CLASS_WET_LAB_BRIEF_2026-10.md');
const PHASE_2B_JOURNEY = path.resolve(PKG_ROOT, '..', '..', 'interfaces', 'journey', 'beyond-crispr-phase-2b.html');
const C11_JOURNEY = path.resolve(PKG_ROOT, '..', '..', 'interfaces', 'journey', 'beyond-crispr-c11-lab-brief.html');

function experimentAntiBiasFirst() {
  const results = CANDIDATES.map((c) => ({
    id: c.id,
    ...survivesAntiBias(c),
    publishedExplanationAdequacy: c.antiBias.publishedExplanationAdequacy,
  }));
  const allScored = CANDIDATES.every(scorecardComplete);
  const anySurvivor = results.some((r) => r.pass);
  const scoringSrc = fs.readFileSync(path.join(__dirname, 'scoring.mjs'), 'utf8');
  const falsifyFirst =
    scoringSrc.includes('survivesAntiBias') && scoringSrc.includes('publishedExplanationAdequacy');
  const allHaveLitStatus = CANDIDATES.every((c) => typeof c.literatureStatus === 'string');
  return {
    id: 'E1_anti_bias_first',
    title: 'Anti-bias / falsification controls run before queue ranking',
    pass:
      allScored &&
      anySurvivor &&
      falsifyFirst &&
      allHaveLitStatus &&
      CANDIDATES.length >= MIN_CANDIDATES,
    nCandidates: CANDIDATES.length,
    nAntiBiasPass: results.filter((r) => r.pass).length,
    interpretation:
      'Candidates are demoted by confound risk and known-explanation adequacy; CRISPR resemblance is not rewarded; literatureStatus is mandatory.',
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
    interpretation:
      'Novelty, recurrence, independence, modularity, information flow, memory, feedback, multi-scale, constraint, tractability.',
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
  const hasGapOrActive = queue.ranked.some(
    (r) =>
      r.role === 'gap_discovery_candidate' ||
      r.role === 'active_research_candidate' ||
      r.role === 'under_unified_lead_candidate',
  );
  const noWinner = queue.declaredWinner === null;
  const hasPositiveControl = queue.positiveControlIds.includes('C4');
  const c4NotGapLead = !queue.ranked.some(
    (r) => r.id === 'C4' && r.role === 'gap_discovery_candidate',
  );
  const leadIsNotCrisprCutter = !queue.ranked.some(
    (r) => r.role === 'gap_discovery_candidate' && r.id === 'C1',
  );
  return {
    id: 'E5_ranked_research_queue',
    title: 'Ranked research queue without declaring a winner',
    pass:
      queue.nSurvivors >= MIN_CANDIDATES &&
      hasGapOrActive &&
      noWinner &&
      leadIsNotCrisprCutter &&
      hasPositiveControl &&
      c4NotGapLead,
    nSurvivors: queue.nSurvivors,
    topIds: queue.ranked.slice(0, 5).map((r) => ({
      id: r.id,
      interest: r.researchInterest,
      role: r.role,
      literatureStatus: r.literatureStatus,
    })),
    declaredWinner: queue.declaredWinner,
    honesty: queue.honesty,
  };
}

function experimentUltimateQuestions() {
  const queue = buildResearchQueue();
  const answers = answerUltimateQuestions(queue);
  const hasArchitecture = Boolean(answers.mostSurprisingArchitecture?.statement);
  const notC4Discovery =
    answers.mostSurprisingArchitecture?.id !== 'C4' &&
    answers.frameworkValidation?.id === 'C4';
  const predictionOk =
    answers.novelTestablePrediction?.yes === true &&
    answers.novelTestablePrediction?.notInSearchCriteria === true &&
    typeof answers.novelTestablePrediction?.prediction === 'string' &&
    answers.novelTestablePrediction.prediction.length > 40;
  return {
    id: 'E6_ultimate_questions',
    title: 'Gap architecture + novel prediction (C4 = positive control only)',
    pass: hasArchitecture && predictionOk && notC4Discovery,
    mostSurprising: answers.mostSurprisingArchitecture,
    frameworkValidation: answers.frameworkValidation,
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

function experimentBlindDiscoveryPhases() {
  const blind = runBlindDiscoveryProtocol();
  return {
    id: 'E9_blind_discovery_phases',
    title: 'Blind discovery phases + unexplained-gap shortlist (excludes positive control)',
    pass: blind.pass === true,
    phase2: blind.phase2_literatureClass,
    shortlistIds: blind.phase3_shortlist.shortlist.map((r) => r.id),
    honesty: blind.phase3_shortlist.honesty,
  };
}

function experimentPhase2bLatticeLane() {
  const audit = phase2bPromptAudit();
  const bundle = exportPhase2bBundle();
  const docOk = fs.existsSync(PHASE_2B_DOC);
  const labOk = fs.existsSync(C11_LAB_BRIEF);
  const edgeOk = fs.existsSync(PHASE_2B_JOURNEY) && fs.existsSync(C11_JOURNEY);
  return {
    id: 'E10_phase_2b_lattice_lane',
    title: 'Phase 2b Lattice blind prompt + C11 lab brief surfaces',
    pass: audit.pass && docOk && labOk && edgeOk && bundle.receiptTemplate.schema?.includes('phase-2b'),
    audit,
    docOk,
    labOk,
    edgeOk,
    latticeChatUrl: bundle.latticeChatUrl,
    honesty:
      'Phase 2b exports prompt/receipt only — live BYOK sessions are operator-run, not CI-claimed.',
  };
}

export function runAllExperiments() {
  const queue = buildResearchQueue();
  const answers = answerUltimateQuestions(queue);
  const lit = runLiteratureScan();
  const blind = runBlindDiscoveryProtocol();
  const experiments = [
    experimentAntiBiasFirst(),
    experimentNoFrameworkConfirmation(),
    experimentIndependentAxes(),
    experimentLiterature(),
    experimentResearchQueue(),
    experimentUltimateQuestions(),
    experimentCorpusPointers(),
    experimentMultiOctaveCoverage(),
    experimentBlindDiscoveryPhases(),
    experimentPhase2bLatticeLane(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    DOC_ID,
    REGISTRY_ID,
    PHI_EGS,
    HONESTY,
    DISCOVERY_QUESTION,
    literature: { n: lit.n, tagCounts: lit.tagCounts },
    blindDiscovery: {
      pass: blind.pass,
      buckets: blind.phase2_literatureClass,
      shortlist: blind.phase3_shortlist.shortlist.map((r) => ({
        id: r.id,
        literatureStatus: r.literatureStatus,
        researchInterest: r.researchInterest,
      })),
    },
    queue: {
      nSurvivors: queue.nSurvivors,
      top: queue.ranked.slice(0, 6).map((r) => ({
        id: r.id,
        provisionalName: r.provisionalName,
        researchInterest: r.researchInterest,
        role: r.role,
        literatureStatus: r.literatureStatus,
      })),
      declaredWinner: null,
      positiveControlIds: queue.positiveControlIds,
      gapDiscoveryIds: queue.gapDiscoveryIds,
    },
    ultimate: answers,
    experiments,
    all_pass: n_pass === experiments.length,
    n_pass,
    n_total: experiments.length,
  };
}
