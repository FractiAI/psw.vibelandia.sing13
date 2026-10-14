import { describe, it, expect, beforeEach } from 'vitest';
import {
  classifyUserAgent,
  hashSubnet,
  mintWatermark,
  buildCanaryPayload,
  normalizeDrainRows,
  isLatticeSensitivePath,
  recordEvent,
  buildStatusPack,
  KNOWN_AI_UA_FRAGMENTS,
  enrichVisitFields,
  detectDualRouteSweeps,
  buildQaSnapshot,
  normalizeEvent,
} from '../../lib/lattice-scraper-telemetry.mjs';

describe('classifyUserAgent', () => {
  it('flags GPTBot as known_ai_bot', () => {
    const c = classifyUserAgent('Mozilla/5.0 AppleWebKit/537.36 (compatible; GPTBot/1.0)');
    expect(c.class).toBe('known_ai_bot');
    expect(c.knownBot).toBe(true);
  });

  it('flags ClaudeBot', () => {
    expect(classifyUserAgent('ClaudeBot/1.0')).toMatchObject({ class: 'known_ai_bot' });
  });

  it('flags script clients', () => {
    expect(classifyUserAgent('python-requests/2.31.0').class).toBe('script_client');
  });

  it('handles empty UA', () => {
    expect(classifyUserAgent('').class).toBe('empty_ua');
  });

  it('includes a non-empty known AI fragment list', () => {
    expect(KNOWN_AI_UA_FRAGMENTS.length).toBeGreaterThan(5);
  });
});

describe('hashSubnet + watermark', () => {
  it('hashes IPv4 to /24 subnet digest', () => {
    const a = hashSubnet('203.0.113.44');
    const b = hashSubnet('203.0.113.99');
    const c = hashSubnet('198.51.100.1');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toHaveLength(16);
  });

  it('mints stable watermark for same subnet/day/route', () => {
    const w1 = mintWatermark({ subnetHash: 'abc', route: '/api/lattice-canary', day: '2026-08-22' });
    const w2 = mintWatermark({ subnetHash: 'abc', route: '/api/lattice-canary', day: '2026-08-22' });
    expect(w1.nonce).toBe(w2.nonce);
    expect(w1.phi_slip_note).toContain(w1.nonce);
  });

  it('changes nonce when subnet changes', () => {
    const w1 = mintWatermark({ subnetHash: 'aaa', route: '/x', day: '2026-08-22' });
    const w2 = mintWatermark({ subnetHash: 'bbb', route: '/x', day: '2026-08-22' });
    expect(w1.nonce).not.toBe(w2.nonce);
  });
});

describe('canary payload', () => {
  it('embeds watermark and honesty rails', () => {
    const p = buildCanaryPayload({
      reqMeta: { subnetHash: 'deadbeef' },
      watermark: mintWatermark({ subnetHash: 'deadbeef', day: '2026-08-22' }),
    });
    expect(p.schema).toBe('lattice-compression-canary/v1');
    expect(p.watermark.nonce).toBeTruthy();
    expect(p.honesty_boundary.egS).toMatch(/catalog/i);
    expect(p.phi_egs).toBeCloseTo(1.618, 3);
  });
});

describe('drain normalization', () => {
  it('maps vercel-style log rows', () => {
    const rows = normalizeDrainRows({
      logs: [
        {
          path: '/api/lattice-canary',
          userAgent: 'GPTBot/1.0',
          ip: '203.0.113.10',
          method: 'GET',
          status: 200,
        },
      ],
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].route).toBe('/api/lattice-canary');
    expect(rows[0].flags).toContain('lattice_sensitive');
  });

  it('detects lattice-sensitive paths', () => {
    expect(isLatticeSensitivePath('/lattice/proof')).toBe(true);
    expect(isLatticeSensitivePath('/questfest')).toBe(false);
  });
});

describe('recordEvent + status pack', () => {
  beforeEach(async () => {
    // Isolate memory ledger between tests when possible
    if (globalThis.__latticeScraperTelemetry) {
      globalThis.__latticeScraperTelemetry.events = [];
      globalThis.__latticeScraperTelemetry.hitsByRoute = {};
      globalThis.__latticeScraperTelemetry.hitsByClass = {};
    }
  });

  it('enriches visit nature on canary routes', () => {
    const v = enrichVisitFields({
      route: '/api/lattice-canary',
      method: 'GET',
      source: 'canary',
      userAgent: 'GPTBot/1.0',
    });
    expect(v.visitSurface).toBe('canary_api');
    expect(v.contentProfile).toBe('compression_canary_json');
    expect(v.botFamily).toBe('openai');
    expect(v.visitKind).toBe('automated_crawler');
  });

  it('detects dual decoy sweeps within 2 minutes', () => {
    const sweeps = detectDualRouteSweeps([
      normalizeEvent({
        id: 'a',
        at: '2026-09-24T07:11:18.731Z',
        subnetHash: 'abc',
        uaLabel: 'ClaudeBot',
        route: '/api/lattice-canary',
        uaClass: 'known_ai_bot',
        botFamily: 'anthropic',
      }),
      normalizeEvent({
        id: 'b',
        at: '2026-09-24T07:11:53.779Z',
        subnetHash: 'abc',
        uaLabel: 'ClaudeBot',
        route: '/.well-known/lattice-agent.json',
        uaClass: 'known_ai_bot',
        botFamily: 'anthropic',
      }),
    ]);
    expect(sweeps).toHaveLength(1);
    expect(sweeps[0].nature).toBe('dual_decoy_sweep');
  });

  it('buildQaSnapshot answers coverage and KQ-on-canary flag', () => {
    const qa = buildQaSnapshot([], { drainConfigured: false });
    expect(qa.coverage).toBe('canary_decoys_only');
    expect(qa.kqSecretOnCanaryRoutes).toBe(false);
    expect(qa.ingestionInterpretation.fetchDoesNotProve).toMatch(/Training/i);
  });

  it('records a canary hit and surfaces it in status', async () => {
    const { event, backend } = await recordEvent({
      source: 'canary',
      route: '/api/lattice-canary',
      userAgent: 'ClaudeBot/1.0',
      ip: '203.0.113.50',
      watermarkNonce: 'testnonce',
      flags: ['canary_hit'],
    });
    expect(event.uaClass).toBe('known_ai_bot');
    expect(event.subnetHash).toHaveLength(16);
    expect(['memory', 'blob']).toContain(backend);

    const pack = await buildStatusPack();
    expect(pack.ok).toBe(true);
    expect(pack.summary.canaryLive).toBe(true);
    expect(pack.routes.statusPage).toBe('/lattice/scraper-telemetry');
    expect(pack.layers.some((l) => l.id === 'canary' && l.status === 'live')).toBe(true);
    expect(pack.recent[0].id).toBe(event.id);
    expect(pack.visitIntel).toBeTruthy();
    expect(pack.visitIntel.botRollups.length).toBeGreaterThan(0);
    expect(pack.summary.coverage).toBeTruthy();
  });
});
