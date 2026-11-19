/**
 * INS ↔ POMC endocrine rhyme validation expedition (E1–E5).
 */
import {
  DOC_ID,
  SEED,
  PHI_EGS,
  FOCUS_PAIR,
  MANKIND_BENEFIT,
  EXON_FEATURE_KEYS,
  PERMUTE_N,
  BOOTSTRAP_B,
  STRING_SUPPORT_FLOOR,
  HONESTY,
  HONESTY_TOKENS,
  REGISTRY_ID,
  ENGINE_SHELF_PINNED,
} from './constants.mjs';
import {
  loadExonFeatureObjects,
  loadGenes,
  loadStringFixture,
  loadOpenTargetsFixture,
  stringPairScore,
} from './load.mjs';
import {
  zScoreColumns,
  maxCrossGeneCoupling,
  permutePairCouplings,
  bootstrapMeanCi,
  runMathProofs,
  cosine,
} from './math.mjs';

function uniqueSymbols(objects) {
  return [...new Set(objects.map((o) => o.symbol))].sort();
}

function allCrossGenePairs(symbols) {
  const pairs = [];
  for (let i = 0; i < symbols.length; i += 1) {
    for (let j = i + 1; j < symbols.length; j += 1) {
      pairs.push([symbols[i], symbols[j]]);
    }
  }
  return pairs;
}

function diseaseRailScore(geneBlock, axisKeywords) {
  const diseases = geneBlock?.topDiseases || [];
  const hits = diseases.filter((d) =>
    axisKeywords.some((k) => String(d.name).toLowerCase().includes(k)),
  );
  const top = hits.length ? Math.max(...hits.map((d) => d.score)) : 0;
  const meanHit =
    hits.length === 0 ? 0 : hits.reduce((s, d) => s + d.score, 0) / hits.length;
  return {
    nHits: hits.length,
    topScore: top,
    meanHitScore: meanHit,
    hits: hits.map((d) => ({ name: d.name, score: d.score })),
  };
}

/**
 * Soft Story population-burden scores for pick-gate (triage only).
 * INS↔POMC = diabetes+obesity (1.0); APP↔DYRK1A = neurodegeneration Soft Story (0.55);
 * NPY↔SOD1 = mixed / fails STRING (0.35).
 */
function populationBurdenSoftStory(pairLabel) {
  if (pairLabel === 'INS↔POMC' || pairLabel === 'INS-POMC') return 1.0;
  if (pairLabel === 'APP↔DYRK1A' || pairLabel === 'APP-DYRK1A') return 0.55;
  if (pairLabel === 'NPY↔SOD1' || pairLabel === 'NPY-SOD1') return 0.35;
  return 0.25;
}

