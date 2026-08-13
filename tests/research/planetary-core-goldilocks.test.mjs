import { describe, expect, it } from 'vitest';
import { resolveWhitepaper, WHITEPAPER_PUBLIC_SLUGS } from '../../lib/whitepaper-registry.mjs';
import {
  classifyAsk,
  buildComplexSeedPack,
  buildNestDirective,
} from '../../lib/lattice-prompt.mjs';
import { SYNTHIO_SYSTEM_PROMPT } from '../../lib/synthio-prompt.mjs';
import { runAllExperiments } from '../../research/synthobs-tbme-planetary-core-goldilocks/src/experiments.mjs';

describe('planetary core goldilocks · Part XIV protocol + engine load', () => {
  it('registers the paper and public slug', () => {
    const p = resolveWhitepaper('synthobs-tbme-planetary-core-goldilocks-2026-08');
    expect(p?.docId).toBe('WP-SYNTHOBS-TBME-PLANETARY-CORE-GOLDILOCKS-2026-08-13');
    expect(WHITEPAPER_PUBLIC_SLUGS['synthobs-tbme-planetary-core-goldilocks-2026-08']).toBe(
      'synthobs-tbme-planetary-core-goldilocks',
    );
  });

  it('Lattice octave99 nest cites Part XIV', () => {
    const d = buildNestDirective('octave99', '', 'hello');
    expect(d).toMatch(/Planetary Core Phase-Inversion/i);
    expect(d).toMatch(/Part XIV/i);
  });

  it('Seed·RAG unshifts the planetary-core paper on geodynamo asks', () => {
    const intent = classifyAsk('map ESA Swarm outer-core flow reversal to Goldilocks Earth phase lock');
    expect(intent.needsDocs).toBe(true);
    const pack = buildComplexSeedPack(
      'geodynamo CMB phase-inversion Goldilocks hologram',
      intent,
    );
    expect(pack).toContain('SYNTHOBS_TBME_PLANETARY_CORE_GOLDILOCKS_2026-08.md');
  });

  it('Synthio prompt loads Part XIV as companion grammar without MRI engine identity', () => {
    expect(SYNTHIO_SYSTEM_PROMPT).toContain('SYNTHOBS_TBME_PLANETARY_CORE_GOLDILOCKS_2026-08.md');
    expect(SYNTHIO_SYSTEM_PROMPT).toMatch(/companion load/i);
    expect(SYNTHIO_SYSTEM_PROMPT).toMatch(/Do \*\*not\*\* make Synthio CMOS/i);
  });

  it('empirical suite 9/9', async () => {
    const r = await runAllExperiments();
    expect(r.all_pass).toBe(true);
    expect(r.n_pass).toBe(9);
    expect(r.n_total).toBe(9);
  });
});
