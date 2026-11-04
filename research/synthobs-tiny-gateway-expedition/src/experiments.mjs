/**
 * Experiments A–D · Tiny Gateway Expedition 001
 * Assignment: SLM + high-rate radar + template binding + efficiency/ablation
 */
import {
  DIGITAL_SEED,
  VALIDATION_SEED,
  IMPLEMENTATION_STATUS,
  ARCHITECTURE_STACK,
  ENGINE_SHELF_SLOT,
  HONESTY,
  RADAR_PARAMS,
  REAL_FUSION_WINDOW,
} from './constants.mjs';
import { DATA_POLICY_HONESTY } from './data-policy.mjs';
import { summarizeLatencies, timeCall, cpuMemSnapshot } from './bench.mjs';
import { resolveLanguageDataset } from './language/real-corpus-lab.mjs';
import { trainLightweight, predictLightweight } from './language/conventional-lightweight.mjs';
import { trainMicroTransformer, predictMicroTransformer } from './language/micro-transformer.mjs';
import {
  trainTinyGatewayLanguage,
  predictTinyGatewayLanguage,
  probeArchitecturalRoles,
} from './language/tiny-gateway-language.mjs';
import { generateSyntheticAirspace } from './radar/synthetic-airspace.mjs';
import { resolveFusionScenario } from './radar/real-track-fusion-lab.mjs';
import { runConventionalFusion } from './radar/conventional-fusion.mjs';
import { runTinyGatewayFusion } from './radar/tiny-gateway-fusion.mjs';
import { createTinyGateway } from './tiny-gateway/gateway.mjs';
import { createTemplate, bindTemplate } from './tiny-gateway/template-binding.mjs';
import { selectTemplate } from './tiny-gateway/wave-node-fq.mjs';

function accuracy(rows, predict) {
  let ok = 0;
  const byTask = {};
  for (const row of rows) {
    const { pred } = predict(row);
    const hit = normalize(pred) === normalize(row.label);
    if (!byTask[row.task]) byTask[row.task] = { n: 0, ok: 0 };
    byTask[row.task].n++;
    if (hit) {
      ok++;
      byTask[row.task].ok++;
    }
  }
  const perTask = {};
  for (const [t, v] of Object.entries(byTask)) {
    perTask[t] = v.n ? v.ok / v.n : 0;
  }
  return { accuracy: rows.length ? ok / rows.length : 0, n: rows.length, correct: ok, perTask };
}

function normalize(v) {
  if (v == null) return '';
  return String(v).toLowerCase().trim();
}

function subsampleScenario(scenario, { maxTracks, maxSteps }) {
  const tracks = scenario.tracks.slice(0, maxTracks).map((tr) => ({
    ...tr,
    path: tr.path.filter((p) => p.step < maxSteps).map((p) => ({ ...p })),
  }));
  const trackIds = new Set(tracks.map((t) => t.id));
  const observations = scenario.observations.filter(
    (o) => trackIds.has(o.trackId) && o.step < maxSteps,
  );
  const anomalyIds = scenario.anomalyIds.filter((id) => trackIds.has(id));
  return {
    ...scenario,
    tracks,
    observations,
    anomalyIds,
    params: {
      ...scenario.params,
      tracks: tracks.length,
      timeSteps: maxSteps,
      observations: observations.length,
      anomalyTracks: anomalyIds.length,
    },
    stats: {
      nSensors: scenario.sensors.length,
      nTracks: tracks.length,
      nSteps: maxSteps,
      nObservations: observations.length,
      nAnomalies: anomalyIds.length,
      expectedObservations: scenario.sensors.length * tracks.length * maxSteps,
    },
  };
}

