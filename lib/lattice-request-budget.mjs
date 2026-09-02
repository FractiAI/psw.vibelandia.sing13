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

/**
 * @param {Record<string, unknown>} body
 * @param {number} [budget]
 */
export function latticeWireWithinBudget(body, budget = LATTICE_WIRE_BUDGET_BYTES) {
  return estimateJsonBytes(body) <= budget;
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
