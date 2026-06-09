import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveWhitepaper, WHITEPAPER_REGISTRY } from './whitepaper-registry.mjs';
import { attributionHtmlBlock } from './synthobs-agent-attribution.mjs';
import { loadAuditReceipt } from './synthobs-peer-review-audit.mjs';

const MD_BASE_TO_ID = Object.fromEntries(
  Object.entries(WHITEPAPER_REGISTRY)
    .filter(([, v]) => v.file)
    .map(([id, v]) => [v.file.replace(/^.*\//, '').toLowerCase(), id]),
);

/** Remove duplicate page title — reader header already shows registry title. */
export function stripLeadingMarkdownTitle(html) {
  return String(html).replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, '');
}

export function postProcessWhitepaperHtml(html) {
  let out = html;
  out = out.replace(/src="\.\.\/interfaces\//gi, 'src="/interfaces/');
  out = out.replace(/href="\.\.\/interfaces\//gi, 'href="/interfaces/');
  out = out.replace(/href="(?:\/interfaces\/)?whitepaper-surface\.html\?id=([^"#]+)/gi, 'href="/whitepaper/$1');
  out = out.replace(/<img(?![^>]*\bloading=)/gi, '<img loading="lazy" decoding="async" ');
  return out;
}

export function normalizeRepoLinksInHtml(html) {
  return html.replace(/<a href="([^"]+)"/gi, (match, href) => {
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || /^https?:\/\//i.test(href)) {
      return match;
    }
    if (/\.(md|markdown)$/i.test(href)) {
      const base = href.replace(/^.*\//, '').toLowerCase();
      const rid = MD_BASE_TO_ID[base];
      if (rid) {
        return `<a href="/whitepaper/${encodeURIComponent(rid)}"`;
      }
    }
    if (href.startsWith('/')) return match;
    if (href.startsWith('interfaces/') || href.startsWith('protocols/') || href.startsWith('docs/')) {
      return `<a href="/${href}"`;
    }
    return match;
  });
}

export async function renderWhitepaperById(id, { cwd } = {}) {
  const entry = resolveWhitepaper(id);
  if (!entry) return { ok: false, code: 'not_found' };
  if (entry.redirect) return { ok: true, redirect: entry.redirect, title: entry.title };

  const root = cwd || process.cwd();
  const absPath = join(root, entry.file);
  let md;
  try {
    md = await readFile(absPath, 'utf8');
  } catch {
    return { ok: false, code: 'read_error', message: `Could not read ${entry.file}` };
  }

  const { marked } = await import('marked');
  marked.setOptions({ gfm: true, breaks: true });
  let html = marked.parse(md);
  html = stripLeadingMarkdownTitle(html);
  html = postProcessWhitepaperHtml(html);
  html = normalizeRepoLinksInHtml(html);

  const receipt = await loadAuditReceipt(id, { cwd: root });
  html += attributionHtmlBlock(receipt);

  return {
    ok: true,
    id,
    title: entry.title,
    source: entry.file,
    html,
    operator: 'SynthOBS Autonomous Agent',
    sandbox: 'Syntheverse Sandbox',
    audit: receipt
      ? {
          snapId: receipt.snapId,
          auditId: receipt.auditId,
          overallScore: receipt.overallScore,
          convergence: receipt.convergence,
          mode: receipt.mode,
          metaAudit: receipt.metaAudit || null,
        }
      : { snapId: 'NSPFRNP-SNAP-PRA-2026-06', status: 'pending' },
  };
}
