/**
 * Hero Leo · Digital Lab — computational evidence lane (not wet-lab).
 * Surfaces Beyond CRISPR suite run + score receipt + digital-tagged ledger rows.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  buildDashboard,
  loadConfig,
  loadLedger,
  loadProspectBoard,
  loadStatus,
  writeStatus,
  appendTimelineEvent,
  DATA_DIR,
} from './hero-leo.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

export const LAB_DIGITAL = 'digital';
export const DIGITAL_LAB_SCHEMA = 'hero-leo-digital-lab/v1';

export const DEFAULT_SUITE = {
  id: 'synthobs-beyond-crispr-biological-discovery',
  reportRel:
    'research/synthobs-beyond-crispr-biological-discovery/data/empirical_report.json',
  npmScript: 'research:synthobs-beyond-crispr-biological-discovery',
};

export const CONVERGENCE_LAYER_SUITE = {
  id: 'synthobs-independent-research-convergence-fhg',
  reportRel:
    'research/synthobs-independent-research-convergence-fhg/data/empirical_report.json',
  npmScript: 'research:synthobs-independent-research-convergence-fhg',
};

/** @typedef {'default' | 'convergence'} DigitalLabSuiteKey */

function suitePaths(config = loadConfig(), suiteKey = 'default') {
  if (suiteKey === 'convergence') {
    const suite = config?.digitalLab?.convergenceLayerTest || CONVERGENCE_LAYER_SUITE;
    return {
      suiteKey,
      id: suite.id || CONVERGENCE_LAYER_SUITE.id,
      reportAbs: path.join(ROOT, suite.reportRel || CONVERGENCE_LAYER_SUITE.reportRel),
      npmScript: suite.npmScript || CONVERGENCE_LAYER_SUITE.npmScript,
    };
  }
  const suite = config?.digitalLab?.suite || DEFAULT_SUITE;
  return {
    suiteKey: 'default',
    id: suite.id || DEFAULT_SUITE.id,
    reportAbs: path.join(ROOT, suite.reportRel || DEFAULT_SUITE.reportRel),
    npmScript: suite.npmScript || DEFAULT_SUITE.npmScript,
  };
}

function projectScoreReceipt(report, paths) {
  const r = report.results || {};
  const relPath = path.relative(ROOT, paths.reportAbs);
  const base = {
    available: true,
    suiteId: paths.id,
    schema: report.schema || null,
    generatedAt: report.generatedAt || null,
    DOC_ID: report.DOC_ID || r.DOC_ID || null,
    all_pass: Boolean(r.all_pass),
    n_pass: r.n_pass ?? null,
    n_total: r.n_total ?? null,
    path: relPath,
    honesty:
      'Digital Lab score receipt is a computational fixture summary — not wet-lab confirmation.',
  };

  if (
    report.suite === CONVERGENCE_LAYER_SUITE.id ||
    r.convergenceLayer ||
    paths.suiteKey === 'convergence'
  ) {
    const cl = r.convergenceLayer || {};
    const panel = r.experiments?.find((e) => e.id === 'E2_integrated_fhg_panel')?.panel;
    return {
      ...base,
      ok: Boolean(r.all_pass),
      reportKind: 'convergence-layer',
      integrated_panel_run: Boolean(r.integrated_panel_run),
      meanIrcMargin: cl.meanIrcMargin ?? panel?.meanMargin ?? null,
      ircMarginGate: cl.gate ?? null,
      meanAdaptiveSIRC: cl.meanAdaptiveSIRC ?? panel?.meanAdaptive ?? null,
      meanWastefulSIRC: cl.meanWastefulSIRC ?? panel?.meanWasteful ?? null,
      nPanels: cl.nPanels ?? panel?.nPanels ?? null,
      panelSlots: (panel?.panels || []).map((p) => ({
        slotId: p.slotId,
        anchor: p.anchor,
        margin: p.margin,
        adaptive: p.bestArchitecture,
      })),
    };
  }

  const queue = r.queue || {};
  const ultimate = r.ultimate || {};
  const blind = r.blindDiscovery || {};
  return {
    ...base,
    ok: Boolean(r.all_pass),
    reportKind: 'beyond-crispr',
    top: (queue.top || []).map((t) => ({
      id: t.id,
      role: t.role,
      literatureStatus: t.literatureStatus,
      researchInterest: t.researchInterest,
      provisionalName: t.provisionalName,
    })),
    lead: ultimate.mostSurprisingArchitecture?.id || null,
    gapDiscoveryIds: queue.gapDiscoveryIds || blind.buckets?.genuinely_unexplained || [],
    positiveControlIds: queue.positiveControlIds || blind.buckets?.positive_control || [],
    declaredWinner: queue.declaredWinner ?? null,
  };
}

