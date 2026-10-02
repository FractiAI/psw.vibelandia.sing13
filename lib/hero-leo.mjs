/**
 * Hero Leo — Scientific Scout for the Homeostasis Expedition.
 * Real ledger / status / publication-gate helpers. Never invent activity.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data', 'hero-leo');

export const HERO_LEO_SCHEMA = 'hero-leo-dashboard/v1';
export const EVIDENCE_ORDER = Object.freeze(['E0', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6']);

function readJson(file, fallback = null) {
  try {
    const p = path.join(DATA_DIR, file);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

export function loadConfig() {
  return readJson('config.json', null);
}

export function loadStatus() {
  return readJson('status.json', {
    schema: 'hero-leo-status/v1',
    state: 'OFFLINE',
    autonomousProcessRunning: false,
    currentAction: 'No status file.',
    updatedAt: null,
  });
}

export function loadLedger() {
  return readJson('ledger.json', {
    schema: 'hero-leo-ledger/v1',
    expedition_id: 'homeostasis-expedition',
    investigations: [],
  });
}

export function loadAchievements() {
  return readJson('achievements.json', { schema: 'hero-leo-achievements/v1', unlocked: [], catalog: [] });
}

export function loadTimeline() {
  return readJson('timeline.json', { schema: 'hero-leo-timeline/v1', events: [] });
}

export function loadPublications() {
  return readJson('publications.json', { schema: 'hero-leo-publications/v1', items: [] });
}

export function evidenceRank(level) {
  const i = EVIDENCE_ORDER.indexOf(level);
  return i < 0 ? -1 : i;
}

/**
 * Evaluate publication gate from config (not hard-coded presentation).
 * @param {object} investigation
 * @param {object} [config]
 */
export function evaluatePublicationGate(investigation, config = loadConfig()) {
  const gate = config?.publicationGate;
  if (!gate || !investigation) {
    return { pass: false, score: 0, requiredPass: 0, details: {}, reason: 'missing_gate_or_investigation' };
  }
  const criteriaScores = investigation.publicationCriteria || {};
  const details = {};
  let score = 0;
  let requiredFail = false;
  for (const [key, spec] of Object.entries(gate.criteria || {})) {
    const val = criteriaScores[key];
    const ok = val === true || val === 1;
    details[key] = { ok, required: !!spec.required, value: val ?? false };
    if (ok) score += Number(spec.weight || 1);
    else if (spec.required) requiredFail = true;
  }
  const minEvidence = gate.criteria?.evidence?.minEvidenceLevel || 'E1';
  const evidenceOk = evidenceRank(investigation.evidence_level) >= evidenceRank(minEvidence);
  if (!evidenceOk) {
    details.evidenceLevelFloor = { ok: false, required: true, minEvidence, actual: investigation.evidence_level };
    requiredFail = true;
  } else {
    details.evidenceLevelFloor = { ok: true, required: true, minEvidence, actual: investigation.evidence_level };
  }
  const pass = !requiredFail && score >= Number(gate.minCriteriaPass || 7);
  return {
    pass,
    score,
    minCriteriaPass: gate.minCriteriaPass,
    details,
    humanApprovalRequired: gate.humanApprovalRequiredForFinalPublish !== false,
    reason: pass ? 'threshold_met' : 'threshold_not_met',
  };
}

export function computeMetrics(ledger = loadLedger(), status = loadStatus(), publications = loadPublications()) {
  const inv = ledger.investigations || [];
  const falsified = inv.filter((i) => i.falsification_status === 'falsified' || i.novelty_status === 'FALSIFIED');
  const surviving = inv.filter((i) => i.falsification_status === 'surviving' || i.falsification_status === 'open');
  return {
    prospects_scanned: ledger.stats?.prospects_scanned ?? 0,
    investigations_started: inv.length,
    investigations_completed: inv.filter((i) => i.result && i.result !== 'in_progress').length,
    hypotheses_generated: inv.filter((i) => i.novel_hypothesis).length,
    hypotheses_falsified: falsified.length,
    hypotheses_surviving_testing: surviving.length,
    predictions_generated: inv.filter((i) => i.prediction).length,
    computational_tests_completed: inv.filter((i) => ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'].includes(i.evidence_level)).length,
    evidence_records_created: inv.length,
    discoveries_captured: inv.filter((i) =>
      ['NOVEL_COMPUTATIONAL_OBSERVATION', 'NOVEL_PREDICTION', 'SYNTHESIS', 'EXPERIMENTAL_RESULT'].includes(
        i.novelty_status,
      ),
    ).length,
    publications_produced: (publications.items || []).filter((p) => p.publication_status === 'PUBLISHED').length,
    repositories_created: (publications.items || []).filter((p) => p.artifact_type === 'repository').length,
    open_questions: inv.filter((i) => i.novelty_status === 'OPEN_QUESTION' || i.publication_status === 'UNPUBLISHED')
      .length,
    active_investigations: status.autonomousProcessRunning && status.currentInvestigationId ? 1 : 0,
    completed_investigations: inv.filter((i) => i.result && i.result !== 'in_progress').length,
    current_expedition: ledger.expedition_id || 'homeostasis-expedition',
    current_research_frontier: status.currentQuestion || null,
    last_activity: status.updatedAt || null,
    next_planned_action: status.nextAction || null,
    autonomous_process_running: Boolean(status.autonomousProcessRunning),
  };
}

export function buildDashboard() {
  const config = loadConfig();
  const status = loadStatus();
  const ledger = loadLedger();
  const achievements = loadAchievements();
  const timeline = loadTimeline();
  const publications = loadPublications();
  const metrics = computeMetrics(ledger, status, publications);
  const current =
    (status.currentInvestigationId &&
      (ledger.investigations || []).find((i) => i.investigation_id === status.currentInvestigationId)) ||
    null;
  const gates = (ledger.investigations || []).map((inv) => ({
    investigation_id: inv.investigation_id,
    gate: evaluatePublicationGate(inv, config),
  }));
  return {
    schema: HERO_LEO_SCHEMA,
    generatedAt: new Date().toISOString(),
    identity: config?.identity || {},
    status,
    metrics,
    ledger,
    achievements,
    timeline,
    publications,
    currentInvestigation: current,
    publicationGates: gates,
    honesty:
      config?.honesty ||
      'Never simulate activity. Zero is valid. Publish only when evidence + gate + human policy allow.',
  };
}
