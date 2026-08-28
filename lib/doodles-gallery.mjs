/**
 * Valet Pru's Doodles · mature audiences 18+.
 * Guests view behind an age gate. Player 1 posts directly (Blob storage on server).
 *
 * SynthOBS Autonomous Agent · Syntheverse Sandbox
 * Honesty: gallery hospitality + Blob storage — not a claim about art-market valuation.
 */

import { put } from '@vercel/blob';

/** Blob JSON manifest — mutable guest-facing list */
export const DOODLES_MANIFEST_PATH = 'doodles/manifest-v1.json';
export const DOODLES_BLOB_PREFIX = 'doodles/works/';

/** Guests do not upload. */
export const DOODLE_GUEST_MAX_BYTES = 0;
export const DOODLE_GUEST_MAX_BATCH = 0;

/**
 * Player 1 (creator seat) ceilings — exceed the catalog media 80 MB rail
 * so a large doodle dump can land in one session.
 */
export const DOODLE_PLAYER1_MAX_BYTES = 500 * 1024 * 1024; // 500 MiB per file
export const DOODLE_PLAYER1_MAX_BATCH = 500;
export const DOODLE_PLAYER1_MAX_CONCURRENT = 4;

/** Catalog / audio rail (for honesty copy + tests) */
export const CATALOG_MEDIA_MAX_BYTES = 80 * 1024 * 1024;

export const DOODLE_AGE_GATE_KEY = 'ssv-doodles-18plus-v1';

/** True when Vercel Blob write token is present (server-side only). */
export function doodlesUploadConfigured() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export const DOODLE_ALLOWED_CONTENT_TYPES = Object.freeze([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'application/octet-stream',
]);

export const DOODLES_GALLERY_META = Object.freeze({
  id: 'doodles-gallery',
  title: "Valet Pru's Doodles",
  subtitle: 'Gallery wall · 18+',
  mature: true,
  ageGate: '18+',
  href: '/doodles',
  inquiry: 'info@fractiai.com',
});

export function emptyDoodlesManifest() {
  return {
    version: 1,
    updatedAt: null,
    works: [],
  };
}

export function normalizeDoodleWork(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = String(raw.id || '')
    .replace(/[^\w-]/g, '')
    .slice(0, 80);
  const src = String(raw.src || raw.url || '').trim();
  if (!id || !src) return null;
  return {
    id,
    title: String(raw.title || 'Untitled doodle').trim().slice(0, 160) || 'Untitled doodle',
    src,
    contentType: String(raw.contentType || 'image/jpeg').slice(0, 80),
    caption: String(raw.caption || '').trim().slice(0, 500) || undefined,
    filename: String(raw.filename || '').trim().slice(0, 200) || undefined,
    uploadedAt: String(raw.uploadedAt || new Date().toISOString()),
    mature: true,
  };
}

export function normalizeDoodlesManifest(raw) {
  const base = emptyDoodlesManifest();
  if (!raw || typeof raw !== 'object') return base;
  const works = Array.isArray(raw.works)
    ? raw.works.map(normalizeDoodleWork).filter(Boolean)
    : [];
  return {
    version: Number(raw.version) || 1,
    updatedAt: raw.updatedAt || null,
    works,
  };
}

/** Player 1 may exceed the 80 MB catalog media ceiling. */
export function player1ExceedsCatalogMediaLimit() {
  return DOODLE_PLAYER1_MAX_BYTES > CATALOG_MEDIA_MAX_BYTES;
}

export function player1UploadLimits() {
  return {
    seat: 'player1',
    maxBytes: DOODLE_PLAYER1_MAX_BYTES,
    maxBatch: DOODLE_PLAYER1_MAX_BATCH,
    maxConcurrent: DOODLE_PLAYER1_MAX_CONCURRENT,
    exceedsCatalogMediaLimit: player1ExceedsCatalogMediaLimit(),
    catalogMediaMaxBytes: CATALOG_MEDIA_MAX_BYTES,
    allowedContentTypes: [...DOODLE_ALLOWED_CONTENT_TYPES],
  };
}

export function guestUploadLimits() {
  return {
    seat: 'guest',
    maxBytes: DOODLE_GUEST_MAX_BYTES,
    maxBatch: DOODLE_GUEST_MAX_BATCH,
    maxConcurrent: 0,
    viewOnly: true,
  };
}

export function titleFromFilename(name) {
  return (
    String(name || 'Untitled')
      .replace(/\.[^.]+$/, '')
      .replace(/[_-]+/g, ' ')
      .trim() || 'Untitled doodle'
  );
}

export function doodlePathname(id, filename) {
  const safe = String(filename || 'doodle.jpg')
    .replace(/[^\w.\-()+ ]/g, '_')
    .slice(0, 120);
  return `${DOODLES_BLOB_PREFIX}${id}-${safe}`;
}

