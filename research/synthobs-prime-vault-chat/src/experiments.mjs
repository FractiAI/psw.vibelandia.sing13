/**
 * Prime Vault Chat — suite locks for the closed-form LLM-sim engine.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SHIP_BLOG_FILE,
  SHIP_BLOG_SLUG,
  DOOR,
} from './constants.mjs';
import {
  createPrimeVaultChatEngine,
  generateSemanticPrimes,
  queryPrimeVaultChat,
  hashThreadPhase,
  DEFAULT_VOCABULARY,
  KNOWLEDGE_CELLS,
  MERGED_CELLS,
  CORPUS_BANK,
} from '../../../lib/prime-vault-chat-engine.mjs';
import {
  encodeCorpusToCells,
  chunkMarkdown,
} from '../../../lib/prime-vault-corpus-encode.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO = path.resolve(PKG_ROOT, '..', '..');

function experimentPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    PHI_EGS,
  };
}

function experimentPrimes() {
  const primes = generateSemanticPrimes(DEFAULT_VOCABULARY.length);
  return {
    id: 'E2_semantic_primes',
    pass:
      primes[0] === 2 &&
      primes.length === DEFAULT_VOCABULARY.length &&
      primes.every((p, i) => i === 0 || p % 2 === 1),
    n: primes.length,
  };
}

function experimentDeterminism() {
  const a = queryPrimeVaultChat('What is the fractal constant?', { octaveTier: 7 });
  const b = queryPrimeVaultChat('What is the fractal constant?', { octaveTier: 7 });
  const stripClock = (s) =>
    s
      .replace(/_Edge note:.*?_/gs, '')
      .replace(/→ Edge clock:.*$/m, '')
      .trim();
  const nodesEqual =
    a.nodes.length === b.nodes.length &&
    a.nodes.every(
      (n, i) =>
        n.concept === b.nodes[i].concept &&
        n.primeVault === b.nodes[i].primeVault &&
        n.amplitude === b.nodes[i].amplitude,
    );
  return {
    id: 'E3_deterministic_reply',
    pass:
      stripClock(a.reply) === stripClock(b.reply) &&
      nodesEqual &&
      a.nodes.length >= 1 &&
      a.trainingCostUsd === 0 &&
      a.latencyMs < 50 &&
      a.llmSim === true,
    latencyMs: a.latencyMs,
    speechAct: a.speechAct,
  };
}

function experimentIntentBoost() {
  const protein = queryPrimeVaultChat('protein folding race vs AlphaFold', {
    octaveTier: 7,
  });
  const hit = protein.nodes.some((n) =>
    /protein|prime|Race|Nova|container/i.test(n.concept),
  );
  return {
    id: 'E4_intent_resonance',
    pass: hit && protein.nodes[0].amplitude > 0 && protein.speechAct === 'race',
    top: protein.nodes[0]?.concept,
    speechAct: protein.speechAct,
  };
}

function experimentZeroTraining() {
  const engine = createPrimeVaultChatEngine({ octaveTier: 7 });
  const r = engine.queryLattice('hello lattice');
  return {
    id: 'E5_zero_training_cost',
    pass: r.trainingCostUsd === 0 && /\$0(?:\.00)? training/i.test(r.reply),
  };
}

function experimentSurfaces() {
  const paper =
    (fs.existsSync(path.join(MONOREPO, 'docs', PAPER_NAME)) &&
      fs.readFileSync(path.join(MONOREPO, 'docs', PAPER_NAME), 'utf8')) ||
    '';
  const blogPath = path.join(MONOREPO, 'interfaces', SHIP_BLOG_FILE);
  const blog = fs.existsSync(blogPath) ? fs.readFileSync(blogPath, 'utf8') : '';
  const door = fs.existsSync(path.join(MONOREPO, 'interfaces', 'prime-vault-chat.html'))
    ? fs.readFileSync(path.join(MONOREPO, 'interfaces', 'prime-vault-chat.html'), 'utf8')
    : '';
  const api = fs.existsSync(path.join(MONOREPO, 'api', 'prime-vault-chat.js'))
    ? fs.readFileSync(path.join(MONOREPO, 'api', 'prime-vault-chat.js'), 'utf8')
    : '';
  const checks = {
    paperHonesty: /Honesty boundary/i.test(paper),
    paperDocId: paper.includes(DOC_ID),
    paperPhi: /1\.618|Φ|PHI/i.test(paper),
    paperFair: /Fair Exchange/i.test(paper),
    paperZero: /\$0|0\.00 training|zero training/i.test(paper),
    paperLlmSim: /LLM-sim|knowledge cell bank|multi-turn|corpus encode/i.test(paper),
    paperOperator: /SynthOBS/i.test(paper),
    blogExists: Boolean(blog),
    blogSlug: blog.includes(SHIP_BLOG_SLUG) || blog.includes('prime-vault-chat'),
    blogDoor: blog.includes(DOOR) || blog.includes('/prime-vault-chat') || blog.includes('/demonstrations'),
    blogHonesty: /Honesty/i.test(blog),
    blogLlmSim: /LLM-sim|knowledge cell/i.test(blog),
    doorChatUi: /pvc-thread|Message Prime Vault/i.test(door),
    apiSeat: /checkLatticeEmailAccess|x-lattice-email/i.test(api),
    apiHistory: /history/i.test(api),
  };
  return {
    id: 'E6_surfaces',
    pass: Object.values(checks).every(Boolean),
    ...checks,
  };
}

function experimentRegistry() {
  return {
    id: 'E7_registry',
    pass: REGISTRY_ID === 'synthobs-prime-vault-chat-2026-09',
    REGISTRY_ID,
  };
}

function experimentKnowledgeBank() {
  const n = Object.keys(KNOWLEDGE_CELLS).length;
  const required = [
    'Closed-form LLM-sim',
    'Multi-turn memory',
    'Unmodeled Nova',
    'Domain boundary',
    'Guest brand Infinite Octaves',
  ];
  const hasAll = required.every((k) => KNOWLEDGE_CELLS[k]?.speak);
  return {
    id: 'E8_knowledge_cell_bank',
    pass:
      n >= 18 &&
      hasAll &&
      DEFAULT_VOCABULARY.length === Object.keys(MERGED_CELLS).length &&
      DEFAULT_VOCABULARY.length > n,
    n,
    merged: DEFAULT_VOCABULARY.length,
  };
}

function experimentMultiTurn() {
  const history = [
    { role: 'user', content: 'What is Phi?' },
    { role: 'assistant', content: 'Phi is about 1.618.' },
  ];
  const follow = queryPrimeVaultChat('tell me more about that', {
    octaveTier: 7,
    history,
  });
  const cold = queryPrimeVaultChat('tell me more about that', { octaveTier: 7 });
  const phaseA = hashThreadPhase([...history, { role: 'user', content: 'tell me more about that' }]);
  const phaseB = hashThreadPhase([{ role: 'user', content: 'tell me more about that' }]);
  const ood = queryPrimeVaultChat('What is the weather in Reno tomorrow?', {
    octaveTier: 7,
  });
  return {
    id: 'E9_multiturn_and_ood',
    pass:
      follow.historyTurns === 2 &&
      follow.threadPhase === phaseA &&
      cold.threadPhase === phaseB &&
      phaseA !== phaseB &&
      follow.llmSim === true &&
      (follow.speechAct === 'continue' || follow.kinds.includes('followup') || follow.kinds.includes('continuing')) &&
      ood.speechAct === 'refuse' &&
      /outside my|filed vaults|medicine|steer back/i.test(ood.reply),
    followAct: follow.speechAct,
    oodAct: ood.speechAct,
  };
}

function experimentCorpusEncode() {
  const jsonPath = path.join(MONOREPO, 'data', 'prime-vault-corpus-v0.json');
  const encodeLib = path.join(MONOREPO, 'lib', 'prime-vault-corpus-encode.mjs');
  const mdPath = path.join(
    MONOREPO,
    'docs',
    'SYNTHOBS_SS_VIBELANDIA_OFFICIAL_PROSPECTUS_NARRATIVE_FOUNDATION_2026-08.md',
  );
  const md = fs.readFileSync(mdPath, 'utf8');
  const live = encodeCorpusToCells(md, { maxCells: 16 });
  const prospectus = queryPrimeVaultChat(
    'What is the Official Prospectus grand arc and Borikén convergence?',
    { octaveTier: 7 },
  );
  const paper =
    (fs.existsSync(path.join(MONOREPO, 'docs', PAPER_NAME)) &&
      fs.readFileSync(path.join(MONOREPO, 'docs', PAPER_NAME), 'utf8')) ||
    '';
  const sampleCell = Object.values(live.cells)[0];
  return {
    id: 'E10_corpus_encode_v0',
    pass:
      fs.existsSync(jsonPath) &&
      fs.existsSync(encodeLib) &&
      live.nCells >= 8 &&
      chunkMarkdown(md).length >= 8 &&
      (CORPUS_BANK.nCells || 0) >= 8 &&
      Array.isArray(sampleCell?.atoms) &&
      sampleCell.atoms.length >= 1 &&
      prospectus.corpusEncode === true &&
      prospectus.speechAct === 'corpus' &&
      /prospectus|Borikén|genesis|voyage|catalog|Reno|Φ|El Gran Sol|fold/i.test(prospectus.reply) &&
      /corpus encode|Layer A|protein-fold|sense/i.test(paper),
    nCells: live.nCells,
    act: prospectus.speechAct,
  };
}

function experimentLanguageFoldProcessor() {
  const about = queryPrimeVaultChat('Tell me about you.');
  const voyage = queryPrimeVaultChat('Tell me about Borikén and the Official Prospectus');
  const leadSpeak =
    voyage.nodes[0] &&
    (CORPUS_BANK.cells?.[voyage.nodes[0].concept]?.speak ||
      MERGED_CELLS[voyage.nodes[0].concept]?.speak ||
      '');
  return {
    id: 'E11_language_fold_processor',
    pass:
      about.languageProcessor === true &&
      about.stages?.sense &&
      about.stages?.retrieve &&
      about.stages?.plan &&
      about.stages?.articulate?.composed === true &&
      voyage.composed === true &&
      Array.isArray(voyage.contacts) &&
      voyage.contacts.length >= 1 &&
      voyage.reply.trim() !== String(leadSpeak || '').trim() &&
      /fold|sense|retrieve|language processor/i.test(about.reply),
    stages: Object.keys(about.stages || {}),
    contacts: voyage.contacts?.length,
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhi(),
    experimentPrimes(),
    experimentDeterminism(),
    experimentIntentBoost(),
    experimentZeroTraining(),
    experimentSurfaces(),
    experimentRegistry(),
    experimentKnowledgeBank(),
    experimentMultiTurn(),
    experimentCorpusEncode(),
    experimentLanguageFoldProcessor(),
  ];
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    experiments,
    n_pass: experiments.filter((e) => e.pass).length,
    n_total: experiments.length,
    all_pass: failed.length === 0,
    failed,
  };
}
