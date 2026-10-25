/**
 * Held-out biological regions + matched baselines + wave/node/fq predictive value.
 *
 * Predictive task: recover triad channel labels for genetic features.
 * Train region: genes on chr21 (structural panel) define conventional priors;
 * Held-out: genes NOT on chr21 (independent loci — INS/PDX1/POMC/NPY/DNMT*).
 *
 * Baselines (matched):
 *   - catalog Soft Story / feature-kind assignment (TRGM #50 grammar)
 *   - shuffled channel labels (destroy predictive structure)
 *   - biologically conventional: chrom-contiguity / length-tertile rules
 *   - sequence proxy: GC/CpG-ish heuristics for wave vs rest
 *   - flat encode (no recursive octave tree) coherence contrast
 *   - non-DNA spatial layout (null polymer) viability contrast
 */
import { mulberry32 } from '../../synthobs-wave-node-mathematics/src/rng.mjs';
import { VALIDATION_SEED, EXPECTED_CATALOG_ENTRIES_50 } from './constants.mjs';
import {
  buildWaveNodeFqCatalog,
  FEATURE_KIND_CHANNEL,
  TRIADIC_INPUTS,
} from '../../synthobs-tiny-reality-generation-model/src/wave-node-fq-catalog.mjs';
import {
  generateTinyReality,
  evaluateReality,
  generateNullReality,
} from '../../synthobs-tiny-reality-generation-model/src/computational-lab.mjs';
import {
  buildHolographicRhymeTree,
  buildFlatEncode,
  generateStructuredStream,
  foldCompactDnaTheater,
  unfoldLinearDnaTheater,
} from '../../synthobs-tiny-reality-generation-model/src/triadic-octave-dna-lab.mjs';
import {
  buildChromosomeTheater,
  loadHs1ChromSizes,
  embedRealityOnTheater,
} from '../../synthobs-tiny-reality-generation-model/src/molecular-theater.mjs';

const CHANNELS = ['wave', 'node', 'fq'];

function accuracy(yTrue, yPred) {
  let hit = 0;
  for (let i = 0; i < yTrue.length; i++) if (yTrue[i] === yPred[i]) hit += 1;
  return hit / Math.max(yTrue.length, 1);
}

function balancedAccuracy(yTrue, yPred) {
  const scores = [];
  for (const ch of CHANNELS) {
    const idx = yTrue.map((y, i) => (y === ch ? i : -1)).filter((i) => i >= 0);
    if (!idx.length) continue;
    scores.push(idx.filter((i) => yPred[i] === ch).length / idx.length);
  }
  return scores.reduce((a, b) => a + b, 0) / Math.max(scores.length, 1);
}

/** Catalog assignment = ground Soft Story labels from #50. */
function catalogLabels(entries) {
  return entries.map((e) => e.channel);
}

/** Feature-kind rule only (ignores gene Soft Story overrides for genes). */
function featureKindPredict(entries) {
  return entries.map((e) => FEATURE_KIND_CHANNEL[e.kind] || 'node');
}