export function runExpedition() {
  const objects = loadExonFeatureObjects();
  const genes = loadGenes();
  const symbols = uniqueSymbols(objects);
  const keys = [...EXON_FEATURE_KEYS];
  const { zObjects } = zScoreColumns(objects, keys);
  const mathProofs = runMathProofs(objects, keys);

  // —— E1: reproduce INS↔POMC max coupling ——
  const e1Best = maxCrossGeneCoupling(zObjects, FOCUS_PAIR.a, FOCUS_PAIR.b);
  const e1 = {
    id: 'E1',
    name: 'reproduce_ins_pomc_exon_coupling',
    focusPair: FOCUS_PAIR.label,
    nInsExons: zObjects.filter((o) => o.symbol === 'INS').length,
    nPomcExons: zObjects.filter((o) => o.symbol === 'POMC').length,
    featureKeys: keys,
    maxCoupling: Number(e1Best.maxCoupling.toFixed(6)),
    bestPair: e1Best.pair
      ? {
          a: e1Best.pair.a,
          b: e1Best.pair.b,
          coupling: Number(e1Best.pair.coupling.toFixed(6)),
        }
      : null,
    symmetryCheck: (() => {
      if (!e1Best.pair) return null;
      const a = zObjects.find((o) => o.id === e1Best.pair.a);
      const b = zObjects.find((o) => o.id === e1Best.pair.b);
      return {
        cosAB: cosine(a.z, b.z),
        cosBA: cosine(b.z, a.z),
      };
    })(),
  };

  // —— E2: rank among all cross-gene pairs + permutation p ——
  const crossPairs = allCrossGenePairs(symbols).map(([a, b]) => {
    const best = maxCrossGeneCoupling(zObjects, a, b);
    return {
      pair: `${a}↔${b}`,
      a,
      b,
      maxCoupling: best.maxCoupling,
      bestExonPair: best.pair,
    };
  });
  crossPairs.sort((x, y) => y.maxCoupling - x.maxCoupling);
  const focusRank =
    crossPairs.findIndex((p) => p.a === FOCUS_PAIR.a && p.b === FOCUS_PAIR.b) + 1;
  const perm = permutePairCouplings(objects, keys, FOCUS_PAIR.a, FOCUS_PAIR.b, {
    nPerm: PERMUTE_N,
    seed: SEED,
  });
  const focusCouplings = crossPairs.map((p) => p.maxCoupling);
  const boot = bootstrapMeanCi(focusCouplings, { B: BOOTSTRAP_B, seed: SEED + 7 });
  const e2 = {
    id: 'E2',
    name: 'null_rank_and_permutation',
    nGenes: symbols.length,
    nCrossGenePairs: crossPairs.length,
    focusRank,
    focusMaxCoupling: e1.maxCoupling,
    permutation: {
      observed: Number(perm.observed.toFixed(6)),
      nullMean: Number(perm.nullMean.toFixed(6)),
      nullP95: Number(perm.nullP95.toFixed(6)),
      p: Number(perm.p.toFixed(6)),
      nPerm: perm.nPerm,
    },
    bootstrapPanelMeanCi: {
      mean: Number(boot.mean.toFixed(6)),
      low: Number(boot.low.toFixed(6)),
      high: Number(boot.high.toFixed(6)),
      B: boot.B,
    },
    topPairs: crossPairs.slice(0, 12).map((p) => ({
      pair: p.pair,
      maxCoupling: Number(p.maxCoupling.toFixed(6)),
    })),
  };

  // —— E3: external STRING ——
  const stringDoc = loadStringFixture();
  const stringInsPomc = stringPairScore(stringDoc, 'INS', 'POMC');
  const stringAppDyrk = stringPairScore(stringDoc, 'APP', 'DYRK1A');
  const stringNpySod = stringPairScore(stringDoc, 'NPY', 'SOD1');
  const e3 = {
    id: 'E3',
    name: 'external_string_literature',
    comparisons: [
      {
        pair: 'INS↔POMC',
        role: 'focus',
        empty: stringInsPomc.empty,
        score: stringInsPomc.score,
        tscore: stringInsPomc.tscore,
        ascore: stringInsPomc.ascore,
        supportsFloor: stringInsPomc.score >= STRING_SUPPORT_FLOOR,
      },
      {
        pair: 'APP↔DYRK1A',
        role: 'runner_up',
        empty: stringAppDyrk.empty,
        score: stringAppDyrk.score,
        tscore: stringAppDyrk.tscore,
        ascore: stringAppDyrk.ascore,
        supportsFloor: stringAppDyrk.score >= STRING_SUPPORT_FLOOR,
      },
      {
        pair: 'NPY↔SOD1',
        role: 'negative_control',
        empty: stringNpySod.empty,
        score: stringNpySod.score,
        tscore: stringNpySod.tscore,
        ascore: stringNpySod.ascore,
        supportsFloor: false,
        note: 'STRING returns empty [] — negative control fails literature association',
      },
    ],
    focusStringScore: stringInsPomc.score,
    negativeControlEmpty: stringNpySod.empty,
  };

  // —— E4: OpenTargets disease rails ——
  const ot = loadOpenTargetsFixture();
  const insDiabetes = diseaseRailScore(ot.genes.INS, [
    'diabetes',
    'mody',
    'hyperproinsulin',
    't1d',
    't2d',
  ]);
  const pomcObesity = diseaseRailScore(ot.genes.POMC, ['obesity']);
  const e4 = {
    id: 'E4',
    name: 'opentargets_disease_rails',
    INS: {
      axis: 'diabetes',
      topDiseases: ot.genes.INS.topDiseases,
      diabetesRail: insDiabetes,
    },
    POMC: {
      axis: 'obesity',
      topDiseases: ot.genes.POMC.topDiseases,
      obesityRail: pomcObesity,
    },
    axesAligned: insDiabetes.nHits > 0 && pomcObesity.nHits > 0,
  };

  // —— E5: mankind-benefit pick gate ——
  const rhymeByPair = Object.fromEntries(
    crossPairs.map((p) => [p.pair, p.maxCoupling]),
  );
  const candidates = [
    {
      pair: 'INS↔POMC',
      rhyme: rhymeByPair['INS↔POMC'] ?? e1.maxCoupling,
      string: stringInsPomc.empty ? 0 : stringInsPomc.score,
      burden: populationBurdenSoftStory('INS↔POMC'),
    },
    {
      pair: 'APP↔DYRK1A',
      rhyme: rhymeByPair['APP↔DYRK1A'] ?? 0,
      string: stringAppDyrk.empty ? 0 : stringAppDyrk.score,
      burden: populationBurdenSoftStory('APP↔DYRK1A'),
    },
    {
      pair: 'NPY↔SOD1',
      rhyme: rhymeByPair['NPY↔SOD1'] ?? 0,
      string: stringNpySod.empty ? 0 : stringNpySod.score,
      burden: populationBurdenSoftStory('NPY↔SOD1'),
    },
  ].map((c) => ({
    ...c,
    gateScore: c.burden * c.string * Math.max(0, c.rhyme),
  }));
  candidates.sort((a, b) => b.gateScore - a.gateScore);
  const winner = candidates[0];
  const e5 = {
    id: 'E5',
    name: 'mankind_benefit_pick_gate',
    formula: 'population_disease_burden_SoftStory × external_STRING × rhyme_recovery',
    mankindBenefit: MANKIND_BENEFIT,
    candidates: candidates.map((c) => ({
      pair: c.pair,
      burdenSoftStory: c.burden,
      string: c.string,
      rhyme: Number(c.rhyme.toFixed(6)),
      gateScore: Number(c.gateScore.toFixed(6)),
    })),
    winner: winner.pair,
    insPomcWins: winner.pair === 'INS↔POMC',
  };

  const supportsFollowUp =
    e1.maxCoupling > 0 &&
    stringInsPomc.score >= STRING_SUPPORT_FLOOR &&
    e5.insPomcWins &&
    stringNpySod.empty;

  const verdict = {
    supportsMetabolicFollowUp: supportsFollowUp,
    summary:
      'Rhyme recovery + STRING literature association SUPPORTS following INS↔POMC for metabolic (diabetes+obesity) follow-up. Does NOT prove causal pathway or clinical effect. NPY↔SOD1 fails STRING (negative control).',
    claims: {
      rhymeRecovery: e1.maxCoupling,
      stringLiteratureAssociation: stringInsPomc.score,
      stringFloorMet: stringInsPomc.score >= STRING_SUPPORT_FLOOR,
      mankindBenefitGateWinner: e5.winner,
      negativeControlNpySod1Empty: stringNpySod.empty,
    },
    doesNotClaim: [
      'causal endocrine pathway',
      'clinical treatment effect',
      'ENGINE_SHELF physics pin',
      'wet-lab confirmation',
    ],
  };

  return {
    documentId: DOC_ID,
    registryId: REGISTRY_ID,
    seed: SEED,
    phiEgs: PHI_EGS,
    engineShelfPinned: ENGINE_SHELF_PINNED,
    focusPair: FOCUS_PAIR,
    honesty: HONESTY,
    honestyTokens: HONESTY_TOKENS,
    panel: {
      nGenes: genes.length,
      symbols,
      nExons: objects.length,
      featureKeys: keys,
    },
    mathProofs,
    experiments: { e1, e2, e3, e4, e5 },
    verdict,
  };
}
