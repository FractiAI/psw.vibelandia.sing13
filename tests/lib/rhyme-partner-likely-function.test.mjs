import { describe, expect, it } from 'vitest';
import {
  annotateLikelyFunction,
  splitDiscoveryPartners,
  withLikelyFunction,
} from '../../lib/rhyme-partner-likely-function.mjs';

describe('rhyme-partner-likely-function', () => {
  it('splits partner ids', () => {
    expect(splitDiscoveryPartners('IC0069 ↔ IC0096')).toEqual({
      a: 'IC0069',
      b: 'IC0096',
    });
    expect(splitDiscoveryPartners('disc_year~st_rad')).toEqual({
      a: 'disc_year',
      b: 'st_rad',
    });
    expect(splitDiscoveryPartners('1VII contact 11-18')).toEqual({
      a: '1VII',
      b: 'contact 11-18',
    });
  });

  it('annotates exoplanet structural twins', () => {
    const a = annotateLikelyFunction({
      theater: 'cosmic · exoplanet',
      discoveryId: 'Kepler-186 b ↔ Kepler-249 b',
      kind: 'pilot_rhyme_aware_only_partner',
    });
    expect(a.likelyFunction).toMatch(/Exoplanet structural twin/i);
    expect(a.partnerAFunction).toMatch(/Kepler-186 b/);
  });

  it('annotates genome exon Soft Story pairs', () => {
    const a = annotateLikelyFunction({
      theater: 'genome · exon',
      discoveryId: 'NPY:ex0@chr7:24284189 ↔ SOD1:ex0@chr21:31659692',
      kind: 'pilot_rhyme_aware_only_partner',
    });
    expect(a.likelyFunction).toMatch(/neuropeptide/i);
    expect(a.partnerAFunction).toMatch(/NPY/);
    expect(a.partnerBFunction).toMatch(/SOD1/);
  });

  it('annotates WMAP novel-physics candidates', () => {
    const a = annotateLikelyFunction({
      theater: 'cosmic · WMAP residual (C4)',
      discoveryId: 'WMAP residual lag 11',
      kind: 'candidate_novel_physics',
      coupling: 0.49,
    });
    expect(a.likelyFunction).toMatch(/lag 11/);
    expect(a.likelyFunction).toMatch(/not a finished law/i);
  });

  it('annotates open motifs from feature pairs', () => {
    const a = annotateLikelyFunction({
      theater: 'cosmic · exoplanet',
      discoveryId: 'disc_year~st_rad',
      kind: 'open_motif_survivor',
    });
    expect(a.likelyFunction).toMatch(/survey-history/i);
  });

  it('withLikelyFunction preserves row fields', () => {
    const row = withLikelyFunction({
      theater: 'ngc',
      discoveryId: 'IC0069 ↔ IC0096',
      kind: 'aware_only_partner_recovery',
      coupling: 0.99,
    });
    expect(row.coupling).toBe(0.99);
    expect(row.likelyFunction).toMatch(/Deep-sky morphology twin/i);
  });
});