/**
 * Compact score receipt projected from empirical_report.json (same shape as pipeline stdout).
 */
export function loadScoreReceipt(config = loadConfig(), suiteKey = 'default') {
  const paths = suitePaths(config, suiteKey);
  if (!fs.existsSync(paths.reportAbs)) {
    return {
      ok: false,
      available: false,
      suiteId: paths.id,
      error: 'suite_report_missing',
      path: path.relative(ROOT, paths.reportAbs),
    };
  }
  try {
    const report = JSON.parse(fs.readFileSync(paths.reportAbs, 'utf8'));
    return projectScoreReceipt(report, paths);
  } catch (err) {
    return {
      ok: false,
      available: false,
      suiteId: paths.id,
      error: 'suite_report_unreadable',
      message: err?.message || String(err),
      path: path.relative(ROOT, paths.reportAbs),
    };
  }
}

export function loadConvergenceLayerReceipt(config = loadConfig()) {
  return loadScoreReceipt(config, 'convergence');
}

export function listDigitalInvestigations(ledger = loadLedger()) {
  return (ledger.investigations || []).filter((i) => i.lab === LAB_DIGITAL);
}

/** Full cockpit payload with Digital Lab attached (avoids circular import in buildDashboard). */
export function buildDashboardWithDigitalLab() {
  const dash = buildDashboard();
  return { ...dash, digitalLab: buildDigitalLab() };
}

/**
 * Dashboard slice for the Digital Lab panel.
 */
export function buildDigitalLab(config = loadConfig(), ledger = loadLedger(), status = loadStatus()) {
  const board = loadProspectBoard();
  const receipt = loadScoreReceipt(config, 'default');
  const convergenceReceipt = loadConvergenceLayerReceipt(config);
  const digital = listDigitalInvestigations(ledger);
  const availableProspects = (board?.prospects || []).filter(
    (p) => p.selection_status !== 'completed' && !p.already_completed,
  );
  return {
    schema: DIGITAL_LAB_SCHEMA,
    lab: LAB_DIGITAL,
    wetLabOutOfScope: config?.digitalLab?.wetLabOutOfScope !== false,
    label: 'Digital Lab — computational evidence lane',
    suiteRun: {
      suiteId: receipt.suiteId,
      available: receipt.available,
      all_pass: receipt.all_pass ?? null,
      n_pass: receipt.n_pass,
      n_total: receipt.n_total,
      generatedAt: receipt.generatedAt,
      path: receipt.path,
      npmScript: suitePaths(config).npmScript,
    },
    scoreReceipt: receipt,
    convergenceLayerTest: {
      label: 'Convergence Layer Test · IRC-FHG integrated panel (fixtures)',
      suiteRun: {
        suiteId: convergenceReceipt.suiteId,
        available: convergenceReceipt.available,
        all_pass: convergenceReceipt.all_pass ?? null,
        n_pass: convergenceReceipt.n_pass,
        n_total: convergenceReceipt.n_total,
        generatedAt: convergenceReceipt.generatedAt,
        path: convergenceReceipt.path,
        npmScript: suitePaths(config, 'convergence').npmScript,
        meanIrcMargin: convergenceReceipt.meanIrcMargin ?? null,
        ircMarginGate: convergenceReceipt.ircMarginGate ?? null,
      },
      scoreReceipt: convergenceReceipt,
    },
    completeProspects: {
      scoutId: board?.scoutId || null,
      nOnBoard: board?.prospects?.length || 0,
      nAvailable: availableProspects.length,
      nDigitalLedger: digital.length,
      hint: board?.prospects?.length
        ? 'Select prospects in Scout command (or Digital Lab) and Complete selected.'
        : 'Run Scout fully first, then complete selected prospects into lab:digital notes.',
    },
    digitalInvestigations: digital.map((i) => ({
      investigation_id: i.investigation_id,
      prospect_id: i.prospect_id || null,
      evidence_level: i.evidence_level,
      novelty_status: i.novelty_status,
      publication_status: i.publication_status,
      question: i.question,
      lab: i.lab,
    })),
    status: {
      state: status.state,
      autonomousProcessRunning: Boolean(status.autonomousProcessRunning),
      currentAction: status.currentAction,
    },
    honesty:
      config?.digitalLab?.honesty ||
      'Digital Lab = suite run · score receipt · computational prospect completion. Wet lab stays out of this panel.',
  };
}

