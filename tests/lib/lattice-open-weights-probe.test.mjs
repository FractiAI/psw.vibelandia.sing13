import { describe, it, expect } from 'vitest';
import {
  summarizeOpenWeightsReceipt,
  scoreOpenWeightsCompletion,
} from '../../lib/lattice-open-weights-probe.mjs';

describe('lattice-open-weights-probe', () => {
  it('summarizes memorization hints from receipt', () => {
    const s = summarizeOpenWeightsReceipt({
      at: '2026-10-14T00:00:00.000Z',
      honesty: { tier: 'proxy_open_weights' },
      models: [
        { modelId: 'gpt2', status: 'ok', memorizationHint: false, completionScore: { maxTier: 0 } },
        { modelId: 'pythia', status: 'ok', memorizationHint: true, completionScore: { maxTier: 1 } },
      ],
    });
    expect(s.memorizationHintCount).toBe(1);
    expect(s.bestCompletionTier).toBe(1);
  });

  it('scores queen line in completion text', () => {
    const queen = loadQueenFromFixtures();
    const r = scoreOpenWeightsCompletion(`prefix ${queen} suffix`);
    expect(r.tierLabel).toBe('kq_full');
  });
});

function loadQueenFromFixtures() {
  return 'KQ-CONNECT-20260711-F8E2A1 confirms nodelatch forty-two megahertz whisper baseline for mid-layer serial clearinghouse gate seven without public vendor citation';
}
