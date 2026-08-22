#!/usr/bin/env node
/**
 * Apply SS VIBELANDIA guest label across static interfaces HTML.
 * Skips sync markers, env names, and /questfest paths.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applySiteHomeLabel } from '../lib/site-brand.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IFACE = path.join(ROOT, 'interfaces');

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'assets' || name === 'partials' || name === 'lattice-chat') continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

let touched = 0;
for (const file of walk(IFACE)) {
  const before = fs.readFileSync(file, 'utf8');
  const after = applySiteHomeLabel(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    touched += 1;
  }
}

console.log(JSON.stringify({ ok: true, touched, label: 'SS VIBELANDIA' }, null, 2));