/**
 * Re-run Beyond CRISPR suite (writable hosts only). Updates empirical_report + timeline.
 */
export function runDigitalLabSuite({ timeoutMs = 120_000, suiteKey = 'default' } = {}) {
  const config = loadConfig();
  const paths = suitePaths(config, suiteKey);
  const { npmScript, id } = paths;
  const isConvergence = suiteKey === 'convergence';
  writeStatus({
    state: 'INVESTIGATING',
    label: isConvergence
      ? 'Hero Leo — Convergence Layer Test'
      : 'Hero Leo — Digital Lab suite run',
    autonomousProcessRunning: true,
    currentAction: `Running npm run ${npmScript}…`,
    nextAction: isConvergence
      ? 'Await IRC-FHG panel receipt (fixtures — not external benchmarks).'
      : 'Await suite receipt; wet lab remains out of scope.',
  });

  const started = new Date().toISOString();
  const proc = spawnSync('npm', ['run', npmScript], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: timeoutMs,
    env: { ...process.env, FORCE_COLOR: '0' },
  });

  const receipt = loadScoreReceipt(config, suiteKey);
  const ok = proc.status === 0 && receipt.available && receipt.all_pass;
  const now = new Date().toISOString();

  const summaryExtra = isConvergence
    ? `mean IRC margin=${receipt.meanIrcMargin ?? '—'}`
    : `lead=${receipt.lead ?? '—'}`;

  appendTimelineEvent({
    id: `EVT-DL-SUITE-${now.replace(/[:.]/g, '').slice(0, 15)}`,
    timestamp: now,
    type: 'digital_lab',
    summary: ok
      ? `Digital Lab ${isConvergence ? 'Convergence Layer' : 'suite'} ${id} green (${receipt.n_pass}/${receipt.n_total}); ${summaryExtra}.`
      : `Digital Lab ${isConvergence ? 'Convergence Layer' : 'suite'} ${id} finished with issues (exit=${proc.status}).`,
    href: isConvergence ? '/journey/hero-leo#convergence-layer' : '/journey/hero-leo#digital-lab',
    lab: LAB_DIGITAL,
  });

  writeStatus({
    state: 'WAITING',
    label: ok
      ? isConvergence
        ? 'Hero Leo — Convergence Layer Test green'
        : 'Hero Leo — Digital Lab suite green'
      : isConvergence
        ? 'Hero Leo — Convergence Layer Test needs attention'
        : 'Hero Leo — Digital Lab suite needs attention',
    autonomousProcessRunning: false,
    currentAction: ok
      ? isConvergence
        ? `Convergence receipt refreshed · all_pass=true · mean IRC margin=${receipt.meanIrcMargin ?? '—'}.`
        : `Suite receipt refreshed · all_pass=true · lead=${receipt.lead}.`
      : `Suite run exit=${proc.status}. Check score receipt / logs.`,
    nextAction: isConvergence
      ? 'Review IRC-FHG panel receipt; external HyPER/TMAFC re-runs remain out of scope.'
      : 'Review Digital Lab score receipt; complete prospects as computational notes.',
    lastCompletedAction: `Digital Lab ${isConvergence ? 'convergence layer' : 'suite'} ${id} (${started} → ${now})`,
  });

  const stampName = isConvergence
    ? 'convergence-layer-suite-stamp.json'
    : 'digital-lab-suite-stamp.json';
  try {
    const stamp = {
      schema: 'hero-leo-digital-lab-suite-stamp/v1',
      lab: LAB_DIGITAL,
      suiteKey,
      startedAt: started,
      finishedAt: now,
      exitCode: proc.status,
      ok,
      scoreReceipt: receipt,
    };
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, stampName), `${JSON.stringify(stamp, null, 2)}\n`, 'utf8');
  } catch {
    // read-only hosts: ignore stamp write
  }

  return {
    ok,
    action: isConvergence ? 'convergence-layer-run' : 'suite-run',
    suiteKey,
    lab: LAB_DIGITAL,
    exitCode: proc.status,
    stderrTail: (proc.stderr || '').slice(-800),
    stdoutTail: (proc.stdout || '').slice(-800),
    scoreReceipt: receipt,
    digitalLab: buildDigitalLab(),
  };
}

export function runConvergenceLayerSuite(opts = {}) {
  return runDigitalLabSuite({ ...opts, suiteKey: 'convergence' });
}
