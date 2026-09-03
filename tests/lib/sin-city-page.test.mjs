import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { renderSinCityPageHtml } from '../../lib/sin-city-page.mjs';
import { renderSinCityHeroHtml } from '../../lib/experience-page-hero.mjs';
import { PROGRAM_CTA_LABEL } from '../../lib/program-cta.mjs';
import { SIN_CITY_PROGRAM_ROUTE } from '../../lib/sin-city-program.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Sin City · experience page', () => {
  it('renders ep-hero shell with concert program CTA and Sound on', () => {
    const html = renderSinCityPageHtml();
    expect(html).toContain('ep-hero ep-hero--sin-city');
    expect(html).toContain(PROGRAM_CTA_LABEL);
    expect(html).toContain(SIN_CITY_PROGRAM_ROUTE);
    expect(html).toContain('qv-sound-mute__label">Sound on');
    expect(html).toContain('sin-city-hero-score');
    expect(html).toContain('J.S. Bach');
    expect(html).toContain('Suno AI');
    expect(html).toContain('Deck 3');
    expect(html).not.toContain('voyage-directory-hero');
    expect(renderSinCityHeroHtml()).toContain('ep-hero--sin-city');
  });

  it('is synced to deck-3-night.html with soundtrack + program', () => {
    const page = read('interfaces/voyage/deck-3-night.html');
    expect(page).toContain('ep-hero--sin-city');
    expect(page).toContain(PROGRAM_CTA_LABEL);
    expect(page).toContain('/sin-city-program');
    expect(page).toContain('sin-city-autoplay.js');
    expect(page).toContain('page-soundtrack.js');
    expect(page).toContain('experience-page-hero.css');
    expect(page).not.toContain('Download program (PDF)');
    expect(read('vercel.json')).toMatch(/"source":\s*"\/sin-city"/);
    expect(read('vercel.json')).toMatch(/"source":\s*"\/voyage\/deck-3-night"/);
  });
});
