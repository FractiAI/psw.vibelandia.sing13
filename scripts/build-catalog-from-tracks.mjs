#!/usr/bin/env node
/**
 * Build media/catalog/catalog.json from files in media/catalog/tracks/
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TRACKS_DIR = path.join(ROOT, 'media', 'catalog', 'tracks');
const OUT = path.join(ROOT, 'media', 'catalog', 'catalog.json');
const DEFAULT_ARTIST = "Hero Jo's Golden Bachdoor Hit Factory";

const MEDIA_EXT = new Set(['.mp3', '.m4a', '.wav', '.ogg', '.flac', '.aac']);
const COVER_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function slug(s) {
  return s
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

function titleFromFile(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim();
}

function main() {
  if (!fs.existsSync(TRACKS_DIR)) {
    fs.mkdirSync(TRACKS_DIR, { recursive: true });
    console.log(`Created ${TRACKS_DIR} — add audio files and re-run.`);
    process.exit(0);
  }

  const allFiles = fs.readdirSync(TRACKS_DIR);
  const coverByStem = new Map();
  for (const f of allFiles) {
    const ext = path.extname(f).toLowerCase();
    if (!COVER_EXT.has(ext)) continue;
    const stem = path.basename(f, ext);
    coverByStem.set(stem, f);
  }

  const files = allFiles
    .filter((f) => MEDIA_EXT.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  if (!files.length) {
    console.log('No audio in media/catalog/tracks/ — add MP3/M4A files and re-run.');
    process.exit(0);
  }

  const tracks = {};
  const trackIds = [];

  for (const file of files) {
    const id = `trk-srv-${slug(file)}`;
    const urlPath = `/media/catalog/tracks/${encodeURIComponent(file)}`;
    const stem = path.basename(file, path.extname(file));
    const coverFile = coverByStem.get(stem);
    const posterPath = coverFile
      ? `/media/catalog/tracks/${encodeURIComponent(coverFile)}`
      : undefined;
    tracks[id] = {
      id,
      title: titleFromFile(file),
      artist: DEFAULT_ARTIST,
      src: urlPath,
      ...(posterPath ? { posterSrc: posterPath } : {}),
      serverHosted: true,
    };
    trackIds.push(id);
  }

  const catalog = {
    version: 1,
    activePlaylistId: 'pl-main',
    tracks,
    playlists: [
      {
        id: 'pl-main',
        name: 'Sonic Singularity · Master Library',
        kind: 'sovereign',
        description: 'Server-hosted catalog — Reno Swamp Beats Caliente.',
        trackIds,
      },
    ],
  };

  fs.writeFileSync(OUT, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${trackIds.length} tracks → ${path.relative(ROOT, OUT)}`);
}

main();
