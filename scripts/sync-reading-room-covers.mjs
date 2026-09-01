#!/usr/bin/env node
/** Generate AI-style SVG poster covers for Reading Room catalog cards. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWhitepaperCatalog } from '../lib/whitepaper-catalog.mjs';
import { attachReadingRoomCardFields } from '../lib/reading-room-display.mjs';
import { renderReadingRoomCoverSvg } from '../lib/reading-room-cover-art.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'interfaces', 'assets', 'reading-room-covers');

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const catalog = await buildWhitepaperCatalog({ cwd: ROOT });
  let written = 0;
  for (const item of catalog.items) {
    const card = attachReadingRoomCardFields(item);
    const svg = renderReadingRoomCoverSvg(card);
    const out = path.join(OUT_DIR, `${item.id}.svg`);
    fs.writeFileSync(out, svg, 'utf8');
    written++;
  }
  console.log(`sync-reading-room-covers: wrote ${written} covers → ${path.relative(ROOT, OUT_DIR)}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
