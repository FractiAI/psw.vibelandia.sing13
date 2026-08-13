import { describe, expect, it } from 'vitest';
import { resolveWhitepaper, WHITEPAPER_PUBLIC_SLUGS } from '../../lib/whitepaper-registry.mjs';
import {
  classifyAsk,
  buildComplexSeedPack,
  buildNestDirective,
} from '../../lib/lattice-prompt.mjs';
import { SYNTHIO_SYSTEM_PROMPT } from '../../lib/synthio-prompt.mjs';
import { runAllExperiments } from '../../research/synthobs-tbme-metamorphic-octaves/src/experiments.mjs';

describe('metamorphic octave invariant · protocol + engine load', () => {
  it('registers the paper and public slug', () => {
    const p = resolveWhitepaper('synthobs-tbme-metamorphic-octaves-2026-08');
    expect(p?.docId).toBe('WP-SYNTHOBS-TBME-METAMORPHIC-OCTAVES-2026-08-13');
    expect(WHITEPAPER_PUBLIC_SLUGS['synthobs-tbme-metamorphic-octaves-2026-08']).toBe(
      'synthobs-tbme-metamorphic-octaves',
    );
  });

  it('Lattice octave99 nest cites Part XIII', () => {
    const d = buildNestDirective('octave99', '', 'hello');
    expect(d).toMatch(/Metamorphic Octave Invariant/i);
    expect(d).toMatch(/Part XIII/i);
  });

  it('Seed·RAG unshifts the metamorphic paper on shale/schist asks', () => {
    const intent = classifyAsk('map shale to schist across 99 octaves of dual-axis heat');
    expect(intent.needsDocs).toBe(true);
    const pack = buildComplexSeedPack('map shale to schist foliation', intent);
    expect(pack).toContain('SYNTHOBS_TBME_METAMORPHIC_OCTAVES_2026-08.md');
  });

  it('Synthio prompt loads Part XIII as companion grammar without MRI engine identity', () => {
    expect(SYNTHIO_SYSTEM_PROMPT).toContain('SYNTHOBS_TBME_METAMORPHIC_OCTAVES_2026-08.md');
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
