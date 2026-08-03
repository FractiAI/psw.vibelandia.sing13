/**
 * Scan interfaces HTML pages (recursive) and sync README + interfaces/index.html.
 * Markers: <!-- interfaces-index:start --> … <!-- interfaces-index:end -->
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

export const README_REL = 'README.md';
export const HTML_PAGE_REL = 'interfaces/index.html';
export const INTERFACES_DIR = 'interfaces';
export const START_MARK = '<!-- interfaces-index:start -->';
export const END_MARK = '<!-- interfaces-index:end -->';

const SKIP_DIR_NAMES = new Set([
  'node_modules',
  'assets',
  'partials',
  'dist',
  '.git',
]);

function toPosix(p) {
  return p.split(sep).join('/');
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function walkHtml(absDir, rootAbs, out = []) {
  let entries;
  try {
    entries = await readdir(absDir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    const abs = join(absDir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIR_NAMES.has(ent.name)) continue;
      await walkHtml(abs, rootAbs, out);
      continue;
    }
    if (!ent.isFile()) continue;
    if (!/\.html?$/i.test(ent.name)) continue;
    const rel = toPosix(relative(rootAbs, abs));
    out.push(rel);
  }
  return out;
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return '';
  return m[1]
    .replace(/\s+/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
    .slice(0, 120);
}

function groupKey(relFromInterfaces) {
  const parts = relFromInterfaces.split('/');
  if (parts.length === 1) return '_root';
  return parts[0];
}

function sectionHeadingMd(key) {
  if (key === '_root') return '### Root (`/interfaces/`)';
  return `### \`${key}/\` (\`/interfaces/${key}/\`)`;
}

function sectionHeadingHtml(key) {
  if (key === '_root') return 'Root (/interfaces/)';
  return `${key}/ (/interfaces/${key}/)`;
}

/**
 * @param {string} cwd
 * @returns {Promise<{ rows: Array<{ rel: string, url: string, title: string, group: string }>, groupKeys: string[], groups: Map<string, any[]> }>}
 */
export async function collectInterfacesRows(cwd) {
  const interfacesAbs = join(cwd, INTERFACES_DIR);
  const files = (await walkHtml(interfacesAbs, interfacesAbs)).sort((a, b) =>
    a.localeCompare(b, 'en'),
  );

  const rows = [];
  for (const rel of files) {
    const abs = join(interfacesAbs, rel);
    let title = '';
    try {
      const html = await readFile(abs, 'utf8');
      title = extractTitle(html);
    } catch {
      title = '';
    }
    const url = `/interfaces/${rel}`;
    rows.push({ rel, url, title, group: groupKey(rel) });
  }

  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row.group)) groups.set(row.group, []);
    groups.get(row.group).push(row);
  }

  const groupKeys = [...groups.keys()].sort((a, b) => {
    if (a === '_root') return -1;
    if (b === '_root') return 1;
    return a.localeCompare(b, 'en');
  });

  return { rows, groupKeys, groups };
}

function buildMarkdownListing(rows, groupKeys, groups) {
  const listingBody = [];
  for (const key of groupKeys) {
    listingBody.push(sectionHeadingMd(key));
    listingBody.push('');
    listingBody.push('| Path | Title |');
    listingBody.push('|------|-------|');
    for (const row of groups.get(key)) {
      const titleCell = row.title ? row.title.replace(/\|/g, '\\|') : '—';
      listingBody.push(`| [\`${row.url}\`](${row.url}) | ${titleCell} |`);
    }
    listingBody.push('');
  }
  return listingBody.join('\n');
}

