import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());

describe('catalog playlist sync · 503 spike guards', () => {
  it('does not treat the baked Capitan default as upload-configured', () => {
    const src = readFileSync(
      resolve(ROOT, 'apps/ss-vibelandia-questfest/src/lib/serverCatalog.ts'),
      'utf8',
    );
    expect(src).toContain('VITE_CATALOG_UPLOAD_SECRET');
    expect(src).toContain('VITE_CAPTAIN_BYPASS_PASSWORD');
    expect(src).toContain('expectedCaptainPassword');
  });

  it('skips playlist sync on unchanged persist and stops retrying permanent 503s', () => {
    const src = readFileSync(
      resolve(ROOT, 'apps/ss-vibelandia-questfest/src/stores/catalogStore.ts'),
      'utf8',
    );
    expect(src).toContain('isPermanentPlaylistSyncError');
    expect(src).toContain('catalog_upload_unconfigured');
    expect(src).toMatch(/if \(!playlistsUnchanged\) \{\s*scheduleSharedPlaylistSync\(playlists\);/);
  });

  it('pushes shared catalog after add / membership edits (not only create/rename)', () => {
    const src = readFileSync(
      resolve(ROOT, 'apps/ss-vibelandia-questfest/src/stores/catalogStore.ts'),
      'utf8',
    );
    // Mutations call set() then persist(); persist alone treats the already-mutated
    // store as unchanged and skips sync — so each membership edit must push explicitly.
    // Match implementations (not the CatalogState type stubs).
    const addImpl = src.indexOf('addTrackToPlaylist: (trackId, playlistId) =>');
    const removeImpl = src.indexOf('removeTrackFromPlaylist: (trackId, playlistId) =>');
    const membershipImpl = src.indexOf('setTrackPlaylistMembership: (trackId, playlistIds) =>');
    const uploadImpl = src.indexOf('uploadTrack: async (file, meta) =>');
    expect(addImpl).toBeGreaterThan(-1);
    expect(membershipImpl).toBeGreaterThan(-1);
    const addBlock = src.slice(addImpl, removeImpl);
    const membershipBlock = src.slice(membershipImpl, uploadImpl);
    expect(addBlock).toContain('scheduleSharedPlaylistSync(get().playlists, { immediate: true })');
    expect(membershipBlock).toContain(
      'scheduleSharedPlaylistSync(get().playlists, { immediate: true })',
    );
  });
});
