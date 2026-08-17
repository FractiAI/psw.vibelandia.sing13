import { describe, expect, it } from 'vitest';
import { resolveWhitepaper, WHITEPAPER_PUBLIC_SLUGS } from '../../lib/whitepaper-registry.mjs';
import { runAllExperiments } from '../../research/synthobs-tbme-egs-hgaios/src/experiments.mjs';

describe('H-GAI/OS dual-capacity suite', () => {
  it('is registered with public slug', () => {
    const entry = resolveWhitepaper('synthobs-tbme-egs-hgaios-2026-08');
    expect(entry?.docId).toBe('WP-SYNTHOBS-TBME-EGS-HGAIOS-2026-08-17');
    expect(WHITEPAPER_PUBLIC_SLUGS['synthobs-tbme-egs-hgaios-2026-08']).toBe('tbme-egs-hgaios');
  });

  it('passes catalog fixtures', () => {
    const r = runAllExperiments();
    expect(r.all_pass).toBe(true);
    expect(r.n_pass).toBe(r.n_total);
    expect(r.n_total).toBe(12);
  });
});