function buildHtmlListing(rows, groupKeys, groups, generatedAt) {
  const parts = [
    `<p class="ix-meta">Auto-generated <strong>${escapeHtml(generatedAt)}</strong> · <strong>${rows.length}</strong> HTML pages under <code>interfaces/</code>. Skips <code>assets/</code>, <code>partials/</code>, and <code>node_modules/</code>.</p>`,
    '',
  ];
  for (const key of groupKeys) {
    const label = sectionHeadingHtml(key);
    parts.push(`<section class="ix-group" data-group="${escapeHtml(key)}">`);
    parts.push(`  <h2>${escapeHtml(label)}</h2>`);
    parts.push('  <ul class="ix-list">');
    for (const row of groups.get(key)) {
      const title = row.title || '—';
      const search = `${row.url} ${title}`.toLowerCase();
      parts.push(
        `    <li data-search="${escapeHtml(search)}"><a href="${escapeHtml(row.url)}"><code>${escapeHtml(row.url)}</code><span class="ix-title">${escapeHtml(title)}</span></a></li>`,
      );
    }
    parts.push('  </ul>');
    parts.push('</section>');
    parts.push('');
  }
  return parts.join('\n');
}

function preserveGeneratedAt(priorText, listingCore) {
  let generatedAt = new Date().toISOString().slice(0, 10);
  if (!priorText.includes(START_MARK) || !priorText.includes(END_MARK)) {
    return generatedAt;
  }
  const prevBlock = priorText
    .slice(priorText.indexOf(START_MARK), priorText.indexOf(END_MARK) + END_MARK.length)
    .replace(/\r\n/g, '\n');
  const prevCore = prevBlock
    .replace(START_MARK, '')
    .replace(END_MARK, '')
    .replace(/^> Auto-generated[^\n]*\n/m, '')
    .replace(/^> Regenerate:[^\n]*\n/gm, '')
    .replace(/^> Skips:[^\n]*\n/gm, '')
    .replace(/<p class="ix-meta">[\s\S]*?<\/p>\n?/m, '')
    .trim();
  if (prevCore === listingCore.trim()) {
    const dateMatch =
      prevBlock.match(/> Auto-generated \*\*(\d{4}-\d{2}-\d{2})\*\*/) ||
      prevBlock.match(/Auto-generated <strong>(\d{4}-\d{2}-\d{2})<\/strong>/);
    if (dateMatch) generatedAt = dateMatch[1];
  }
  return generatedAt;
}

function replaceMarkedBlock(text, block) {
  const nl = text.includes('\r\n') ? '\r\n' : '\n';
  const blockForFile = nl === '\r\n' ? block.replace(/\n/g, '\r\n') : block;
  if (text.includes(START_MARK) && text.includes(END_MARK)) {
    const re = new RegExp(
      `${escapeRegExp(START_MARK)}[\\s\\S]*?${escapeRegExp(END_MARK)}`,
      'm',
    );
    const next = text.replace(re, () => blockForFile);
    return { next, changed: next !== text };
  }
  return { next: text, changed: false, missing: true };
}

/**
 * Sync README.md interfaces listing.
 * @param {{ cwd?: string, catalog?: Awaited<ReturnType<typeof collectInterfacesRows>> }} [opts]
 */
export async function syncInterfacesReadmeIndex(opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const catalog = opts.catalog || (await collectInterfacesRows(cwd));
  const { rows, groupKeys, groups } = catalog;
  const listingCore = buildMarkdownListing(rows, groupKeys, groups);
  const readmeAbs = join(cwd, README_REL);

  let prior = '';
  try {
    prior = await readFile(readmeAbs, 'utf8');
  } catch {
    prior = '';
  }

  const generatedAt = preserveGeneratedAt(prior, listingCore);
  const block = [
    START_MARK,
    '',
    `> Auto-generated **${generatedAt}** · **${rows.length}** HTML pages under \`interfaces/\`.`,
    `> Regenerate: \`npm run sync:interfaces-index\` (also runs from the Cursor interfaces-index hook when interfaces HTML changes).`,
    `> Skips \`assets/\`, \`partials/\`, and \`node_modules/\`. Live page: [\`/interfaces/\`](/interfaces/).`,
    '',
    listingCore,
    END_MARK,
  ].join('\n');

  let readme = prior;
  if (!readme) {
    throw new Error(`Missing ${README_REL}`);
  }

  const replaced = replaceMarkedBlock(readme, block);
  if (!replaced.missing) {
    if (replaced.changed) await writeFile(readmeAbs, replaced.next, 'utf8');
    return { changed: replaced.changed, count: rows.length, generatedAt, path: README_REL };
  }

  const nl = readme.includes('\r\n') ? '\r\n' : '\n';
  const sectionHeader = `${nl}${nl}## Interfaces · HTML pages${nl}${nl}Listing of ship UI HTML entry points under \`interfaces/\`.${nl}${nl}`;
  const blockForFile = nl === '\r\n' ? block.replace(/\n/g, '\r\n') : block;
  const next = readme.replace(/\s*$/, '') + sectionHeader + blockForFile + nl;
  await writeFile(readmeAbs, next, 'utf8');
  return { changed: true, count: rows.length, generatedAt, path: README_REL };
}

