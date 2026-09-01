#!/usr/bin/env node
/** Bake Reading Room poster catalog to static JSON — instant edge load, no serverless cold start. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWhitepaperCatalog } from '../lib/whitepaper-catalog.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'interfaces', 'data');
const OUT = path.join(OUT_DIR, 'reading-room-catalog.json');

const catalog = await buildWhitepaperCatalog();
const payload = {
  ok: true,
  schema: catalog.schema,
  categories: catalog.categories,
  items: catalog.items,
  generatedAt: new Date().toISOString(),
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(payload), 'utf8');
console.log('sync-reading-room-catalog: wrote', OUT, `(${payload.items.length} items)`);
