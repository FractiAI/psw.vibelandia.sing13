#!/usr/bin/env node
/**
 * Convert server catalog video tracks → MP3 + cover JPEG (posterSrc).
 * Uses production /api/catalog-upload (client token) — no local BLOB token required.
 *
 *   node scripts/migrate-video-to-audio.mjs
 *   CATALOG_ORIGIN=https://www.ssvibelandiaquestfest24x365.com CATALOG_UPLOAD_SECRET=... node scripts/migrate-video-to-audio.mjs
 *
 * Requires ffmpeg on PATH (or FFMPEG_PATH).
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { upload } from '@vercel/blob/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ORIGIN = (process.env.CATALOG_ORIGIN || 'https://www.ssvibelandiaquestfest24x365.com').replace(
  /\/$/,
  '',
);
const SECRET = process.env.CATALOG_UPLOAD_SECRET || 'valetpru1!';
const TMP = path.join(ROOT, 'scripts', '.migrate-tmp');
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const FFPROBE = process.env.FFPROBE_PATH || 'ffprobe';
const DRY = process.argv.includes('--dry-run');

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit' });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exit ${code}`))));
  });
}

async function probeDurationSec(file) {
  return new Promise((resolve) => {
    const p = spawn(
      FFPROBE,
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file],
      { stdio: ['ignore', 'pipe', 'ignore'] },
    );
    let out = '';
    p.stdout.on('data', (d) => {
      out += d;
    });
    p.on('close', () => {
      const n = Number(out.trim());
      resolve(Number.isFinite(n) && n > 0 ? Math.round(n) : undefined);
    });
    p.on('error', () => resolve(undefined));
  });
}

async function fetchCatalog() {
  const res = await fetch(`${ORIGIN}/api/catalog`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`catalog ${res.status}`);
  return res.json();
}

async function blobUpload(pathname, filePath, contentType) {
  const buf = fs.readFileSync(filePath);
  const name = path.basename(filePath);
  const file = new File([buf], name, { type: contentType });
  return upload(pathname, file, {
    access: 'public',
    handleUploadUrl: `${ORIGIN}/api/catalog-upload`,
    headers: { 'X-Catalog-Secret': SECRET },
    multipart: buf.length > 15 * 1024 * 1024,
  });
}

async function patchTrack(trackId, patch) {
  const res = await fetch(`${ORIGIN}/api/catalog-track`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Catalog-Secret': SECRET,
    },
    body: JSON.stringify({ action: 'update', trackId, ...patch }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `patch ${res.status}`);
  return data.track;
}

async function migrateOne(track) {
  const mediaUrl = track.videoSrc || track.src;
  if (!mediaUrl) return { skipped: true, reason: 'no_media' };

  const inPath = path.join(TMP, `${track.id}-in`);
  const mp3Path = path.join(TMP, `${track.id}.mp3`);
  const jpgPath = path.join(TMP, `${track.id}.jpg`);

  console.log(`\n▶ ${track.title} (${track.id})`);
  console.log(`  download ${mediaUrl.slice(0, 72)}…`);

  if (DRY) {
    console.log('  [dry-run] skip download/transcode');
    return { dry: true };
  }

  fs.mkdirSync(TMP, { recursive: true });
  const dl = await fetch(mediaUrl);
  if (!dl.ok) throw new Error(`download ${dl.status}`);
  const ext = path.extname(new URL(mediaUrl).pathname) || '.bin';
  const inFile = `${inPath}${ext}`;
  fs.writeFileSync(inFile, Buffer.from(await dl.arrayBuffer()));
  const inSize = fs.statSync(inFile).size;
  console.log(`  video ${(inSize / 1e6).toFixed(1)} MB`);

  console.log('  ffmpeg → mp3…');
  await run(FFMPEG, ['-y', '-i', inFile, '-vn', '-acodec', 'libmp3lame', '-b:a', '128k', mp3Path]);
  const mp3Size = fs.statSync(mp3Path).size;
  console.log(`  mp3 ${(mp3Size / 1e6).toFixed(2)} MB`);

  console.log('  ffmpeg → cover…');
  await run(FFMPEG, ['-y', '-ss', '00:00:02', '-i', inFile, '-vframes', '1', '-q:v', '3', jpgPath]).catch(
    () => {},
  );

  const durationSec = await probeDurationSec(mp3Path);

  console.log('  upload mp3…');
  const audioBlob = await blobUpload(`catalog/${track.id}.mp3`, mp3Path, 'audio/mpeg');

  let posterSrc;
  if (fs.existsSync(jpgPath)) {
    console.log('  upload cover…');
    const coverBlob = await blobUpload(`catalog/covers/${track.id}.jpg`, jpgPath, 'image/jpeg');
    posterSrc = coverBlob.url;
  }

  console.log('  patch catalog…');
  const updated = await patchTrack(track.id, {
    src: audioBlob.url,
    posterSrc,
    clearVideo: true,
    durationSec,
  });

  try {
    fs.unlinkSync(inFile);
    fs.unlinkSync(mp3Path);
    if (fs.existsSync(jpgPath)) fs.unlinkSync(jpgPath);
  } catch {
    /* ignore */
  }

  console.log(`  ✓ ${updated.title} → audio only`);
  return { ok: true, mp3Size, inSize };
}

async function main() {
  console.log('Origin:', ORIGIN, DRY ? '(dry-run)' : '');
  const catalog = await fetchCatalog();
  const tracks = Object.values(catalog.tracks || {}).filter((t) => t.videoSrc);
  console.log(`Catalog v${catalog.version} — ${tracks.length} video track(s) to convert`);

  if (!tracks.length) {
    console.log('Nothing to migrate.');
    return;
  }

  const results = [];
  for (const track of tracks) {
    try {
      results.push(await migrateOne(track));
    } catch (e) {
      console.error(`  ✗ ${track.id}:`, e.message || e);
      results.push({ error: true });
    }
  }

  const ok = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => r.error).length;
  console.log(`\nDone: ${ok} converted, ${fail} failed.`);

  if (fail) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
