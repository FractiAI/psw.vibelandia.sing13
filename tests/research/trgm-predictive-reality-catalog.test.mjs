import { describe, expect, it } from 'vitest';
import {
  DIGITAL_SEED,
  ENGINE_SHELF_SLOT,
  EXPECTED_CATALOG_ENTRIES_50,
  PARENT_SHELF_SLOT,
  REALITY_CATALOG_VERSION,
  REGISTRY_ID,
  VALIDATION_SEED,
} from '../../research/synthobs-trgm-predictive-reality-catalog/src/constants.mjs';
import { runAllExperiments } from '../../research/synthobs-trgm-predictive-reality-catalog/src/experiments.mjs';

describe('synthobs-trgm-predictive-reality-catalog', () => {
  it('locks registry, shelf slot, and parent pin', () => {
    expect(REGISTRY_ID).toBe('synthobs-trgm-predictive-reality-catalog-2026-10');
    expect(ENGINE_SHELF_SLOT).toBe(51);
    expect(PARENT_SHELF_SLOT).toBe(50);
    expect(DIGITAL_SEED).toBe(20261025);
    expect(VALIDATION_SEED).toBe(202610251);
    expect(EXPECTED_CATALOG_ENTRIES_50).toBe(199);
    expect(REALITY_CATALOG_VERSION).toBe('trgm-51/v1');
  });

  it(
    'V1–V8 battery · reproduce #50 · held-out · reality catalog',
    async () => {
      const r = await runAllExperiments();
      expect(r.all_pass).toBe(true);
      expect(r.n_total).toBe(8);
      expect(r.n_pass).toBe(8);
      expect(r.enginePinRecommended).toBe(true);

      expect(r.repro.ok).toBe(true);
      expect(r.repro.metrics.n_pass).toBe(24);
      expect(r.repro.metrics.catalogEntries).toBe(199);
      expect(r.repro.metrics.heldViability).toBe(1);
      expect(r.repro.metrics.nullViability).toBe(0);

      expect(r.held.split.heldGenes.length).toBeGreaterThanOrEqual(4);
      expect(r.held.predictiveValue.channelAddsValue).toBe(true);
      expect(r.held.predictiveValue.catalogBA).toBeGreaterThan(r.held.predictiveValue.shuffledBA);
      expect(r.held.architecture.treeBeatsFlat).toBe(true);
      expect(r.held.architecture.dnaBeatsNullLayout).toBe(true);
      expect(r.held.catalogPreserved).toBe(true);

      expect(r.channel.assignmentAddsClockValue).toBe(true);
      expect(r.channel.catalogEntries).toBe(199);
      expect(r.channel.correct.clockSyncRate).toBe(1);

      expect(r.realityCatalog.version).toBe('trgm-51/v1');
      expect(r.realityCatalog.index.n).toBeGreaterThanOrEqual(8);

      expect(r.experiments.map((e) => e.id)).toEqual([
        'V1',
        'V2',
        'V3',
        'V4',
        'V5',
        'V6',
        'V7',
        'V8',
      ]);
    },
    180_000,
  );
});