function fusionPair(scenario) {
  const conv = runConventionalFusion(scenario);
  const gw = runTinyGatewayFusion(scenario);
  return {
    conventional: { runtimeMs: conv.runtimeMs, metrics: conv.metrics, nEstTracks: conv.nEstTracks },
    tinyGateway: {
      runtimeMs: gw.runtimeMs,
      metrics: gw.metrics,
      nEstTracks: gw.nEstTracks,
      templateHits: gw.templateHits,
      gateway: gw.gateway,
    },
    f1Delta: gw.metrics.f1 - conv.metrics.f1,
    runtimeRatioGatewayOverConventional: conv.runtimeMs > 0 ? gw.runtimeMs / conv.runtimeMs : null,
  };
}

/** Experiment A — Small language model comparison */
export function runExperimentA(seed = DIGITAL_SEED) {
  const resolved = resolveLanguageDataset(seed);
  if (!resolved.ok) {
    return {
      id: 'A_language',
      title: 'Small language model · three-way comparison',
      seed,
      skipped: true,
      sourceMode: resolved.sourceMode,
      missing: resolved.missing,
      honesty: resolved.honesty,
    };
  }
  const dataset = resolved.dataset;
  const env = cpuMemSnapshot();

  const tLw = timeCall(() => trainLightweight(dataset));
  const tTf = timeCall(() => trainMicroTransformer(dataset, seed));
  const tGw = timeCall(() => trainTinyGatewayLanguage(dataset));

  const lwLat = [];
  const tfLat = [];
  const gwLat = [];

  const predictTimed = (predict, model, row, sink) => {
    const t0 = performance.now();
    const out = predict(model, row);
    sink.push(performance.now() - t0);
    return out;
  };

  const evalSet = [...dataset.test, ...dataset.heldOut];

  const lwAcc = accuracy(evalSet, (row) => predictTimed(predictLightweight, tLw.result, row, lwLat));
  const tfAcc = accuracy(evalSet, (row) => predictTimed(predictMicroTransformer, tTf.result, row, tfLat));
  const gwAcc = accuracy(evalSet, (row) => predictTimed(predictTinyGatewayLanguage, tGw.result, row, gwLat));

  const roles = probeArchitecturalRoles(tGw.result, dataset.test[0] || dataset.train[0]);

  const intentRows = evalSet.filter((r) => r.task === 'intent_recognition' || r.task === 'unseen_generalization');
  let agree = 0;
  for (const row of intentRows) {
    const a = predictLightweight(tLw.result, row).pred;
    const b = predictTinyGatewayLanguage(tGw.result, row).pred;
    if (normalize(a) === normalize(b)) agree++;
  }

  return {
    id: 'A_language',
    title: 'Small language model · three-way comparison',
    seed,
    sourceMode: resolved.sourceMode,
    sourcesUsed: resolved.sourcesUsed,
    datasetStats: dataset.stats,
    capabilitiesCovered: Object.keys(lwAcc.perTask || {}),
    trainMs: { lightweight: tLw.ms, microTransformer: tTf.ms, tinyGateway: tGw.ms },
    accuracy: { lightweight: lwAcc, microTransformer: tfAcc, tinyGateway: gwAcc },
    latency: {
      lightweight: summarizeLatencies(lwLat),
      microTransformer: summarizeLatencies(tfLat),
      tinyGateway: summarizeLatencies(gwLat),
    },
    modelSizeBytes: {
      lightweight: tLw.result.sizeBytes,
      microTransformer: tTf.result.sizeBytes,
      tinyGateway: tGw.result.sizeBytes,
    },
    architecturalRoles: roles,
    intentAgreementGatewayVsLightweight: intentRows.length ? agree / intentRows.length : 0,
    env,
    honesty:
      `${resolved.honesty} Micro-Transformer is a pure-JS 2-layer stand-in — not HuggingFace/GPT. Tiny Gateway is template+Wave–Node–Fq, not a trained LLM. Roles tested separately: language architecture / LLM surround / neural-portion substitute / multi-agent substrate.`,
  };
}

/**
 * Experiment B — Multisensor fusion
 * Primary: assignment-required civilian synthetic 6×180×80×86400
 * Secondary: Movebank+Kp historical when available (honest dual report)
 */
