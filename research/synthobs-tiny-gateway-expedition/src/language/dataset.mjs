/**
 * Bounded language fixtures — identical for all three implementations.
 * Not a web-scale corpus; deliberately small for reproducible micro-bench.
 */
import { mulberry32, shuffleInPlace, choice } from '../rng.mjs';

const INTENTS = [
  'navigate',
  'query',
  'update',
  'summarize',
  'compare',
  'schedule',
  'extract',
  'execute',
];

const ENTITIES = [
  ['Reno', 'LOC'],
  ['Puerto Reno', 'LOC'],
  ['Alice', 'PER'],
  ['Track-42', 'ID'],
  ['Sensor-3', 'ID'],
  ['Friday', 'DATE'],
  ['lease', 'DOC'],
  ['paycheck', 'MONEY'],
];

const KB = Object.freeze({
  'capital of nevada': 'Carson City',
  'questfest host city': 'Reno',
  'bio pipe rate': '10 bit/s',
  'engine shelf trgm': '50',
  'phi egs approx': '1.618',
  'radar sensors default': '6',
});

const PARAPHRASE_PAIRS = [
  ['find the capital of nevada', 'what is nevada capital'],
  ['schedule a friday meeting', 'book meeting on friday'],
  ['extract entities from text', 'pull out named entities'],
  ['compare sensor three and track forty two', 'contrast Sensor-3 with Track-42'],
];

export function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function buildLanguageDataset(seed = 20261030) {
  const rng = mulberry32(seed);
  const train = [];
  const test = [];
  const heldOut = [];

  // Intent + instruction examples
  for (const intent of INTENTS) {
    for (let i = 0; i < 6; i++) {
      const [ent, typ] = choice(rng, ENTITIES);
      const text = `${intent} about ${ent} please`;
      const row = {
        id: `intent-${intent}-${i}`,
        task: 'intent_recognition',
        text,
        tokens: tokenize(text),
        label: intent,
        entities: [{ text: ent, type: typ }],
      };
      (i < 4 ? train : test).push(row);
    }
  }

  // QA over KB
  for (const [q, a] of Object.entries(KB)) {
    const row = {
      id: `qa-${q}`,
      task: 'bounded_qa',
      text: q,
      tokens: tokenize(q),
      label: a,
      answer: a,
    };
    train.push(row);
    test.push({ ...row, id: `qa-test-${q}`, text: `question: ${q}`, tokens: tokenize(`question: ${q}`) });
  }

  // Entity extraction
  for (let i = 0; i < 20; i++) {
    const picks = [choice(rng, ENTITIES), choice(rng, ENTITIES)];
    const text = `Record shows ${picks[0][0]} met ${picks[1][0]} near the gate`;
    const row = {
      id: `ner-${i}`,
      task: 'entity_relation_extraction',
      text,
      tokens: tokenize(text),
      entities: picks.map(([t, typ]) => ({ text: t, type: typ })),
      relations: [{ head: picks[0][0], tail: picks[1][0], type: 'met' }],
      label: picks.map((p) => p[0]).join('|'),
    };
    (i < 14 ? train : test).push(row);
  }

  // Multi-step
  for (let i = 0; i < 12; i++) {
    const steps = ['extract', 'query', 'summarize'];
    const text = `first ${steps[0]} entities then ${steps[1]} kb then ${steps[2]}`;
    const row = {
      id: `multi-${i}`,
      task: 'multi_step_execution',
      text,
      tokens: tokenize(text),
      label: steps.join('>'),
      steps,
    };
    (i < 8 ? train : test).push(row);
  }

  // Paraphrase
  for (let i = 0; i < PARAPHRASE_PAIRS.length; i++) {
    const [a, b] = PARAPHRASE_PAIRS[i];
    train.push({
      id: `pp-train-${i}`,
      task: 'paraphrase_recognition',
      text: a,
      textB: b,
      tokens: tokenize(a),
      tokensB: tokenize(b),
      label: 'paraphrase',
    });
    test.push({
      id: `pp-test-${i}`,
      task: 'paraphrase_recognition',
      text: a,
      textB: b,
      tokens: tokenize(a),
      tokensB: tokenize(b),
      label: 'paraphrase',
    });
  }

  // Context retention mini-dialogs
  for (let i = 0; i < 8; i++) {
    const topic = choice(rng, ENTITIES)[0];
    const row = {
      id: `ctx-${i}`,
      task: 'context_retention',
      text: `remember ${topic}`,
      followUp: `what did I ask you to remember`,
      tokens: tokenize(`remember ${topic}`),
      label: topic,
      contextKey: 'memory',
    };
    (i < 5 ? train : test).push(row);
  }

  // Unseen generalization — novel surface forms, known intents
  for (const intent of ['navigate', 'query', 'execute']) {
    heldOut.push({
      id: `unseen-${intent}`,
      task: 'unseen_generalization',
      text: `kindly proceed to ${intent} the nested packet`,
      tokens: tokenize(`kindly proceed to ${intent} the nested packet`),
      label: intent,
    });
  }

  // New knowledge incorporation
  const newFact = { key: 'tiny gateway host', value: 'FractiAI' };
  heldOut.push({
    id: 'new-knowledge-1',
    task: 'new_knowledge_incorporation',
    text: 'who hosts tiny gateway',
    tokens: tokenize('who hosts tiny gateway'),
    teach: newFact,
    label: newFact.value,
  });

  shuffleInPlace(rng, train);
  shuffleInPlace(rng, test);

  return {
    seed,
    train,
    test,
    heldOut,
    kb: { ...KB },
    intents: [...INTENTS],
    paraphrasePairs: PARAPHRASE_PAIRS,
    stats: { nTrain: train.length, nTest: test.length, nHeldOut: heldOut.length },
  };
}

export { KB, INTENTS, ENTITIES };
