#!/usr/bin/env node
/**
 * Apply a kitchen-table article body fragment into an existing ship-blog shell.
 * Usage: node scripts/apply-kitchen-table-body.mjs <blog-file.html> <body-fragment.html> [kicker]
 *
 * Body fragment = content between </header> and honesty <p>, no honesty/cta/footer.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { auditShipBlogFile } from '../lib/ship-blog-magazine.mjs';

const [, , blogName, bodyPath, kicker] = process.argv;
if (!blogName || !bodyPath) {
  console.error('Usage: apply-kitchen-table-body.mjs <blog.html> <body.html> [kicker]');
  process.exit(1);
}

const blogPath = blogName.startsWith('/') ? blogName : join(process.cwd(), 'interfaces', blogName);
const fragmentPath = bodyPath.startsWith('/') ? bodyPath : join(process.cwd(), bodyPath);

let html = readFileSync(blogPath, 'utf8');
const body = readFileSync(fragmentPath, 'utf8').trim();

if (kicker) {
  html = html.replace(
    /(<p class="kicker">)([\s\S]*?)(<\/p>)/i,
    `$1${kicker}$3`,
  );
}

const honestyRe = /<p[^>]*class="[^"]*honesty[^"]*"[\s\S]*?<\/p>/i;
const honestyMatch = html.match(honestyRe);
if (!honestyMatch) {
  console.error('No honesty rail found in', blogPath);
  process.exit(1);
}

const headerEnd = html.search(/<\/header>/i);
if (headerEnd < 0) {
  console.error('No </header> in', blogPath);
  process.exit(1);
}
const afterHeader = headerEnd + '</header>'.length;
const honestyIdx = html.indexOf(honestyMatch[0]);

const before = html.slice(0, afterHeader);
const after = html.slice(honestyIdx);
html = `${before}\n\n${body}\n\n${after}`;

writeFileSync(blogPath, html);
const a = auditShipBlogFile(blogPath);
const ok = a.passesLength && a.honestyEnd && a.voice.passes;
console.log(
  JSON.stringify({
    file: blogName,
    ok,
    words: a.words,
    honestyEnd: a.honestyEnd,
    voice: {
      soft: a.voice.softStory,
      dnc: a.voice.doesNotClaim,
      empty: a.voice.emptyWorkshopMetaphor,
      everyday: a.voice.everydayAnchors,
      refusalH2: a.voice.refusalH2,
      meta: a.voice.metaJargon,
      tables: a.voice.tables,
    },
  }),
);
process.exit(ok ? 0 : 2);