export async function runExperimentB(seed = DIGITAL_SEED) {
  const tGen = timeCall(() =>
    generateSyntheticAirspace(seed, { ...RADAR_PARAMS }),
  );
  const synthetic = tGen.result;
  synthetic.sourceMode = 'assignment_civilian_synthetic';
  synthetic.provenance = {
    kind: 'assignment_recreation',
    note: 'Prior experiment scripts/logs with these params were not found in-repo; fixture recreated from stated parameters. Prior conflicting timing/memory figures are not verified.',
    generateMs: tGen.ms,
  };

  const primary = fusionPair(synthetic);

  // Scaling: sensors, tracks, observation frequency (step budgets)
  const scaleSensors = [];
  for (const sensors of [2, 4, 6]) {
    const sc = generateSyntheticAirspace(seed + sensors, {
      sensors,
      tracks: 60,
      timeSteps: 40,
      anomalyTracks: 6,
      observations: sensors * 60 * 40,
    });
    sc.sourceMode = 'assignment_civilian_synthetic_scale_sensors';
    const pair = fusionPair(sc);
    scaleSensors.push({
      sensors,
      nObs: sc.stats.nObservations,
      conventionalMs: pair.conventional.runtimeMs,
      gatewayMs: pair.tinyGateway.runtimeMs,
      conventionalF1: pair.conventional.metrics.f1,
      gatewayF1: pair.tinyGateway.metrics.f1,
    });
  }

  const scaleTracks = [];
  for (const tracks of [45, 90, 180]) {
    const sc = generateSyntheticAirspace(seed + tracks, {
      sensors: 6,
      tracks,
      timeSteps: 40,
      anomalyTracks: Math.max(3, Math.round(tracks * 0.1)),
      observations: 6 * tracks * 40,
    });
    sc.sourceMode = 'assignment_civilian_synthetic_scale_tracks';
    const pair = fusionPair(sc);
    scaleTracks.push({
      tracks,
      nObs: sc.stats.nObservations,
      conventionalMs: pair.conventional.runtimeMs,
      gatewayMs: pair.tinyGateway.runtimeMs,
      conventionalF1: pair.conventional.metrics.f1,
      gatewayF1: pair.tinyGateway.metrics.f1,
    });
  }

  const scaleSteps = [];
  for (const timeSteps of [20, 40, 80]) {
    const sc = generateSyntheticAirspace(seed + timeSteps, {
      sensors: 6,
      tracks: 90,
      timeSteps,
      anomalyTracks: 9,
      observations: 6 * 90 * timeSteps,
    });
    sc.sourceMode = 'assignment_civilian_synthetic_scale_steps';
    const pair = fusionPair(sc);
    scaleSteps.push({
      timeSteps,
      nObs: sc.stats.nObservations,
      conventionalMs: pair.conventional.runtimeMs,
      gatewayMs: pair.tinyGateway.runtimeMs,
      conventionalF1: pair.conventional.metrics.f1,
      gatewayF1: pair.tinyGateway.metrics.f1,
    });
  }

  // Optional historical secondary arm
  let historical = null;
  try {
    const resolved = await resolveFusionScenario({
      seed,
      startHour: REAL_FUSION_WINDOW.startHour,
      targetSteps: REAL_FUSION_WINDOW.targetSteps,
    });
    if (resolved.ok) {
      const pair = fusionPair(resolved.scenario);
      historical = {
        sourceMode: resolved.sourceMode,
        fixture: resolved.scenario.stats,
        params: resolved.scenario.params,
        provenance: resolved.scenario.provenance,
        ...pair,
      };
    } else {
      historical = { skipped: true, sourceMode: resolved.sourceMode, missing: resolved.missing };
    }
  } catch (err) {
    historical = { skipped: true, error: String(err?.message || err) };
  }

  return {
    id: 'B_radar',
    title: 'Multisensor track fusion · assignment synthetic primary (+ optional historical)',
    seed,
    sourceMode: 'assignment_civilian_synthetic',
    priorScriptRecovery: IMPLEMENTATION_STATUS.priorRadarScriptRecovery,
    fixture: synthetic.stats,
    params: synthetic.params,
    provenance: synthetic.provenance,
    conventional: primary.conventional,
    tinyGateway: primary.tinyGateway,
    f1Delta: primary.f1Delta,
    runtimeRatioGatewayOverConventional: primary.runtimeRatioGatewayOverConventional,
    scaling: { bySensors: scaleSensors, byTracks: scaleTracks, byTimeSteps: scaleSteps },
    historicalSecondary: historical,
    honesty: `${DATA_POLICY_HONESTY} Primary fusion = assignment civilian synthetic. Not ATC/ADS-B. Timings measured on this host.`,
  };
}

