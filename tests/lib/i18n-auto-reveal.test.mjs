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
    const qfI18n = qf.indexOf('i18n-auto.js');
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

  it('reveals experience pages immediately in head before deferred bundles', () => {
    for (const rel of [
      'interfaces/reading-room.html',
      'interfaces/front-desk.html',
      'interfaces/voyage/deck-3-night.html',
    ]) {
      const html = read(rel);
      expect(html).toContain("classList.remove('vbi18n-pending')");
      expect(html).toContain("classList.add('vbi18n-ready')");
    }
  });

  it('boot reveals before dictionary fetch and does not block on live translation', () => {
    const js = read('interfaces/i18n-auto.js');
    expect(js).toMatch(/function boot\(\)[\s\S]*revealDocument\(\)/);
    expect(js).not.toMatch(/return done\.then\(function \(\) \{\s*revealDocument\(\)/);
  });
});
