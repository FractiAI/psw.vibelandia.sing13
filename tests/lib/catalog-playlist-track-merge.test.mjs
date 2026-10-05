import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mergeUserPlaylistTrackIds } from '../../lib/catalog-playlist-track-merge.mjs';

const ROOT = resolve(process.cwd());
const tracks = {
  fox: { id: 'fox' },
  ship: { id: 'ship' },
  dawn: { id: 'dawn' },
  ghost: { id: 'ghost' },
};

describe('mergeUserPlaylistTrackIds · add-track race lock', () => {
  it('keeps server order and appends local-only adds (fox+ship stays, dawn joins)', () => {
    expect(
      mergeUserPlaylistTrackIds(['fox', 'ship'], ['fox', 'ship', 'dawn'], tracks),
    ).toEqual(['fox', 'ship', 'dawn']);
  });

  it('does not drop remote server tracks when local is a subset', () => {
    expect(mergeUserPlaylistTrackIds(['fox', 'ship', 'dawn'], ['fox', 'ship'], tracks)).toEqual([
      'fox',
      'ship',
      'dawn',
    ]);
  });

  it('dedupes and ignores unknown track ids', () => {
    expect(
      mergeUserPlaylistTrackIds(['fox'], ['fox', 'missing', 'dawn', 'fox'], tracks),
    ).toEqual(['fox', 'dawn']);
  });

  it('seeds empty server list from local', () => {
    expect(mergeUserPlaylistTrackIds([], ['fox', 'ship'], tracks)).toEqual(['fox', 'ship']);
  });
});

describe('questfest bridge · playlist add-track sync wiring', () => {
  it('unions local adds in catalogSeed merge (no longer server-wins skip)', () => {
    const src = readFileSync(
      resolve(ROOT, 'apps/ss-vibelandia-questfest/src/lib/catalogSeed.ts'),
      'utf8',
    );
    expect(src).toContain('mergeUserPlaylistTrackIds');
    expect(src).toContain('union local pending track adds');
    expect(src).not.toMatch(
      /Server-shared playlists win — local only seeds playlists not yet on server/,
    );
  });

  it('pushes fresh store state and immediate-syncs add/remove', () => {
    const src = readFileSync(
      resolve(ROOT, 'apps/ss-vibelandia-questfest/src/stores/catalogStore.ts'),
      'utf8',
    );
    expect(src).toContain('useCatalogStore.getState().playlists');
    expect(src).toContain('mergedAheadOfServer');
    expect(src).toMatch(
      /addTrackToPlaylist:[\s\S]*?scheduleSharedPlaylistSync\(get\(\)\.playlists, \{ immediate: true \}\)/,
    );
    expect(src).toMatch(
      /removeTrackFromPlaylist:[\s\S]*?scheduleSharedPlaylistSync\(get\(\)\.playlists, \{ immediate: true \}\)/,
    );
  });
});
