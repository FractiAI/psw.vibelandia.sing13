#!/usr/bin/env node
/**
 * Apply kitchen-table continuous-prose rewrites to assigned ship-blog HTML files.
 * Preserves nav / header / CTA / footer; replaces body + honesty.
 * Accepts either:
 *   - scripts/kitchen-table-bodies/*.mjs exporting { file, body, honesty }
 *   - scripts/kitchen-table-bodies/batch-bodies.mjs exporting { REWRITES }
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { auditShipBlogFile } from '../lib/ship-blog-magazine.mjs';

const DIR = join(process.cwd(), 'interfaces');
const BODIES = join(process.cwd(), 'scripts/kitchen-table-bodies');

function replaceCore(html, bodyHtml, honestyHtml) {
  const artMatch = html.match(/<article[\s\S]*?<\/article>/i);
  if (!artMatch) throw new Error('no article');
  const article = artMatch[0];
  const nav = (article.match(/<nav[\s\S]*?<\/nav>/i) || [''])[0];
  const header = (article.match(/<header[\s\S]*?<\/header>/i) || [''])[0];
  const cta = (article.match(/<div[^>]*class="[^"]*cta-row[^"]*"[\s\S]*?<\/div>/i) || [''])[0];
  const footer = (article.match(/<footer[\s\S]*?<\/footer>/i) || [''])[0];
  const fair = `\n    <p><em>Fair Exchange:</em> a portion of transaction value remains subject to refund or adjustment depending on resonance, utility, and depth of delivery.</p>\n`;
  const cls = (article.match(/<article([^>]*)>/i) || ['', ' class="wrap"'])[1];
  const newArticle = `<article${cls}>
 ${nav}
 ${header}

${bodyHtml.trim()}

 ${honestyHtml.trim()}
${fair}
    ${cta}
    ${footer}
  </article>`;
  return html.replace(artMatch[0], newArticle);
}

const jobs = [];

const batchPath = join(BODIES, 'batch-bodies.mjs');
if (existsSync(batchPath)) {
  const mod = await import(batchPath);
  const map = mod.REWRITES || mod.BODIES || {};
  for (const [file, payload] of Object.entries(map)) {
    jobs.push({ source: 'batch-bodies', file, ...payload });
  }
}

for (const name of readdirSync(BODIES).filter((n) => n.endsWith('.mjs') && n !== 'batch-bodies.mjs').sort()) {
  const mod = await import(join(BODIES, name));
  if (mod.file && mod.body && mod.honesty) {
    jobs.push({ source: basename(name), file: mod.file, body: mod.body, honesty: mod.honesty });
  }
}

const filter = process.argv.slice(2);
const selected = filter.length ? jobs.filter((j) => filter.includes(j.file)) : jobs;

const results = [];
for (const job of selected) {
  const { file, body, honesty } = job;
  if (!file || !body || !honesty) {
    results.push({ file, error: 'missing export' });
    continue;
  }
  const path = join(DIR, file);
  const html = readFileSync(path, 'utf8');
  const next = replaceCore(html, body, honesty);
  writeFileSync(path, next);
  const a = auditShipBlogFile(path);
  results.push({
    file,
    words: a.words,
    passesLength: a.passesLength,
    honestyEnd: a.honestyEnd,
    voice: a.voice.passes,
    soft: a.voice.softStory,
    dnc: a.voice.doesNotClaim,
    empty: a.voice.emptyWorkshopMetaphor,
    everyday: a.voice.everydayAnchors,
    ok: a.passesLength && a.honestyEnd && a.voice.passes,
  });
}

const ok = results.filter((r) => r.ok).length;
const fail = results.filter((r) => r.ok === false);
console.log(JSON.stringify({ rewritten: results.length, pass: ok, fail: fail.length, results, fails: fail }, null, 2));
process.exit(fail.length ? 2 : 0);
