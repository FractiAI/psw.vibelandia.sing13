import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const STORE = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/stores/catalogStore.ts');
const EDITOR = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/components/catalog/PlaylistEditor.tsx');
const COVER = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/lib/playingCover.ts');
const PANEL = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/components/jukebox/JukeboxTrackPanel.tsx');

describe('playlist cover propagates to member tracks', () => {
  it('updatePlaylist copies posterSrc onto each non-master member track', () => {
    const src = readFileSync(STORE, 'utf8');
    const block = src.slice(src.indexOf('updatePlaylist:'));
    expect(block).toMatch(/propagateCover/);
    expect(block).toMatch(/tracks\[trackId\] = \{ \.\.\.tr, posterSrc \}/);
    expect(block).toMatch(/!isMasterPlaylist\(id\)/);
    expect(block).toMatch(/patchTrackPostersOnServer/);
  });

  it('edit playlist track thumbs prefer playlist cover via playingCoverUrl', () => {
    const src = readFileSync(EDITOR, 'utf8');
    expect(src).toMatch(/playingCoverUrl\(tr, pl\)/);
    expect(src).not.toMatch(/const thumb = tr\.posterSrc \|\| undefined/);
  });

  it('playingCoverUrl cache-busts with playlist poster so Change image remounts rows', () => {
    const src = readFileSync(COVER, 'utf8');
    expect(src).toMatch(/playlist\?\.posterSrc/);
    expect(src).toMatch(/cv=/);
  });

  it('listen browse rows show playlist cover on each track', () => {
    const src = readFileSync(PANEL, 'utf8');
    expect(src).toMatch(/playingCoverUrl\(row\.track, playlist\)/);
    expect(src).toMatch(/jb-track-cover/);
  });
});
