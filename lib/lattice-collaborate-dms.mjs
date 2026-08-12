/**
 * Lattice Collaborate · shared DM log (center pipe).
 * Blob when BLOB_READ_WRITE_TOKEN is set; otherwise process-local memory
 * (fine for vitest / single-instance dev — not multi-node durable).
 *
 * Honesty: seating is email→peerId map only (Valet Pru creators + Daniel).
 * No claim of E2E crypto or multi-tenant isolation beyond allowlist.
 */
import { list, put } from '@vercel/blob';
import { checkLatticeEmailAccess, normalizeEmail } from './lattice-access.mjs';

const BLOB_PATH = 'collaborate/dms-v1.json';
const MAX_EVENTS = 500;
const VALID_PEER_IDS = new Set(['peer_valet_pru', 'peer_daniel']);

/** Guest seat email → Collaborate peer id (creators resolve separately). */
export const COLLAB_GUEST_SEAT_EMAILS = Object.freeze({
  'danielarifriedman@gmail.com': 'peer_daniel',
});

const mem =
  globalThis.__latticeCollabDms ||
  (globalThis.__latticeCollabDms = { events: [], loaded: false });

function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Map allowlisted email → Collaborate seat peer id.
 * @param {string} rawEmail
 * @returns {string | null}
 */
export function resolveCollabPeerId(rawEmail) {
  const access = checkLatticeEmailAccess(rawEmail);
  if (!access.ok) return null;
  const email = normalizeEmail(rawEmail);
  const guestSeat = COLLAB_GUEST_SEAT_EMAILS[email];
  if (guestSeat) return guestSeat;
  if (access.privilege === 'creator') return 'peer_valet_pru';
  return null;
}

function sanitizeDm(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = typeof raw.id === 'string' ? raw.id.trim().slice(0, 80) : '';
  const fromPeerId = typeof raw.fromPeerId === 'string' ? raw.fromPeerId.trim() : '';
  const threadPeerId = typeof raw.threadPeerId === 'string' ? raw.threadPeerId.trim() : '';
  const text = String(raw.text ?? raw.body ?? '')
    .trim()
    .slice(0, 4000);
  const createdAt =
    typeof raw.createdAt === 'string' && raw.createdAt.trim()
      ? raw.createdAt.trim().slice(0, 40)
      : new Date().toISOString();
  if (!id || !text) return null;
  if (!VALID_PEER_IDS.has(fromPeerId) || !VALID_PEER_IDS.has(threadPeerId)) return null;
  if (fromPeerId === threadPeerId) return null;
  return {
    id,
    kind: 'chat',
    fromPeerId,
    threadPeerId,
    text,
    createdAt,
  };
}

async function blobReadEvents() {
  if (!blobConfigured()) return null;
  try {
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 8 });
    const hit = blobs.find((b) => b.pathname === BLOB_PATH) ?? blobs[0];
    if (!hit?.url) return [];
    const res = await fetch(`${hit.url}${hit.url.includes('?') ? '&' : '?'}_=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    const events = Array.isArray(data?.events) ? data.events : Array.isArray(data) ? data : [];
    return events.map(sanitizeDm).filter(Boolean);
  } catch (e) {
    console.error('[lattice-collaborate-dms] blob read', e);
    return null;
  }
}

async function blobWriteEvents(events) {
  if (!blobConfigured()) return false;
  try {
    await put(
      BLOB_PATH,
      JSON.stringify({
        version: 1,
        updatedAt: new Date().toISOString(),
        events,
      }),
      {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 5,
      },
    );
    return true;
  } catch (e) {
    console.error('[lattice-collaborate-dms] blob write', e);
    return false;
  }
}

async function loadEvents() {
  const fromBlob = await blobReadEvents();
  if (fromBlob) {
    mem.events = fromBlob;
    mem.loaded = true;
    return fromBlob.slice();
  }
  return mem.events.slice();
}

async function persistEvents(events) {
  const capped = events.slice(-MAX_EVENTS);
  mem.events = capped;
  mem.loaded = true;
  if (blobConfigured()) {
    const ok = await blobWriteEvents(capped);
    if (!ok) {
      /* memory still holds; callers get success for same-instance */
    }
  }
  return capped;
}

/**
 * @param {{ since?: string | null }} [opts]
 * @returns {Promise<object[]>}
 */
export async function listCollaborateDms(opts = {}) {
  const events = await loadEvents();
  const since = typeof opts.since === 'string' && opts.since.trim() ? opts.since.trim() : null;
  if (!since) return events;
  return events.filter((e) => e.createdAt > since);
}

/**
 * Append one DM. Idempotent on `id`.
 * @param {object} raw
 * @returns {Promise<{ ok: boolean, event?: object, duplicate?: boolean, error?: string }>}
 */
export async function appendCollaborateDm(raw) {
  const event = sanitizeDm(raw);
  if (!event) {
    return { ok: false, error: 'invalid_dm' };
  }
  const events = await loadEvents();
  if (events.some((e) => e.id === event.id)) {
    return { ok: true, event, duplicate: true };
  }
  events.push(event);
  await persistEvents(events);
  return { ok: true, event, duplicate: false };
}

/** Test helper — clear in-memory log (does not delete Blob). */
export function resetCollaborateDmsMemoryForTests() {
  mem.events = [];
  mem.loaded = false;
}
