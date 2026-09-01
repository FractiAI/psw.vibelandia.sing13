#!/usr/bin/env node
/** Write abstract-derived AI cover prompts for Reading Room posters. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWhitepaperCatalog } from '../lib/whitepaper-catalog.mjs';
import { attachReadingRoomCardFields } from '../lib/reading-room-display.mjs';
import { coverPromptFor } from '../lib/reading-room-cover-focus.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'data', 'reading-room-cover-prompts.json');

async function main() {
  const catalog = await buildWhitepaperCatalog({ cwd: ROOT });
  const prompts = {};
  for (const item of catalog.items) {
    const card = attachReadingRoomCardFields(item, { cwd: ROOT });
    prompts[item.id] = {
      title: card.displayTitle,
      prompt: coverPromptFor(card),
    };
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), prompts }, null, 2));
  console.log(`generate-reading-room-cover-prompts: ${Object.keys(prompts).length} prompts → ${path.relative(ROOT, OUT)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
