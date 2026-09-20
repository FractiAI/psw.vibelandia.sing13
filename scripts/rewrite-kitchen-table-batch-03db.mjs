#!/usr/bin/env node
/**
 * Kitchen-table continuous-prose rewrite for ship-blog batch.
 * Preserves nav / header / CTA / footer; replaces body + honesty.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { auditShipBlogFile } from '../lib/ship-blog-magazine.mjs';
import { REWRITES } from './kitchen-table-bodies/batch-bodies.mjs';

const DIR = join(process.cwd(), 'interfaces');

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

${bodyHtml}

    ${honestyHtml}
${fair}
    ${cta}
    ${footer}
  </article>`;
  return html.replace(artMatch[0], newArticle);
}

const results = [];
for (const [file, { body, honesty }] of Object.entries(REWRITES)) {
  const path = join(DIR, file);
  const html = readFileSync(path, 'utf8');
  const next = replaceCore(html, body, honesty);
  writeFileSync(path, next);
  const a = auditShipBlogFile(path);
  const fail = [];
  if (!a.passesLength) fail.push('len=' + a.words);
  if (!a.honestyEnd) fail.push('honesty');
  if (!a.voice.passes) {
    const v = a.voice;
    fail.push(
      `voice soft=${v.softStory} ref=${v.refusalH2} dnc=${v.doesNotClaim} meta=${v.metaJargon} tab=${v.tables} empty=${v.emptyWorkshopMetaphor} everyday=${v.everydayAnchors}`,
    );
  }
  results.push({
    file,
    words: a.words,
    ok: fail.length === 0,
    fail: fail.join('; '),
  });
}

console.log(JSON.stringify(results, null, 2));
const fails = results.filter((r) => !r.ok);
console.log('\nFAILS:', fails.length ? fails.map((f) => f.file + ' ' + f.fail).join('\n') : 'none');
