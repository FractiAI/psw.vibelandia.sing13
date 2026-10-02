import { describe, expect, it } from 'vitest';
import {
  buildDashboard,
  evaluatePublicationGate,
  evidenceRank,
  loadConfig,
  loadLedger,
  loadStatus,
} from '../../lib/hero-leo.mjs';
import { runFullScout, completeSelectedProspects, TOP_N } from '../../lib/hero-leo-scout.mjs';
import {
  buildDashboardWithDigitalLab,
  buildDigitalLab,
  LAB_DIGITAL,
  loadScoreReceipt,
} from '../../lib/hero-leo-digital-lab.mjs';

describe('hero-leo homeostasis scout', () => {
  it('loads config with publication gate (not hard-coded only in UI)', () => {
    const cfg = loadConfig();
    expect(cfg.identity.name).toBe('Hero Leo');
    expect(cfg.publicationGate.minCriteriaPass).toBeGreaterThanOrEqual(7);
    expect(cfg.publicationGate.humanApprovalRequiredForFinalPublish).toBe(true);
  });

  it('never claims a running daemon when status says waiting', () => {
    const status = loadStatus();
    expect(status.autonomousProcessRunning).toBe(false);
    expect(['WAITING', 'OFFLINE', 'INITIALIZING']).toContain(status.state);
  });

  it('seeds real ledger investigations with evidence levels', () => {
    const ledger = loadLedger();
    expect(ledger.investigations.length).toBeGreaterThanOrEqual(3);
    const c4 = ledger.investigations.find((i) => i.investigation_id === 'INV-HE-2026-10-02-002');
    expect(c4.novelty_status).toBe('REDISCOVERY');
    expect(c4.falsification_status).toBe('falsified');
    const c11 = ledger.investigations.find((i) => i.investigation_id === 'INV-HE-2026-10-02-003');
    expect(c11.evidence_level).toBe('E3');
    expect(c11.novelty_status).toBe('NOVEL_PREDICTION');
  });

  it('evaluates publication gate from config criteria', () => {
    const ledger = loadLedger();
    const published = ledger.investigations.find((i) => i.investigation_id === 'INV-HE-2026-10-02-001');
    const gate = evaluatePublicationGate(published);
    expect(gate.pass).toBe(true);
    expect(evidenceRank('E2')).toBeGreaterThan(evidenceRank('E0'));
    const note = ledger.investigations.find((i) => i.investigation_id === 'INV-HE-2026-10-02-003');
    const hold = evaluatePublicationGate(note);
    expect(hold.pass).toBe(false);
  });

  it('builds dashboard with honest zero-capable metrics', () => {
    const dash = buildDashboard();
    expect(dash.schema).toBe('hero-leo-dashboard/v1');
    expect(dash.metrics.active_investigations).toBe(0);
    expect(dash.metrics.autonomous_process_running).toBe(false);
    expect(dash.achievements.unlocked.length).toBeGreaterThan(0);
    expect(dash.timeline.events.length).toBeGreaterThan(0);
  });

  it('full scout returns top 11 prospects for Player 1 selection', () => {
    const board = runFullScout({ topN: TOP_N });
    expect(board.nReturned).toBe(TOP_N);
    expect(board.prospects).toHaveLength(TOP_N);
    expect(board.prospects[0].rank).toBe(1);
    expect(board.prospects[0].prospect_id).toBeTruthy();
    expect(board.prospects[0].null_hypothesis).toBeTruthy();
    const dash = buildDashboard();
    expect(dash.prospectBoard?.scoutId).toBe(board.scoutId);
    expect(dash.status.autonomousProcessRunning).toBe(false);
  });

  it('completes selected prospects into ledger research notes', () => {
    const board = runFullScout({ topN: TOP_N });
    const pick =
      board.prospects.find((p) => !p.already_completed && p.selection_status !== 'completed') ||
      board.prospects[0];
    expect(pick?.prospect_id).toBeTruthy();
    const before = loadLedger().investigations.length;
    const result = completeSelectedProspects([pick.prospect_id]);
    expect(result.ok).toBe(true);
    expect(result.completed.some((c) => c.prospect_id === pick.prospect_id)).toBe(true);
    expect(loadLedger().investigations.length).toBeGreaterThanOrEqual(before);
    expect(loadStatus().autonomousProcessRunning).toBe(false);
    const row = loadLedger().investigations.find((i) => i.prospect_id === pick.prospect_id);
    expect(row?.lab).toBe(LAB_DIGITAL);
  });

  it('Digital Lab loads Beyond CRISPR score receipt and tags lab:digital', () => {
    const cfg = loadConfig();
    expect(cfg.digitalLab.labTag).toBe('digital');
    expect(cfg.digitalLab.wetLabOutOfScope).toBe(true);
    const receipt = loadScoreReceipt();
    expect(receipt.available).toBe(true);
    expect(typeof receipt.all_pass).toBe('boolean');
    expect(receipt.lead).toBeTruthy();
    expect(Array.isArray(receipt.gapDiscoveryIds)).toBe(true);
    const dl = buildDigitalLab();
    expect(dl.schema).toBe('hero-leo-digital-lab/v1');
    expect(dl.lab).toBe(LAB_DIGITAL);
    expect(dl.wetLabOutOfScope).toBe(true);
    expect(dl.digitalInvestigations.length).toBeGreaterThan(0);
    expect(dl.digitalInvestigations.every((i) => i.lab === LAB_DIGITAL)).toBe(true);
    const dash = buildDashboardWithDigitalLab();
    expect(dash.digitalLab.suiteRun.suiteId).toContain('beyond-crispr');
    expect(buildDashboard().schema).toBe('hero-leo-dashboard/v1');
  });
});
