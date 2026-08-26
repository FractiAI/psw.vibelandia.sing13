#!/usr/bin/env node
/**
 * Write the five Canvas exhibit room HTML pages from lib/exhibit-rooms.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXHIBIT_ROOMS, renderExhibitRoomHtml } from '../lib/exhibit-rooms.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'interfaces');

for (const room of EXHIBIT_ROOMS) {
  const file = path.join(OUT, room.file);
  fs.writeFileSync(file, renderExhibitRoomHtml(room));
}

console.log(
  JSON.stringify(
    {
      ok: true,
      pages: EXHIBIT_ROOMS.map((r) => ({ href: r.href, file: r.file })),
    },
    null,
    2,
  ),
);
