import { describe, expect, it } from 'vitest';
import { listRecentPaperBlogPosts } from '../../lib/questfest-blog.mjs';
import { blogPostForPaper } from '../../lib/questfest-blog-posts.mjs';

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
    expect(posts.some((p) => p.id.includes('synthio-mri-vs-legacy'))).toBe(true);
    expect(posts.some((p) => p.id.includes('metamorphic-octaves'))).toBe(true);
  });
});
