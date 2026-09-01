import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Page soundtrack · popup handoff + prior music stop', () => {
  it('opens browse popup when soundtrack is playing and guest leaves the page', () => {
    const js = read('interfaces/page-soundtrack.js');
    expect(js).toContain('openBrowsePopup');
    expect(js).toContain('leavesSoundtrackPage');
    expect(js).toContain('isPrimaryShipDoor');
    expect(js).toContain("document.addEventListener('click', onNavigateClick, true)");
    expect(js).toContain('stopImmediatePropagation');
    expect(js).toContain('data-qv-jukebox');
    expect(js).toContain('QV_isPageSoundtrackPlaying');
    expect(js).toContain('shouldBrowsePaperInPopup');
    expect(js).toContain('QV_openPaperBrowse');
    expect(js).toContain('maybeHandoffActiveSession');
    expect(js).toContain('Popup blocked');
    expect(js).not.toContain('handleBrowsePaperNavigation(ev);\n    },\n    true\n  );');
  });

  it('registers navigation guard before async catalog fetch', () => {
    const js = read('interfaces/page-soundtrack.js');
    const guardIdx = js.indexOf("document.addEventListener('click', onNavigateClick, true)");
    const fetchIdx = js.indexOf('resolvePlaylist(opts).then');
    expect(guardIdx).toBeGreaterThan(-1);
    expect(fetchIdx).toBeGreaterThan(-1);
    expect(guardIdx).toBeLessThan(fetchIdx);
  });

  it('site jukebox keeps soundtrack page when browse popup is blocked', () => {
    const js = read('interfaces/site-jukebox.js');
    expect(js).toContain('QV_isPageSoundtrackPlaying');
    expect(js).toContain('isPrimaryShipDoor');
    expect(js).toContain('browseWin');
    expect(js).not.toContain('window.location.href = url');
  });

  it('primary ship doors navigate in-tab even when soundtrack is playing', () => {
    const soundtrack = read('interfaces/page-soundtrack.js');
    const jukebox = read('interfaces/site-jukebox.js');
    expect(soundtrack).toContain('if (isPrimaryShipDoor(url))');
    expect(soundtrack).toContain('handoffIfPlaying();\n        return;');
    expect(jukebox).toContain('!isPrimaryShipDoor(offUrl)');
  });

  it('pauses other media and broadcasts stop before starting page soundtrack', () => {
    const js = read('interfaces/page-soundtrack.js');
    expect(js).toContain('pauseOtherMedia');
    expect(js).toContain("type: 'stop'");
    expect(js).toContain('pagehide');
    expect(js).toContain('openHandoffPopup');
    expect(js).toContain('handoffIfPlaying');
    expect(js).toContain('openBrowsePopup(url.href)');
  });
});

describe('Reading Room · Canvas-style hero video', () => {
  it('uses ep-hero full-bleed looping Roosevelt video like Canvas landing', () => {
    const hero = read('lib/experience-page-hero.mjs');
    const page = read('interfaces/reading-room.html');
    expect(hero).toContain("modifier: 'reading-room'");
    expect(hero).toContain('youtubeId: READING_ROOM_VIDEO_ID');
    expect(page).toContain('data-qv-browse="1"');
    expect(page).toContain('target="_blank"');
    expect(page).toContain('ep-hero--reading-room');
    expect(page).toContain('ep-hero--compact');
    expect(page).toContain('href="#papers"');
    expect(page).toContain('Loading poster shelves');
    expect(page).toContain('ep-hero__video-embed');
    expect(page).toContain('data-youtube-id="VXZL77ub8DY"');
    expect(page).not.toContain('rr-prelude');
  });

  it('loads YouTube loop via page-hero-video.js on ep-hero embed', () => {
    const js = read('interfaces/page-hero-video.js');
    expect(js).toContain('.ep-hero__video-embed[data-youtube-id]');
    expect(js).toContain("'loop=1'");
  });
});
