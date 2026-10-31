/**
 * Experiments A–D · Tiny Gateway language + radar program
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
import { DATA_POLICY_HONESTY, allowSyntheticFallback } from './data-policy.mjs';
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
import { createTemplate } from './tiny-gateway/template-binding.mjs';

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

/** Experiment A — Small language model comparison (real corpus first) */
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
      `${resolved.honesty} Micro-Transformer is a pure-JS 2-layer stand-in — not HuggingFace/GPT. Tiny Gateway is template+Wave–Node–Fq, not a trained LLM.`,
  };
}

/** Subsample a real scenario by track count / step count (keeps provenance). */
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

/** Experiment B — Multisensor fusion (Movebank+Kp real historical first) */
export async function runExperimentB(seed = DIGITAL_SEED) {
  const resolved = await resolveFusionScenario({
    seed,
    startHour: REAL_FUSION_WINDOW.startHour,
    targetSteps: REAL_FUSION_WINDOW.targetSteps,
  });
  if (!resolved.ok) {
    return {
      id: 'B_radar',
      title: 'Multisensor track fusion · Leo Computational Lab',
      seed,
      skipped: true,
      sourceMode: resolved.sourceMode,
      missing: resolved.missing,
      honesty: resolved.honesty,
      priorScriptRecovery: IMPLEMENTATION_STATUS.priorRadarScriptRecovery,
      legacySyntheticParams: RADAR_PARAMS,
    };
  }

  const scenario = resolved.scenario;
  const conv = runConventionalFusion(scenario);
  const gw = runTinyGatewayFusion(scenario);

  // Scaling on real subsampled windows (not synthetic), unless source was synthetic fallback
  const scaleTracks = [];
  const trackBudgets = [Math.min(8, scenario.tracks.length), Math.min(16, scenario.tracks.length), scenario.tracks.length]
    .filter((v, i, a) => a.indexOf(v) === i && v > 0);
  for (const tracks of trackBudgets) {
    const sc = subsampleScenario(scenario, { maxTracks: tracks, maxSteps: Math.min(40, scenario.params.timeSteps) });
    const c = runConventionalFusion(sc);
    const g = runTinyGatewayFusion(sc);
    scaleTracks.push({
      tracks,
      nObs: sc.stats.nObservations,
      conventionalMs: c.runtimeMs,
      gatewayMs: g.runtimeMs,
      conventionalF1: c.metrics.f1,
      gatewayF1: g.metrics.f1,
      sourceMode: scenario.sourceMode,
    });
  }

  // Optional synthetic scaling contrast — only when explicitly allowed (never silent)
  const scaleSensor = [];
  if (allowSyntheticFallback()) {
    for (const sensors of [2, 4, 6]) {
      const sc = generateSyntheticAirspace(seed + sensors, {
        sensors,
        tracks: 60,
        timeSteps: 20,
        anomalyTracks: 6,
        observations: sensors * 60 * 20,
      });
      sc.sourceMode = 'synthetic_fallback_scaling_contrast';
      const c = runConventionalFusion(sc);
      const g = runTinyGatewayFusion(sc);
      scaleSensor.push({
        sensors,
        nObs: sc.stats.nObservations,
        conventionalMs: c.runtimeMs,
        gatewayMs: g.runtimeMs,
        conventionalF1: c.metrics.f1,
        gatewayF1: g.metrics.f1,
        sourceMode: sc.sourceMode,
      });
    }
  }

  const f1Delta = gw.metrics.f1 - conv.metrics.f1;
  const runtimeRatio = conv.runtimeMs > 0 ? gw.runtimeMs / conv.runtimeMs : null;

  return {
    id: 'B_radar',
    title: 'Multisensor track fusion · Leo Computational Lab (real historical preferred)',
    seed,
    sourceMode: resolved.sourceMode,
    priorScriptRecovery: IMPLEMENTATION_STATUS.priorRadarScriptRecovery,
    fixture: scenario.stats,
    params: scenario.params,
    provenance: scenario.provenance,
    legacySyntheticParamsNote:
      'RADAR_PARAMS 6×180×80 retained as historical assignment shape only; primary run uses Movebank+Kp when available.',
    conventional: { runtimeMs: conv.runtimeMs, metrics: conv.metrics, nEstTracks: conv.nEstTracks },
    tinyGateway: {
      runtimeMs: gw.runtimeMs,
      metrics: gw.metrics,
      nEstTracks: gw.nEstTracks,
      templateHits: gw.templateHits,
      gateway: gw.gateway,
    },
    f1Delta,
    runtimeRatioGatewayOverConventional: runtimeRatio,
    scaling: { byTracksReal: scaleTracks, bySensorsSyntheticContrast: scaleSensor },
    honesty:
      `${DATA_POLICY_HONESTY} Primary fusion = ${resolved.sourceMode}. Not ATC/ADS-B. Timings measured on this host.`,
  };
}

