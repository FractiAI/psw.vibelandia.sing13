/**
 * Hero Leo Phase 3 — full scout → top-N prospects → Player 1 selects → complete.
 * Computational / catalog prospecting only. Never fabricates wet-lab results.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadConfig,
  loadLedger,
  loadAchievements,
  evaluatePublicationGate,
  DATA_DIR,
  writeJson,
  writeStatus,
  appendTimelineEvent,
  loadProspectBoard,
  enrichProspectBoard,
} from './hero-leo.mjs';
import { LAB_DIGITAL } from './hero-leo-digital-lab.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
export const TOP_N = 11;

export { loadProspectBoard };

function readCatalog() {
  const p = path.join(DATA_DIR, 'prospect-catalog.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

/**
 * Least-friction research priority (sequencing only — not scientific rank).
 */
export function scoreProspect(p) {
  const num =
    (p.information_gain ?? 0.5) *
    (p.relevance ?? 0.5) *
    (p.novelty_potential ?? 0.5) *
    (p.falsifiability ?? 0.5) *
    (p.evidence_proximity ?? 0.5);
  const den = Math.max(0.05, (p.friction ?? 0.5) * (1 + (1 - (p.falsifiability ?? 0.5))));
  return Number((num / den).toFixed(4));
}

function alreadyInvestigatedIds(ledger) {
  const ids = new Set();
  for (const inv of ledger.investigations || []) {
    if (inv.prospect_id) ids.add(inv.prospect_id);
    for (const link of inv.artifact_links || []) {
      // soft dedupe by title keywords not needed
    }
  }
  return ids;
}

function toBoardRow(p, rank) {
  const already = !!p.already_completed;
  return {
    rank,
    prospect_id: p.id,
    title: p.title,
    domain: p.domain,
    question: p.question,
    motivation: p.motivation,
    known_explanations: p.known_explanations,
    null_hypothesis: p.null_hypothesis,
    predicted_test: p.predicted_test,
    priority_score: p.priority_score,
    friction: p.friction,
    information_gain: p.information_gain,
    novelty_potential: p.novelty_potential,
    falsifiability: p.falsifiability,
    evidence_proximity: p.evidence_proximity,
    relevance: p.relevance,
    links: p.links || [],
    already_completed: already,
    selection_status: already ? 'completed' : 'available',
  };
}

/**
 * Run a full scout: rank catalog, return top 11 *available* prospects, persist board + status.
 * Already-ledgered prospects are excluded from the selectable board when enough remain,
 * so Select all 11 can always tick every row on the board.
 */
export function runFullScout({ topN = TOP_N } = {}) {
  const catalog = readCatalog();
  const ledger = loadLedger();
  const done = alreadyInvestigatedIds(ledger);
  const scored = (catalog.prospects || [])
    .map((p) => ({
      ...p,
      priority_score: scoreProspect(p),
      already_completed: done.has(p.id),
    }))
    .sort((a, b) => b.priority_score - a.priority_score);

  const available = scored.filter((p) => !p.already_completed);
  const completed = scored.filter((p) => p.already_completed);
  // Prefer a full board of selectable rows; only pad with completed if catalog is thin.
  const chosen =
    available.length >= topN
      ? available.slice(0, topN)
      : [...available, ...completed].slice(0, topN);

  const top = chosen.map((p, i) => toBoardRow(p, i + 1));

  const board = {
    schema: 'hero-leo-prospect-board/v1',
    scoutId: `SCOUT-${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}`,
    generatedAt: new Date().toISOString(),
    expedition_id: catalog.expedition_id,
    nCatalog: (catalog.prospects || []).length,
    nAvailable: available.length,
    nAlreadyCompleted: completed.length,
    nReturned: top.length,
    nSelectable: top.filter((p) => !p.already_completed).length,
    honesty:
      'Top prospects are ranked from an authorized SING13 catalog using a sequencing score (information×relevance×novelty×falsifiability×proximity ÷ friction). Already-ledgered prospects are deferred so Select all can tick the full board. Not a claim of new wet-lab discovery. Player 1 selects what to complete.',
    prospects: top,
  };

  writeJson('prospects.json', board);

  const scanned = (ledger.stats?.prospects_scanned || 0) + (catalog.prospects || []).length;
  ledger.stats = { ...(ledger.stats || {}), prospects_scanned: scanned, last_scout_id: board.scoutId };
  writeJson('ledger.json', ledger);

  writeStatus({
    state: 'WAITING',
    label: 'Hero Leo — Scout complete · awaiting Player 1 selection',
    autonomousProcessRunning: false,
    currentMission: 'Homeostasis Expedition · Scientific Scout',
    currentInvestigationId: null,
    currentQuestion: loadConfig()?.initialQuestion || null,
    currentHypothesis: null,
    currentNull: null,
    currentEvidenceLevel: null,
    currentAction: `Scout ${board.scoutId} returned top ${top.length} prospects. Select one, several, or all to complete.`,
    nextAction: 'Player 1: select prospects in the cockpit and press Complete selected.',
    lastCompletedAction: `Full scout ranked ${board.nCatalog} catalog frontiers → top ${top.length}.`,
    latestScoutId: board.scoutId,
  });

  appendTimelineEvent({
    id: `EVT-SCOUT-${board.scoutId}`,
    timestamp: board.generatedAt,
    type: 'prospect',
    summary: `Hero Leo scouted catalog (${board.nCatalog}) and returned top ${top.length} prospects.`,
    href: '/journey/hero-leo#scout',
  });

  return board;
}

