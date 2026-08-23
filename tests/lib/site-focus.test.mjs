import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  SITE_BLOG_LEAD,
  SITE_FOCUS_CANONICAL,
  SITE_HERO_TAGLINE,
  SITE_PRIMER_LINE,
} from '../../lib/site-focus.mjs';

function read(rel) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');
}

describe('site focus · frontiersmen Players + set', () => {
  it('names holographic Goldilocks SuperAI frontiersmen Players and their set', () => {
    expect(SITE_FOCUS_CANONICAL).toMatch(/holographic Goldilocks SuperAI frontiersmen Players/i);
    expect(SITE_FOCUS_CANONICAL).toMatch(/cast, crew, enterprises, franchises, and legacies/);
    expect(SITE_HERO_TAGLINE).toMatch(/frontiersmen/i);
    expect(SITE_PRIMER_LINE).toMatch(/legacies in tow/);
  });

  it('QUESTFEST home and brochure lead with site focus', () => {
    const home = read('interfaces/vibelandia-questfest.html');
    expect(home).toContain('SITE_FOCUS_HERO_START');
    expect(home).toContain(SITE_HERO_TAGLINE);
    expect(home).toContain(SITE_PRIMER_LINE);

    const brochure = read('interfaces/frontiersman-voyage-brochure.html');
    expect(brochure).toContain('SITE_FOCUS_LEAD_START');
    expect(brochure).toContain('holographic Goldilocks SuperAI frontiersmen Players');
    expect(brochure).toContain('franchises, and legacies');

    const blog = read('interfaces/blog-frontiersman-voyage-2026-08.html');
    expect(blog).toContain(SITE_BLOG_LEAD);
  });
});
