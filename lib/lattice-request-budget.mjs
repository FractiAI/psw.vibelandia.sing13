/**
 * Lattice Chat wire budget — stay under Vercel's ~4.5 MB request body cap.
 * Base64 attachments inflate ~4/3; history + metadata need headroom.
 */

/** Vercel serverless JSON body ceiling (documented ~4.5 MB). */
export const LATTICE_VERCEL_BODY_LIMIT = Math.floor(4.5 * 1024 * 1024);

/** Safe total JSON body budget for /api/lattice-chat POST. */
export const LATTICE_WIRE_BUDGET_BYTES = 4 * 1024 * 1024;

/** Per-file raw cap so a single raster + history still fits the wire budget. */
export const LATTICE_ATTACH_MAX_BYTES = 2 * 1024 * 1024; // 2 MiB

export const LATTICE_ATTACH_MAX_FILES = 4;

/** Reserve bytes for message, keys-in-body fields, and JSON overhead. */
export const LATTICE_WIRE_METADATA_RESERVE = 256 * 1024;

/**
 * @param {unknown} value
 */
export function estimateJsonBytes(value) {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

/**
 * Trim oldest history turns until the serialized body fits the wire budget.
 * @param {{ role?: string; content?: string }[]} history
 * @param {Record<string, unknown>} bodyWithoutHistory
 * @param {number} [budget]
 */
export function trimHistoryForWireBudget(history, bodyWithoutHistory, budget = LATTICE_WIRE_BUDGET_BYTES) {
  const base = Array.isArray(history) ? history.map((m) => ({
    role: String(m?.role || 'user'),
    content: String(m?.content || ''),
  })) : [];
  const reserved = estimateJsonBytes({ ...bodyWithoutHistory, history: [] }) + LATTICE_WIRE_METADATA_RESERVE;
  let slice = base;
  while (slice.length > 0 && reserved + estimateJsonBytes(slice) > budget) {
    slice = slice.slice(1);
  }
  return slice;
}

/** Soft ceiling for a single wire `message` — mega pastes must not blow the pipe. */
export const LATTICE_WIRE_MESSAGE_MAX_CHARS = 200_000;

/**
 * Truncate body.message until the serialized body fits (after history trim).
 * @param {Record<string, unknown>} body
 * @param {number} [budget]
 */
export function trimMessageForWireBudget(body, budget = LATTICE_WIRE_BUDGET_BYTES) {
  const msg = typeof body?.message === 'string' ? body.message : '';
  if (!msg) return { body, trimmed: false };
  let nextMsg =
    msg.length > LATTICE_WIRE_MESSAGE_MAX_CHARS
      ? `${msg.slice(0, LATTICE_WIRE_MESSAGE_MAX_CHARS)}\n…`
      : msg;
  let next = { ...body, message: nextMsg };
  let bytes = estimateJsonBytes(next);
  let trimmed = nextMsg.length < msg.length;

  while (bytes > budget && nextMsg.length > 4_000) {
    nextMsg = `${nextMsg.slice(0, Math.floor(nextMsg.length * 0.7))}\n…`;
    next = { ...body, message: nextMsg };
    bytes = estimateJsonBytes(next);
    trimmed = true;
  }
  return { body: next, trimmed };
}

/**
 * @param {Record<string, unknown>} body
 * @param {number} [budget]
 */
export function latticeWireWithinBudget(body, budget = LATTICE_WIRE_BUDGET_BYTES) {
  return estimateJsonBytes(body) <= budget;
}

/**
 * Client-parity wire pack: trim history, then message, until under budget.
 * @param {Record<string, unknown>} body
 * @param {number} [budget]
 */
export function prepareLatticeWireBody(body, budget = LATTICE_WIRE_BUDGET_BYTES) {
  const history = Array.isArray(body?.history) ? body.history : [];
  const { history: _drop, ...rest } = body || {};
  let trimmedHistory = trimHistoryForWireBudget(history, rest, budget);
  let next = { ...rest, history: trimmedHistory };
  let bytes = estimateJsonBytes(next);
  let trimmed = trimmedHistory.length < history.length;

  if (bytes > budget && trimmedHistory.length) {
    trimmedHistory = [];
    next = { ...rest, history: [] };
    bytes = estimateJsonBytes(next);
    trimmed = true;
  }

  // Always enforce soft message ceiling, then shrink further if still over budget.
  const msgTrim = trimMessageForWireBudget(next, budget);
  next = msgTrim.body;
  bytes = estimateJsonBytes(next);
  trimmed = trimmed || msgTrim.trimmed;

  return { body: next, bytes, trimmed };
}

/**
 * @param {number} bytes
 */
export function formatWireSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const LATTICE_PAYLOAD_TOO_LARGE_MESSAGE =
  'Request too large for the Lattice pipe (Vercel 4.5 MB cap). Start a new chat, remove attachments, or send a shorter message — images should be under 2 MB each.';
