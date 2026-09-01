import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  renderVisitGoldenPathHeroCtasHtml,
  renderVisitGoldenPathHtml,
  VISIT_GOLDEN_PATH_KICKER,
} from '../../lib/visit-golden-path.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Visit golden path · Canvas → Program → Check In', () => {
  it('renders three numbered steps with program as primary', () => {
    const html = renderVisitGoldenPathHtml('canvas');
    expect(html).toContain(VISIT_GOLDEN_PATH_KICKER);
    expect(html).toContain('Concert program');
    expect(html).toContain('/concierto-program');
    expect(html).toContain('/front-desk');
    expect(html).toContain('Check In');
    expect(html).toContain('visit-golden-path__step--here');
    expect(html).toContain('visit-golden-path__step--primary');
  });

  it('marks Check In step here on front-desk page', () => {
    const html = renderVisitGoldenPathHtml('front-desk', { anchorFrontDesk: '/front-desk' });
    expect(html).toContain('/front-desk');
    expect(html).toContain('Check In · Sound on');
    expect(html).toContain('Check-in program');
    expect(html).toContain('/front-desk-program');
    expect(html).toContain('visit-golden-path--front-desk');
    expect(html).toContain('Creator Studio');
  });

  it('marks Reading Room as sole step on reading-room page', () => {
    const html = renderVisitGoldenPathHtml('reading-room');
    expect(html).toContain('/reading-room');
    expect(html).not.toContain('Browse papers');
    expect(html).not.toContain('/reading-room#papers');
    expect(html).toContain('visit-golden-path--reading-room');
    expect(html).toContain('Check In');
  });

  it('front-desk hero CTAs favor check-in program and playlist', () => {
    const html = renderVisitGoldenPathHeroCtasHtml('front-desk');
    expect(html).toContain('/front-desk-program');
    expect(html).toContain('playlist=pl-reception');
    expect(html).toContain('/creator-studio');
  });

  it('hero CTAs favor program and Check In over five parallel doors', () => {
    const canvas = renderVisitGoldenPathHeroCtasHtml('canvas');
    const ship = renderVisitGoldenPathHeroCtasHtml('ship');
    expect(canvas).toContain('/concierto-program');
    expect(canvas).toContain('/front-desk');
    expect(canvas).toContain('Check In');
    expect(ship).toContain('/concierto-program');
    expect(ship).toContain('/front-desk');
    expect(ship).toContain('Check In');
    expect(ship).toContain('href="/journey"');
  });

  it('landing and ship board ship the golden path strip', () => {
    const canvas = read('interfaces/omniverse-canvas.html');
    const ship = read('interfaces/vibelandia-questfest.html');
    const frontDesk = read('interfaces/front-desk.html');
    expect(canvas).toContain('visit-golden-path');
    expect(canvas).toContain('VISIT_GOLDEN_PATH_START');
    expect(canvas).toContain('Exhibit · Sound on');
    expect(ship).toContain('visit-golden-path');
    expect(ship).toContain('VISIT_GOLDEN_PATH_START');
    expect(ship).toContain('Concert program');
    expect(ship).toContain('Your cruise line · five doors');
    expect(frontDesk).toContain('visit-golden-path--front-desk');
    expect(frontDesk).toContain('Check-in program');
    const readingRoom = read('interfaces/reading-room.html');
    expect(readingRoom).toContain('visit-golden-path--reading-room');
    expect(readingRoom).toContain('data-youtube-id="VXZL77ub8DY"');
    expect(readingRoom).toContain('ep-hero--reading-room');
    expect(readingRoom).toContain('ep-hero__video-embed');
    expect(readingRoom).not.toContain('rr-prelude');
    expect(readingRoom).not.toContain('data-youtube-start');
    expect(readingRoom).not.toContain('Browse papers');
    expect(readingRoom).not.toContain('Open concert in jukebox');
    expect(readingRoom).toContain('Concert program');
    expect(readingRoom).toContain('id="papers"');
  });

  it('site gravity audit reflects improved funnel clarity', () => {
    const audit = read('interfaces/site-gravity-audit-2026-08.html');
    expect(audit).toContain('Funnel clarity <strong>8/10</strong>');
    expect(audit).toContain('golden path');
  });
});
