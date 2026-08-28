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
});
