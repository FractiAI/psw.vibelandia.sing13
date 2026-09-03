/**
 * Let's Chat · relay (Blob-backed when BLOB_READ_WRITE_TOKEN is set; in-memory fallback).
 * Signaling envelopes expire — center pipe forwards ciphertext only.
 *
 * Honesty: Blob path is public-read ciphertext. No plaintext is stored — edge clients
 * decrypt locally. Blob persistence survives Vercel cold starts; memory-only fallback
 * does not (development / test environments).
 */
import { list, put } from '@vercel/blob';

const TTL_MS = 90_000;
const PRESENCE_TTL_MS = 45_000;
const MAX_INBOX = 300;

const BLOB_INBOX_PATH = 'lets-chat/inbox-v1.json';
const BLOB_PRESENCE_PATH = 'lets-chat/presence-v1.json';

/** Max ciphertext length by envelope kind (relay only — expires with TTL). */
export const MAX_CIPHERTEXT_BY_KIND = Object.freeze({
  msg: 16_000,
  signal: 32_000,
  file: 400_000,
  photo: 400_000,
});

function maxCipherForKind(kind) {
  return MAX_CIPHERTEXT_BY_KIND[kind] || MAX_CIPHERTEXT_BY_KIND.msg;
}

const mem =
  globalThis.__letsChatSignal ||
  (globalThis.__letsChatSignal = {
    inbox: [],
    presence: new Map(),
  });

function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function blobRead(path) {
  if (!blobConfigured()) return null;
  try {
    const { blobs } = await list({ prefix: path, limit: 8 });
    const hit = blobs.find((b) => b.pathname === path) ?? blobs[0];
    if (!hit?.url) return null;
    const res = await fetch(`${hit.url}${hit.url.includes('?') ? '&' : '?'}_=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('[lets-chat-signal] blob read', path, e);
    return null;
  }
}

async function blobWrite(path, data) {
  if (!blobConfigured()) return false;
  try {
    await put(path, JSON.stringify(data), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 3,
    });
    return true;
  } catch (e) {
    console.error('[lets-chat-signal] blob write', path, e);
    return false;
  }
}

function pruneInbox(inbox, now = Date.now()) {
  const pruned = inbox.filter((m) => now - m.at < TTL_MS);
  return pruned.length > MAX_INBOX ? pruned.slice(-MAX_INBOX) : pruned;
}

function prunePresence(presence, now = Date.now()) {
  const out = {};
  for (const [peerId, row] of Object.entries(presence)) {
    if (now - row.at <= PRESENCE_TTL_MS) out[peerId] = row;
  }
  return out;
}

function presenceMapToObject(map) {
  const out = {};
  for (const [k, v] of map) out[k] = v;
  return out;
}

function presenceObjectToMap(obj) {
  const m = new Map();
  for (const [k, v] of Object.entries(obj || {})) m.set(k, v);
  return m;
}

async function loadInbox() {
  if (blobConfigured()) {
    const data = await blobRead(BLOB_INBOX_PATH);
    if (data) {
      const inbox = pruneInbox(Array.isArray(data.envelopes) ? data.envelopes : []);
      mem.inbox = inbox;
      return inbox.slice();
    }
  }
  return pruneInbox(mem.inbox).slice();
}

async function saveInbox(inbox) {
  mem.inbox = inbox;
  if (blobConfigured()) {
    await blobWrite(BLOB_INBOX_PATH, {
      version: 1,
      updatedAt: new Date().toISOString(),
      envelopes: inbox,
    });
  }
}

async function loadPresence() {
  if (blobConfigured()) {
    const data = await blobRead(BLOB_PRESENCE_PATH);
    if (data) {
      const pruned = prunePresence(data.presence || {});
      mem.presence = presenceObjectToMap(pruned);
      return pruned;
    }
  }
  const pruned = prunePresence(presenceMapToObject(mem.presence));
  mem.presence = presenceObjectToMap(pruned);
  return pruned;
}

async function savePresence() {
  const obj = prunePresence(presenceMapToObject(mem.presence));
  mem.presence = presenceObjectToMap(obj);
  if (blobConfigured()) {
    await blobWrite(BLOB_PRESENCE_PATH, {
      version: 1,
      updatedAt: new Date().toISOString(),
      presence: obj,
    });
  }
}

/**
 * @param {object} raw
 * @returns {object | null}
 */
export function sanitizeEnvelope(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = typeof raw.id === 'string' ? raw.id.trim().slice(0, 80) : '';
  const fromPeerId = typeof raw.fromPeerId === 'string' ? raw.fromPeerId.trim().slice(0, 24) : '';
  const toPeerId = typeof raw.toPeerId === 'string' ? raw.toPeerId.trim().slice(0, 24) : '';
  const threadId = typeof raw.threadId === 'string' ? raw.threadId.trim().slice(0, 64) : '';
  const kind = typeof raw.kind === 'string' ? raw.kind.trim().slice(0, 24) : 'msg';
  const ciphertext = typeof raw.ciphertext === 'string' ? raw.ciphertext.trim() : '';
  const maxLen = maxCipherForKind(kind);
  if (!id || !fromPeerId || !toPeerId || !threadId || !ciphertext || ciphertext.length > maxLen) return null;
  if (fromPeerId === toPeerId) return null;
  return {
    id,
    kind,
    fromPeerId,
    toPeerId,
    threadId,
    ciphertext,
    at: Date.now(),
  };
}

/**
 * Push an envelope into the relay. Blob-backed when configured.
 * @param {object} envelope
 * @returns {Promise<{ ok: boolean, duplicate: boolean }>}
 */
export async function pushEnvelope(envelope) {
  const inbox = await loadInbox();
  if (inbox.some((m) => m.id === envelope.id)) {
    return { ok: true, duplicate: true };
  }
  inbox.push(envelope);
  await saveInbox(pruneInbox(inbox));
  return { ok: true, duplicate: false };
}

/**
 * Pull envelopes for a peer, optionally since a timestamp.
 * @param {{ toPeerId: string, since?: number }} opts
 * @returns {Promise<object[]>}
 */
export async function pullInbox(opts) {
  const inbox = await loadInbox();
  const since = Number(opts.since) || 0;
  return inbox.filter((m) => m.toPeerId === opts.toPeerId && m.at > since);
}

/**
 * Set presence for a peer. Blob-backed when configured.
 * @param {string} peerId
 * @param {{ dnd?: boolean, label?: string }} row
 * @returns {Promise<void>}
 */
export async function setPresence(peerId, row) {
  await loadPresence();
  mem.presence.set(peerId, {
    dnd: Boolean(row.dnd),
    label: typeof row.label === 'string' ? row.label.slice(0, 40) : '',
    at: Date.now(),
  });
  await savePresence();
}

/**
 * Snapshot current presence state.
 * @returns {Promise<Record<string, { dnd: boolean, label: string }>>}
 */
export async function snapshotPresence() {
  const pres = await loadPresence();
  const out = {};
  for (const [peerId, row] of Object.entries(pres)) {
    out[peerId] = { dnd: row.dnd, label: row.label };
  }
  return out;
}

/** Test helper — clear in-memory state (does not delete Blob). */
export function resetLetsChatSignalForTests() {
  mem.inbox = [];
  mem.presence.clear();
}