/** Experiment C — Template binding & reusable execution (stage-isolated) */
export function runExperimentC(seed = DIGITAL_SEED) {
  const gw = createTinyGateway({ domain: 'template_bench', task: 'reuse', honeycombRadius: 2 });
  const constructMs = [];
  const selectMs = [];
  const bindMs = [];
  const execMs = [];
  const reuseMs = [];
  const incrementalUpdateMs = [];
  const crossDatasetReuseMs = [];
  const coldMs = [];
  const warmMs = [];

  const tCold = timeCall(() => {
    for (let i = 0; i < 40; i++) {
      const t0 = performance.now();
      gw.registerTemplate(
        createTemplate({
          id: `tpl:${i}`,
          kind: 'bench',
          slots: ['x', 'y'],
          execute: (b) => b.x + b.y,
        }),
      );
      constructMs.push(performance.now() - t0);
    }
  });
  coldMs.push(tCold.ms);

  for (let trial = 0; trial < 200; trial++) {
    const data = { x: trial, y: trial * 0.5, kind: 'bench' };
    const scored = gw.registry.list('bench').map((t, i) => ({
      template: t,
      score: 1 / (1 + Math.abs(i - (trial % 40))),
    }));

    const tSel = timeCall(() => selectTemplate(scored));
    selectMs.push(tSel.ms);

    const tpl = tSel.result?.template || scored[0].template;
    const tBind = timeCall(() => bindTemplate(tpl, data));
    bindMs.push(tBind.ms);

    const tExec = timeCall(() => tpl.execute(tBind.result.bound, data));
    execMs.push(tExec.ms);

    const tRun = timeCall(() =>
      gw.run({
        data,
        scored,
        pathway: { from: '0,0', to: '1,0' },
        targetScale: 2,
      }),
    );
    reuseMs.push(tRun.ms);
    warmMs.push(tRun.ms);
  }

  // Incremental update: mutate one slot and re-bind/exec without reconstructing templates
  for (let trial = 0; trial < 100; trial++) {
    const tpl = gw.registry.list('bench')[trial % 40];
    const t0 = performance.now();
    const bound = bindTemplate(tpl, { x: trial + 1, y: trial * 0.25 });
    tpl.execute(bound.bound);
    incrementalUpdateMs.push(performance.now() - t0);
  }

  // Cross-dataset reuse: same templates, new data distribution
  for (let trial = 0; trial < 100; trial++) {
    const tpl = gw.registry.list('bench')[trial % 40];
    const t0 = performance.now();
    const bound = bindTemplate(tpl, { x: Math.sin(trial), y: Math.cos(trial) * 10 });
    tpl.execute(bound.bound);
    crossDatasetReuseMs.push(performance.now() - t0);
  }

  const conventionalRebuild = [];
  const conventionalReuse = [];
  const fns = [];
  for (let i = 0; i < 40; i++) {
    const t0 = performance.now();
    fns.push((d) => d.x + d.y + i * 0);
    conventionalRebuild.push(performance.now() - t0);
  }
  for (let trial = 0; trial < 200; trial++) {
    const t0 = performance.now();
    const f = (d) => d.x + d.y;
    f({ x: trial, y: trial * 0.5 });
    conventionalRebuild.push(performance.now() - t0);

    const t1 = performance.now();
    fns[trial % 40]({ x: trial, y: trial * 0.5 });
    conventionalReuse.push(performance.now() - t1);
  }

  const warmMedian = summarizeLatencies(warmMs).medianMs;
  const selectMedian = summarizeLatencies(selectMs).medianMs;

  return {
    id: 'C_template_binding',
    title: 'Template construction · selection · bind · execute · reuse',
    seed,
    stages: {
      construct: summarizeLatencies(constructMs),
      select: summarizeLatencies(selectMs),
      bind: summarizeLatencies(bindMs),
      execute: summarizeLatencies(execMs),
      endToEndReuse: summarizeLatencies(reuseMs),
      incrementalUpdate: summarizeLatencies(incrementalUpdateMs),
      crossDatasetReuse: summarizeLatencies(crossDatasetReuseMs),
    },
    coldStartConstructTotalMs: tCold.ms,
    warmStart: summarizeLatencies(warmMs),
    conventional: {
      rebuildEachCall: summarizeLatencies(conventionalRebuild),
      reuseFn: summarizeLatencies(conventionalReuse),
    },
    notes: [
      'Select, bind, and execute are timed independently; end-to-end reuse also includes Wave–Node–Fq + honeycomb pathway.',
      'Do not equate fast template selection with fast end-to-end computation.',
      `selectMedian=${selectMedian?.toFixed?.(6)} warmE2EMedian=${warmMedian?.toFixed?.(6)}`,
    ],
    reuseVsRebuildMedianRatio:
      summarizeLatencies(conventionalRebuild).medianMs > 0
        ? summarizeLatencies(conventionalRebuild).medianMs / Math.max(1e-9, warmMedian)
        : null,
  };
}