/**
 * Sync interfaces/index.html listing body.
 * @param {{ cwd?: string, catalog?: Awaited<ReturnType<typeof collectInterfacesRows>> }} [opts]
 */
export async function syncInterfacesHtmlPage(opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const catalog = opts.catalog || (await collectInterfacesRows(cwd));
  const { rows, groupKeys, groups } = catalog;
  const htmlAbs = join(cwd, HTML_PAGE_REL);

  let prior = '';
  try {
    prior = await readFile(htmlAbs, 'utf8');
  } catch {
    throw new Error(`Missing ${HTML_PAGE_REL} — create the shell page first`);
  }

  // Compare listing without meta line for date stability.
  const listingWithoutMeta = (() => {
    const parts = [];
    for (const key of groupKeys) {
      const label = sectionHeadingHtml(key);
      parts.push(`<section class="ix-group" data-group="${escapeHtml(key)}">`);
      parts.push(`  <h2>${escapeHtml(label)}</h2>`);
      parts.push('  <ul class="ix-list">');
      for (const row of groups.get(key)) {
        const title = row.title || '—';
        const search = `${row.url} ${title}`.toLowerCase();
        parts.push(
          `    <li data-search="${escapeHtml(search)}"><a href="${escapeHtml(row.url)}"><code>${escapeHtml(row.url)}</code><span class="ix-title">${escapeHtml(title)}</span></a></li>`,
        );
      }
      parts.push('  </ul>');
      parts.push('</section>');
      parts.push('');
    }
    return parts.join('\n');
  })();

  const generatedAt = preserveGeneratedAt(prior, listingWithoutMeta);
  const listingHtml = buildHtmlListing(rows, groupKeys, groups, generatedAt);
  const block = [START_MARK, '', listingHtml.trimEnd(), '', END_MARK].join('\n');

  const replaced = replaceMarkedBlock(prior, block);
  if (replaced.missing) {
    throw new Error(`${HTML_PAGE_REL} is missing ${START_MARK} / ${END_MARK} markers`);
  }
  if (replaced.changed) await writeFile(htmlAbs, replaced.next, 'utf8');
  return { changed: replaced.changed, count: rows.length, generatedAt, path: HTML_PAGE_REL };
}

/**
 * Sync README + interfaces/index.html from one scan.
 * @param {{ cwd?: string }} [opts]
 */
export async function syncInterfacesIndex(opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const catalog = await collectInterfacesRows(cwd);
  const readme = await syncInterfacesReadmeIndex({ cwd, catalog });
  const html = await syncInterfacesHtmlPage({ cwd, catalog });
  return {
    changed: readme.changed || html.changed,
    count: catalog.rows.length,
    generatedAt: readme.generatedAt,
    readme,
    html,
  };
}

export function isInterfacesHtmlRel(relPath) {
  const r = String(relPath || '').replace(/\\/g, '/');
  if (!/^interfaces\//i.test(r)) return false;
  if (!/\.html?$/i.test(r)) return false;
  if (/\/(assets|partials|node_modules)\//i.test(r)) return false;
  // Avoid re-entry when the generated index page is written.
  if (/^interfaces\/index\.html$/i.test(r)) return false;
  return true;
}
