import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getCatalogUploadSecret,
  catalogUploadConfigured,
  mergeCatalogSnapshots,
  normalizeCatalog,
} from '../../lib/catalog-server.mjs';

const ENV_KEYS = [
  'CATALOG_UPLOAD_SECRET',
  'QUESTFEST_CATALOG_UPLOAD_SECRET',
  'CAPTAIN_BYPASS_PASSWORD',
  'VITE_CAPTAIN_BYPASS_PASSWORD',
  'VITE_CATALOG_UPLOAD_SECRET',
];
const SAVED_KEYS = [...ENV_KEYS, 'VERCEL', 'VERCEL_ENV', 'BLOB_READ_WRITE_TOKEN'];
const savedEnv = new Map();

function saveEnv() {
  savedEnv.clear();
  for (const key of SAVED_KEYS) savedEnv.set(key, process.env[key]);
}

function clearSecretEnv() {
  for (const key of ENV_KEYS) delete process.env[key];
}

function restoreEnv() {
  for (const [key, value] of savedEnv) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

describe('getCatalogUploadSecret', () => {
  beforeEach(() => saveEnv());
  afterEach(() => restoreEnv());

  it('fails closed on Vercel with no env secret (no hard-coded fallback)', () => {
    clearSecretEnv();
    process.env.VERCEL = '1';
    expect(getCatalogUploadSecret()).toBeNull();
  });

  it('returns the configured secret when set', () => {
    clearSecretEnv();
    process.env.CATALOG_UPLOAD_SECRET = 'some-secret-123';
    expect(getCatalogUploadSecret()).toBe('some-secret-123');
  });

  it('rejects a too-short secret', () => {
    clearSecretEnv();
    process.env.CATALOG_UPLOAD_SECRET = 'short';
    expect(getCatalogUploadSecret()).toBeNull();
  });
});

describe('catalogUploadConfigured', () => {
  beforeEach(() => saveEnv());
  afterEach(() => restoreEnv());

  it('is false when only BLOB_READ_WRITE_TOKEN is set (no secret)', () => {
    clearSecretEnv();
    process.env.BLOB_READ_WRITE_TOKEN = 'blob-token';
    process.env.VERCEL = '1';
    expect(catalogUploadConfigured()).toBe(false);
  });
});

describe('mergeCatalogSnapshots', () => {
  it('static manifest wins on track id conflict', () => {
    const base = {
      version: 1,
      tracks: { t1: { id: 't1', title: 'static' } },
      playlists: [{ id: 'pl-main', name: 'main', trackIds: ['t1'] }],
    };
    const overlay = {
      version: 1,
      tracks: { t1: { id: 't1', title: 'overlay' } },
      playlists: [],
    };
    const merged = mergeCatalogSnapshots(base, overlay);
    expect(merged.tracks.t1.title).toBe('static');
  });

  it('does not throw when both sides have zero playlists', () => {
    const base = { version: 1, tracks: {}, playlists: [] };
    const overlay = { version: 1, tracks: {}, playlists: [] };
    expect(() => mergeCatalogSnapshots(base, overlay)).not.toThrow();
    const merged = mergeCatalogSnapshots(base, overlay);
    const main = merged.playlists.find((p) => p.id === 'pl-main');
    expect(main).toBeTruthy();
  });

  it('handles base with empty playlists and an overlay pl-main', () => {
    const base = { version: 1, tracks: {}, playlists: [] };
    const overlay = {
      version: 1,
      tracks: {},
      playlists: [{ id: 'pl-main', name: 'main', trackIds: [] }],
    };
    expect(() => mergeCatalogSnapshots(base, overlay)).not.toThrow();
    const merged = mergeCatalogSnapshots(base, overlay);
    expect(merged.playlists.length).toBeGreaterThanOrEqual(1);
  });
});
