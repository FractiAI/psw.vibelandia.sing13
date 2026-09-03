#!/usr/bin/env node
/**
 * Generate Bach-conductor instrument plates for Canvas · Front Desk · Sin City programs.
 * Usage: node scripts/sync-program-bach-images.mjs [canvas|front-desk|sin-city|all]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONCIERTO_PRELUDE_TRACK_IDS } from '../lib/concierto-prelude-playlist.mjs';
import { RECEPTION_PLAYLIST_TRACK_IDS } from '../lib/reception-playlist.mjs';
import { SIN_CITY_PLAYLIST_TRACK_IDS } from '../lib/sin-city-playlist.mjs';
import * as canvasKit from '../lib/canvas-program-images.mjs';
import * as deskKit from '../lib/front-desk-program-images.mjs';
import * as nightKit from '../lib/sin-city-program-images.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flags = process.argv.slice(2).filter((a) => a.startsWith('--'));
const force = flags.includes('--force');
const delayArg = flags.find((a) => a.startsWith('--delay-ms='));
const delayMs = Math.max(800, Number(delayArg?.split('=')[1]) || 2500);
const maxRetries = 6;
const which = args[0] || 'all';

const PROGRAMS = {
  canvas: {
    outRel: 'interfaces/assets/canvas-program',
    trackIds: CONCIERTO_PRELUDE_TRACK_IDS,
    kit: canvasKit,
  },
  'front-desk': {
    outRel: 'interfaces/assets/front-desk-program',
    trackIds: RECEPTION_PLAYLIST_TRACK_IDS,
    kit: deskKit,
  },
  'sin-city': {
    outRel: 'interfaces/assets/sin-city-program',
    trackIds: SIN_CITY_PLAYLIST_TRACK_IDS,
    kit: nightKit,
  },
};

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

async function syncOne(outDir, basename, prompt, seed, kit) {
  const dest = path.join(outDir, `${basename}.jpg`);
  if (!force && fs.existsSync(dest) && fs.statSync(dest).size > 2048) {
    return 'skipped';
  }
  const url = kit.programPollinationsUrl(prompt, seed);
  await downloadCover(url, dest);
  return 'written';
}

async function syncProgram(id) {
  const spec = PROGRAMS[id];
  if (!spec) throw new Error(`unknown program ${id}`);
  const outDir = path.join(ROOT, spec.outRel);
  fs.mkdirSync(outDir, { recursive: true });
  const { kit, trackIds } = spec;
  let written = 0;
  let skipped = 0;
  let failed = 0;
  const jobs = [
    {
      basename: kit[id === 'canvas' ? 'CANVAS_PROGRAM_HERO_BASENAME' : id === 'front-desk' ? 'FRONT_DESK_PROGRAM_HERO_BASENAME' : 'SIN_CITY_PROGRAM_HERO_BASENAME'] || 'hero-bach-conductor',
      prompt: kit.programHeroImagePrompt(),
      seed: kit.programImageSeedFor('hero'),
    },
    ...trackIds.map((trackId) => ({
      basename: kit.programImageBasenameForTrackId(trackId),
      prompt: kit.programImagePromptForTrackId(trackId),
      seed: kit.programImageSeedFor(trackId),
    })),
  ];
  jobs[0].basename = 'hero-bach-conductor';

  for (const job of jobs) {
    try {
      const status = await syncOne(outDir, job.basename, job.prompt, job.seed, kit);
      if (status === 'written') {
        written++;
        process.stdout.write(`${id} ok: ${job.basename}\n`);
      } else {
        skipped++;
      }
    } catch (err) {
      failed++;
      process.stderr.write(`${id} fail: ${job.basename} — ${err.message}\n`);
    }
    await sleep(delayMs);
  }
  return { id, written, skipped, failed, total: jobs.length };
}

async function main() {
  const ids = which === 'all' ? Object.keys(PROGRAMS) : [which];
  const reports = [];
  for (const id of ids) {
    reports.push(await syncProgram(id));
  }
  const failed = reports.reduce((n, r) => n + r.failed, 0);
  console.log(JSON.stringify({ ok: failed === 0, reports }, null, 2));
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
