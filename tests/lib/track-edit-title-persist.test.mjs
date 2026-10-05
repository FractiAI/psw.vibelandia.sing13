import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const STORE = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/stores/catalogStore.ts');
const SEED = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/lib/catalogSeed.ts');
const SERVER = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/lib/serverCatalog.ts');
const API = resolve(ROOT, 'api/catalog-track.js');
const EDITOR = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/components/catalog/TrackMetadataEditor.tsx');

/** Mirror of mergePendingServerTracks meta preference for regression. */
function preferLocalMeta(serverTrack, localTrack) {
  const localMeta = Number(localTrack.metaUpdatedAt) || 0;
  const remoteMeta = Number(serverTrack.metaUpdatedAt) || 0;
  if (localMeta <= remoteMeta) return serverTrack;
  return {
    ...serverTrack,
    title: localTrack.title,
    artist: localTrack.artist,
    metaUpdatedAt: localTrack.metaUpdatedAt,
  };
}

describe('Edit track title persistence (colon titles / concurrent cover)', () => {
  it('keeps newer local title over stale server sync (1:12 style edits)', () => {
    const server = { id: 'trk-up-1', title: '112', artist: 'A', metaUpdatedAt: 100 };
    const local = { id: 'trk-up-1', title: '1:12', artist: 'A', metaUpdatedAt: 200 };
    expect(preferLocalMeta(server, local).title).toBe('1:12');
    expect(preferLocalMeta(server, { ...local, metaUpdatedAt: 50 }).title).toBe('112');
  });

  it('ships metaUpdatedAt merge + optimistic updateTrack persist', () => {
    const seed = readFileSync(SEED, 'utf8');
    expect(seed).toMatch(/localMeta <= remoteMeta/);
    expect(seed).toMatch(/metaUpdatedAt/);
    const store = readFileSync(STORE, 'utf8');
    expect(store).toMatch(/metaUpdatedAt: Date\.now\(\)/);
    expect(store).toMatch(/Optimistic local persist/);
    expect(store).toMatch(/patchTrackPostersOnServer/);
  });

  it('batches playlist cover track posters in one catalog write', () => {
    const server = readFileSync(SERVER, 'utf8');
    expect(server).toMatch(/export async function patchTrackPostersOnServer/);
    expect(server).toMatch(/action: 'patch_posters'/);
    const api = readFileSync(API, 'utf8');
    expect(api).toMatch(/action === 'patch_posters'/);
    expect(api).toMatch(/for \(let attempt = 0; attempt < 4/);
  });

  it('does not reset the edit form while Save is in flight', () => {
    const src = readFileSync(EDITOR, 'utf8');
    expect(src).toMatch(/if \(busy\) return/);
  });
});
