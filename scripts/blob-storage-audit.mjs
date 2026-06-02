#!/usr/bin/env node
/**
 * Audit Vercel Blob usage for the QUESTFEST catalog store.
 *
 *   BLOB_READ_WRITE_TOKEN=... node scripts/blob-storage-audit.mjs
 *   BLOB_READ_WRITE_TOKEN=... node scripts/blob-storage-audit.mjs --orphans --dry-run
 *
 * Pull token from FractiAI → psw-vibelandia-sing13 → Storage → Blob → .env.local
 * Compare blob host with https://www.ssvibelandiaquestfest24x365.com/api/deploy-info
 */
import { list, del } from '@vercel/blob';
import { readFileSync } from 'node:fs';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const pruneOrphans = args.has('--orphans');

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('Set BLOB_READ_WRITE_TOKEN (FractiAI project Storage tab).');
  process.exit(1);
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KiB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MiB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GiB`;
}

function hostFromUrl(url) {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

function pathnameFromUrl(url) {
  try {
    return decodeURIComponent(new URL(url).pathname.replace(/^\//, ''));
  } catch {
    return null;
  }
}

async function listAllBlobs() {
  const all = [];
  let cursor;
  do {
    const page = await list({ cursor, limit: 1000 });
    all.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return all;
}

function referencedPathsFromCatalog(catalog) {
  const paths = new Set();
  for (const t of Object.values(catalog.tracks || {})) {
    for (const url of [t.src, t.videoSrc, t.posterSrc]) {
      const p = pathnameFromUrl(url);
      if (p) paths.add(p);
    }
  }
  paths.add('catalog/dynamic-catalog-v1.json');
  return paths;
}

async function loadReferencedPaths() {
  const paths = new Set(['catalog/dynamic-catalog-v1.json']);
  try {
    const { blobs } = await list({ prefix: 'catalog/dynamic-catalog-v1.json', limit: 1 });
    const hit = blobs[0];
    if (hit?.url) {
      const res = await fetch(hit.url, { cache: 'no-store' });
      if (res.ok) {
        const catalog = await res.json();
        for (const p of referencedPathsFromCatalog(catalog)) paths.add(p);
        return paths;
      }
    }
  } catch {
    /* fall through */
  }
  try {
    const raw = readFileSync(new URL('../media/catalog/catalog.json', import.meta.url), 'utf8');
    for (const p of referencedPathsFromCatalog(JSON.parse(raw))) paths.add(p);
  } catch {
    /* ignore */
  }
  return paths;
}

async function main() {
  console.log('Listing Blob objects…');
  const blobs = await listAllBlobs();
  const host = blobs[0] ? hostFromUrl(blobs[0].url) : '(empty store)';
  let total = 0;
  const byPrefix = new Map();

  for (const b of blobs) {
    total += b.size || 0;
    const prefix = b.pathname.includes('/')
      ? b.pathname.split('/').slice(0, 2).join('/')
      : b.pathname;
    const row = byPrefix.get(prefix) || { count: 0, bytes: 0 };
    row.count += 1;
    row.bytes += b.size || 0;
    byPrefix.set(prefix, row);
  }

  console.log('\n=== Blob store summary ===');
  console.log('Host:', host);
  console.log('Objects:', blobs.length);
  console.log('Total size:', fmtBytes(total));
  console.log('\nBy prefix:');
  for (const [prefix, row] of [...byPrefix.entries()].sort((a, b) => b[1].bytes - a[1].bytes)) {
    console.log(`  ${prefix}: ${row.count} files, ${fmtBytes(row.bytes)}`);
  }

  if (pruneOrphans) {
    const catalogPaths = await loadReferencedPaths();
    const orphans = blobs.filter((b) => {
      if (b.pathname === 'catalog/dynamic-catalog-v1.json') return false;
      if (!b.pathname.startsWith('catalog/')) return false;
      return !catalogPaths.has(b.pathname);
    });

    console.log(`\nOrphan catalog blobs (not in static catalog.json paths): ${orphans.length}`);
    let orphanBytes = 0;
    for (const b of orphans) {
      orphanBytes += b.size || 0;
      console.log(`  ${fmtBytes(b.size || 0)}  ${b.pathname}`);
    }
    console.log('Orphan total:', fmtBytes(orphanBytes));

    if (orphans.length && !dryRun) {
      const urls = orphans.map((b) => b.url);
      for (let i = 0; i < urls.length; i += 100) {
        await del(urls.slice(i, i + 100));
      }
      console.log('Deleted orphan blobs.');
    } else if (orphans.length && dryRun) {
      console.log('Dry run — no deletes.');
    }
  }

  console.log('\nCompare host with production GET /api/deploy-info → catalog.blobSampleHost');
  console.log('FractiAI Pro project: https://vercel.com/fractiai/psw.vibelandia-sing13/settings/stores');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
