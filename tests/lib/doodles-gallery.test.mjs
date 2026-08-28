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
  doodlesUploadConfigured,
  mergeDoodleWorks,
  persistDoodleWorks,
  persistManifestChange,
  reorderDoodleWorks,
  removeDoodleWork,
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
    expect(html).toContain("Valet Pru's Doodles");
    expect(html).not.toMatch(/phone doodles/i);
    expect(html).toContain('I am 18+');
    expect(html).toContain('Player 1');
    expect(html).toContain('500');
    expect(html).toContain('age-gate');
    expect(html).not.toContain('capitan-secret');
    expect(html).not.toContain('Capitan / catalog upload secret');
    expect(html).toContain('id="upload-pane"');
    const vercel = readFileSync(join(ROOT, 'vercel.json'), 'utf8');
    expect(vercel).toContain('"/doodles"');
    expect(vercel).toContain('doodles-gallery.html');
    expect(vercel).toContain('api/doodles.js');
    const quicklinks = readFileSync(join(ROOT, 'interfaces/site-quicklinks.js'), 'utf8');
    expect(quicklinks).toContain('href="/doodles">Doodles</a>');
  });

  it('doodlesUploadConfigured checks Blob token only', () => {
    const prev = process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    expect(doodlesUploadConfigured()).toBe(false);
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
    expect(doodlesUploadConfigured()).toBe(true);
    if (prev === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
    else process.env.BLOB_READ_WRITE_TOKEN = prev;
  });

  it('mergeDoodleWorks adds every work without dropping prior entries', () => {
    const a = normalizeDoodleWork({ id: 'ddl-a', src: 'https://example.com/a.png', title: 'A' });
    const b = normalizeDoodleWork({ id: 'ddl-b', src: 'https://example.com/b.png', title: 'B' });
    const c = normalizeDoodleWork({ id: 'ddl-c', src: 'https://example.com/c.png', title: 'C' });
    const merged = mergeDoodleWorks(emptyDoodlesManifest(), [a, b, c]);
    expect(merged.works.map((w) => w.id)).toEqual(['ddl-c', 'ddl-b', 'ddl-a']);
  });

  it('persistDoodleWorks retries when a concurrent write would have dropped entries', async () => {
    let manifest = emptyDoodlesManifest();
    const a = normalizeDoodleWork({ id: 'ddl-a', src: 'https://example.com/a.png', title: 'A' });
    const b = normalizeDoodleWork({ id: 'ddl-b', src: 'https://example.com/b.png', title: 'B' });

    const loadManifest = async () => normalizeDoodlesManifest(manifest);
    const putManifest = async (next) => {
      manifest = normalizeDoodlesManifest(next);
    };

    const first = persistDoodleWorks({ loadManifest, putManifest, works: [a] });
    const second = persistDoodleWorks({ loadManifest, putManifest, works: [b] });
    const [savedA, savedB] = await Promise.all([first, second]);

    expect(savedA.works[0].id).toBe('ddl-a');
    expect(savedB.works[0].id).toBe('ddl-b');
    expect(manifest.works.map((w) => w.id).sort()).toEqual(['ddl-a', 'ddl-b']);
  });

  it('gallery page uses batch register after parallel blob upload', () => {
    const html = readFileSync(join(ROOT, 'interfaces/doodles-gallery.html'), 'utf8');
    expect(html).toContain("action: 'registerBatch'");
    expect(html).toContain('uploadBlobOnly');
    expect(html).not.toContain("action: 'register'");
  });

  it('gallery wall renders museum gold frames without filename labels', () => {
    const html = readFileSync(join(ROOT, 'interfaces/doodles-gallery.html'), 'utf8');
    expect(html).toContain('museum-wall');
    expect(html).toContain('museum-frame--wall');
    expect(html).toContain('experience-phases.css');
    expect(html).not.toContain('card__title');
    expect(html).toContain("alt = 'Valet Pru doodle'");
  });

  it('reorderDoodleWorks follows the requested wall order', () => {
    const a = normalizeDoodleWork({ id: 'ddl-a', src: 'https://example.com/a.png' });
    const b = normalizeDoodleWork({ id: 'ddl-b', src: 'https://example.com/b.png' });
    const c = normalizeDoodleWork({ id: 'ddl-c', src: 'https://example.com/c.png' });
    let man = emptyDoodlesManifest();
    man = upsertDoodleWork(man, a);
    man = upsertDoodleWork(man, b);
    man = upsertDoodleWork(man, c);
    const reordered = reorderDoodleWorks(man, ['ddl-b', 'ddl-c', 'ddl-a']);
    expect(reordered.works.map((w) => w.id)).toEqual(['ddl-b', 'ddl-c', 'ddl-a']);
  });

  it('removeDoodleWork drops one id from the manifest', () => {
    const a = normalizeDoodleWork({ id: 'ddl-a', src: 'https://example.com/a.png' });
    const b = normalizeDoodleWork({ id: 'ddl-b', src: 'https://example.com/b.png' });
    let man = emptyDoodlesManifest();
    man = upsertDoodleWork(man, a);
    man = upsertDoodleWork(man, b);
    const next = removeDoodleWork(man, 'ddl-b');
    expect(next.works.map((w) => w.id)).toEqual(['ddl-a']);
  });

  it('gallery page exposes Player 1 edit wall controls', () => {
    const html = readFileSync(join(ROOT, 'interfaces/doodles-gallery.html'), 'utf8');
    expect(html).toContain('edit-toggle');
    expect(html).toContain("postManifestAction('reorder'");
    expect(html).toContain("postManifestAction('delete'");
    expect(html).toContain('museum-wall__delete');
    expect(html).toContain('bindDragReorder');
    expect(html).not.toContain('← Earlier');
    const api = readFileSync(join(ROOT, 'api/doodles.js'), 'utf8');
    expect(api).toContain("action === 'reorder'");
    expect(api).toContain("action === 'delete'");
    expect(api).toContain('v=${Date.now()}');
  });
});
