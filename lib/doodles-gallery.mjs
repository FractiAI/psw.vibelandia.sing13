/**
 * Doodles Gallery — Valet Pru phone doodles for Gusta · mature audiences 18+.
 * Guests view behind an age gate. Player 1 posts via Capitan upload secret
 * with elevated size + batch ceilings (large dump friendly).
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
export const DOODLE_PLAYER1_SESSION_KEY = 'ssv-doodles-player1-v1';

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
  title: 'Doodles Gallery',
  subtitle: 'Valet Pru · for Gusta',
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
