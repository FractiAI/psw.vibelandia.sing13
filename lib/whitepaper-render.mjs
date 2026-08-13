import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveWhitepaper, resolveWhitepaperId, WHITEPAPER_REGISTRY, whitepaperHref, whitepaperSurfaceHref } from './whitepaper-registry.mjs';
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

/**
 * GFM strikethrough treats paired ~…~ as <del>. Approximate values like
 * (~27%) … (~68%) then strike "27%) and Dark Energy (". Convert ASCII
 * approx-tildes before digits to ≈ outside math/code.
 */
export function neutralizeApproxTildes(md) {
  let out = String(md ?? '');
  const codeFences = [];
  out = out.replace(/```[\s\S]*?```/g, (m) => {
    const key = `@@FRACCODETILDE${codeFences.length}@@`;
    codeFences.push({ key, body: m });
    return key;
  });
  const inlineCode = [];
  out = out.replace(/`[^`\n]+`/g, (m) => {
    const key = `@@FRACICODETILDE${inlineCode.length}@@`;
    inlineCode.push({ key, body: m });
    return key;
  });
  // ~1.618 or ~27% or ~95% — not already math
  out = out.replace(/(^|[^$\\~])~(\d+(?:\.\d+)?%?)/g, '$1≈$2');
  for (const c of inlineCode) out = out.split(c.key).join(c.body);
  for (const c of codeFences) out = out.split(c.key).join(c.body);
  return out;
}

/**
 * Shield TeX math from marked (underscores → <em>, soft breaks, etc.).
 * Supports $$...$$, $...$, \[...\], \(...\).
 */
export function extractMathPlaceholders(md) {
  const blocks = [];
  let out = String(md ?? '');

  const stash = (tex, display) => {
    const key = `@@FRACMATH${blocks.length}@@`;
    blocks.push({ key, tex: String(tex).trim(), display: Boolean(display) });
    return key;
  };

  // Fenced code first — do not touch math-looking $ inside code fences.
  const codeFences = [];
  out = out.replace(/```[\s\S]*?```/g, (m) => {
    const key = `@@FRACCODE${codeFences.length}@@`;
    codeFences.push({ key, body: m });
    return key;
  });

  out = out.replace(/\\\[([\s\S]+?)\\\]/g, (_, tex) => stash(tex, true));
  out = out.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => stash(tex, true));
  out = out.replace(/\\\(([\s\S]+?)\\\)/g, (_, tex) => stash(tex, false));
  // Inline $...$ — single line, non-empty, not $$ 
  out = out.replace(/\$([^\$\n]+?)\$/g, (_, tex) => stash(tex, false));

  for (const c of codeFences) {
    out = out.split(c.key).join(c.body);
  }

  return { md: out, blocks };
}

export function restoreMathPlaceholders(html, blocks) {
  let out = String(html ?? '');
  for (const b of blocks) {
    const wrapped = b.display ? `\\[${b.tex}\\]` : `\\(${b.tex}\\)`;
    out = out.split(b.key).join(wrapped);
  }
  return out;
}

export const GITHUB_MONOREPO_TREE = 'https://github.com/FractiAI/psw.vibelandia.sing13/tree/main';

/**
 * Relative `../research/<suite>/` markdown links 404 on the live reader
 * (`/research/...` is not a Vercel HTML surface). Point them at the
 * monorepo GitHub tree instead.
 */
export function githubTreeHrefForResearch(href) {
  const raw = String(href || '').trim();
  if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || /^https?:\/\//i.test(raw)) {
    return null;
  }
  const hashIdx = raw.indexOf('#');
  const pathPart = hashIdx >= 0 ? raw.slice(0, hashIdx) : raw;
  const hash = hashIdx >= 0 ? raw.slice(hashIdx) : '';
  const m = pathPart.match(/^(?:\.\.\/)*(?:\/)?research\/(.+)$/);
  if (!m) return null;
  const rest = m[1].replace(/\/+$/, '');
  const slash = pathPart.endsWith('/') ? '/' : '';
  return `${GITHUB_MONOREPO_TREE}/research/${rest}${slash}${hash}`;
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
    const researchHref = githubTreeHrefForResearch(href);
    if (researchHref) {
      return `<a href="${researchHref}"`;
    }
    if (/\.(md|markdown)$/i.test(href)) {
      const base = href.replace(/^.*\//, '').toLowerCase();
      const rid = MD_BASE_TO_ID[base];
      if (rid) {
        return `<a href="${whitepaperSurfaceHref(rid)}"`;
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

  const canonicalId = resolveWhitepaperId(id) || id;

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
  const mdNeutral = neutralizeApproxTildes(md);
  const { md: mdSafe, blocks: mathBlocks } = extractMathPlaceholders(mdNeutral);
  let html = marked.parse(mdSafe);
  html = restoreMathPlaceholders(html, mathBlocks);
  html = stripLeadingMarkdownTitle(html);
  html = postProcessWhitepaperHtml(html);
  html = normalizeRepoLinksInHtml(html);

  const receipt = await loadAuditReceipt(canonicalId, { cwd: root });
  html += attributionHtmlBlock(receipt);

  return {
    ok: true,
    id: canonicalId,
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
