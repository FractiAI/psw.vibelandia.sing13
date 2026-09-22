import { describe, expect, it } from 'vitest';
import { planSpaBuilds, spasAffectedByPath } from '../../scripts/vercel-smart-build.mjs';

describe('vercel-smart-build path plan', () => {
  it('skips SPAs for docs / ship-blog / protocols only', () => {
    const plan = planSpaBuilds([
      'docs/SYNTHOBS_RSI_PHI_EGS_FIDELITY_ATTRACTOR_EGS_2026-09.md',
      'interfaces/blog-rsi-phi-egs-fidelity-2026-09.html',
      'lib/questfest-blog-posts.mjs',
      'vercel.json',
    ]);
    expect(plan.buildAll).toBe(false);
    expect(plan.spas.size).toBe(0);
  });

  it('builds only lattice-chat when that app changes', () => {
    const plan = planSpaBuilds(['apps/lattice-chat/src/App.jsx']);
    expect([...plan.spas]).toEqual(['lattice-chat']);
  });

  it('builds all when package-lock changes', () => {
    const plan = planSpaBuilds(['package-lock.json', 'docs/foo.md']);
    expect(plan.buildAll).toBe(true);
    expect(plan.spas.size).toBe(3);
  });

  it('maps prefixes', () => {
    expect(spasAffectedByPath('apps/ss-vibelandia-questfest/package.json')).toEqual([
      'questfest',
    ]);
    expect(spasAffectedByPath('apps/executive-ai-onboard/src/main.jsx')).toEqual([
      'executive',
    ]);
    expect(spasAffectedByPath('protocols/MCA_NSPFRNP_CATALOG.md')).toBeNull();
  });
});
