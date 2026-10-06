import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const RECIPIENTS = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/lib/forwardRecipients.ts');
const SHARE = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/lib/shareCatalog.ts');
const MODAL = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/components/jukebox/ForwardModal.tsx');
const PANEL = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/components/jukebox/JukeboxTrackPanel.tsx');
const MANAGE = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/components/jukebox/PlaylistManageModal.tsx');
const BRIDGE = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/components/player/BridgePlayer.tsx');
const NOW = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/pages/JukeboxNowPlayingPage.tsx');
const PLAIN = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/lib/plainSpeak.ts');

describe('forward playlists + tracks with multi recipients', () => {
  it('keeps an on-device recipient address book', () => {
    const src = readFileSync(RECIPIENTS, 'utf8');
    expect(src).toMatch(/qf-forward-recipients-v1/);
    expect(src).toMatch(/loadForwardRecipients/);
    expect(src).toMatch(/saveForwardRecipients/);
    expect(src).toMatch(/createForwardRecipient/);
  });

  it('builds track and playlist listen URLs for forward messages', () => {
    const src = readFileSync(SHARE, 'utf8');
    expect(src).toMatch(/buildPlaylistListenUrl/);
    expect(src).toMatch(/q\.set\('playlist'/);
    expect(src).toMatch(/openForwardEmail/);
    expect(src).toMatch(/openForwardSms/);
    expect(src).toMatch(/copyForwardMessage/);
  });

  it('ForwardModal supports multi-select recipients and email/text/copy', () => {
    const src = readFileSync(MODAL, 'utf8');
    expect(src).toMatch(/selected/);
    expect(src).toMatch(/type="checkbox"/);
    expect(src).toMatch(/openForwardEmail/);
    expect(src).toMatch(/openForwardSms/);
    expect(src).toMatch(/forwardEmailSend/);
    expect(src).toMatch(/forwardTextSend/);
  });

  it('wires Forward on playlist panel, manage modal, player, and now playing', () => {
    const panel = readFileSync(PANEL, 'utf8');
    expect(panel).toMatch(/ForwardModal/);
    expect(panel).toMatch(/kind: 'playlist'/);
    expect(panel).toMatch(/kind: 'track'/);
    expect(panel).toMatch(/onForwardTrack/);

    const manage = readFileSync(MANAGE, 'utf8');
    expect(manage).toMatch(/ForwardModal/);
    expect(manage).toMatch(/openForward/);
    expect(manage).toMatch(/PLAIN\.forward/);

    const bridge = readFileSync(BRIDGE, 'utf8');
    expect(bridge).toMatch(/ForwardModal/);
    expect(bridge).toMatch(/sp-now-btn--forward/);
    expect(bridge).toMatch(/kind: 'track'/);

    const now = readFileSync(NOW, 'utf8');
    expect(now).toMatch(/ForwardModal/);
    expect(now).toMatch(/kind: 'track'/);
    expect(now).toMatch(/kind: 'playlist'/);
  });

  it('exposes plain-speak Forward labels', () => {
    const src = readFileSync(PLAIN, 'utf8');
    expect(src).toMatch(/forwardTrack:/);
    expect(src).toMatch(/forwardPlaylist:/);
    expect(src).toMatch(/forwardPickRecipients:/);
  });
});
