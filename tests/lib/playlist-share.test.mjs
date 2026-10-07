import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const SHARE = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/lib/shareCatalog.ts');
const PLAIN = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/lib/plainSpeak.ts');
const PANEL = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/components/jukebox/JukeboxTrackPanel.tsx');
const MANAGE = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/components/jukebox/PlaylistManageModal.tsx');
const NOW = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/pages/JukeboxNowPlayingPage.tsx');
const TRACK_SHARE = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/lib/shareTrack.ts');

describe('playlist Share matches track Share', () => {
  it('exposes sharePlaylist with native sheet then clipboard fallback', () => {
    const src = readFileSync(SHARE, 'utf8');
    expect(src).toMatch(/export async function sharePlaylist/);
    expect(src).toMatch(/navigator\.share/);
    expect(src).toMatch(/navigator\.clipboard\.writeText/);
    expect(src).toMatch(/buildPlaylistListenUrl/);
    expect(src).toMatch(/buildPlaylistShareText/);

    const track = readFileSync(TRACK_SHARE, 'utf8');
    expect(track).toMatch(/export async function shareTrack/);
  });

  it('labels Share playlist in plain speak', () => {
    const src = readFileSync(PLAIN, 'utf8');
    expect(src).toMatch(/sharePlaylist:\s*'Share playlist'/);
    expect(src).toMatch(/share:\s*'Share'/);
  });

  it('wires Share (not Forward) on playlist panel, manage modal, and now playing', () => {
    const panel = readFileSync(PANEL, 'utf8');
    expect(panel).toMatch(/sharePlaylist/);
    expect(panel).toMatch(/PLAIN\.share/);
    expect(panel).not.toMatch(/kind: 'playlist'/);

    const manage = readFileSync(MANAGE, 'utf8');
    expect(manage).toMatch(/sharePlaylist/);
    expect(manage).toMatch(/PLAIN\.share/);
    expect(manage).not.toMatch(/ForwardModal/);
    expect(manage).not.toMatch(/openForward/);

    const now = readFileSync(NOW, 'utf8');
    expect(now).toMatch(/sharePlaylist/);
    expect(now).toMatch(/PLAIN\.sharePlaylist/);
    expect(now).not.toMatch(/kind: 'playlist'/);
    // Track Forward remains available on now playing
    expect(now).toMatch(/kind: 'track'/);
  });
});
