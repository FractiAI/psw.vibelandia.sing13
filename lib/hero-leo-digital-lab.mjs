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

function suitePaths(config = loadConfig()) {
  const suite = config?.digitalLab?.suite || DEFAULT_SUITE;
  return {
    id: suite.id || DEFAULT_SUITE.id,
    reportAbs: path.join(ROOT, suite.reportRel || DEFAULT_SUITE.reportRel),
    npmScript: suite.npmScript || DEFAULT_SUITE.npmScript,
  };
}

/**
 * Compact score receipt projected from empirical_report.json (same shape as pipeline stdout).
 */
export function loadScoreReceipt(config = loadConfig()) {
  const { id, reportAbs } = suitePaths(config);
  if (!fs.existsSync(reportAbs)) {
    return {
      ok: false,
      available: false,
      suiteId: id,
      error: 'suite_report_missing',
      path: path.relative(ROOT, reportAbs),
    };
  }
  try {
    const report = JSON.parse(fs.readFileSync(reportAbs, 'utf8'));
    const r = report.results || {};
    const queue = r.queue || {};
    const ultimate = r.ultimate || {};
    const blind = r.blindDiscovery || {};
    return {
      ok: Boolean(r.all_pass),
      available: true,
      suiteId: id,
      schema: report.schema || null,
      generatedAt: report.generatedAt || null,
      DOC_ID: report.DOC_ID || r.DOC_ID || null,
      all_pass: Boolean(r.all_pass),
      n_pass: r.n_pass ?? null,
      n_total: r.n_total ?? null,
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
      path: path.relative(ROOT, reportAbs),
      honesty:
        'Digital Lab score receipt is a computational fixture summary — not wet-lab confirmation.',
    };
  } catch (err) {
    return {
      ok: false,
      available: false,
      suiteId: id,
      error: 'suite_report_unreadable',
      message: err?.message || String(err),
      path: path.relative(ROOT, reportAbs),
    };
  }
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
  const receipt = loadScoreReceipt(config);
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
export function runDigitalLabSuite({ timeoutMs = 120_000 } = {}) {
  const config = loadConfig();
  const { npmScript, id } = suitePaths(config);
  writeStatus({
    state: 'INVESTIGATING',
    label: 'Hero Leo — Digital Lab suite run',
    autonomousProcessRunning: true,
    currentAction: `Running npm run ${npmScript}…`,
    nextAction: 'Await suite receipt; wet lab remains out of scope.',
  });

  const started = new Date().toISOString();
  const proc = spawnSync('npm', ['run', npmScript], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: timeoutMs,
    env: { ...process.env, FORCE_COLOR: '0' },
  });

  const receipt = loadScoreReceipt(config);
  const ok = proc.status === 0 && receipt.available && receipt.all_pass;
  const now = new Date().toISOString();

  appendTimelineEvent({
    id: `EVT-DL-SUITE-${now.replace(/[:.]/g, '').slice(0, 15)}`,
    timestamp: now,
    type: 'digital_lab',
    summary: ok
      ? `Digital Lab suite ${id} green (${receipt.n_pass}/${receipt.n_total}); lead=${receipt.lead}.`
      : `Digital Lab suite ${id} finished with issues (exit=${proc.status}).`,
    href: '/journey/hero-leo#digital-lab',
    lab: LAB_DIGITAL,
  });

  writeStatus({
    state: 'WAITING',
    label: ok ? 'Hero Leo — Digital Lab suite green' : 'Hero Leo — Digital Lab suite needs attention',
    autonomousProcessRunning: false,
    currentAction: ok
      ? `Suite receipt refreshed · all_pass=true · lead=${receipt.lead}.`
      : `Suite run exit=${proc.status}. Check score receipt / logs.`,
    nextAction: 'Review Digital Lab score receipt; complete prospects as computational notes.',
    lastCompletedAction: `Digital Lab suite run ${id} (${started} → ${now})`,
  });

  // Persist a small receipt stamp under data/hero-leo for cockpit provenance
  try {
    const stamp = {
      schema: 'hero-leo-digital-lab-suite-stamp/v1',
      lab: LAB_DIGITAL,
      startedAt: started,
      finishedAt: now,
      exitCode: proc.status,
      ok,
      scoreReceipt: receipt,
    };
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(DATA_DIR, 'digital-lab-suite-stamp.json'),
      `${JSON.stringify(stamp, null, 2)}\n`,
      'utf8',
    );
  } catch {
    // read-only hosts: ignore stamp write
  }

  return {
    ok,
    action: 'suite-run',
    lab: LAB_DIGITAL,
    exitCode: proc.status,
    stderrTail: (proc.stderr || '').slice(-800),
    stdoutTail: (proc.stdout || '').slice(-800),
    scoreReceipt: receipt,
    digitalLab: buildDigitalLab(),
  };
}