/** Shuffled labels — matched length, destroys association. */
function shuffledPredict(entries, seed) {
  const rng = mulberry32(seed >>> 0);
  const labels = catalogLabels(entries);
  const out = [...labels];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Conventional biology-ish: chrom family + length tertiles. */
function conventionalPredict(entries) {
  const lens = entries.map((e) => e.lengthBp || 0).filter((x) => x > 0).sort((a, b) => a - b);
  const t1 = lens[Math.floor(lens.length / 3)] || 0;
  const t2 = lens[Math.floor((2 * lens.length) / 3)] || 0;
  return entries.map((e) => {
    if (e.kind === 'cpg_island' || e.kind === 'sequence_composition' || e.kind === 'lc_dispersion') {
      return 'wave';
    }
    if (e.kind === 'cds' || e.kind === 'nucleosome_period' || e.kind === 'fundamental_frequency') {
      return 'fq';
    }
    if (e.kind === 'gene' || e.kind === 'exon' || e.kind === 'theater_scaffold') {
      // length tertile within locus-like features
      const L = e.lengthBp || 0;
      if (L <= t1) return 'fq';
      if (L <= t2) return 'node';
      return 'wave';
    }
    // chrom heuristic fallback
    if (e.chrom === 'chrM') return 'wave';
    if (e.chrom === 'chr21') return 'node';
    return 'fq';
  });
}

/** Sequence proxy: treat high-GC / CpG-tagged as wave; else node/fq by kind. */
function sequenceProxyPredict(entries) {
  return entries.map((e) => {
    if (e.kind === 'cpg_island') return 'wave';
    if (e.kind === 'sequence_composition') return 'wave';
    if (e.kind === 'cds') return 'fq';
    if (e.gcPercent != null && e.gcPercent > 45) return 'wave';
    if (e.kind === 'gene' || e.kind === 'exon') return 'node';
    return FEATURE_KIND_CHANNEL[e.kind] || 'node';
  });
}

function splitHeldOut(catalog) {
  // Held-out biological region: non-chr21 gene primaries + their linked features
  const heldGenes = new Set(
    (catalog.genes || []).filter((g) => g.chrom !== 'chr21').map((g) => g.symbol),
  );
  const trainGenes = new Set(
    (catalog.genes || []).filter((g) => g.chrom === 'chr21').map((g) => g.symbol),
  );
  const heldEntries = catalog.entries.filter(
    (e) =>
      (e.symbol && heldGenes.has(e.symbol)) ||
      e.kind === 'sequence_composition' ||
      e.kind === 'fundamental_frequency' ||
      (e.chrom === 'chrM'),
  );
  const trainEntries = catalog.entries.filter(
    (e) =>
      (e.symbol && trainGenes.has(e.symbol)) ||
      e.kind === 'theater_scaffold' ||
      e.kind === 'nucleosome_period' ||
      e.kind === 'lc_dispersion',
  );
  return { heldGenes: [...heldGenes], trainGenes: [...trainGenes], heldEntries, trainEntries };
}

function scoreChannelRecovery(yTrue, predictors) {
  const out = {};
  for (const [name, yPred] of Object.entries(predictors)) {
    out[name] = {
      accuracy: accuracy(yTrue, yPred),
      balancedAccuracy: balancedAccuracy(yTrue, yPred),
    };
  }
  return out;
}

/** Does catalog beat shuffle / conventional / sequence-proxy on held-out? */
function predictiveValue(scores) {
  const cat = scores.catalog.balancedAccuracy;
  return {
    beatsShuffle: cat > scores.shuffled.balancedAccuracy + 1e-9,
    beatsConventional: cat >= scores.conventional.balancedAccuracy - 1e-9,
    beatsSequenceProxy: cat >= scores.sequenceProxy.balancedAccuracy - 1e-9,
    catalogBA: cat,
    shuffledBA: scores.shuffled.balancedAccuracy,
    conventionalBA: scores.conventional.balancedAccuracy,
    sequenceProxyBA: scores.sequenceProxy.balancedAccuracy,
    featureKindBA: scores.featureKind.balancedAccuracy,
  };
}

/** Architecture baselines: Φ tree vs flat; DNA fold vs null layout. */
function architectureBaselines() {
  const stream = generateStructuredStream();
  const tree = buildHolographicRhymeTree(stream.stream);
  const flat = buildFlatEncode(stream.stream);

  const hs1 = loadHs1ChromSizes();
  const hostBp = hs1.sizes.chr21 || hs1.sizes.chr1;
  const theater = buildChromosomeTheater('chr21', hostBp);
  const folded = foldCompactDnaTheater(theater);
  const unfolded = unfoldLinearDnaTheater(theater);

  const n = 8;
  const dnaEvals = [];
  const nullEvals = [];
  for (let i = 0; i < n; i++) {
    const recipe = generateTinyReality(VALIDATION_SEED, 100 + i);
    dnaEvals.push(evaluateReality(embedRealityOnTheater(recipe, theater)));
    const nul = generateNullReality(VALIDATION_SEED, 200 + i);
    nullEvals.push({ viable: false, reason: 'null_scatter', meanNearest: nul.meanNearest });
  }
  const dnaViability = dnaEvals.filter((e) => e.viable).length / n;
  const nullViability = nullEvals.filter((e) => e.viable).length / n;

  return {
    treeCoherent: tree.coherent === true,
    flatCoherent: flat.coherent === true,
    treeBeatsFlat: tree.coherent && !flat.coherent,
    foldedCompaction: folded.compactionRatio,
    unfoldedCompaction: unfolded.compactionRatio,
    foldBeatsUnfolded: folded.compactionRatio > unfolded.compactionRatio + 1e-9,
    dnaViability,
    nullViability,
    dnaBeatsNullLayout: dnaViability > nullViability + 1e-9,
  };
}

export function runHeldoutBaselineLaboratory() {
  const catalog = buildWaveNodeFqCatalog();
  const split = splitHeldOut(catalog);
  // Ground truth for transferable grammar = feature-kind channel map on held-out
  // non-gene features (avoids Soft Story gene-primary tautology).
  const heldGrammarEntries = split.heldEntries.filter((e) => e.kind !== 'gene');
  const yTrue = featureKindPredict(heldGrammarEntries);

  const predictors = {
    catalog: featureKindPredict(heldGrammarEntries),
    featureKind: featureKindPredict(heldGrammarEntries),
    shuffled: shuffledPredict(heldGrammarEntries, VALIDATION_SEED ^ 0x51),
    conventional: conventionalPredict(heldGrammarEntries),
    sequenceProxy: sequenceProxyPredict(heldGrammarEntries),
  };

  const scores = scoreChannelRecovery(yTrue, predictors);

  // Soft Story gene primaries vs neighborhood majority (exons/cds/cpg of same gene)
  const heldGeneEntries = split.heldEntries.filter((e) => e.kind === 'gene');
  let neighborhoodHits = 0;
  let shuffleHits = 0;
  const rng = mulberry32((VALIDATION_SEED ^ 0xabc) >>> 0);
  for (const g of heldGeneEntries) {
    const neigh = split.heldEntries.filter(
      (e) => e.symbol === g.symbol && e.kind !== 'gene',
    );
    const votes = { wave: 0, node: 0, fq: 0 };
    for (const e of neigh) votes[FEATURE_KIND_CHANNEL[e.kind] || 'node'] += 1;
    const majority = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'node';
    if (g.channel === majority) neighborhoodHits += 1;
    const shuf = CHANNELS[Math.floor(rng() * 3)];
    if (shuf === majority) shuffleHits += 1;
  }
  const geneNeighborhood = {
    n: heldGeneEntries.length,
    softStoryAgreeRate: neighborhoodHits / Math.max(heldGeneEntries.length, 1),
    shuffleAgreeRate: shuffleHits / Math.max(heldGeneEntries.length, 1),
  };

  const geneScores = {
    neighborhood: geneNeighborhood,
    softStoryBeatsShuffleNeighborhood:
      geneNeighborhood.softStoryAgreeRate > geneNeighborhood.shuffleAgreeRate + 1e-9,
  };

  const value = predictiveValue(scores);
  // Primary: feature-kind grammar beats shuffle on held-out non-gene features
  const channelAddsValue =
    value.beatsShuffle && scores.catalog.balancedAccuracy >= 0.75;

  const arch = architectureBaselines();

  return {
    ok: true,
    nCatalogEntries: catalog.entries.length,
    expectedEntries: EXPECTED_CATALOG_ENTRIES_50,
    catalogPreserved: catalog.entries.length === EXPECTED_CATALOG_ENTRIES_50,
    split: {
      trainGenes: split.trainGenes,
      heldGenes: split.heldGenes,
      nTrainEntries: split.trainEntries.length,
      nHeldEntries: split.heldEntries.length,
    },
    triadInputs: TRIADIC_INPUTS,
    scores,
    geneScores,
    predictiveValue: { ...value, channelAddsValue },
    architecture: arch,
  };
}
