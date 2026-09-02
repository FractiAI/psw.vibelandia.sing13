import { describe, it, expect } from 'vitest';
import {
  experimentPhaseTaxonomy,
  experimentDesignStructuralLoad,
  experimentDesignLiveCursor,
  experimentWriteLiveCursor,
  experimentDeployLiveCursor,
  experimentOverallFindings,
  experimentOutputComparison,
  experimentUnpromptedNesting,
  experimentImplementationPillars,
  runAllExperiments,
} from '../../research/synthobs-lattice-vs-vibe-coding/src/experiments.mjs';
import { compareRowOutput, OUTPUT_DIMENSIONS } from '../../research/synthobs-lattice-vs-vibe-coding/src/output-scoring.mjs';
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

  it('E8 output comparison — design · performance · size · quality', () => {
    expect(OUTPUT_DIMENSIONS).toHaveLength(4);
    const e8 = experimentOutputComparison();
    expect(e8.pass).toBe(true);
    expect(e8.byDimension.size.latticeWins).toBe(4);
    expect(e8.summary.latticeFasterCount).toBe(4);
    expect(e8.summary.latticeQualityMean).toBeGreaterThanOrEqual(0.95);

    const row = compareRowOutput({
      task: { id: 'T3_single_doc_fact', class: 'pointer_rag' },
      lattice: {
        replyPreview: '**Document ID:** `WP-SYNTHOBS-EGS-81-ELECTRONS-2026-07` honesty boundary',
        durationMs: 1000,
        toolCalls: 2,
        usage: { totalTokens: 100 },
        promptChars: 1000,
        assistantChars: 200,
      },
      standard: {
        replyPreview: '**Document ID:** `WP-SYNTHOBS-EGS-81-ELECTRONS-2026-07` honesty',
        durationMs: 2000,
        toolCalls: 2,
        usage: { totalTokens: 200 },
        promptChars: 5000,
        assistantChars: 200,
      },
      comparison: { latticeSavedPctVsStandard: 50 },
    });
    expect(row.quality.winner).toBe('tie');
    expect(row.size.winner).toBe('lattice');
    expect(row.performance.winner).toBe('lattice');
  });

  it(
    'E6 overall findings — Lattice wins design · write · deploy',
    async () => {
      const e6 = experimentOverallFindings();
      expect(e6.pass).toBe(true);
      expect(e6.findings.overall.latticeWins).toBe(4);
      expect(e6.findings.unpromptedNesting.unprompted.latticeSpontaneous).toBe(2);
      expect(e6.findings.implementationPillars.byPillar.efficiency.latticeWins).toBeGreaterThanOrEqual(5);

      const all = await runAllExperiments();
      expect(all.all_pass).toBe(true);
      expect(all.n_pass).toBe(10);
    },
    30_000,
  );

  it('E9 unprompted nesting — Lattice nests without keywords', () => {
    const e9 = experimentUnpromptedNesting();
    expect(e9.pass).toBe(true);
    expect(e9.unpromptedSummary.latticeSpontaneousCount).toBe(2);
    expect(e9.unpromptedSummary.vibeSpontaneousCount).toBe(0);
  });

  it('E10 implementation pillars — efficiency through implementation', () => {
    const e10 = experimentImplementationPillars();
    expect(e10.pass).toBe(true);
    expect(e10.byPillar.efficiency.latticeWins).toBeGreaterThanOrEqual(5);
    expect(e10.whatMakesBetter.scalability).toContain('Peer-firewall');
  });

  it('registry + slug resolve', () => {
    const entry = resolveWhitepaper('synthobs-lattice-vs-vibe-coding-2026-09');
    expect(entry?.docId).toContain('LATTICE-VS-VIBE-CODING');
    expect(WHITEPAPER_PUBLIC_SLUGS['synthobs-lattice-vs-vibe-coding-2026-09']).toBe(
      'synthobs-lattice-vs-vibe-coding',
    );
  });
});
