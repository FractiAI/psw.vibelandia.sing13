#!/usr/bin/env node
/**
 * Generate Bach-conductor illustrations for Reading Room concert program tracks.
 * Writes interfaces/assets/reading-room-program/*.jpg
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { READING_ROOM_PLAYLIST_TRACK_IDS } from '../lib/reading-room-playlist.mjs';
import {
  READING_ROOM_PROGRAM_HERO_BASENAME,
  programHeroImagePrompt,
  programImageBasenameForTrackId,
  programImagePromptForTrackId,
  programImageSeedFor,
  programPollinationsUrl,
} from '../lib/reading-room-program-images.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'interfaces', 'assets', 'reading-room-program');

const args = process.argv.slice(2);
const force = args.includes('--force');
const delayArg = args.find((a) => a.startsWith('--delay-ms='));
const delayMs = Math.max(1500, Number(delayArg?.split('=')[1]) || 3500);
const maxRetries = 6;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadCover(url, dest) {
  let lastErr;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (res.status === 429 || res.status === 402 || res.status === 503) {
        const retryAfterSec = Number(res.headers.get('retry-after')) || Math.min(60, 4 * 2 ** attempt);
        process.stderr.write(`rate limited (${res.status}), waiting ${retryAfterSec}s…\n`);
        await sleep(retryAfterSec * 1000);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 2048) throw new Error('image too small');
      fs.writeFileSync(dest, buf);
      return;
    } catch (err) {
      lastErr = err;
      if (attempt < maxRetries - 1) await sleep(Math.min(45_000, 2500 * 2 ** attempt));
    }
  }
  throw lastErr;
}

async function syncOne(basename, prompt, seed) {
  const dest = path.join(OUT_DIR, `${basename}.jpg`);
  if (!force && fs.existsSync(dest) && fs.statSync(dest).size > 2048) {
    return 'skipped';
  }
  const url = programPollinationsUrl(prompt, seed);
  await downloadCover(url, dest);
  return 'written';
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let written = 0;
  let skipped = 0;
  let failed = 0;

  const jobs = [
    {
      basename: READING_ROOM_PROGRAM_HERO_BASENAME,
      prompt: programHeroImagePrompt(),
      seed: programImageSeedFor('hero'),
    },
    ...READING_ROOM_PLAYLIST_TRACK_IDS.map((trackId) => ({
      basename: programImageBasenameForTrackId(trackId),
      prompt: programImagePromptForTrackId(trackId),
      seed: programImageSeedFor(trackId),
    })),
  ];

  for (const job of jobs) {
    try {
      const status = await syncOne(job.basename, job.prompt, job.seed);
      if (status === 'written') {
        written++;
        process.stdout.write(`program image ok: ${job.basename}\n`);
      } else {
        skipped++;
      }
    } catch (err) {
      failed++;
      process.stderr.write(`program image fail: ${job.basename} — ${err.message}\n`);
    }
    await sleep(delayMs);
  }

  console.log(JSON.stringify({ ok: failed === 0, written, skipped, failed, total: jobs.length }, null, 2));
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
