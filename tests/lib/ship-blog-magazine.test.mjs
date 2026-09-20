import { describe, expect, it } from 'vitest';
import {
  SHIP_BLOG_MIN_ARTICLE_WORDS,
  SHIP_BLOG_JOURNALISM_WINDOW,
  auditAllShipBlogs,
  auditShipBlogFile,
  listRecentShipBlogHtmlFiles,
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

  it(`locks the ${SHIP_BLOG_JOURNALISM_WINDOW} newest notes to journalism voice (not legal-brief body)`, async () => {
    const recent = await listRecentShipBlogHtmlFiles(SHIP_BLOG_JOURNALISM_WINDOW);
    expect(recent.length).toBe(SHIP_BLOG_JOURNALISM_WINDOW);
    const fails = [];
    for (const row of recent) {
      const audit = auditShipBlogFile(row.file);
      if (!audit.passesVoice) {
        fails.push(
          `${row.file.split('/').pop()}: softStory=${audit.voice.softStory} refusalH2=${audit.voice.refusalH2} doesNotClaim=${audit.voice.doesNotClaim} meta=${audit.voice.metaJargon} tables=${audit.voice.tables}`,
        );
      }
    }
    expect(fails).toEqual([]);
  });
});
