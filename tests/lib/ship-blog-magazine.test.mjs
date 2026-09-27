import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  SHIP_BLOG_MIN_ARTICLE_WORDS,
  SHIP_BLOG_JOURNALISM_WINDOW,
  SHIP_BLOG_ERFT_SHAPE_WINDOW,
  SHIP_BLOG_ERFT_VOICE_PEER_FILE,
  SHIP_BLOG_ERFT_VOICE_PEER_PATH,
  auditAllShipBlogs,
  auditShipBlogFile,
  erftResearchIntroShape,
  journalismVoiceSmell,
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

  it('locks every eligible ship-blog note to journalism voice (ERFT research-intro peer · Soft Story 0 · everyday anchors)', async () => {
    const recent = await listRecentShipBlogHtmlFiles(SHIP_BLOG_JOURNALISM_WINDOW);
    expect(recent.length).toBeGreaterThanOrEqual(80);
    const fails = [];
    for (const row of recent) {
      const audit = auditShipBlogFile(row.file);
      if (!audit.passesVoice) {
        fails.push(
          `${row.file.split('/').pop()}: softStory=${audit.voice.softStory} refusalH2=${audit.voice.refusalH2} doesNotClaim=${audit.voice.doesNotClaim} meta=${audit.voice.metaJargon} tables=${audit.voice.tables} emptyWorkshop=${audit.voice.emptyWorkshopMetaphor} everyday=${audit.voice.everydayAnchors}`,
        );
      }
    }
    expect(fails).toEqual([]);
  });

  it('also locks unregistered blog-*.html files that sit outside the registry map', () => {
    const audits = auditAllShipBlogs();
    const fails = audits
      .filter((a) => !a.passesVoice)
      .map(
        (a) =>
          `${a.file.split('/').pop()}: softStory=${a.voice.softStory} refusalH2=${a.voice.refusalH2} doesNotClaim=${a.voice.doesNotClaim} meta=${a.voice.metaJargon} tables=${a.voice.tables} emptyWorkshop=${a.voice.emptyWorkshopMetaphor} everyday=${a.voice.everydayAnchors}`,
      );
    expect(fails).toEqual([]);
  });

  it('pins the ERFT research-intro HTML as the canonical voice peer', () => {
    const html = readFileSync(SHIP_BLOG_ERFT_VOICE_PEER_PATH, 'utf8');
    expect(SHIP_BLOG_ERFT_VOICE_PEER_FILE).toBe('blog-erft-recursive-fidelity-2026-09.html');
    expect(html).toMatch(/When Information Rewrites Itself, Does φ Reduce the Drift\?/);
    expect(html).toMatch(/FractiAI Research/);
    const voice = journalismVoiceSmell(html);
    const shape = erftResearchIntroShape(html);
    expect(voice.passes).toBe(true);
    expect(shape.passes).toBe(true);
  });

  it(`locks the ${SHIP_BLOG_ERFT_SHAPE_WINDOW} newest ship-blog notes to ERFT research-intro shape`, async () => {
    const recent = await listRecentShipBlogHtmlFiles(SHIP_BLOG_ERFT_SHAPE_WINDOW);
    expect(recent.length).toBe(SHIP_BLOG_ERFT_SHAPE_WINDOW);
    const fails = [];
    for (const row of recent) {
      const html = readFileSync(row.file, 'utf8');
      const shape = erftResearchIntroShape(html);
      if (!shape.passes) {
        fails.push(
          `${row.file.split('/').pop()}: lead=${shape.hasLead} h2=${shape.h2Count} dateline=${shape.hasFractiAiDateline} honesty=${shape.hasHonesty} theater=${shape.shipBoardTheater}`,
        );
      }
    }
    expect(fails).toEqual([]);
  });
});
