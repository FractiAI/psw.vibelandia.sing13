import { describe, it, expect } from 'vitest';
import {
  loadProbeTargets,
  scoreResponse,
  scoreRunBundle,
  BLIND_PROMPT_V1,
} from '../../lib/lattice-kq-probe-score.mjs';

describe('lattice-kq-probe-score', () => {
  it('exports canonical blind prompt', () => {
    expect(BLIND_PROMPT_V1).toMatch(/SING13/);
    expect(BLIND_PROMPT_V1).toMatch(/Do not invent/);
  });

  it('loads KQ and catalog targets from repo docs', () => {
    const t = loadProbeTargets();
    expect(t.some((x) => x.id === 'kq-queen-full' && x.tier === 3)).toBe(true);
    expect(t.some((x) => x.id === 'doc-kq-connect-id')).toBe(true);
  });

  it('scores none for generic lattice prose', () => {
    const r = scoreResponse(
      'Fractal systems and lattice architectures appear in many AI papers. I do not know FractiAI-specific phrases.',
    );
    expect(r.tierLabel).toBe('none');
    expect(r.maxTier).toBe(0);
  });

  it('scores kq_full on exact Queen line', () => {
    const queen = loadProbeTargets().find((x) => x.id === 'kq-queen-full');
    expect(queen).toBeTruthy();
    const r = scoreResponse(`Unrelated intro.\n${queen.text}\nEnd.`);
    expect(r.tierLabel).toBe('kq_full');
    expect(r.maxTier).toBe(3);
  });

  it('scores watermark tier for phi_slip_note', () => {
    const nonce = 'abcdef0123456789abcdef01';
    const slip = `Φ_EGS·canary·${nonce}`;
    const r = scoreResponse(`prefix ${slip} suffix`, loadProbeTargets(), { watermarkNonces: [nonce] });
    expect(r.tierLabel).toBe('watermark_nonce');
  });

  it('marks contaminated runs in bundle', () => {
    const scored = scoreRunBundle({
      contaminated: true,
      responses: [{ id: 'x', provider: 'test', rawText: 'no hits' }],
    });
    expect(scored.contaminated).toBe(true);
    expect(scored.responses[0].contaminated).toBe(true);
  });
});
