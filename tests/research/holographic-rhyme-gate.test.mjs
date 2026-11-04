import { describe, expect, it } from 'vitest';
import {
  experimentR_holographicRhymeGate,
  experimentH_enginePinGate,
} from '../../research/synthobs-tiny-gateway-rhyming-templates/src/experiments.mjs';
import {
  auditRhyme,
  brickWallCandidate,
  trueRhymeCandidate,
  FOUR_PILLARS,
} from '../../research/synthobs-tiny-gateway-rhyming-templates/src/holographic-rhyme-gate.mjs';
import {
  differingWordSessions,
} from '../../research/synthobs-tiny-gateway-rhyming-templates/src/rhyme-vs-cache.mjs';

describe('Holographic rhyme gate · Rhyming Templates', () => {
  it('requires all four pillars and rejects brick walls', () => {
    const brick = auditRhyme(brickWallCandidate(40));
    expect(brick.pass).toBe(false);
    expect(brick.failed).toEqual(expect.arrayContaining(['self_similar', 'recursive', 'self_correcting']));

    const ok = auditRhyme(trueRhymeCandidate(differingWordSessions(), 2, 0.15));
    expect(ok.pass).toBe(true);
    expect(FOUR_PILLARS.every((p) => ok.pillars[p].pass)).toBe(true);
  });

  it('passes experiment R and blocks pin without rhymeOk', () => {
    const R = experimentR_holographicRhymeGate();
    expect(R.pass).toBe(true);
    expect(R.vsCacheDiffering.rhymeBytes).toBeLessThan(R.vsCacheDiffering.cacheBytes);
    expect(R.vsCacheIdentical.cacheBytes).toBeLessThan(R.vsCacheIdentical.rhymeBytes);

    const blocked = experimentH_enginePinGate([{ baselineBytes: 1000, tinyBytes: 100 }], true, { pass: true }, false);
    expect(blocked.enginePinRecommended).toBe(false);
    expect(blocked.pass).toBe(false);
  });
});