/** Experiment D — Efficiency, scaling, ablation on synthetic assignment fixture */
export async function runExperimentD(seed = DIGITAL_SEED) {
  const base = generateSyntheticAirspace(seed + 7, {
    sensors: 6,
    tracks: 60,
    timeSteps: 40,
    anomalyTracks: 6,
    observations: 6 * 60 * 40,
  });
  base.sourceMode = 'assignment_civilian_synthetic_ablation';

  const full = runTinyGatewayFusion(base, { ablation: {} });
  const noSpiral = runTinyGatewayFusion(base, { ablation: { disableSpiral: true } });
  const noHoney = runTinyGatewayFusion(base, { ablation: { disableHoneycomb: true } });
  const noWave = runTinyGatewayFusion(base, { ablation: { disableWave: true } });
  const noTree = runTinyGatewayFusion(base, { ablation: { disableTree: true } });
  const conv = runConventionalFusion(base);

  const ablations = [
    { name: 'full', runtimeMs: full.runtimeMs, f1: full.metrics.f1 },
    { name: 'disableSpiral', runtimeMs: noSpiral.runtimeMs, f1: noSpiral.metrics.f1 },
    { name: 'disableHoneycomb', runtimeMs: noHoney.runtimeMs, f1: noHoney.metrics.f1 },
    { name: 'disableWave', runtimeMs: noWave.runtimeMs, f1: noWave.metrics.f1 },
    { name: 'disableTree', runtimeMs: noTree.runtimeMs, f1: noTree.metrics.f1 },
    { name: 'conventional', runtimeMs: conv.runtimeMs, f1: conv.metrics.f1 },
  ];

  const volumes = [];
  for (const tracks of [20, 40, 60]) {
    const sc = generateSyntheticAirspace(seed + tracks, {
      sensors: 6,
      tracks,
      timeSteps: 40,
      anomalyTracks: Math.max(2, Math.round(tracks * 0.1)),
      observations: 6 * tracks * 40,
    });
    const c = runConventionalFusion(sc);
    const g = runTinyGatewayFusion(sc);
    volumes.push({
      tracks,
      nObs: sc.stats.nObservations,
      conventionalMs: c.runtimeMs,
      gatewayMs: g.runtimeMs,
      conventionalF1: c.metrics.f1,
      gatewayF1: g.metrics.f1,
      throughputObsPerSecConv: sc.stats.nObservations / Math.max(1e-6, c.runtimeMs / 1000),
      throughputObsPerSecGw: sc.stats.nObservations / Math.max(1e-6, g.runtimeMs / 1000),
      sourceMode: 'assignment_civilian_synthetic',
    });
  }

  const mem = cpuMemSnapshot();
  const initGw = timeCall(() => createTinyGateway({ domain: 'init', task: 'bench', honeycombRadius: 2 }));

  return {
    id: 'D_efficiency',
    title: 'Computational efficiency · scaling · ablation',
    seed,
    sourceMode: 'assignment_civilian_synthetic_ablation',
    ablations,
    volumes,
    memory: mem,
    initializationMs: initGw.ms,
    gpuUtilization: null,
    energyJoules: null,
    honesty: `${DATA_POLICY_HONESTY} Ablations/volumes on civilian synthetic. GPU/energy null on this Node harness.`,
  };
}

