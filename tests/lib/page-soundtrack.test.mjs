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
    expect(js).toContain("document.addEventListener('click', onNavigateClick, true)");
    expect(js).toContain('QV_openBrowse');
  });

  it('pauses other media and broadcasts stop before starting page soundtrack', () => {
    const js = read('interfaces/page-soundtrack.js');
    expect(js).toContain('pauseOtherMedia');
    expect(js).toContain("type: 'stop'");
    expect(js).toContain('pagehide');
    expect(js).toContain('openHandoffPopup');
  });
});

describe('Reading Room · Roosevelt prelude video', () => {
  it('uses full-frame rr-prelude classes without ep-hero embed sizing conflict', () => {
    const hero = read('lib/experience-page-hero.mjs');
    const page = read('interfaces/reading-room.html');
    expect(hero).toContain('rr-prelude__video rr-prelude__video--loading');
    expect(hero).not.toMatch(/rr-prelude__video ep-hero__video-embed/);
    expect(page).toContain('rr-prelude__video rr-prelude__video--loading');
    expect(page).toContain('min-height: min(50svh, 36rem)');
    expect(page).not.toContain('max-height: min(42vh, 22rem)');
  });

  it('loads YouTube embed for rr-prelude iframe via page-hero-video.js', () => {
    const js = read('interfaces/page-hero-video.js');
    expect(js).toContain('.rr-prelude__video[data-youtube-id]');
    expect(js).toContain('rr-prelude__video--loading');
    expect(pageHeroVideoId()).toBe('VXZL77ub8DY');
  });
});

function pageHeroVideoId() {
  const page = read('interfaces/reading-room.html');
  const m = page.match(/data-youtube-id="([^"]+)"/);
  return m ? m[1] : null;
}
