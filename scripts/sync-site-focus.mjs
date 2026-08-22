#!/usr/bin/env node
/**
 * Sync site focus copy — frontiersmen Players + their set — across guest surfaces.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SITE_BLOG_LEAD,
  SITE_BROCHURE_LEAD,
  SITE_BROCHURE_TAGLINE,
  SITE_FOCUS_CANONICAL,
  SITE_HERO_TAGLINE,
  SITE_META_DESCRIPTION,
  SITE_PAGE_TITLE,
  SITE_PRIMER_LINE,
} from '../lib/site-focus.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function patchMarkedBlock(html, start, end, block) {
  if (html.includes(start) && html.includes(end)) {
    const re = new RegExp(
      `${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    );
    return html.replace(re, `${start}\n      ${block}\n      ${end}`);
  }
  return null;
}

const questfestPath = path.join(ROOT, 'interfaces', 'vibelandia-questfest.html');
let questfest = fs.readFileSync(questfestPath, 'utf8');

questfest = questfest.replace(
  /<title>SS Vibelandia · Frontiersman Voyage · Holographic Resort Vessel<\/title>/,
  `<title>${SITE_PAGE_TITLE}</title>`,
);
questfest = questfest.replace(
  /<meta name="description" content="[^"]*" \/>/,
  `<meta name="description" content="${SITE_META_DESCRIPTION}" />`,
);
questfest = questfest.replace(
  /<meta property="og:description" content="Not just a cruise[^"]*" \/>/,
  `<meta property="og:description" content="${SITE_META_DESCRIPTION}" />`,
);
questfest = questfest.replace(
  /<meta name="twitter:description" content="Not just a cruise[^"]*" \/>/,
  `<meta name="twitter:description" content="${SITE_META_DESCRIPTION}" />`,
);

const heroStart = '<!-- SITE_FOCUS_HERO_START -->';
const heroEnd = '<!-- SITE_FOCUS_HERO_END -->';
const heroBlock = `<p class="hero-tagline">${SITE_HERO_TAGLINE}</p>
      <p class="primer">\n        ${SITE_PRIMER_LINE}\n      </p>`;
let next = patchMarkedBlock(questfest, heroStart, heroEnd, heroBlock);
if (next) {
  questfest = next;
} else {
  questfest = questfest.replace(
    /<p class="hero-tagline">[\s\S]*?<\/p>\s*\n      <p class="primer">[\s\S]*?<\/p>/,
    `${heroStart}\n      ${heroBlock}\n      ${heroEnd}`,
  );
}
fs.writeFileSync(questfestPath, questfest);

const brochurePath = path.join(ROOT, 'interfaces', 'frontiersman-voyage-brochure.html');
let brochure = fs.readFileSync(brochurePath, 'utf8');
brochure = brochure.replace(
  /<meta name="description" content="Official Frontiersman Voyage Brochure[^"]*" \/>/,
  `<meta name="description" content="${SITE_META_DESCRIPTION}" />`,
);
const leadStart = '<!-- SITE_FOCUS_LEAD_START -->';
const leadEnd = '<!-- SITE_FOCUS_LEAD_END -->';
next = patchMarkedBlock(brochure, leadStart, leadEnd, `<p class="lead">${SITE_BROCHURE_LEAD}</p>`);
if (next) {
  brochure = next;
} else {
  brochure = brochure.replace(
    /<p class="lead">Welcome aboard\. SS Vibelandia[\s\S]*?<\/p>/,
    `${leadStart}\n    <p class="lead">${SITE_BROCHURE_LEAD}</p>\n    ${leadEnd}`,
  );
}
brochure = brochure.replace(
  /<p class="tagline">Not just a cruise[\s\S]*?Y-Chromosome Frontiersmen<\/p>/,
  `<p class="tagline">${SITE_BROCHURE_TAGLINE}</p>`,
);
fs.writeFileSync(brochurePath, brochure);

const blogPath = path.join(ROOT, 'interfaces', 'blog-frontiersman-voyage-2026-08.html');
let blog = fs.readFileSync(blogPath, 'utf8');
blog = blog.replace(
  /<meta name="description" content="Plain-language on-ramp to SS Vibelandia[^"]*" \/>/,
  `<meta name="description" content="${SITE_META_DESCRIPTION}" />`,
);
blog = blog.replace(
  /<p class="lead">This ship is a holographic resort vessel[\s\S]*?wherever you are\.<\/p>/,
  `<p class="lead">${SITE_BLOG_LEAD}</p>`,
);
fs.writeFileSync(blogPath, blog);

console.log(
  JSON.stringify(
    {
      ok: true,
      focus: SITE_FOCUS_CANONICAL,
      patched: [
        'interfaces/vibelandia-questfest.html',
        'interfaces/frontiersman-voyage-brochure.html',
        'interfaces/blog-frontiersman-voyage-2026-08.html',
      ],
    },
    null,
    2,
  ),
);
