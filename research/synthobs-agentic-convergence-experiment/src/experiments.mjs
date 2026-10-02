/**
 * Orchestrate Phases 1–4 + literature scan + blind-token lock.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SHIP_BLOG_FILE,
  AGENT_OBJECTIVE,
  FORBIDDEN_AGENT_TOKENS,
  CONVERGENCE_MARGIN,
  PORTABILITY_MARGIN,
  AHOIS_PATH,
  HONESTY,
  PHI_EGS,
} from './constants.mjs';
import { makeTrainLandscape, agentView } from './landscapes.mjs';
import { runAllAgents } from './agents.mjs';
import { scoreRepresentation, summarizeConvergence } from './convergence.mjs';
import { runPortabilityPhase } from './portability.mjs';
import { runLiteratureScan } from './literature-scan.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);

function experimentBlindLock() {
  const obj = AGENT_OBJECTIVE.toLowerCase();
  const hits = FORBIDDEN_AGENT_TOKENS.filter((t) => obj.includes(t.toLowerCase()));
  // Smoke: agents module must call assertBlind and import the forbidden list.
  const agentsSrc = fs.readFileSync(path.join(__dirname, 'agents.mjs'), 'utf8');
  const hasAssert = agentsSrc.includes('assertBlind(AGENT_OBJECTIVE)');
  const hasImport = agentsSrc.includes('FORBIDDEN_AGENT_TOKENS');
  return {
    id: 'E1_blind_objective_lock',
    title: 'Blind objective — forbidden framework tokens absent',
    forbidden: FORBIDDEN_AGENT_TOKENS,
    objectiveHits: hits,
    pass: hits.length === 0 && hasAssert && hasImport,
    interpretation: 'Agents optimize useful information / prediction cost only.',
    honesty: 'Does not prove live LLM blindness; locks fixture objective text.',
  };
}

function experimentAhoisClue() {
  return {
    id: 'E2_ahois_clue_path',
    title: 'AHOIS named as precursor clue path',
    path: AHOIS_PATH,
    pass: AHOIS_PATH.length === 6 && AHOIS_PATH[0] === 'conventional representation',
    interpretation: 'AHOIS is the miniature representational path this experiment generalizes.',
    honesty: 'Named protocol clue — not a prior empirical crown.',
  };
}

function experimentTrainConvergence() {
  const landscape = makeTrainLandscape();
  const view = agentView(landscape);
  const results = runAllAgents(view);
  const scores = results.map((r) => scoreRepresentation(r, landscape));
  const summary = summarizeConvergence(scores);
  const pass = summary.margin >= CONVERGENCE_MARGIN;
  return {
    id: 'E3_train_convergence',
    title: 'Independent explorers beat flat control on structural properties',
    summary,
    gate: CONVERGENCE_MARGIN,
    pass,
    paths: results.map((r) => ({ agentId: r.agentId, steps: r.path.length, architecture: r.architecture })),
    interpretation: pass
      ? 'Explorers independently invent reps that score higher on multiscale / hierarchical / local-global / bounded-adapt properties than flat control.'
      : 'Convergence margin not cleared on train landscape — refuse strong attractor claim.',
    honesty: 'Post-hoc property labels; agents were not told fractal/holographic/Goldilocks.',
  };
}

function experimentPortability() {
  const port = runPortabilityPhase();
  return {
    id: 'E4_heldout_portability',
    title: 'Same scorers on held-out noisier landscape',
    ...port,
    pass: port.portable,
    interpretation: port.portable
      ? 'Margin persists under new seed / higher noise — structure not a single-dataset artifact.'
      : 'Portability margin failed — treat train convergence as landscape-specific.',
    honesty: `Gate ${PORTABILITY_MARGIN}; fixture portability ≠ universal physics.`,
  };
}

function experimentLiterature() {
  const lit = runLiteratureScan();
  return {
    id: 'E5_literature_scan',
    title: 'Curated literature / data scan',
    n: lit.n,
    tagCounts: lit.tagCounts,
    pass: lit.n >= 6,
    honesty: lit.honesty,
    sampleIds: lit.rows.map((r) => r.id),
  };
}

function experimentCorpusPointers() {
  const paperPath = path.join(MONOREPO_DOCS, PAPER_NAME);
  const blogOk = fs.existsSync(MONOREPO_BLOG);
  const paperOk = fs.existsSync(paperPath);
  return {
    id: 'E6_corpus_pointers',
    title: 'Monorepo paper + ship-blog present',
    paperPath,
    blogPath: MONOREPO_BLOG,
    pass: paperOk && blogOk,
    paperOk,
    blogOk,
    interpretation: 'Seed:Edge surfaces exist for guest + auditor paths.',
    honesty: HONESTY,
  };
}

export function runAllExperiments() {
  const experiments = [
    experimentBlindLock(),
    experimentAhoisClue(),
    experimentTrainConvergence(),
    experimentPortability(),
    experimentLiterature(),
    experimentCorpusPointers(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    DOC_ID,
    REGISTRY_ID,
    PHI_EGS,
    HONESTY,
    experiments,
    all_pass: n_pass === experiments.length,
    n_pass,
    n_total: experiments.length,
  };
}
