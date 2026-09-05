import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  VOYAGE_JOURNEYS,
  VOYAGE_JOURNEY_INTRO,
  findJourney,
  journeyHref,
  renderJourneyDetailHtml,
  renderJourneyHubHtml,
} from '../../lib/voyage-journeys.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Voyage journeys · adventures hub', () => {
  it('defines nine curated adventures distinct from exhibit shells', () => {
    expect(VOYAGE_JOURNEYS.length).toBe(9);
    expect(VOYAGE_JOURNEY_INTRO).toContain('adventures we offer');
    expect(VOYAGE_JOURNEY_INTRO).not.toContain('deck SKUs');
    for (const j of VOYAGE_JOURNEYS) {
      expect(j.heroImage).toMatch(/^\/interfaces\/assets\//);
      expect(j.body.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('finds journeys by slug and renders detail without undefined lede', () => {
    const j = findJourney('puerto-reno-gangway');
    expect(j?.title).toContain('Puerto Reno');
    const html = renderJourneyDetailHtml(j);
    expect(html).toContain(j.lede);
    expect(html).not.toContain('undefined');
    expect(html).toContain(journeyHref(j.slug));
  });

  it('ships a unique image file for each adventure', () => {
    const used = new Set();
    for (const j of VOYAGE_JOURNEYS) {
      const rel = j.heroImage.replace(/^\//, '');
      expect(existsSync(join(ROOT, rel)), j.heroImage).toBe(true);
      expect(used.has(j.heroImage), `duplicate image ${j.heroImage}`).toBe(false);
      used.add(j.heroImage);
    }
    expect(findJourney('boriken-convergence')?.heroImage).toContain('journey-boriken-convergence');
    expect(findJourney('cartagena-spice-stone')?.heroImage).toContain('journey-cartagena-spice-stone');
    expect(findJourney('truckee-sierra-forage')?.heroImage).toContain('journey-truckee-sierra-forage');
    expect(findJourney('redwood-sanctuary')?.heroImage).toContain('journey-redwood-sanctuary');
    expect(findJourney('tahoe-catamaran')?.heroImage).toContain('journey-tahoe-catamaran');
    expect(findJourney('omniversal-canvas-walk')?.heroImage).toContain('exhibit-fiction-key');
  });

  it('hub HTML lists all journeys with images', () => {
    const html = renderJourneyHubHtml();
    expect(html).toContain('Journeys we offer');
    expect(html).toContain('/interfaces/journeys.css');
    for (const j of VOYAGE_JOURNEYS) {
      expect(html).toContain(journeyHref(j.slug));
      expect(html).toContain(j.heroImage);
    }
  });

  it('synced pages exist and /journey rewrites to hub not decks', () => {
    expect(existsSync(join(ROOT, 'interfaces/journeys.html'))).toBe(true);
    const vercel = read('vercel.json');
    expect(vercel).toContain('"source": "/journey"');
    expect(vercel).toContain('"destination": "/interfaces/journeys.html"');
    expect(vercel).not.toMatch(/"source": "\/journey"[\s\S]*?decks\.html/);

    for (const j of VOYAGE_JOURNEYS) {
      const file = join(ROOT, 'interfaces/journey', `${j.slug}.html`);
      expect(existsSync(file)).toBe(true);
      expect(vercel).toContain(`"source": "${journeyHref(j.slug)}"`);
      const html = read(`interfaces/journey/${j.slug}.html`);
      expect(html).toMatch(new RegExp(j.title.replace(/&/g, '&amp;').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      expect(html).toContain('Honesty');
    }
  });

  it('canvas landing injects rich shells and journeys teaser', () => {
    const canvas = read('interfaces/omniverse-canvas.html');
    expect(canvas).toContain('Host layer · horizon · three nested spheres');
    expect(canvas).toContain('shell-card');
    expect(canvas).toContain('exhibit-core-key.jpg');
    expect(canvas).toContain('Adventures we offer');
    expect(canvas).toContain('href="/journey"');
    expect(canvas).toContain('Browse adventures');
  });
});
