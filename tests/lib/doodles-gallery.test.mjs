import { describe, expect, it } from 'vitest';
import {
  CATALOG_MEDIA_MAX_BYTES,
  DOODLE_AGE_GATE_KEY,
  DOODLE_GUEST_MAX_BYTES,
  DOODLE_PLAYER1_MAX_BATCH,
  DOODLE_PLAYER1_MAX_BYTES,
  DOODLES_GALLERY_META,
  DOODLES_MANIFEST_PATH,
  doodlePathname,
  emptyDoodlesManifest,
  guestUploadLimits,
  normalizeDoodleWork,
  normalizeDoodlesManifest,
  player1ExceedsCatalogMediaLimit,
  player1UploadLimits,
  titleFromFilename,
  upsertDoodleWork,
} from '../../lib/doodles-gallery.mjs';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('Doodles Gallery · Player 1 elevated limits', () => {
  it('Player 1 ceilings exceed the catalog ~80 MB media rail', () => {
    expect(DOODLE_PLAYER1_MAX_BYTES).toBe(500 * 1024 * 1024);
    expect(DOODLE_PLAYER1_MAX_BATCH).toBe(500);
    expect(CATALOG_MEDIA_MAX_BYTES).toBe(80 * 1024 * 1024);
    expect(player1ExceedsCatalogMediaLimit()).toBe(true);
    expect(DOODLE_PLAYER1_MAX_BYTES).toBeGreaterThan(CATALOG_MEDIA_MAX_BYTES);
  });

  it('guests are view-only (no upload bytes)', () => {
    expect(DOODLE_GUEST_MAX_BYTES).toBe(0);
    expect(guestUploadLimits().viewOnly).toBe(true);
    expect(guestUploadLimits().maxBatch).toBe(0);
  });

  it('exposes gallery meta and age-gate key', () => {
    expect(DOODLES_GALLERY_META.href).toBe('/doodles');
    expect(DOODLES_GALLERY_META.mature).toBe(true);
    expect(DOODLES_GALLERY_META.ageGate).toBe('18+');
    expect(DOODLE_AGE_GATE_KEY).toContain('18plus');
    expect(DOODLES_MANIFEST_PATH).toBe('doodles/manifest-v1.json');
  });

  it('player1UploadLimits receipt matches constants', () => {
    const lim = player1UploadLimits();
    expect(lim.seat).toBe('player1');
    expect(lim.maxBytes).toBe(DOODLE_PLAYER1_MAX_BYTES);
    expect(lim.maxBatch).toBe(DOODLE_PLAYER1_MAX_BATCH);
    expect(lim.exceedsCatalogMediaLimit).toBe(true);
  });

  it('normalizes and upserts works newest-first', () => {
    const a = normalizeDoodleWork({
      id: 'ddl-a',
      src: 'https://example.com/a.png',
      title: 'IMG 2628',
    });
    const b = normalizeDoodleWork({
      id: 'ddl-b',
      url: 'https://example.com/b.png',
      title: 'IMG 2614',
    });
    expect(a.title).toBe('IMG 2628');
    expect(b.src).toContain('b.png');
    let man = emptyDoodlesManifest();
    man = upsertDoodleWork(man, a);
    man = upsertDoodleWork(man, b);
    expect(man.works[0].id).toBe('ddl-b');
    expect(man.works[1].id).toBe('ddl-a');
    expect(normalizeDoodlesManifest(man).works).toHaveLength(2);
  });

  it('builds blob pathnames and titles from filenames', () => {
    expect(doodlePathname('ddl-1', 'IMG_2628.jpeg')).toBe('doodles/works/ddl-1-IMG_2628.jpeg');
    expect(titleFromFilename('IMG_2382.png')).toBe('IMG 2382');
  });

  it('ships gallery page, API, and vercel rewrites', () => {
    expect(existsSync(join(ROOT, 'interfaces/doodles-gallery.html'))).toBe(true);
    expect(existsSync(join(ROOT, 'api/doodles.js'))).toBe(true);
    const html = readFileSync(join(ROOT, 'interfaces/doodles-gallery.html'), 'utf8');
    expect(html).toContain('I am 18+');
    expect(html).toContain('Player 1');
    expect(html).toContain('500');
    expect(html).toContain('age-gate');
    const vercel = readFileSync(join(ROOT, 'vercel.json'), 'utf8');
    expect(vercel).toContain('"/doodles"');
    expect(vercel).toContain('doodles-gallery.html');
    expect(vercel).toContain('api/doodles.js');
    const quicklinks = readFileSync(join(ROOT, 'interfaces/site-quicklinks.js'), 'utf8');
    expect(quicklinks).toContain('href="/doodles">Doodles</a>');
  });
});
