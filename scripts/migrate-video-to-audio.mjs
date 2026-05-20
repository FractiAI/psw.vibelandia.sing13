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
const PATCH_ONLY = process.argv.includes('--patch-only');

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
    clientPayload: JSON.stringify({ allowOverwrite: true }),
    multipart: buf.length > 15 * 1024 * 1024,
  });
}

function blobOriginFromUrl(url) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/** MP3 may already be on Blob from a prior run that failed to patch catalog. */
async function resolveAudioUrl(track, mp3Path) {
  const pathname = `catalog/${track.id}.mp3`;
  try {
    const blob = await blobUpload(pathname, mp3Path, 'audio/mpeg');
    return blob.url;
  } catch (e) {
    const msg = String(e?.message || e);
    if (!/already exists/i.test(msg)) throw e;
    const origin = blobOriginFromUrl(track.videoSrc || track.src);
    if (!origin) throw e;
    const guess = `${origin}/${pathname}`;
    const head = await fetch(guess, { method: 'HEAD', cache: 'no-store' });
    if (head.ok) {
      console.log('  reuse existing mp3 blob');
      return guess;
    }
    throw e;
  }
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

async function patchOnlyOne(track) {
  const origin = blobOriginFromUrl(track.videoSrc || track.src);
  if (!origin) throw new Error('no_blob_origin');
  const audioUrl = `${origin}/catalog/${track.id}.mp3`;
  const head = await fetch(audioUrl, { method: 'HEAD', cache: 'no-store' });
  if (!head.ok) throw new Error(`mp3 missing ${head.status}`);
  const coverUrl = `${origin}/catalog/covers/${track.id}.jpg`;
  const coverHead = await fetch(coverUrl, { method: 'HEAD', cache: 'no-store' });
  const posterSrc = coverHead.ok ? coverUrl : undefined;
  console.log('  patch catalog (existing mp3 on blob)…');
  const updated = await patchTrack(track.id, { src: audioUrl, posterSrc, clearVideo: true });
  console.log(`  ✓ ${updated.title} → audio only`);
  return { ok: true, patchOnly: true };
}

async function migrateOne(track) {
  const mediaUrl = track.videoSrc || track.src;
  if (!mediaUrl) return { skipped: true, reason: 'no_media' };

  const inPath = path.join(TMP, `${track.id}-in`);
  const mp3Path = path.join(TMP, `${track.id}.mp3`);
  const jpgPath = path.join(TMP, `${track.id}.jpg`);

  console.log(`\n▶ ${track.title} (${track.id})`);

  if (PATCH_ONLY) return patchOnlyOne(track);

  console.log(`  download ${mediaUrl.slice(0, 72)}…`);

  if (DRY) {
    console.log('  [dry-run] skip download/transcode');
    return { dry: true };
  }

  fs.mkdirSync(TMP, { recursive: true });
  const dl = await fetch(mediaUrl, { signal: AbortSignal.timeout(45 * 60 * 1000) });
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
  await run(FFMPEG, [
    '-y',
    '-ss',
    '00:00:02',
    '-i',
    inFile,
    '-frames:v',
    '1',
    '-q:v',
    '3',
    '-update',
    '1',
    jpgPath,
  ]).catch(() => {});

  const durationSec = await probeDurationSec(mp3Path);

  console.log('  upload mp3…');
  const audioUrl = await resolveAudioUrl(track, mp3Path);

  let posterSrc;
  if (fs.existsSync(jpgPath)) {
    console.log('  upload cover…');
    const coverBlob = await blobUpload(`catalog/covers/${track.id}.jpg`, jpgPath, 'image/jpeg');
    posterSrc = coverBlob.url;
  }

  console.log('  patch catalog…');
  const updated = await patchTrack(track.id, {
    src: audioUrl,
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
  console.log('Origin:', ORIGIN, DRY ? '(dry-run)' : PATCH_ONLY ? '(patch-only)' : '');
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
