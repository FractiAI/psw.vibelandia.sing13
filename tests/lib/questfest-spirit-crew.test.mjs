import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());

describe('QUESTFEST live board date + spirit crew', () => {
  it('does not let i18n stamp a baked calendar date on the cloud badge', () => {
    const html = readFileSync(resolve(ROOT, 'interfaces/vibelandia-questfest.html'), 'utf8');
    expect(html).toContain('id="qf-cloud-badge"');
    expect(html).toContain('data-vbi18n-skip');
    expect(html).not.toMatch(/cloud-badge"[^>]*data-i18n=/);
    expect(html).not.toMatch(/cloudSkinEyebrow/);
  });

  it('paints the guest’s local calendar date in the bulletin client', () => {
    const js = readFileSync(resolve(ROOT, 'interfaces/daily-ship-bulletin.js'), 'utf8');
    expect(js).toContain('getDay()');
    expect(js).toContain('getMonth()');
    expect(js).toContain('getDate()');
    expect(js).toContain('paintToday');
  });

  it('lists spirit crew from Howard Hughes through Vinicius de Moraes', () => {
    const html = readFileSync(resolve(ROOT, 'interfaces/vibelandia-questfest.html'), 'utf8');
    const names = [
      'Howard Hughes',
      'Hero Jo',
      'Chairman Frank',
      'Mark Twain',
      'Marilyn Monroe',
      'Frida Kahlo',
      'Hank Williams',
      'Héctor Lavoe',
      'Vinicius de Moraes',
    ];
    for (const name of names) {
      expect(html).toContain(name);
    }
    const coexist = readFileSync(resolve(ROOT, 'interfaces/coexist-ai-asi.html'), 'utf8');
    expect(coexist).toContain('Howard Hughes');
    expect(coexist).toContain('Vinicius de Moraes');
  });
});
