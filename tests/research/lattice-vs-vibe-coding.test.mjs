import { describe, it, expect } from 'vitest';
import {
  experimentPhaseTaxonomy,
  experimentDesignStructuralLoad,
  experimentDesignLiveCursor,
  experimentWriteLiveCursor,
  experimentDeployLiveCursor,
  experimentOverallFindings,
  runAllExperiments,
} from '../../research/synthobs-lattice-vs-vibe-coding/src/experiments.mjs';
import {
  resolveWhitepaper,
  WHITEPAPER_PUBLIC_SLUGS,
} from '../../lib/whitepaper-registry.mjs';

describe('synthobs-lattice-vs-vibe-coding', () => {
  it('E1 locks design · write · deploy phases', () => {
    const e1 = experimentPhaseTaxonomy();
    expect(e1.pass).toBe(true);
    expect(e1.PHASES).toHaveLength(3);
  });

  it('E2 design structural load shows Lattice advantage', () => {
    const e2 = experimentDesignStructuralLoad();
    expect(e2.pass).toBe(true);
    expect(e2.tokenReductionPct).toBeGreaterThanOrEqual(95);
  });

  it('E3 design live Cursor wins multi-band plan', () => {
    const e3 = experimentDesignLiveCursor();
    expect(e3.pass).toBe(true);
    expect(e3.winner).toBe('lattice');
    expect(e3.tokenReductionPct).toBeGreaterThanOrEqual(35);
  });

  it('E4 write phase wins code locate + pointer-RAG', () => {
    const e4 = experimentWriteLiveCursor();
    expect(e4.pass).toBe(true);
    expect(e4.latticeWins).toBe(e4.n);
    expect(e4.meanTokenReductionPct).toBeGreaterThanOrEqual(45);
  });

  it('E5 deploy phase wins ops/config grounding', () => {
    const e5 = experimentDeployLiveCursor();
    expect(e5.pass).toBe(true);
    expect(e5.winner).toBe('lattice');
  });

  it(
    'E6 overall findings — Lattice wins design · write · deploy',
    async () => {
      const e6 = experimentOverallFindings();
      expect(e6.pass).toBe(true);
      expect(e6.findings.overall.latticeWins).toBe(4);
      expect(e6.findings.overall.meanTokenReductionPct).toBeGreaterThanOrEqual(40);

      const all = await runAllExperiments();
      expect(all.all_pass).toBe(true);
      expect(all.n_pass).toBe(7);
    },
    30_000,
  );

  it('registry + slug resolve', () => {
    const entry = resolveWhitepaper('synthobs-lattice-vs-vibe-coding-2026-09');
    expect(entry?.docId).toContain('LATTICE-VS-VIBE-CODING');
    expect(WHITEPAPER_PUBLIC_SLUGS['synthobs-lattice-vs-vibe-coding-2026-09']).toBe(
      'synthobs-lattice-vs-vibe-coding',
    );
  });
});
