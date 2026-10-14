import { describe, expect, it } from 'vitest';
import {
  FRUIT_LAYER_ANY_COMBINATION,
  describeFruitGiftProfile,
  getFruitLayerStats,
  loadFruitLayerTaxonomy,
  normalizeFruitGiftProfile,
} from '../../lib/fruit-layer-gifts.mjs';
import {
  FRUIT_LAYER_TREE_MARKERS,
  renderFruitLayerTreeLegendHtml,
} from '../../lib/infinite-octave-fruit-layer-tree.mjs';

describe('Fruit Layer gift taxonomy', () => {
  it('loads corpus with expected scale', () => {
    const stats = getFruitLayerStats();
    expect(stats.sectionCount).toBe(28);
    expect(stats.giftCount).toBeGreaterThan(1300);
    expect(stats.metaOperatorCount).toBeGreaterThanOrEqual(30);
    expect(stats.signatureGiftCount).toBe(22);
  });

  it('includes XXVII beauty · style subsections', () => {
    const t = loadFruitLayerTaxonomy();
    expect(t.subsections.XXVII.length).toBeGreaterThanOrEqual(6);
    const titles = t.subsections.XXVII.map((s) => s.title).join(' ');
    expect(titles).toMatch(/Beauty|Fashion|Swag|presence/i);
  });

  it('includes XXVIII abundance · prosperity subsections (A–J)', () => {
    const t = loadFruitLayerTaxonomy();
    expect(t.subsections.XXVIII).toHaveLength(10);
    const abundance = t.subsections.XXVIII.flatMap((s) => s.gifts);
    expect(abundance).toContain('Wealth creation');
    expect(abundance).toContain('Shared, regenerative, Goldilocks abundance: enough for people to thrive, with the capacity to create more without undermining the conditions that make thriving possible');
    expect(t.sectionNotes?.XXVIII?.giftIdRange).toBe('1231–1440');
  });

  it('normalizes any combination profiles', () => {
    const { profile, warnings, stats } = normalizeFruitGiftProfile({
      giftsBySection: {
        I: ['Strength', 'Not A Real Gift'],
        'XXVII-C': ['Swag', 'Coolness'],
      },
      metaOperators: ['integration', 'fake-op'],
      signatureGiftIds: [1021, 9999],
    });
    expect(stats.giftCount).toBe(3);
    expect(profile.metaOperators).toEqual(['integration']);
    expect(profile.signatureGiftIds).toEqual([1021]);
    expect(warnings.length).toBeGreaterThan(0);
    expect(describeFruitGiftProfile(profile)).toMatch(/Any combination/i);
  });

  it('renders fruit legend markers', () => {
    const html = renderFruitLayerTreeLegendHtml();
    expect(html).toContain(FRUIT_LAYER_TREE_MARKERS.start);
    expect(html).toContain(FRUIT_LAYER_ANY_COMBINATION.slice(0, 20));
    expect(html).toMatch(/1021–1042/);
  });
});
