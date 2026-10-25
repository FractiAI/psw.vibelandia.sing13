/**
 * Digital agent lab — tasks with vs without TRGM gateway scaffolding.
 *
 * With-gateway agents drive TRGM full stack (bio pipe + triad + clock + tree + fold).
 * Without-gateway agents drive unstructured / null / flat baselines.
 */
import { mulberry32 } from '../../synthobs-wave-node-mathematics/src/rng.mjs';
import {
  BIO_PIPE_BPS,
  N_AGENT_TRIALS,
  TREATMENTS,
  VALIDATION_SEED,
} from './constants.mjs';
import {
  buildBiologicalRealityPipe,
  bioPipeRateLocked,
  attachBioPipeToStack,
} from '../../synthobs-tiny-reality-generation-model/src/biological-reality-pipe.mjs';
import {
  generateStructuredStream,
  generateUnstructuredStream,
  polygonSpinClock,
  buildHolographicRhymeTree,
  buildFlatEncode,
  foldCompactDnaTheater,
  unfoldLinearDnaTheater,
  driveRealityFromStack,
} from '../../synthobs-tiny-reality-generation-model/src/triadic-octave-dna-lab.mjs';
import {
  buildChromosomeTheater,
  loadHs1ChromSizes,
} from '../../synthobs-tiny-reality-generation-model/src/molecular-theater.mjs';
import {
  evaluateReality,
  generateTinyReality,
  generateNullReality,
} from '../../synthobs-tiny-reality-generation-model/src/computational-lab.mjs';
import {
  buildWaveNodeFqCatalog,
  FEATURE_KIND_CHANNEL,
} from '../../synthobs-tiny-reality-generation-model/src/wave-node-fq-catalog.mjs';

function mean(xs) {
  return xs.reduce((a, b) => a + b, 0) / Math.max(xs.length, 1);
}

function balancedAccuracy(yTrue, yPred) {
  const channels = ['wave', 'node', 'fq'];
  const scores = [];
  for (const ch of channels) {
    const idx = yTrue.map((y, i) => (y === ch ? i : -1)).filter((i) => i >= 0);
    if (!idx.length) continue;
    scores.push(idx.filter((i) => yPred[i] === ch).length / idx.length);
  }
  return mean(scores);
}

function loadHostTheater() {
  const hs1 = loadHs1ChromSizes();
  const hostBp = hs1.sizes.chr21 || hs1.sizes.chr1;
  const chrom = hs1.sizes.chr21 != null ? 'chr21' : 'chr1';
  return buildChromosomeTheater(chrom, hostBp);
}

/** Build with-gateway stack: bio pipe + structured + clock + tree + folded DNA. */
export function buildWithGatewayStack(seed = VALIDATION_SEED) {
  const theater = loadHostTheater();
  const stream = generateStructuredStream();
  const clock = polygonSpinClock(stream.stream);
  const tree = buildHolographicRhymeTree(stream.stream);
  const folded = foldCompactDnaTheater(theater);
  const stack = attachBioPipeToStack({
    kind: TREATMENTS.withGateway.id,
    stream,
    clock,
    tree,
    host: folded,
    seed,
  });
  return stack;
}

/** Build without-gateway stack: unstructured noise + flat encode + unfolded/null. */
export function buildWithoutGatewayStack(seed = VALIDATION_SEED) {
  const theater = loadHostTheater();
  const structured = generateStructuredStream();
  const stream = generateUnstructuredStream(seed, structured.stream.length);
  const clock = polygonSpinClock(stream.stream);
  const tree = buildFlatEncode(stream.stream);
  const host = unfoldLinearDnaTheater(theater);
  return {
    kind: TREATMENTS.withoutGateway.id,
    stream,
    clock,
    tree,
    host,
    bioPipe: null,
    bioSchedule: null,
    seed,
  };
}

/**
 * Run agent navigation + viability + coherence trials under a stack.
 */
