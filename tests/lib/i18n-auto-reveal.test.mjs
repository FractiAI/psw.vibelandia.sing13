import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('i18n-auto · reveal safety', () => {
  it('reveals the document on timeout, fetch timeout, and apply failure', () => {
    const js = read('interfaces/i18n-auto.js');
    expect(js).toContain('scheduleRevealFallback');
    expect(js).toContain('REVEAL_FALLBACK_MS');
    expect(js).toContain('fetch_timeout');
    expect(js).toContain('promiseWithTimeout');
    expect(js).toContain('i18n-auto: apply failed');
  });

  it('loads i18n before soundtrack on Reading Room, Front Desk, Sin City, and QUESTFEST home', () => {
    const rr = read('interfaces/reading-room.html');
    const fd = read('interfaces/front-desk.html');
    const sc = read('interfaces/voyage/deck-3-night.html');
    const qf = read('interfaces/vibelandia-questfest.html');
    const rrI18n = rr.indexOf('i18n-auto.js');
    const rrSound = rr.indexOf('page-soundtrack.js');
    const fdI18n = fd.indexOf('i18n-auto.js');
    const fdSound = fd.indexOf('page-soundtrack.js');
    const scI18n = sc.indexOf('i18n-auto.js');
    const scSound = sc.indexOf('page-soundtrack.js');
    expect(rrI18n).toBeGreaterThan(-1);
    expect(rrSound).toBeGreaterThan(-1);
    expect(rrI18n).toBeLessThan(rrSound);
    expect(fdI18n).toBeGreaterThan(-1);
    expect(fdSound).toBeGreaterThan(-1);
    expect(fdI18n).toBeLessThan(fdSound);
    expect(scI18n).toBeGreaterThan(-1);
    expect(scSound).toBeGreaterThan(-1);
    expect(scI18n).toBeLessThan(scSound);
    expect(sc).toContain('i18n-auto.js" data-page="surface" defer');
    expect(qf).toContain('i18n-auto.js" data-page="questfest" defer');
  });

  it('ships fail-open reveal before i18n on Reading Room, whitepaper reader, art landing, and QUESTFEST', () => {
    const failopen = read('interfaces/vbi18n-failopen.js');
    expect(failopen).toContain('__vbi18nFailOpenReveal');
    expect(failopen).toMatch(/reveal\(\)/);
    expect(read('interfaces/vibelandia-questfest.html')).toContain("classList.remove('vbi18n-pending')");
    expect(read('interfaces/reading-room.html')).toContain('vbi18n-failopen.js');
    expect(read('interfaces/whitepaper-surface.html')).toContain('vbi18n-failopen.js');
    expect(read('interfaces/omniverse-canvas.html')).toContain('vbi18n-failopen.js');
    expect(read('interfaces/front-desk.html')).toContain('vbi18n-failopen.js');
    expect(read('interfaces/vibelandia-questfest.html')).toContain('vbi18n-failopen.js');
    expect(read('interfaces/reading-room.html')).toContain('All papers');
    expect(read('interfaces/reading-room.html')).toContain('loadCatalog');
    expect(read('interfaces/omniverse-canvas.html')).toContain('i18n-auto.js" data-page="surface" defer');
  });

  it('loads i18n before soundtrack on art landing', () => {
    const html = read('interfaces/omniverse-canvas.html');
    const i18n = html.indexOf('i18n-auto.js');
    const soundtrack = html.indexOf('page-soundtrack.js');
    expect(i18n).toBeGreaterThan(-1);
    expect(soundtrack).toBeGreaterThan(-1);
    expect(i18n).toBeLessThan(soundtrack);
  });

  it('reveals experience pages immediately in head before deferred bundles', () => {
    for (const rel of [
      'interfaces/reading-room.html',
      'interfaces/front-desk.html',
      'interfaces/voyage/deck-3-night.html',
      'interfaces/whitepaper-surface.html',
      'interfaces/omniverse-canvas.html',
    ]) {
      const html = read(rel);
      expect(html).toContain("classList.remove('vbi18n-pending')");
      expect(html).toContain("classList.add('vbi18n-ready')");
    }
  });

  it('does not live-translate canonical whitepaper reader bodies', () => {
    const js = read('interfaces/i18n-auto.js');
    expect(js).toContain("page === 'papers'");
    expect(read('interfaces/whitepaper-surface.html')).toContain('data-vbi18n-skip');
    expect(read('interfaces/whitepaper-surface.html')).toContain('loadDocument');
  });

  it('boot reveals before dictionary fetch and does not block on live translation', () => {
    const js = read('interfaces/i18n-auto.js');
    expect(js).toMatch(/if \(I18N_LIVE_DISABLED\)[\s\S]*return;/);
    expect(js).not.toMatch(/return done\.then\(function \(\) \{\s*revealDocument\(\)/);
  });

  it('disables live translation via kill switch', () => {
    const js = read('interfaces/i18n-auto.js');
    expect(js).toContain('I18N_LIVE_DISABLED = true');
    expect(js).toContain('liveTranslate: false');
    expect(js).toMatch(/if \(I18N_LIVE_DISABLED\)[\s\S]*return;/);
    const css = read('interfaces/brand-gold-surfaces.css');
    expect(css).toContain('visibility: visible !important');
    expect(read('interfaces/voyage-surfaces.css')).toContain('visibility: visible !important');
    expect(read('interfaces/ship-blog.css')).toContain('visibility: visible !important');
  });

  it('loads Reading Room poster shelves from static catalog first', () => {
    const html = read('interfaces/reading-room.html');
    expect(html).toContain('/interfaces/data/reading-room-catalog.json');
    expect(html).toContain('/api/whitepaper-catalog');
    expect(read('interfaces/data/reading-room-catalog.json')).toContain('"ok":true');
  });
});
