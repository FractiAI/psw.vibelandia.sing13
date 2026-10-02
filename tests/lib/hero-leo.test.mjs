import { describe, expect, it } from 'vitest';
import {
  buildDashboard,
  evaluatePublicationGate,
  evidenceRank,
  loadConfig,
  loadLedger,
  loadStatus,
} from '../../lib/hero-leo.mjs';

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
});
