#!/usr/bin/env node
/**
 * HEAD-check server catalog `src` URLs. For 404s, retarget to a sibling track with the
 * same normalized title+artist that still has a live Blob (or report unrecovered).
 *
 *   CATALOG_UPLOAD_SECRET=… node scripts/heal-dead-catalog-src.mjs
 *   node scripts/heal-dead-catalog-src.mjs --dry-run
 *   node scripts/heal-dead-catalog-src.mjs --limit=50
 *
 * Does not delete tracks or blobs — only patches `src` (+ durationSec when present).
 */
const ORIGIN = (process.env.CATALOG_ORIGIN || 'https://www.ssvibelandiaquestfest24x365.com').replace(
  /\/$/,
  '',
);
const SECRET = process.env.CATALOG_UPLOAD_SECRET || 'valetpru1!';
const DRY = process.argv.includes('--dry-run');
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? Math.max(1, Number(limitArg.split('=')[1]) || 0) : 0;

function normalizeTrackLabel(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019\u201a\u2032']/g, "'")
    .replace(/(\p{L})'s\b/gu, '$1s')
    .replace(/(\p{L})\s+s\b/gu, '$1s')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function headOk(url) {
  if (!url) return false;
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (res.ok) return true;
    if (res.status === 405 || res.status === 501) {
      const get = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
        cache: 'no-store',
      });
      return get.ok || get.status === 206;
    }
    return false;
  } catch {
    return false;
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

const catalog = await fetch(`${ORIGIN}/api/catalog`, { cache: 'no-store' }).then((r) => {
  if (!r.ok) throw new Error(`catalog ${r.status}`);
  return r.json();
});

const tracks = Object.values(catalog.tracks || {});
const byKey = new Map();
for (const tr of tracks) {
  const key = `${normalizeTrackLabel(tr.title)}|${normalizeTrackLabel(tr.artist || '')}`;
  const list = byKey.get(key) ?? [];
  list.push(tr);
  byKey.set(key, list);
}

const dead = [];
let checked = 0;
for (const tr of tracks) {
  if (!tr?.src || !tr.serverHosted) continue;
  checked += 1;
  if (LIMIT && checked > LIMIT) break;
  const ok = await headOk(tr.src);
  if (!ok) dead.push(tr);
  if (checked % 50 === 0) console.log(`checked ${checked}/${tracks.length}…`);
}

console.log(`checked=${checked} dead=${dead.length} dryRun=${DRY}`);

const healed = [];
const unrecovered = [];

for (const tr of dead) {
  const key = `${normalizeTrackLabel(tr.title)}|${normalizeTrackLabel(tr.artist || '')}`;
  const siblings = (byKey.get(key) || []).filter((s) => s.id !== tr.id && s.src);
  let donor = null;
  for (const s of siblings) {
    if (await headOk(s.src)) {
      donor = s;
      break;
    }
  }
  if (!donor) {
    unrecovered.push({ id: tr.id, title: tr.title, src: tr.src });
    console.log(`✗ no donor  ${tr.id}  ${tr.title}`);
    continue;
  }
  const patch = {
    src: donor.src,
    ...(Number.isFinite(Number(donor.durationSec)) ? { durationSec: donor.durationSec } : {}),
  };
  console.log(`→ heal ${tr.id} ← ${donor.id}  ${tr.title}`);
  if (DRY) {
    healed.push({ id: tr.id, from: tr.src, to: donor.src, dry: true });
    continue;
  }
  try {
    const updated = await patchTrack(tr.id, patch);
    healed.push({ id: tr.id, from: tr.src, to: updated?.src || donor.src });
  } catch (e) {
    unrecovered.push({ id: tr.id, title: tr.title, error: String(e?.message || e) });
    console.error(`  patch failed`, e?.message || e);
  }
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checked,
      dead: dead.length,
      healed: healed.length,
      unrecovered: unrecovered.length,
      healedIds: healed.map((h) => h.id),
      unrecoveredIds: unrecovered.map((u) => u.id),
    },
    null,
    2,
  ),
);
