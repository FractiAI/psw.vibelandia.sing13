import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const read = (rel) => readFileSync(resolve(ROOT, rel), 'utf8');

/** Mirror of shouldPreferLocalPlaylistTrackIds — keep in lockstep with catalogSeed.ts */
function shouldPreferLocalPlaylistTrackIds(
  serverTrackIds,
  localTrackIds,
  playlistId,
  preferLocalPlaylistIds,
) {
  if (preferLocalPlaylistIds?.has(playlistId)) return true;
  if (localTrackIds.length < serverTrackIds.length) return false;
  const localSet = new Set(localTrackIds);
  return serverTrackIds.every((id) => localSet.has(id));
}

describe('catalog playlist add-tracks · membership stick', () => {
  it('keeps local adds when dirty or when local is a superset of server', () => {
    const pl = 'pl-user-1';
    expect(shouldPreferLocalPlaylistTrackIds(['fox'], ['fox', 'a', 'b'], pl, null)).toBe(true);
    expect(shouldPreferLocalPlaylistTrackIds(['fox'], ['fox'], pl, null)).toBe(true);
    expect(
      shouldPreferLocalPlaylistTrackIds(['fox', 'a'], ['fox'], pl, null),
    ).toBe(false);
    expect(
      shouldPreferLocalPlaylistTrackIds(['fox', 'a'], ['fox'], pl, new Set([pl])),
    ).toBe(true);
    expect(
      shouldPreferLocalPlaylistTrackIds(['fox', 'new'], ['fox'], pl, null),
    ).toBe(false);
  });

  it('wires prefer-local merge + dirty tracking + immediate membership sync', () => {
    const seed = read('apps/ss-vibelandia-questfest/src/lib/catalogSeed.ts');
    const store = read('apps/ss-vibelandia-questfest/src/stores/catalogStore.ts');

    expect(seed).toContain('shouldPreferLocalPlaylistTrackIds');
    expect(seed).toContain('preferLocalPlaylistIds');
    expect(seed).toContain('never wipe in-flight local adds');

    expect(store).toContain('dirtyPlaylistIds');
    expect(store).toContain('markPlaylistsDirty');
    expect(store).toContain('Always read live store');
    expect(store).toMatch(/addTrackToPlaylist:[\s\S]*markPlaylistsDirty\(\[playlistId\]\)/);
    expect(store).toMatch(
      /addTrackToPlaylist:[\s\S]*scheduleSharedPlaylistSync\(undefined, \{ immediate: true \}\)/,
    );
    expect(store).toMatch(
      /setTrackPlaylistMembership:[\s\S]*scheduleSharedPlaylistSync\(undefined, \{ immediate: true \}\)/,
    );
    expect(store).toContain('applyServerCatalog(server, prefsWithLikes, downloaded, dirtyPlaylistIds)');
  });
});
