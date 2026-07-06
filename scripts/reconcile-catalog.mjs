#!/usr/bin/env node
/**
 * Repair Sonic Singularity master catalog from Redis upload index + orphan blobs.
 *
 *   node scripts/reconcile-catalog.mjs
 *   node scripts/reconcile-catalog.mjs --no-blob
 *
 * Requires BLOB_READ_WRITE_TOKEN + UPSTASH_* + CATALOG_UPLOAD_SECRET in env
 * (copy from Vercel project settings or .env.local).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function loadDotEnvLocal() {
  const path = resolve(process.cwd(), '.env.local');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadDotEnvLocal();

const args = new Set(process.argv.slice(2));
const includeBlobOrphans = !args.has('--no-blob');

const { reconcileCatalogFully } = await import('../lib/catalog-server.mjs');

const result = await reconcileCatalogFully({ includeBlobOrphans });
console.log(
  JSON.stringify(
    {
      ok: true,
      before: result.before,
      after: result.after,
      indexRecovered: result.indexRecovered,
      blobRecovered: result.blobRecovered,
      includeBlobOrphans,
    },
    null,
    2,
  ),
);
