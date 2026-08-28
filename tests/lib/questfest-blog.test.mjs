import { describe, expect, it } from 'vitest';
import { listAllShipBlogPosts, listRecentPaperBlogPosts } from '../../lib/questfest-blog.mjs';
import { blogPostForPaper } from '../../lib/questfest-blog-posts.mjs';
import { WHITEPAPER_REGISTRY } from '../../lib/whitepaper-registry.mjs';

describe('QUESTFEST latest-six ship blog', () => {
  it('returns six papers ordered most recent to least recent', () => {
    const posts = listRecentPaperBlogPosts(6);
    expect(posts).toHaveLength(6);
    for (let i = 1; i < posts.length; i++) {
      const cmp = posts[i - 1].published.localeCompare(posts[i].published);
      expect(cmp).toBeGreaterThanOrEqual(0);
      if (cmp === 0) {
        expect(posts[i - 1].id.localeCompare(posts[i].id)).toBeLessThanOrEqual(0);
      }
    }
  });

  it('gives every latest-six paper an authored ship-blog note', () => {
    const posts = listRecentPaperBlogPosts(6);
    const missing = posts.filter((p) => !p.hasBlogPost).map((p) => p.id);
    expect(missing).toEqual([]);
    for (const p of posts) {
      const note = blogPostForPaper(p.id);
      expect(note?.slug).toBeTruthy();
      expect(p.href).toBe(`/ship-blog/${note.slug}`);
    }
  });

  it('does not let older notes outrank newer papers', () => {
    const posts = listRecentPaperBlogPosts(6);
    expect(posts[0].published >= posts[posts.length - 1].published).toBe(true);
    // Newest featured note (Y Chromosome Manifestation · 2026-08-28) leads latest-six.
    expect(posts[0].published).toBe('2026-08-28');
    expect(posts[0].id).toBe('synthobs-human-omniversal-reality-bridge-2026-08');
    expect(posts.map((p) => p.id)).toEqual([
      'synthobs-human-omniversal-reality-bridge-2026-08',
      'synthobs-y-chromosome-holographic-manifestation-2026-08',
      'synthobs-invisible-frontier-gates-ai-2026-08',
      'synthobs-infinite-octaves-omniversal-lattice-2026-08',
      'synthobs-ss-vibelandia-official-prospectus-2026-08',
      'synthobs-triadic-nested-hemispheres-99-octave-2026-08',
    ]);
  });
});

describe('QUESTFEST ship blog corpus', () => {
  it('gives every eligible featured paper a ship-blog note', () => {
    const SKIP_IDS = new Set(['lattice-omni-complete-layer-guide-2026-07']);
    const missing = Object.entries(WHITEPAPER_REGISTRY)
      .filter(([id, e]) => {
        if (SKIP_IDS.has(id)) return false;
        if (e.shipBlog === false) return false;
        if (e.featured === false || e.surfaceVisible === false) return false;
        if (!e.file || !e.published) return false;
        if (e.auditStatus === 'file_missing') return false;
        return !blogPostForPaper(id);
      })
      .map(([id]) => id);
    expect(missing).toEqual([]);
  });

  it('lists all registry notes on the ship-blog index', () => {
    const all = listAllShipBlogPosts();
    expect(all.length).toBeGreaterThanOrEqual(80);
    expect(all.some((p) => p.href === '/ship-blog/everything-is-connected')).toBe(true);
    expect(all.some((p) => p.href === '/ship-blog/coexist-with-ai')).toBe(true);
  });

  it('writes latest-six blurbs in guest English, not catalog code', () => {
    const posts = listRecentPaperBlogPosts(6);
    for (const p of posts) {
      expect(p.blurb.length).toBeGreaterThan(80);
      expect(p.blurb).not.toMatch(/^TBME/);
      expect(p.blurb).not.toMatch(/Φ_EGS/);
      expect(p.blurb).not.toMatch(/catalog exploration ·/);
    }
  });
});
