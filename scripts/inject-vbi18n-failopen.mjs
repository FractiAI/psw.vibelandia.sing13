#!/usr/bin/env node
/** Inject vbi18n-failopen.js into HTML surfaces that still gate on vbi18n-pending. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IFACE = path.join(ROOT, 'interfaces');
const TAG = '<script src="/interfaces/vbi18n-failopen.js"></script>';
const VIS_RE =
  /html\.vbi18n-pending body\s*\{\s*visibility:\s*hidden;?\s*\}/g;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

let patched = 0;
for (const file of walk(IFACE)) {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('vbi18n-pending')) continue;
  let changed = false;

  if (!html.includes('vbi18n-failopen.js')) {
    if (html.includes('<head>')) {
      html = html.replace('<head>', '<head>\n  ' + TAG);
    } else if (html.includes('<head ')) {
      html = html.replace(/<head([^>]*)>/, '<head$1>\n  ' + TAG);
    }
    changed = true;
  }

  const next = html.replace(
    VIS_RE,
    'html.vbi18n-pending body, html.vbi18n-ready body { visibility: visible; }',
  );
  if (next !== html) {
    html = next;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, html, 'utf8');
    patched += 1;
    console.log('inject-vbi18n-failopen:', path.relative(ROOT, file));
  }
}

console.log('inject-vbi18n-failopen: patched', patched, 'files');
