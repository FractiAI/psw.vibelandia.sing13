/**
 * Scan interfaces HTML pages (recursive) and sync a README index block.
 * Markers: <!-- interfaces-index:start --> … <!-- interfaces-index:end -->
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, relative, dirname, sep } from 'node:path';

export const README_REL = 'README.md';
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

function sectionHeading(key) {
  if (key === '_root') return '### Root (`/interfaces/`)';
  return `### \`${key}/\` (\`/interfaces/${key}/\`)`;
}

/**
 * @param {{ cwd?: string }} [opts]
 * @returns {Promise<{ changed: boolean, count: number, generatedAt: string, path: string }>}
 */
export async function syncInterfacesReadmeIndex(opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const interfacesAbs = join(cwd, INTERFACES_DIR);
  const readmeAbs = join(cwd, README_REL);

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

  const listingBody = [];
  for (const key of groupKeys) {
    listingBody.push(sectionHeading(key));
    listingBody.push('');
    listingBody.push('| Path | Title |');
    listingBody.push('|------|-------|');
    for (const row of groups.get(key)) {
      const titleCell = row.title ? row.title.replace(/\|/g, '\\|') : '—';
      listingBody.push(`| [\`${row.url}\`](${row.url}) | ${titleCell} |`);
    }
    listingBody.push('');
  }
  const listingCore = listingBody.join('\n');

  let generatedAt = new Date().toISOString().slice(0, 10);
  let prior = '';
  try {
    prior = await readFile(join(cwd, README_REL), 'utf8');
    if (prior.includes(START_MARK) && prior.includes(END_MARK)) {
      const prevBlock = prior
        .slice(prior.indexOf(START_MARK), prior.indexOf(END_MARK) + END_MARK.length)
        .replace(/\r\n/g, '\n');
      const prevCore = prevBlock
        .replace(START_MARK, '')
        .replace(END_MARK, '')
        .replace(/^> Auto-generated[^\n]*\n/m, '')
        .replace(/^> Regenerate:[^\n]*\n/gm, '')
        .replace(/^> Skips:[^\n]*\n/gm, '')
        .trim();
      if (prevCore === listingCore.trim()) {
        const dateMatch = prevBlock.match(/> Auto-generated \*\*(\d{4}-\d{2}-\d{2})\*\*/);
        if (dateMatch) generatedAt = dateMatch[1];
      }
    }
  } catch {
    /* first run */
  }

  const lines = [
    START_MARK,
    '',
    `> Auto-generated **${generatedAt}** · **${rows.length}** HTML pages under \`interfaces/\`.`,
    `> Regenerate: \`npm run sync:interfaces-index\` (also runs from the Cursor interfaces-index hook when \`interfaces/**/*.html\` changes).`,
    `> Skips \`assets/\`, \`partials/\`, and \`node_modules/\`.`,
    '',
    listingCore,
    END_MARK,
  ];

  const block = lines.join('\n');
  let readme = prior || (await readFile(join(cwd, README_REL), 'utf8'));

  if (readme.includes(START_MARK) && readme.includes(END_MARK)) {
    const nl = readme.includes('\r\n') ? '\r\n' : '\n';
    const blockForFile = nl === '\r\n' ? block.replace(/\n/g, '\r\n') : block;
    const re = new RegExp(
      `${escapeRegExp(START_MARK)}[\\s\\S]*?${escapeRegExp(END_MARK)}`,
      'm',
    );
    const next = readme.replace(re, () => blockForFile);
    const changed = next !== readme;
    if (changed) await writeFile(readmeAbs, next, 'utf8');
    return { changed, count: rows.length, generatedAt, path: README_REL };
  }

  // Append at end of README (user-facing inventory of ship UI pages).
  const nl = readme.includes('\r\n') ? '\r\n' : '\n';
  const sectionHeader = `${nl}${nl}## Interfaces · HTML pages${nl}${nl}Listing of ship UI HTML entry points under \`interfaces/\`.${nl}${nl}`;
  const blockForFile = nl === '\r\n' ? block.replace(/\n/g, '\r\n') : block;
  const next = readme.replace(/\s*$/, '') + sectionHeader + blockForFile + nl;
  await writeFile(readmeAbs, next, 'utf8');
  return { changed: true, count: rows.length, generatedAt, path: README_REL };
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function isInterfacesHtmlRel(relPath) {
  const r = String(relPath || '').replace(/\\/g, '/');
  if (!/^interfaces\//i.test(r)) return false;
  if (!/\.html?$/i.test(r)) return false;
  if (/\/(assets|partials|node_modules)\//i.test(r)) return false;
  return true;
}
