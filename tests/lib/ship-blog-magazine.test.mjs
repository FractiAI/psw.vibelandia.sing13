import { describe, expect, it } from 'vitest';
import {
  SHIP_BLOG_MIN_ARTICLE_WORDS,
  auditAllShipBlogs,
} from '../../lib/ship-blog-magazine.mjs';

describe('QUESTFEST ship-blog magazine snap', () => {
  it(`locks every blog-*.html to ≥${SHIP_BLOG_MIN_ARTICLE_WORDS} article prose words`, () => {
    const audits = auditAllShipBlogs();
    expect(audits.length).toBeGreaterThanOrEqual(80);
    const short = audits
      .filter((a) => !a.passesLength)
      .map((a) => `${a.file.split('/').pop()}:${a.words}`);
    expect(short).toEqual([]);
  });

  it('keeps the honesty rail at the end of every ship-blog article', () => {
    const audits = auditAllShipBlogs();
    const early = audits
      .filter((a) => !a.honestyEnd)
      .map((a) => a.file.split('/').pop());
    expect(early).toEqual([]);
  });
});
