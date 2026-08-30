/**
 * Let's Chat · ephemeral in-memory relay (no Blob, no durable store).
 * Signaling envelopes expire — center pipe forwards ciphertext only.
 */
const TTL_MS = 90_000;
const PRESENCE_TTL_MS = 45_000;
const MAX_INBOX = 300;

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

function prune(now = Date.now()) {
  mem.inbox = mem.inbox.filter((m) => now - m.at < TTL_MS);
  for (const [peerId, row] of mem.presence) {
    if (now - row.at > PRESENCE_TTL_MS) mem.presence.delete(peerId);
  }
  if (mem.inbox.length > MAX_INBOX) {
    mem.inbox = mem.inbox.slice(-MAX_INBOX);
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

/** @param {object} envelope */
export function pushEnvelope(envelope) {
  prune();
  if (mem.inbox.some((m) => m.id === envelope.id)) {
    return { ok: true, duplicate: true };
  }
  mem.inbox.push(envelope);
  return { ok: true, duplicate: false };
}

/** @param {{ toPeerId: string, since?: number }} opts */
export function pullInbox(opts) {
  prune();
  const since = Number(opts.since) || 0;
  return mem.inbox.filter((m) => m.toPeerId === opts.toPeerId && m.at > since);
}

/** @param {string} peerId @param {{ dnd?: boolean, label?: string }} row */
export function setPresence(peerId, row) {
  prune();
  mem.presence.set(peerId, {
    dnd: Boolean(row.dnd),
    label: typeof row.label === 'string' ? row.label.slice(0, 40) : '',
    at: Date.now(),
  });
}

/** @returns {Record<string, { dnd: boolean, label: string }>} */
export function snapshotPresence() {
  prune();
  const out = {};
  for (const [peerId, row] of mem.presence) {
    out[peerId] = { dnd: row.dnd, label: row.label };
  }
  return out;
}

/** Test helper */
export function resetLetsChatSignalForTests() {
  mem.inbox = [];
  mem.presence.clear();
}