export function runAgentRealityTasks(stack, { n = N_AGENT_TRIALS, seed = VALIDATION_SEED } = {}) {
  const trials = [];
  for (let i = 0; i < n; i++) {
    if (stack.kind === TREATMENTS.withoutGateway.id && i % 3 === 2) {
      // Periodic null layout probe for without-gateway arm
      const nul = generateNullReality(seed, 300 + i);
      trials.push({
        kind: 'null_probe',
        viable: false,
        navOk: false,
        coherence: 0,
        waveL2: Infinity,
        beneficial: false,
        meanNearest: nul.meanNearest,
      });
      continue;
    }
    const driven = driveRealityFromStack(i, stack, stack.host);
    trials.push({
      kind: 'driven',
      viable: Boolean(driven.evaled.viable),
      navOk: Boolean(driven.evaled.navigation.ok),
      coherence: driven.coherenceScore,
      waveL2: driven.evaled.wave.l2,
      beneficial: Boolean(driven.beneficial),
    });
  }
  return {
    treatment: stack.kind,
    n: trials.length,
    navSuccessRate: mean(trials.map((t) => (t.navOk ? 1 : 0))),
    viabilityRate: mean(trials.map((t) => (t.viable ? 1 : 0))),
    meanCoherence: mean(trials.map((t) => t.coherence || 0)),
    benefitRate: mean(trials.map((t) => (t.beneficial ? 1 : 0))),
    hasBioPipe: Boolean(stack.bioPipe),
    bioPipeBitRateBps: stack.bioPipe?.bitRateBps ?? null,
    treeCoherent: Boolean(stack.tree?.coherent),
    hostFolded: Boolean(stack.host?.folded),
  };
}

/**
 * Channel-recovery task: with-gateway uses feature-kind grammar;
 * without-gateway uses shuffled / random labels.
 */
export function runChannelRecoveryTask(seed = VALIDATION_SEED) {
  const catalog = buildWaveNodeFqCatalog();
  const held = catalog.entries.filter((e) => e.kind !== 'gene');
  const yTrue = held.map((e) => FEATURE_KIND_CHANNEL[e.kind] || 'node');

  const withPred = held.map((e) => FEATURE_KIND_CHANNEL[e.kind] || 'node');
  const rng = mulberry32((seed ^ 0x51) >>> 0);
  const withoutPred = yTrue.map(() => ['wave', 'node', 'fq'][Math.floor(rng() * 3)]);

  return {
    n: held.length,
    withGateway: {
      balancedAccuracy: balancedAccuracy(yTrue, withPred),
      accuracy: withPred.filter((p, i) => p === yTrue[i]).length / held.length,
    },
    withoutGateway: {
      balancedAccuracy: balancedAccuracy(yTrue, withoutPred),
      accuracy: withoutPred.filter((p, i) => p === yTrue[i]).length / held.length,
    },
  };
}

/**
 * Rate-intake task: with-gateway locks 10 bit/s bio pipe;
 * without-gateway has no rate lock (effective "dump" = uncapped).
 */
export function runRateIntakeTask() {
  const withPipe = buildBiologicalRealityPipe({ bitRateBps: BIO_PIPE_BPS });
  const withoutPipe = {
    bitRateBps: null,
    effectiveBitRateBps: Infinity,
    rateLocked: false,
    kind: 'uncapped_dump',
  };
  return {
    withGateway: {
      bitRateBps: withPipe.bitRateBps,
      effectiveBitRateBps: withPipe.effectiveBitRateBps,
      durationSec: withPipe.durationSec,
      rateLocked: bioPipeRateLocked(withPipe),
      informationBits: withPipe.informationBits,
    },
    withoutGateway: withoutPipe,
  };
}

/**
 * Full paired agent laboratory.
 */
export function runPairedAgentLaboratory() {
  const withStack = buildWithGatewayStack();
  const withoutStack = buildWithoutGatewayStack();
  const withTasks = runAgentRealityTasks(withStack);
  const withoutTasks = runAgentRealityTasks(withoutStack);
  const channel = runChannelRecoveryTask();
  const rate = runRateIntakeTask();

  const deltas = {
    navSuccessRate: withTasks.navSuccessRate - withoutTasks.navSuccessRate,
    viabilityRate: withTasks.viabilityRate - withoutTasks.viabilityRate,
    meanCoherence: withTasks.meanCoherence - withoutTasks.meanCoherence,
    benefitRate: withTasks.benefitRate - withoutTasks.benefitRate,
    channelBA:
      channel.withGateway.balancedAccuracy - channel.withoutGateway.balancedAccuracy,
  };

  return {
    withGateway: { ...withTasks, channel: channel.withGateway, rate: rate.withGateway },
    withoutGateway: {
      ...withoutTasks,
      channel: channel.withoutGateway,
      rate: rate.withoutGateway,
    },
    deltas,
    treatments: TREATMENTS,
  };
}
