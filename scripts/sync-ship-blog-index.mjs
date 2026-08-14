#!/usr/bin/env node
/**
 * Generate interfaces/ship-blog-index.html from lib/questfest-blog.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderShipBlogIndexPageHtml, listAllShipBlogPosts } from '../lib/questfest-blog.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TARGET = path.join(ROOT, 'interfaces', 'ship-blog-index.html');

const posts = listAllShipBlogPosts();
fs.writeFileSync(TARGET, renderShipBlogIndexPageHtml(posts));
console.log(
  JSON.stringify(
    { ok: true, file: 'interfaces/ship-blog-index.html', count: posts.length },
    null,
    2,
  ),
);
