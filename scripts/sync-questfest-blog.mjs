#!/usr/bin/env node
/**
 * Inject six most recent ship-blog notes into interfaces/vibelandia-questfest.html
 * Markers: <!-- QUESTFEST_BLOG_START --> … <!-- QUESTFEST_BLOG_END -->
 * Cards open plain-language posts from lib/questfest-blog-posts.mjs (not bare paper titles).
 * Latest six is most recent → least recent. Every new paper needs a note.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listRecentPaperBlogPosts, renderQuestfestBlogHtml } from '../lib/questfest-blog.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TARGET = path.join(ROOT, 'interfaces', 'vibelandia-questfest.html');
const START = '<!-- QUESTFEST_BLOG_START -->';
const END = '<!-- QUESTFEST_BLOG_END -->';

const html = fs.readFileSync(TARGET, 'utf8');
const posts = listRecentPaperBlogPosts(6);
const block = `${START}\n${renderQuestfestBlogHtml(posts)}${END}`;

let next;
if (html.includes(START) && html.includes(END)) {
  const re = new RegExp(
    `${START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
  );
  next = html.replace(re, block);
} else {
  // Insert before footer
  const footer = html.indexOf('<footer>');
  if (footer < 0) {
    console.error('No footer marker and no blog markers in questfest HTML');
    process.exitCode = 1;
    process.exit();
  }
  next = `${html.slice(0, footer)}${block}\n\n${html.slice(footer)}`;
}

fs.writeFileSync(TARGET, next);
console.log(
  JSON.stringify(
    {
      ok: true,
      file: 'interfaces/vibelandia-questfest.html',
      posts: posts.map((p) => ({ id: p.id, published: p.published })),
    },
    null,
    2,
  ),
);