export async function runAllExperiments({ seed = DIGITAL_SEED, validationSeed = VALIDATION_SEED } = {}) {
  const A = runExperimentA(seed);
  const A2 = runExperimentA(validationSeed);
  const B = await runExperimentB(seed);
  const C = runExperimentC(seed);
  const D = await runExperimentD(seed);

  const experiments = [
    {
      id: 'E1_architecture_implemented',
      title: 'Architecture components implemented vs provisional',
      pass: ARCHITECTURE_STACK.length === 7,
      status: IMPLEMENTATION_STATUS,
      stack: ARCHITECTURE_STACK,
    },
    {
      id: 'E2_language_three_way',
      title: 'Language three-way accuracy on shared fixtures',
      pass: !A.skipped && A.accuracy?.tinyGateway?.n > 0 && A.accuracy?.lightweight?.n > 0,
      primary: A,
      validation: A2.skipped
        ? { skipped: true }
        : {
            seed: validationSeed,
            tinyGatewayAcc: A2.accuracy.tinyGateway.accuracy,
            lightweightAcc: A2.accuracy.lightweight.accuracy,
            microTransformerAcc: A2.accuracy.microTransformer.accuracy,
          },
    },
    {
      id: 'E3_architectural_roles',
      title: 'Language roles probed separately',
      pass: !A.skipped && Object.values(A.architecturalRoles || {}).every((r) => r.ok),
      roles: A.architecturalRoles,
    },
    {
      id: 'E4_fusion_assignment_fixture',
      title: 'Fusion fixture executes on assignment civilian synthetic (6×180×80×86400)',
      pass:
        !B.skipped &&
        B.fixture?.nObservations === RADAR_PARAMS.observations &&
        B.fixture?.nSensors === RADAR_PARAMS.sensors &&
        B.fixture?.nTracks === RADAR_PARAMS.tracks &&
        B.sourceMode === 'assignment_civilian_synthetic',
      sourceMode: B.sourceMode,
      fixture: B.fixture,
      B,
    },
    {
      id: 'E5_fusion_f1_reported',
      title: 'Fusion precision/recall/F1 measured for both pipelines',
      pass:
        !B.skipped &&
        Number.isFinite(B.conventional?.metrics?.f1) &&
        Number.isFinite(B.tinyGateway?.metrics?.f1),
      conventionalF1: B.conventional?.metrics?.f1,
      gatewayF1: B.tinyGateway?.metrics?.f1,
      f1Delta: B.f1Delta,
    },
    {
      id: 'E6_template_reuse_stages',
      title: 'Template stages timed independently (select/bind/execute)',
      pass: C.stages.execute.n >= 100 && C.stages.bind.n >= 100 && C.stages.select.n >= 100,
      C,
    },
    {
      id: 'E7_ablation_runs',
      title: 'Ablation suite completes on synthetic assignment arm',
      pass: !D.skipped && D.ablations?.length >= 5,
      D,
    },
    {
      id: 'E8_engine_pin_gate',
      title: 'Data-gated engine pin recommendation (expedition ships as application companion)',
      pass: true,
      ...evaluateEnginePin({ A, B, C, D }),
    },
  ];

  const n_pass = experiments.filter((e) => e.pass).length;
  const n_total = experiments.length;

  return {
    experiments,
    n_pass,
    n_total,
    all_pass: n_pass === n_total,
    A,
    B,
    C,
    D,
    dataPolicy: DATA_POLICY_HONESTY,
    implementationStatus: IMPLEMENTATION_STATUS,
    honesty: HONESTY,
    engineShelfCandidate: ENGINE_SHELF_SLOT,
    expedition: 'Tiny Gateway Expedition 001',
  };
}

