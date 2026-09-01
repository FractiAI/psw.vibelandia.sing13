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

  it('loads i18n before soundtrack on Reading Room and QUESTFEST home', () => {
    const rr = read('interfaces/reading-room.html');
    const qf = read('interfaces/vibelandia-questfest.html');
    const rrI18n = rr.indexOf('i18n-auto.js');
    const rrSound = rr.indexOf('page-soundtrack.js');
    const qfI18n = qf.indexOf('i18n-auto.js');
    expect(rrI18n).toBeGreaterThan(-1);
    expect(rrSound).toBeGreaterThan(-1);
    expect(rrI18n).toBeLessThan(rrSound);
    expect(qf).toContain('i18n-auto.js" data-page="questfest" defer');
  });

  it('ships fail-open reveal before i18n on Reading Room and QUESTFEST', () => {
    const failopen = read('interfaces/vbi18n-failopen.js');
    expect(failopen).toContain('__vbi18nFailOpenReveal');
    expect(read('interfaces/reading-room.html')).toContain('vbi18n-failopen.js');
    expect(read('interfaces/vibelandia-questfest.html')).toContain('vbi18n-failopen.js');
    expect(read('interfaces/reading-room.html')).toContain('All papers');
    expect(read('interfaces/reading-room.html')).toContain('loadCatalog');
  });
});
