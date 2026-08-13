/**
 * Lattice Collaborate · shared Lattice Chat agent session (center pipe).
 * All seats on the shared Collaborate band see the same inputs/outputs
 * including thought-stream transcripts after (and mid-run via `live` events).
 *
 * Honesty: seating is email→peerId map only (Valet Pru creators + Daniel).
 * Not E2E crypto; Blob when configured, else process memory.
 */
import { list, put } from '@vercel/blob';
import { resolveCollabPeerId } from './lattice-collaborate-dms.mjs';

export { resolveCollabPeerId };

const BLOB_PATH = 'collaborate/agent-session-v1.json';
const MAX_EVENTS = 400;
const VALID_PEER_IDS = new Set(['peer_valet_pru', 'peer_daniel']);
const VALID_ROLES = new Set(['user', 'assistant', 'live']);

const mem =
  globalThis.__latticeCollabAgent ||
  (globalThis.__latticeCollabAgent = { events: [], loaded: false });

function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function sanitizeTranscript(raw) {
  if (!Array.isArray(raw)) return undefined;
  const out = [];
  for (const item of raw.slice(0, 80)) {
    if (!item || typeof item !== 'object') continue;
    const type = String(item.type || '').slice(0, 24);
    if (!type) continue;
    const copy = { type };
    if (typeof item.text === 'string') copy.text = item.text.slice(0, 12000);
    if (typeof item.name === 'string') copy.name = item.name.slice(0, 120);
    if (typeof item.status === 'string') copy.status = item.status.slice(0, 80);
    if (typeof item.callId === 'string') copy.callId = item.callId.slice(0, 80);
    if (typeof item.argsPreview === 'string') copy.argsPreview = item.argsPreview.slice(0, 2000);
    if (typeof item.resultPreview === 'string') copy.resultPreview = item.resultPreview.slice(0, 2000);
    if (typeof item.durationMs === 'number' && Number.isFinite(item.durationMs)) {
      copy.durationMs = item.durationMs;
    }
    if (typeof item.message === 'string') copy.message = item.message.slice(0, 500);
    out.push(copy);
  }
  return out.length ? out : undefined;
}

function sanitizeEvent(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = typeof raw.id === 'string' ? raw.id.trim().slice(0, 100) : '';
  const fromPeerId = typeof raw.fromPeerId === 'string' ? raw.fromPeerId.trim() : '';
  const role = typeof raw.role === 'string' ? raw.role.trim() : '';
  const content = String(raw.content ?? raw.text ?? raw.body ?? '')
    .trim()
    .slice(0, 16000);
  const createdAt =
    typeof raw.createdAt === 'string' && raw.createdAt.trim()
      ? raw.createdAt.trim().slice(0, 40)
      : new Date().toISOString();
  if (!id || !VALID_PEER_IDS.has(fromPeerId) || !VALID_ROLES.has(role)) return null;
  if (role !== 'live' && !content && !(Array.isArray(raw.transcript) && raw.transcript.length)) {
    return null;
  }
  const event = {
    id,
    kind: 'agent',
    role,
    fromPeerId,
    content,
    createdAt,
  };
  const transcript = sanitizeTranscript(raw.transcript);
  if (transcript) event.transcript = transcript;
  if (typeof raw.model === 'string' && raw.model.trim()) {
    event.model = raw.model.trim().slice(0, 80);
  }
  if (typeof raw.mode === 'string' && raw.mode.trim()) {
    event.mode = raw.mode.trim().slice(0, 24);
  }
  if (typeof raw.senderName === 'string' && raw.senderName.trim()) {
    event.senderName = raw.senderName.trim().slice(0, 80);
  }
  return event;
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
    return events.map(sanitizeEvent).filter(Boolean);
  } catch (e) {
    console.error('[lattice-collaborate-agent] blob read', e);
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
    console.error('[lattice-collaborate-agent] blob write', e);
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
  if (blobConfigured()) await blobWriteEvents(capped);
  return capped;
}

/**
 * @param {{ since?: string | null }} [opts]
 */
export async function listCollaborateAgentEvents(opts = {}) {
  const events = await loadEvents();
  const since = typeof opts.since === 'string' && opts.since.trim() ? opts.since.trim() : null;
  if (!since) return events;
  return events.filter((e) => e.createdAt > since);
}

/**
 * Append or replace (same id) one agent-session event.
 * `live` events replace prior live from the same peer.
 * @param {object} raw
 */
export async function appendCollaborateAgentEvent(raw) {
  const event = sanitizeEvent(raw);
  if (!event) return { ok: false, error: 'invalid_agent_event' };
  const events = await loadEvents();
  if (event.role === 'live') {
    const next = events.filter(
      (e) => !(e.role === 'live' && e.fromPeerId === event.fromPeerId),
    );
    next.push(event);
    await persistEvents(next);
    return { ok: true, event, duplicate: false };
  }
  const idx = events.findIndex((e) => e.id === event.id);
  if (idx >= 0) {
    events[idx] = event;
    await persistEvents(events);
    return { ok: true, event, duplicate: true };
  }
  events.push(event);
  // Drop live markers from this peer once a final message lands
  const cleaned = events.filter(
    (e) => !(e.role === 'live' && e.fromPeerId === event.fromPeerId),
  );
  await persistEvents(cleaned);
  return { ok: true, event, duplicate: false };
}

/** Test-only: clear in-memory agent session pipe. */
export function resetCollaborateAgentMemoryForTests() {
  mem.events = [];
  mem.loaded = false;
}