function nextInvestigationId(ledger) {
  const n = (ledger.investigations || []).length + 1;
  const day = new Date().toISOString().slice(0, 10);
  return `INV-HE-${day}-${String(n).padStart(3, '0')}`;
}

/**
 * Computational completion of selected prospects (E1 research notes).
 * Null-first: attempt to falsify / classify rediscovery vs open.
 */
export function completeSelectedProspects(prospectIds = []) {
  const ids = [...new Set((prospectIds || []).map(String))];
  if (!ids.length) {
    return { ok: false, error: 'no_prospects_selected' };
  }
  const board = loadProspectBoard();
  if (!board?.prospects?.length) {
    return { ok: false, error: 'no_prospect_board', hint: 'Run scout first.' };
  }
  const byId = new Map(board.prospects.map((p) => [p.prospect_id, p]));
  const ledger = loadLedger();
  const config = loadConfig();
  const completed = [];
  const now = new Date().toISOString();

  writeStatus({
    state: 'INVESTIGATING',
    label: 'Hero Leo — Completing selected prospects',
    autonomousProcessRunning: true,
    currentAction: `Completing ${ids.length} selected prospect(s)…`,
    nextAction: 'Writing ledger rows with null-first computational notes.',
  });

  for (const pid of ids) {
    const p = byId.get(pid);
    if (!p) continue;
    if ((ledger.investigations || []).some((i) => i.prospect_id === pid)) {
      completed.push({ prospect_id: pid, skipped: true, reason: 'already_in_ledger' });
      continue;
    }

    // Publication-gate calibration special case — real evaluation
    let result;
    let novelty_status = 'OPEN_QUESTION';
    let falsification_status = 'open';
    let evidence_level = 'E1';
    let analysis;

    if (pid === 'P-PUBLICATION-GATE-CAL') {
      const mismatches = [];
      for (const inv of ledger.investigations || []) {
        const g = evaluatePublicationGate(inv, config);
        const humanPub = inv.publication_status === 'PUBLISHED';
        if (g.pass && !humanPub && inv.human_review_status !== 'approved') {
          mismatches.push(inv.investigation_id);
        }
        if (!g.pass && humanPub && inv.publicationCriteria?.novelty === false) {
          // rediscovery published as honesty correction — allowed
        }
      }
      const nullFails = mismatches.length >= 2;
      falsification_status = nullFails ? 'falsified' : 'surviving';
      novelty_status = nullFails ? 'FALSIFIED' : 'SYNTHESIS';
      evidence_level = 'E2';
      analysis = `Gate vs human status mismatches: ${mismatches.length ? mismatches.join(', ') : 'none'}.`;
      result = nullFails
        ? 'Null supported: gate disagreed with human publish decisions on ≥2 rows — tighten criteria or criteria scoring.'
        : 'Null not supported at ≥2 mismatches; gate roughly aligned with human decisions on current ledger.';
    } else if (pid === 'P-AGENTIC-CONVERGENCE-PORT') {
      // Check suite report exists / all_pass if present
      const reportPath = path.join(
        ROOT,
        'research/synthobs-agentic-convergence-experiment/data/empirical_report.json',
      );
      let allPass = null;
      try {
        if (fs.existsSync(reportPath)) {
          allPass = JSON.parse(fs.readFileSync(reportPath, 'utf8'))?.results?.all_pass ?? null;
        }
      } catch {
        allPass = null;
      }
      evidence_level = allPass === true ? 'E2' : 'E1';
      novelty_status = 'REDISCOVERY';
      falsification_status = allPass === false ? 'falsified' : 'surviving';
      analysis = `empirical_report all_pass=${allPass}`;
      result =
        allPass === true
          ? 'Suite receipt present with all_pass=true — regenerable computational peer still green (rediscovery of fixture success, not new biology).'
          : allPass === false
            ? 'Suite receipt all_pass=false — portability/fixture claim downgraded until green.'
            : 'No empirical_report.json found in workspace — recorded as E1 observation that receipt is missing here.';
    } else {
      // Generic computational completion: research note + kill conditions documented
      analysis = `Null-first card written. Predicted test: ${p.predicted_test}. Competing explanation: ${p.known_explanations}.`;
      result = `Computational research note completed for “${p.title}”. Evidence remains below wet-lab (E1). Next escalate only if Player 1 authorizes higher-friction work.`;
      novelty_status = p.novelty_potential >= 0.7 ? 'NOVEL_PREDICTION' : 'OPEN_QUESTION';
      falsification_status = 'open';
      evidence_level = 'E1';
    }

    const invId = nextInvestigationId(ledger);
    const inv = {
      expedition_id: 'homeostasis-expedition',
      investigation_id: invId,
      prospect_id: pid,
      timestamp: now,
      lab: LAB_DIGITAL,
      research_domain: p.domain,
      question: p.question,
      motivation: p.motivation,
      observation: `Scout board ${board.scoutId} rank #${p.rank}; priority_score=${p.priority_score}`,
      known_explanations: p.known_explanations,
      novel_hypothesis: p.novelty_potential >= 0.5 ? p.question : null,
      prediction: p.predicted_test,
      null_hypothesis: p.null_hypothesis,
      test_method: 'Hero Leo Digital Lab computational completion (catalog + local receipts); not wet-lab.',
      controls: 'Null-first; rediscovery labeling; human gate for external publish.',
      evidence_sources: p.links || [],
      analysis,
      result,
      alternative_explanations: p.known_explanations,
      falsification_status,
      evidence_level,
      novelty_status,
      replication_status: 'computational_only',
      confidence: 'low–medium (computational note)',
      friction_estimate: String(p.friction),
      information_gain: String(p.information_gain),
      next_action: 'Player 1 review; escalate only with authorization.',
      publication_status: 'RESEARCH_NOTE',
      artifact_links: p.links || [],
      human_review_status: 'pending',
      publicationCriteria: {
        scientificSignificance: true,
        novelty: novelty_status === 'NOVEL_PREDICTION',
        evidence: true,
        reproducibility: true,
        falsifiability: true,
        alternativeExplanations: true,
        documentation: true,
        provenance: true,
        scientificUsefulness: true,
        publicationReadiness: false,
      },
    };
    ledger.investigations.push(inv);
    completed.push({ prospect_id: pid, investigation_id: invId, evidence_level, novelty_status });
    p.selection_status = 'completed';

    appendTimelineEvent({
      id: `EVT-${invId}`,
      timestamp: now,
      type: 'computational_test',
      summary: `Digital Lab completed prospect ${pid} → ${invId} (${novelty_status}, ${evidence_level}).`,
      investigation_id: invId,
      lab: LAB_DIGITAL,
      href: '/journey/hero-leo#digital-lab',
    });
  }

  writeJson('ledger.json', ledger);
  writeJson('prospects.json', board);

  // Achievement: pattern_found if any novel prediction completed this batch
  if (completed.some((c) => c.novelty_status === 'NOVEL_PREDICTION')) {
    const ach = loadAchievements();
    if (!(ach.unlocked || []).some((u) => u.id === 'pattern_found')) {
      ach.unlocked = ach.unlocked || [];
      ach.unlocked.push({
        id: 'pattern_found',
        unlockedAt: now,
        investigation_id: completed.find((c) => c.novelty_status === 'NOVEL_PREDICTION')?.investigation_id,
        evidence: 'Completed a high novelty_potential prospect as NOVEL_PREDICTION research note.',
      });
      writeJson('achievements.json', ach);
    }
  }

  writeStatus({
    state: 'WAITING',
    label: 'Hero Leo — Selection batch complete',
    autonomousProcessRunning: false,
    currentInvestigationId: completed.find((c) => c.investigation_id)?.investigation_id || null,
    currentAction: `Completed ${completed.filter((c) => c.investigation_id).length} prospect(s). No daemon running.`,
    nextAction: 'Review new ledger rows; scout again or escalate authorized higher-friction work.',
    lastCompletedAction: `Completed prospects: ${completed.map((c) => c.prospect_id).join(', ')}`,
    latestDiscoveryId: completed.find((c) => c.investigation_id)?.investigation_id || null,
  });

  const refreshed = enrichProspectBoard(loadProspectBoard() || board, ledger);
  return { ok: true, scoutId: board.scoutId, completed, board: refreshed, ledger };
}
