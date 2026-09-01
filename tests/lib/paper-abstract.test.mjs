import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { abstractFromMarkdown } from '../../lib/paper-abstract.mjs';

describe('paper-abstract', () => {
  it('extracts ## Abstract from SynthOBS markdown', async () => {
    const abs = await abstractFromMarkdown(
      'docs/SYNTHOBS_Y_CHROMOSOME_HOLOGRAPHIC_MANIFESTATION_EGS_2026-08.md',
    );
    expect(abs).toBeTruthy();
    expect(abs.length).toBeGreaterThan(40);
    expect(abs).not.toMatch(/^##/);
  });

  it('returns null for missing files', async () => {
    expect(await abstractFromMarkdown('docs/DOES_NOT_EXIST.md')).toBeNull();
  });
});

describe('whitepaper catalog · abstracts', () => {
  it('buildWhitepaperCatalog attaches abstract field', async () => {
    const { buildWhitepaperCatalog } = await import('../../lib/whitepaper-catalog.mjs');
    const catalog = await buildWhitepaperCatalog();
    const pinned = catalog.items.find(
      (i) => i.id === 'synthobs-cmos-protonic-99-octave-omni-lattice-2026-08',
    );
    expect(pinned).toBeTruthy();
    expect(pinned.abstract).toBeTruthy();
    expect(typeof pinned.abstract).toBe('string');
  });
});
