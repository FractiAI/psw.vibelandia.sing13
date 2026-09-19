/**
 * QUESTFEST ship-blog magazine feature bar (Snap Amendment C · 2026-09-19).
 * Every interfaces/blog-*.html must be a longform feature — not a sound bite.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MIN_WORDS = 850;
const MIN_H2 = 3;

/** Outer ship-blog article (class=wrap), depth-aware so nested card <article>s do not truncate. */
function extractOuterArticle(html) {
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
  const wrapOpen = clean.match(/<article\b[^>]*class=["'][^"']*\bwrap\b[^"']*["'][^>]*>/i);
  const startIdx = wrapOpen ? wrapOpen.index : clean.search(/<article\b/i);
  if (startIdx < 0) return clean;
  const from = clean.slice(startIdx);
  let depth = 0;
  let end = from.length;
  for (const m of from.matchAll(/<\/?article\b[^>]*>/gi)) {
    const tag = m[0];
    if (/^<\//.test(tag)) {
      depth -= 1;
      if (depth === 0) {
        end = m.index + tag.length;
        break;
      }
    } else {
      depth += 1;
    }
  }
  return from.slice(0, end);
}

function articleMetrics(html) {
  const article = extractOuterArticle(html);
  const text = article.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text ? text.split(/\s+/).length : 0;
  const h2 = (article.match(/<h2\b/gi) || []).length;
  // End-rail honesty = the main article's `.honesty` paragraph (not micro-copy inside innovation cards).
  const honestyMatches = [...article.matchAll(/<p\b[^>]*class=["'][^"']*\bhonesty\b[^"']*["'][^>]*>/gi)];
  const honestyIdx = honestyMatches.length ? honestyMatches[honestyMatches.length - 1].index : -1;
  const leadIdx = article.search(/class=["'][^"']*\blead\b/i);
  const firstH2 = article.search(/<h2\b/i);
  return {
    words,
    h2,
    honestyIdx,
    leadIdx,
    firstH2,
    hasLead: leadIdx >= 0,
    hasHonesty: honestyIdx >= 0,
  };
}

describe('QUESTFEST ship-blog magazine feature (Amendment C)', () => {
  it(`requires every interfaces/blog-*.html ≥ ${MIN_WORDS} words, ≥ ${MIN_H2} h2, lead, end-rail honesty`, () => {
    const dir = path.join(ROOT, 'interfaces');
    const files = fs.readdirSync(dir).filter((f) => f.startsWith('blog-') && f.endsWith('.html')).sort();
    expect(files.length).toBeGreaterThanOrEqual(80);

    const failures = [];
    for (const f of files) {
      const rel = `interfaces/${f}`;
      const html = fs.readFileSync(path.join(dir, f), 'utf8');
      const m = articleMetrics(html);
      if (m.words < MIN_WORDS) failures.push(`${rel}: ${m.words} words (need ≥ ${MIN_WORDS})`);
      if (m.h2 < MIN_H2) failures.push(`${rel}: ${m.h2} h2 (need ≥ ${MIN_H2})`);
      if (!m.hasLead) failures.push(`${rel}: missing .lead`);
      if (!m.hasHonesty) failures.push(`${rel}: missing .honesty`);
      if (m.hasHonesty && m.hasLead && m.honestyIdx < m.leadIdx) {
        failures.push(`${rel}: honesty appears before lead`);
      }
      if (m.hasHonesty && m.firstH2 >= 0 && m.honestyIdx < m.firstH2) {
        failures.push(`${rel}: honesty before first h2 (must be end rail)`);
      }
    }

    const preview = failures.slice(0, 60).join('\n') + (failures.length > 60 ? `\n… +${failures.length - 60} more` : '');
    expect(failures, preview).toEqual([]);
  });
});
