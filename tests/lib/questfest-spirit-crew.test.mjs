import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());

describe('QUESTFEST live board date + aboard channels', () => {
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

  it('tucks Meet / Join / Coexist under More aboard for Player spine', () => {
    const html = readFileSync(resolve(ROOT, 'interfaces/vibelandia-questfest.html'), 'utf8');
    expect(html).toContain('Your four doors');
    expect(html).toContain('player-more-aboard');
    expect(html).toContain('Meet the crew');
    expect(html).toContain('/meet-the-crew');
    expect(html).toContain('Join the crew');
    expect(html).toContain('/join-the-crew');
    expect(html).toContain('Coexist with AI');
    expect(html).toContain('/coexist');
    expect(html).toContain('99 Octave chart');
    expect(html).toContain('/octave99-chart');
    expect(html).not.toMatch(/<ul class="qf-spirit"/);
    expect(html).not.toContain('Channel VII');
  });

  it('lists spirit crew from Howard Hughes through Vinicius de Moraes on Meet the crew', () => {
    const html = readFileSync(resolve(ROOT, 'interfaces/meet-the-crew.html'), 'utf8');
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
    expect(html).toContain('qf-spirit-card');
    const images = [
      'howard-hughes.png',
      'js-bach.png',
      'frank-sinatra.png',
      'mark-twain.png',
      'marilyn-monroe.png',
      'frida-kahlo.jpg',
      'hank-williams.png',
      'hector-lavoe.jpg',
      'vinicius-de-moraes.jpg',
      'valet-pru-guayabera-panama.jpg',
    ];
    for (const image of images) {
      expect(html).toContain(`/interfaces/assets/questfest-crew/${image}`);
    }
    const join = readFileSync(resolve(ROOT, 'interfaces/join-the-crew.html'), 'utf8');
    expect(join).toContain('Downtown Citadel Host');
    expect(join).toContain('/commons/host');
    const coexist = readFileSync(resolve(ROOT, 'interfaces/coexist-ai-asi.html'), 'utf8');
    expect(coexist).toContain('/meet-the-crew');
    expect(coexist).toContain('/join-the-crew');
    expect(coexist).toContain('Linear NPC');
    expect(coexist).toContain('Which Quadrant Are You?');
  });
});