/** Experiment C — Template binding & reusable execution */
export function runExperimentC(seed = DIGITAL_SEED) {
  const gw = createTinyGateway({ domain: 'template_bench', task: 'reuse', honeycombRadius: 2 });
  const constructMs = [];
  const selectMs = [];
  const bindMs = [];
  const execMs = [];
  const reuseMs = [];
  const coldMs = [];
  const warmMs = [];

  // Cold start: build templates
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

  // Warm repeated execution of existing templates on new data
  for (let trial = 0; trial < 200; trial++) {
    const data = { x: trial, y: trial * 0.5, kind: 'bench' };
    const scored = gw.registry.list('bench').map((t, i) => ({ template: t, score: 1 / (1 + Math.abs(i - (trial % 40))) }));

    const tSel = timeCall(() => {
      /* selection happens inside run */
    });
    selectMs.push(tSel.ms);

    const tRun = timeCall(() =>
      gw.run({
        data,
        scored,
        pathway: { from: '0,0', to: '1,0' },
        targetScale: 2,
      }),
    );
    // Approximate stage split: selection+bind+exec bundled; also isolate bind/exec
    const tpl = scored[0].template;
    const tBind = timeCall(() => {
      const { bindTemplate } = requireBind();
      return bindTemplate(tpl, data);
    });
    bindMs.push(tBind.ms);
    const tExec = timeCall(() => tpl.execute(tBind.result.bound, data));
    execMs.push(tExec.ms);
    reuseMs.push(tRun.ms);
    warmMs.push(tRun.ms);
  }

  // Conventional contrast: rebuild closure each time vs reuse
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
    // rebuild each time
    const f = (d) => d.x + d.y;
    f({ x: trial, y: trial * 0.5 });
    conventionalRebuild.push(performance.now() - t0);

    const t1 = performance.now();
    fns[trial % 40]({ x: trial, y: trial * 0.5 });
    conventionalReuse.push(performance.now() - t1);
  }

  const warmMedian = summarizeLatencies(warmMs).medianMs;
  const constructMedian = summarizeLatencies(constructMs).medianMs;
  const reuseAdvantage =
    summarizeLatencies(conventionalRebuild).medianMs > 0
      ? summarizeLatencies(conventionalRebuild).medianMs / Math.max(1e-9, warmMedian)
      : null;

  return {
    id: 'C_template_binding',
    title: 'Template construction · selection · bind · execute · reuse',
    seed,
    stages: {
      construct: summarizeLatencies(constructMs),
      selectStub: summarizeLatencies(selectMs),
      bind: summarizeLatencies(bindMs),
      execute: summarizeLatencies(execMs),
      endToEndReuse: summarizeLatencies(reuseMs),
    },
    coldStartConstructTotalMs: tCold.ms,
    warmStart: summarizeLatencies(warmMs),
    conventional: {
      rebuildEachCall: summarizeLatencies(conventionalRebuild),
      reuseFn: summarizeLatencies(conventionalReuse),
    },
    notes: [
      'End-to-end reuse includes Wave–Node–Fq selection + honeycomb pathway — not select-only.',
      'Advantage vs conventional rebuild is measured; do not equate select latency with full compute.',
    ],
    reuseVsRebuildMedianRatio: reuseAdvantage,
  };
}

function requireBind() {
  return {
    bindTemplate: (template, data) => {
      const bound = {};
      for (const slot of template.slots) bound[slot] = data[slot];
      return { templateId: template.id, bound, raw: data };
    },
  };
}

