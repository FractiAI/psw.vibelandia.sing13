#!/usr/bin/env node
/**
 * Verify CURSOR_API_KEY can see FractiAI/psw.vibelandia.sing13 via Cursor GitHub.
 * Usage: CURSOR_API_KEY=… node scripts/lattice-verify-cursor-github.mjs
 * Never prints the key.
 */
import { Cursor } from '@cursor/sdk';

const TARGET = 'fractiai/psw.vibelandia.sing13';
const apiKey = (process.env.CURSOR_API_KEY || '').trim();

if (!apiKey) {
  console.error('FAIL: CURSOR_API_KEY is not set in this shell.');
  console.error('Set it to the same key used on Vercel, then re-run.');
  process.exit(2);
}

console.log('Checking Cursor.repositories.list for', TARGET, '…');
console.log('(API key present, length', apiKey.length + ')');

try {
  const listed = await Cursor.repositories.list({ apiKey });
  const urls = (Array.isArray(listed) ? listed : [])
    .map((r) => String(r?.url || '').trim())
    .filter(Boolean);
  const matched = urls.filter((u) => u.toLowerCase().includes(TARGET));

  console.log('Connected repos visible to this key:', urls.length);
  if (matched.length) {
    console.log('PASS: repo is connected for this API key:');
    for (const u of matched) console.log(' ', u);
    process.exit(0);
  }

  console.error('FAIL: repo not in Cursor.repositories.list for this API key.');
  console.error('IDE access to the folder does not grant cloud/API GitHub App access.');
  console.error('Fix: cursor.com → Integrations → GitHub → grant FractiAI org / this repo');
  console.error('     using the same Cursor account that created CURSOR_API_KEY.');
  if (urls.length) {
    console.error('Sample of connected repos:');
    for (const u of urls.slice(0, 15)) console.error(' ', u);
  }
  process.exit(1);
} catch (err) {
  console.error('FAIL: repositories.list error:', err instanceof Error ? err.message : err);
  process.exit(3);
}
