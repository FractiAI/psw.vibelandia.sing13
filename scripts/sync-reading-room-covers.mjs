#!/usr/bin/env node
/**
 * Generate AI poster covers for Reading Room cards (Pollinations · abstract-derived prompts).
 * Writes interfaces/assets/reading-room-covers/{id}.jpg + data/reading-room-cover-manifest.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWhitepaperCatalog } from '../lib/whitepaper-catalog.mjs';
import { attachReadingRoomCardFields } from '../lib/reading-room-display.mjs';
import {
  abstractFocusLine,
  coverSeedFor,
  pollinationsUrl,
  visualPromptFor,
} from '../lib/reading-room-cover-prompt.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'interfaces', 'assets', 'reading-room-covers');
const MANIFEST = path.join(ROOT, 'data', 'reading-room-cover-manifest.json');

const args = process.argv.slice(2);
const force = args.includes('--force');
const limitArg = args.find((a) => a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity;
const delayArg = args.find((a) => a.startsWith('--delay-ms='));
const delayMs = Math.max(1500, Number(delayArg?.split('=')[1]) || 4500);
const maxRetries = 8;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadCover(url, dest) {
  let lastErr;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (res.status === 429 || res.status === 402 || res.status === 503) {
        const retryAfterSec = Number(res.headers.get('retry-after')) || Math.min(90, 5 * 2 ** attempt);
        process.stderr.write(`rate limited (${res.status}), waiting ${retryAfterSec}s…\n`);
        await sleep(retryAfterSec * 1000);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 2048) throw new Error('cover too small');
      fs.writeFileSync(dest, buf);
      return;
    } catch (err) {
      lastErr = err;
      if (attempt < maxRetries - 1) {
        await sleep(Math.min(60_000, 3000 * 2 ** attempt));
      }
    }
  }
  throw lastErr;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const catalog = await buildWhitepaperCatalog({ cwd: ROOT });
  const cards = catalog.items.map((item) => attachReadingRoomCardFields(item)).slice(0, limit);

  const manifest = {
    schema: 'reading-room-cover-manifest/v1',
    updated: new Date().toISOString().slice(0, 10),
    operator: 'SynthOBS Autonomous Agent',
    honesty:
      'AI poster art derived from paper abstract focus lines — catalog hospitality, not empirical proof.',
    covers: {},
  };

  let written = 0;
  let skipped = 0;
  let failed = 0;

  for (const card of cards) {
    const dest = path.join(OUT_DIR, `${card.id}.jpg`);
    const focus = abstractFocusLine(card);
    const prompt = visualPromptFor(card);
    const seed = coverSeedFor(card.id);
    const url = pollinationsUrl(prompt, seed);

    manifest.covers[card.id] = { focus, prompt, seed, file: `${card.id}.jpg` };

    if (!force && fs.existsSync(dest) && fs.statSync(dest).size > 2048) {
      skipped++;
      continue;
    }

    try {
      await downloadCover(url, dest);
      written++;
      process.stdout.write(`cover ok: ${card.id}\n`);
    } catch (err) {
      failed++;
      process.stderr.write(`cover fail: ${card.id} — ${err.message}\n`);
    }

    await sleep(delayMs);
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(
    JSON.stringify(
      {
        ok: failed === 0,
        written,
        skipped,
        failed,
        total: cards.length,
        delayMs,
        out: path.relative(ROOT, OUT_DIR),
        manifest: path.relative(ROOT, MANIFEST),
      },
      null,
      2,
    ),
  );
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