function evaluateEnginePin({ A, B, C, D }) {
  /**
   * Expedition 001 is an application companion by default.
   * Pin only if measured gates are strongly positive — same honesty as Leo lab prior.
   */
  if (A.skipped || B.skipped || D.skipped) {
    return {
      enginePinRecommended: false,
      candidateSlot: ENGINE_SHELF_SLOT,
      gates: { skipped: true },
      reasons: ['required_experiment_skipped'],
      interpretation: 'Withhold engine pin — required experiment skipped',
    };
  }

  const langOk =
    A.accuracy.tinyGateway.accuracy + 1e-9 >= A.accuracy.lightweight.accuracy - 0.02 &&
    Object.values(A.architecturalRoles).every((r) => r.ok);

  const radarOk = B.tinyGateway.metrics.f1 + 1e-9 >= B.conventional.metrics.f1 - 0.05;

  const reuseOk =
    C.conventional.rebuildEachCall.medianMs > 0 &&
    C.warmStart.medianMs <= C.conventional.rebuildEachCall.medianMs * 1.25;

  const ablationAlive = D.ablations.some(
    (a) => a.name !== 'full' && a.name !== 'conventional' && Math.abs(a.runtimeMs - D.ablations[0].runtimeMs) > 0.01,
  );

  const assignmentFixtureOk = B.fixture?.nObservations === RADAR_PARAMS.observations;

  const reasons = [];
  if (!langOk) reasons.push('language_accuracy_or_roles_gate_failed');
  if (!radarOk) reasons.push('fusion_f1_more_than_5pp_behind_conventional');
  if (!reuseOk) reasons.push('template_reuse_not_competitive_with_rebuild');
  if (!ablationAlive) reasons.push('ablations_did_not_move_runtime');
  if (!assignmentFixtureOk) reasons.push('assignment_synthetic_fixture_incomplete');

  // Expedition series remains application companion even if gates pass —
  // ENGINE_SHELF promotion is a separate Player 1 decision. Still report gates.
  const gatesPass = langOk && radarOk && reuseOk && ablationAlive && assignmentFixtureOk;

  return {
    enginePinRecommended: false,
    gatesWouldPass: gatesPass,
    candidateSlot: ENGINE_SHELF_SLOT,
    gates: { langOk, radarOk, reuseOk, ablationAlive, assignmentFixtureOk },
    sourceModes: { language: A.sourceMode, fusion: B.sourceMode, efficiency: D.sourceMode },
    reasons: gatesPass
      ? ['expedition_ships_as_application_companion_not_engine_shelf']
      : reasons,
    interpretation: gatesPass
      ? 'Measured gates would pass, but Tiny Gateway Expedition 001 ships as application companion (not ENGINE_SHELF)'
      : `Gates failed (${reasons.join(', ') || 'unknown'}) — application companion only`,
  };
}
