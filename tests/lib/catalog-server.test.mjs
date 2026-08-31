import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getCatalogUploadSecret,
  catalogUploadConfigured,
  isSing13VercelEdge,
  mergeCatalogSnapshots,
  normalizeCatalog,
} from '../../lib/catalog-server.mjs';
import {
  CONCIERTO_PRELUDE_PLAYLIST_ID,
  CONCIERTO_PRELUDE_TRACK_IDS,
} from '../../lib/concierto-prelude-playlist.mjs';
import { reconcilePinnedSovereignPlaylists } from '../../lib/pinned-sovereign-playlists.mjs';

const ENV_KEYS = [
  'CATALOG_UPLOAD_SECRET',
  'QUESTFEST_CATALOG_UPLOAD_SECRET',
  'CAPTAIN_BYPASS_PASSWORD',
  'VITE_CAPTAIN_BYPASS_PASSWORD',
  'VITE_CATALOG_UPLOAD_SECRET',
];
const SAVED_KEYS = [
  ...ENV_KEYS,
  'VERCEL',
  'VERCEL_ENV',
  'BLOB_READ_WRITE_TOKEN',
  'VERCEL_GIT_REPO_OWNER',
  'VERCEL_GIT_REPO_SLUG',
];
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

  it('fails closed on Vercel with no env secret outside SING 13 edge', () => {
    clearSecretEnv();
    process.env.VERCEL = '1';
    delete process.env.VERCEL_GIT_REPO_OWNER;
    delete process.env.VERCEL_GIT_REPO_SLUG;
    expect(getCatalogUploadSecret()).toBeNull();
  });

  it('uses SING 13 edge default when Blob is on and repo matches', () => {
    clearSecretEnv();
    process.env.BLOB_READ_WRITE_TOKEN = 'blob-token';
    process.env.VERCEL_GIT_REPO_OWNER = 'FractiAI';
    process.env.VERCEL_GIT_REPO_SLUG = 'psw.vibelandia.sing13';
    expect(isSing13VercelEdge()).toBe(true);
    expect(getCatalogUploadSecret()).toBe('valetpru1!');
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

  it('is false when only BLOB is set on a non-SING-13 Vercel project', () => {
    clearSecretEnv();
    process.env.BLOB_READ_WRITE_TOKEN = 'blob-token';
    process.env.VERCEL = '1';
    delete process.env.VERCEL_GIT_REPO_OWNER;
    delete process.env.VERCEL_GIT_REPO_SLUG;
    expect(catalogUploadConfigured()).toBe(false);
  });

  it('is true on SING 13 edge when Blob is set even without explicit secret env', () => {
    clearSecretEnv();
    process.env.BLOB_READ_WRITE_TOKEN = 'blob-token';
    process.env.VERCEL_GIT_REPO_OWNER = 'FractiAI';
    process.env.VERCEL_GIT_REPO_SLUG = 'psw.vibelandia.sing13';
    expect(catalogUploadConfigured()).toBe(true);
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

  it('keeps static pinned sovereign playlists when overlay has empty track lists', () => {
    const base = {
      version: 1,
      tracks: {},
      playlists: [
        {
          id: CONCIERTO_PRELUDE_PLAYLIST_ID,
          name: 'Prelude',
          trackIds: [...CONCIERTO_PRELUDE_TRACK_IDS],
        },
      ],
    };
    const overlay = {
      version: 1,
      tracks: {},
      playlists: [{ id: CONCIERTO_PRELUDE_PLAYLIST_ID, name: 'Prelude', trackIds: [] }],
    };
    const merged = mergeCatalogSnapshots(base, overlay);
    const prelude = merged.playlists.find((p) => p.id === CONCIERTO_PRELUDE_PLAYLIST_ID);
    expect(prelude?.trackIds).toEqual([...CONCIERTO_PRELUDE_TRACK_IDS]);
  });
});

describe('reconcilePinnedSovereignPlaylists', () => {
  it('restores canonical track order for pinned playlists', () => {
    const catalog = {
      version: 1,
      tracks: {},
      playlists: [{ id: CONCIERTO_PRELUDE_PLAYLIST_ID, name: 'Prelude', trackIds: [] }],
    };
    const next = reconcilePinnedSovereignPlaylists(catalog);
    const prelude = next.playlists.find((p) => p.id === CONCIERTO_PRELUDE_PLAYLIST_ID);
    expect(prelude?.trackIds).toEqual([...CONCIERTO_PRELUDE_TRACK_IDS]);
  });
});
