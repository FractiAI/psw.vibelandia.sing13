import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const SELECTORS = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/stores/catalogSelectors.ts');
const PANEL = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/components/jukebox/JukeboxTrackPanel.tsx');
const EDITOR = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/components/catalog/PlaylistEditor.tsx');
const NOW = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/pages/JukeboxNowPlayingPage.tsx');
const BRIDGE = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/components/player/BridgePlayer.tsx');

describe('Edit track title reflects immediately without refresh', () => {
  it('exports useGetTrack / useTrack that subscribe to tracks map', () => {
    const src = readFileSync(SELECTORS, 'utf8');
    expect(src).toMatch(/export function useGetTrack/);
    expect(src).toMatch(/export function useTrack/);
    expect(src).toMatch(/useCatalogStore\(\(s\) => s\.tracks\)/);
    expect(src).toMatch(/s\.tracks\[trackId\]/);
  });

  it('listen / edit / now / dock use live track selectors', () => {
    expect(readFileSync(PANEL, 'utf8')).toMatch(/useGetTrack\(\)/);
    expect(readFileSync(EDITOR, 'utf8')).toMatch(/useGetTrack\(\)/);
    expect(readFileSync(NOW, 'utf8')).toMatch(/useTrack\(currentTrackId\)/);
    expect(readFileSync(BRIDGE, 'utf8')).toMatch(/useTrack\(currentTrackId\)/);
    expect(readFileSync(PANEL, 'utf8')).not.toMatch(/useCatalogStore\(\(s\) => s\.getTrack\)/);
  });
});