/** Experiment D — Efficiency, scaling, ablation (real scenario preferred) */
export async function runExperimentD(seed = DIGITAL_SEED) {
  const resolved = await resolveFusionScenario({
    seed,
    startHour: REAL_FUSION_WINDOW.startHour,
    targetSteps: REAL_FUSION_WINDOW.targetSteps,
  });
  if (!resolved.ok) {
    return {
      id: 'D_efficiency',
      title: 'Computational efficiency · scaling · ablation',
      seed,
      skipped: true,
      sourceMode: resolved.sourceMode,
      missing: resolved.missing,
      honesty: resolved.honesty,
    };
  }

  const base = subsampleScenario(resolved.scenario, {
    maxTracks: Math.min(resolved.scenario.tracks.length, 20),
    maxSteps: Math.min(resolved.scenario.params.timeSteps, 40),
  });

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
  const trackBudgets = [8, 12, 16, Math.min(base.tracks.length, 24)].filter(
    (v, i, a) => v <= base.tracks.length && a.indexOf(v) === i,
  );
  for (const tracks of trackBudgets) {
    const sc = subsampleScenario(base, { maxTracks: tracks, maxSteps: base.params.timeSteps });
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
      sourceMode: resolved.sourceMode,
    });
  }

  const mem = cpuMemSnapshot();

  return {
    id: 'D_efficiency',
    title: 'Computational efficiency · scaling · ablation',
    seed,
    sourceMode: resolved.sourceMode,
    ablations,
    volumes,
    memory: mem,
    gpuUtilization: null,
    energyJoules: null,
    honesty: `${DATA_POLICY_HONESTY} Ablations/volumes on real historical subsample when available. GPU/energy null on this Node harness.`,
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
      title: 'Language three-way accuracy on shared fixtures (real corpus preferred)',
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
      id: 'E4_fusion_real_fixture',
      title: 'Fusion fixture executes on real historical data (or documented fallback)',
      pass:
        !B.skipped &&
        B.fixture?.nObservations > 0 &&
        B.fixture?.nObservations === B.fixture?.expectedObservations &&
        (B.sourceMode === 'historical_movebank_kp' || B.sourceMode === 'synthetic_fallback'),
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
      title: 'Template stages timed independently',
      pass: C.stages.execute.n >= 100 && C.stages.bind.n >= 100,
      C,
    },
    {
      id: 'E7_ablation_runs',
      title: 'Ablation suite completes on preferred data mode',
      pass: !D.skipped && D.ablations?.length >= 5,
      D,
    },
    {
      id: 'E8_engine_pin_gate',
      title: 'Data-gated engine pin recommendation',
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
  };
}

function evaluateEnginePin({ A, B, C, D }) {
  /**
   * Pin only if sufficiently positive measured findings on preferred real data:
   * - Language: gateway accuracy ≥ lightweight − 2pp AND role probes ok
   * - Fusion: gateway F1 within 0.05 of conventional on real (or allowed) fixture
   * - Template: warm reuse competitive with conventional rebuild
   * - Ablation: at least one component removal changes runtime
   * - Real-data priority: refuse pin if primary fusion/language ran synthetic_fallback only
   */
  if (A.skipped || B.skipped || D.skipped) {
    return {
      enginePinRecommended: false,
      candidateSlot: ENGINE_SHELF_SLOT,
      gates: { skipped: true },
      reasons: ['required_experiment_skipped_missing_real_data'],
      interpretation: 'Withhold engine pin — real-data experiment skipped',
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

  const realDataOk =
    (A.sourceMode || '').startsWith('historical_real') && B.sourceMode === 'historical_movebank_kp';

  const reasons = [];
  if (!langOk) reasons.push('language_accuracy_or_roles_gate_failed');
  if (!radarOk) reasons.push('fusion_f1_more_than_5pp_behind_conventional');
  if (!reuseOk) reasons.push('template_reuse_not_competitive_with_rebuild');
  if (!ablationAlive) reasons.push('ablations_did_not_move_runtime');
  if (!realDataOk) reasons.push('primary_runs_not_on_real_historical_sources');

  const enginePinRecommended = langOk && radarOk && reuseOk && ablationAlive && realDataOk;

  return {
    enginePinRecommended,
    candidateSlot: ENGINE_SHELF_SLOT,
    gates: { langOk, radarOk, reuseOk, ablationAlive, realDataOk },
    sourceModes: { language: A.sourceMode, fusion: B.sourceMode, efficiency: D.sourceMode },
    reasons,
    interpretation: enginePinRecommended
      ? `Measured gates passed on real Leo lab data — recommend ENGINE_SHELF #${ENGINE_SHELF_SLOT}`
      : `Gates failed (${reasons.join(', ') || 'unknown'}) — ship as application companion, not engine pin`,
  };
}
