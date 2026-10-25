import { describe, expect, it } from 'vitest';
import {
  DIGITAL_SEED,
  ENGINE_SHELF_SLOT,
  PRIMARY_HYPOTHESIS,
  REGISTRY_ID,
} from '../../research/synthobs-tiny-reality-generation-model/src/constants.mjs';
import { runAllExperiments } from '../../research/synthobs-tiny-reality-generation-model/src/experiments.mjs';

describe('synthobs-tiny-reality-generation-model', () => {
  it('locks registry, shelf slot, and primary hypothesis', () => {
    expect(REGISTRY_ID).toBe('synthobs-tiny-reality-generation-model-2026-10');
    expect(ENGINE_SHELF_SLOT).toBe(50);
    expect(DIGITAL_SEED).toBe(20261025);
    expect(PRIMARY_HYPOTHESIS).toMatch(/three-symbol/);
    expect(PRIMARY_HYPOTHESIS).toMatch(/polygon spin/);
    expect(PRIMARY_HYPOTHESIS).toMatch(/Infinite Octave/);
    expect(PRIMARY_HYPOTHESIS).toMatch(/folded compact DNA/);
  });

  it(
    'E+M+T+G battery · historical · DNA theater · triadic · genetic nodes',
    async () => {
      const r = await runAllExperiments();
      expect(r.all_pass).toBe(true);
      expect(r.n_total).toBe(24); // E1–E5 + M1–M5 + T1–T6 + G1–G5 + C1–C3
      expect(r.n_pass).toBe(24);
      expect(r.enginePinRecommended).toBe(true);
      expect(r.lab.held.summary.viabilityRate).toBe(1);
      expect(r.lab.nullBaseline.viabilityRate).toBe(0);
      expect(r.lab.phaseSteering.hardGate).toBe(false);
      expect(r.lab.phaseSteering.role).toBe('steering_delta');

      expect(r.historical_ran).toBe(true);
      expect(r.historical.sourceMode).toMatch(/live_csv|fixture/);
      expect(r.historical_n_total).toBe(3);

      expect(r.molecular_ran).toBe(true);
      expect(r.molecular_all_pass).toBe(true);
      expect(r.molecular.theater.role).toBe('physical_theater');
      expect(r.molecular.host.chrom).toBe('chr1');
      expect(r.molecular.held.viabilityRate).toBeGreaterThanOrEqual(0.75);
      expect(r.molecularExperiments.map((e) => e.id)).toEqual(['M1', 'M2', 'M3', 'M4', 'M5']);

      expect(r.triadic_ran).toBe(true);
      expect(r.triadic_all_pass).toBe(true);
      expect(r.triadicExperiments.map((e) => e.id)).toEqual(['T1', 'T2', 'T3', 'T4', 'T5', 'T6']);
      expect(r.triadic.conditions.full.meanCoherence).toBeGreaterThan(
        r.triadic.conditions.unstructured.meanCoherence,
      );
      expect(r.triadic.conditions.full.benefitRate).toBeGreaterThanOrEqual(0.75);

      expect(r.genetic_ran).toBe(true);
      expect(r.genetic_all_pass).toBe(true);
      expect(r.geneticExperiments.map((e) => e.id)).toEqual(['G1', 'G2', 'G3', 'G4', 'G5']);
      expect(r.genetic.summary.nGenes).toBeGreaterThanOrEqual(8);
      expect(r.genetic.summary.nExons).toBeGreaterThanOrEqual(20);
      expect(r.genetic.summary.chrM.length).toBe(16569);
      expect(r.genetic.summary.cpgEnrichment).toBeGreaterThan(1.5);
      expect(r.genetic.summary.host.viability).toBeGreaterThanOrEqual(0.75);

      expect(r.catalog_ran).toBe(true);
      expect(r.catalog_all_pass).toBe(true);
      expect(r.catalogExperiments.map((e) => e.id)).toEqual(['C1', 'C2', 'C3']);
      expect(r.catalog.genesByChannel.wave).toEqual(expect.arrayContaining(['DNMT1', 'DNMT3A']));
      expect(r.catalog.genesByChannel.node).toEqual(
        expect.arrayContaining(['APP', 'SOD1', 'DYRK1A', 'TMPRSS2']),
      );
      expect(r.catalog.genesByChannel.fq).toEqual(
        expect.arrayContaining(['INS', 'PDX1', 'POMC', 'NPY']),
      );
      expect(r.catalog.summary.byChannel.wave).toBeGreaterThan(0);
      expect(r.catalog.summary.byChannel.node).toBeGreaterThan(0);
      expect(r.catalog.summary.byChannel.fq).toBeGreaterThan(0);
    },
    180_000,
  );
});
