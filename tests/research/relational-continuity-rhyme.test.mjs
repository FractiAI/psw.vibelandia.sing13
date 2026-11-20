import { describe, it, expect } from 'vitest';
import {
  DOCUMENT_ID,
  ENGINE_SHELF_PINNED,
  TITLE,
} from '../../research/synthobs-relational-continuity-rhyme-expedition/src/constants.mjs';
import { runFullExpedition } from '../../research/synthobs-relational-continuity-rhyme-expedition/src/experiments.mjs';

describe('Relational continuity rhyme expedition', () => {
  const report = runFullExpedition();

  it('stays a Rhyming Expedition Soft Story with pin deferred', () => {
    expect(DOCUMENT_ID).toContain('RELATIONAL-CONTINUITY-RHYME');
    expect(TITLE.toLowerCase()).toContain('relational rhyme');
    expect(ENGINE_SHELF_PINNED).toBe(false);
    expect(report.engineShelfPin).toBe('deferred');
    expect(report.rhymingExpeditionArm).toBe(true);
  });

  it('separates prior results, hypotheses, and findings', () => {
    expect(report.previouslyDemonstrated.length).toBeGreaterThanOrEqual(2);
    expect(report.newHypotheses.length).toBeGreaterThanOrEqual(3);
    expect(report.newFindings.length).toBeGreaterThanOrEqual(1);
  });

  it('recovers partners via rhyme better than lexical baselines', () => {
    expect(report.h1.rates.fractisi_rhyme.accuracy).toBeGreaterThanOrEqual(0.85);
    expect(report.h1.rates.embedding_sim.accuracy).toBeLessThan(0.3);
    expect(report.h1.signal).toBe(true);
  });

  it('closes QA gaps by structure rather than lexical overlap', () => {
    expect(report.h2.rates.fractisi_rhyme.accuracy).toBeGreaterThanOrEqual(0.85);
    expect(report.h2.rates.embedding_sim.accuracy).toBeLessThan(0.2);
    expect(report.h2.rhymeWinsWhenLexicalLoses).toBe(report.h2.n);
    expect(report.h2.signal).toBe(true);
  });

  it('holds seed↔edge rhyme after octave transforms without inherited text', () => {
    expect(report.h3.edge.fractisi_rhyme.accuracy).toBeGreaterThanOrEqual(0.85);
    expect(report.h3.transformedEdgeControl.rhyme).toBeGreaterThanOrEqual(0.85);
    expect(report.h3.transformedEdgeControl.embedding).toBeLessThan(0.2);
    expect(report.h3.signal).toBe(true);
  });

  it('collapses when rhyme is ablated', () => {
    expect(report.abl.rates.full.accuracy).toBeGreaterThan(
      report.abl.rates.minus_rhyme.accuracy + 0.25,
    );
    expect(report.abl.signal).toBe(true);
  });

  it('fires a positive expedition signal and reports RRS', () => {
    expect(report.positiveExpeditionSignal).toBe(true);
    expect(report.signals).toEqual(expect.arrayContaining(['H1', 'H2', 'H3', 'ABL']));
    expect(report.rrs.rrs).toBeGreaterThan(0);
  });
});