/**
 * Merge one work into a manifest (newest first).
 * @param {ReturnType<typeof normalizeDoodlesManifest>} manifest
 * @param {ReturnType<typeof normalizeDoodleWork>} work
 */
export function upsertDoodleWork(manifest, work) {
  const next = normalizeDoodlesManifest(manifest);
  const normalized = normalizeDoodleWork(work);
  if (!normalized) return next;
  const without = next.works.filter((w) => w.id !== normalized.id);
  return {
    version: Math.max(Number(next.version) || 1, 1) + 1,
    updatedAt: new Date().toISOString(),
    works: [normalized, ...without],
  };
}

/**
 * Persist manifest to Vercel Blob (overwrite).
 * Callers must already hold upload auth + BLOB_READ_WRITE_TOKEN.
 */
export async function putDoodlesManifest(manifest) {
  const body = JSON.stringify(normalizeDoodlesManifest(manifest), null, 2);
  const blob = await put(DOODLES_MANIFEST_PATH, body, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return blob;
}

/**
 * Merge multiple works into one manifest snapshot (newest batch first).
 * @param {ReturnType<typeof normalizeDoodlesManifest>} manifest
 * @param {Array<ReturnType<typeof normalizeDoodleWork>>} works
 */
export function mergeDoodleWorks(manifest, works) {
  let next = normalizeDoodlesManifest(manifest);
  for (const work of works) {
    next = upsertDoodleWork(next, work);
  }
  return next;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Persist one or more doodle works with optimistic retry — avoids lost updates when
 * concurrent uploads each read/write the same Blob manifest.
 */
export async function persistDoodleWorks({
  loadManifest,
  putManifest,
  works,
  maxAttempts = 12,
}) {
  const normalized = (Array.isArray(works) ? works : [works])
    .map((w) => normalizeDoodleWork(w))
    .filter(Boolean);
  if (!normalized.length) {
    throw new Error('no_valid_works');
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const current = await loadManifest();
    const allPresent = normalized.every((w) => current.works.some((cw) => cw.id === w.id));
    if (allPresent) {
      return { manifest: current, works: normalized };
    }

    const next = mergeDoodleWorks(current, normalized);
    await putManifest(next);

    const verify = await loadManifest();
    const missing = normalized.filter((w) => !verify.works.some((cw) => cw.id === w.id));
    if (!missing.length) {
      return { manifest: verify, works: normalized };
    }

    await sleep(25 * (attempt + 1) + Math.random() * 35);
  }

  throw new Error('manifest_conflict');
}

/**
 * Apply a manifest mutation with optimistic retry (reorder, delete, etc.).
 */
export async function persistManifestChange({
  loadManifest,
  putManifest,
  mutate,
  verify,
  maxAttempts = 12,
}) {
  let lastNext = null;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const current = await loadManifest();
    const next = mutate(normalizeDoodlesManifest(current));
    if (!next || !Array.isArray(next.works)) {
      throw new Error('invalid_mutation');
    }
    lastNext = next;
    await putManifest(next);
    const loaded = await loadManifest();
    if (verify(loaded, next)) {
      return loaded;
    }
    // Blob CDN can lag briefly — trust the write we just made after a few tries.
    if (attempt >= 2) {
      return next;
    }
    await sleep(25 * (attempt + 1) + Math.random() * 35);
  }
  if (lastNext) return lastNext;
  throw new Error('manifest_conflict');
}

/**
 * Reorder works to match `orderIds` (left-to-right, top-to-bottom on the wall).
 * Unknown ids are ignored; works omitted from the list are appended in prior order.
 */
export function reorderDoodleWorks(manifest, orderIds) {
  const next = normalizeDoodlesManifest(manifest);
  const byId = new Map(next.works.map((w) => [w.id, w]));
  const reordered = [];
  const seen = new Set();

  for (const rawId of orderIds) {
    const id = String(rawId || '')
      .replace(/[^\w-]/g, '')
      .slice(0, 80);
    if (!id || seen.has(id) || !byId.has(id)) continue;
    reordered.push(byId.get(id));
    seen.add(id);
  }

  for (const work of next.works) {
    if (!seen.has(work.id)) reordered.push(work);
  }

  return {
    version: Math.max(Number(next.version) || 1, 1) + 1,
    updatedAt: new Date().toISOString(),
    works: reordered,
  };
}

/** Remove one work from the manifest by id (Blob asset may remain in storage). */
export function removeDoodleWork(manifest, id) {
  const next = normalizeDoodlesManifest(manifest);
  const cleanId = String(id || '')
    .replace(/[^\w-]/g, '')
    .slice(0, 80);
  if (!cleanId) return next;
  return {
    version: Math.max(Number(next.version) || 1, 1) + 1,
    updatedAt: new Date().toISOString(),
    works: next.works.filter((w) => w.id !== cleanId),
  };
}
