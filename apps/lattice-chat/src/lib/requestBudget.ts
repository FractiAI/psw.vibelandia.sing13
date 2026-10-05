/** Mirror lib/lattice-request-budget.mjs — keep in sync for client preflight. */

export const LATTICE_WIRE_BUDGET_BYTES = 4 * 1024 * 1024;
export const LATTICE_ATTACH_MAX_BYTES = 2 * 1024 * 1024;
export const LATTICE_WIRE_METADATA_RESERVE = 256 * 1024;

export const LATTICE_PAYLOAD_TOO_LARGE_MESSAGE =
  'Request too large for the Lattice pipe (Vercel 4.5 MB cap). Start a new chat, remove attachments, or send a shorter message — images should be under 2 MB each.';

export function estimateJsonBytes(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

export function trimHistoryForWireBudget(
  history: { role: string; content: string }[],
  bodyWithoutHistory: Record<string, unknown>,
  budget = LATTICE_WIRE_BUDGET_BYTES,
): { role: string; content: string }[] {
  const base = history.map((m) => ({
    role: String(m.role || 'user'),
    content: String(m.content || ''),
  }));
  const reserved =
    estimateJsonBytes({ ...bodyWithoutHistory, history: [] }) + LATTICE_WIRE_METADATA_RESERVE;
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
 * Returns the next body + whether message text was shortened.
 */
export function trimMessageForWireBudget(
  body: Record<string, unknown>,
  budget = LATTICE_WIRE_BUDGET_BYTES,
): { body: Record<string, unknown>; trimmed: boolean } {
  const msg = typeof body.message === 'string' ? body.message : '';
  if (!msg) return { body, trimmed: false };
  let nextMsg = msg.length > LATTICE_WIRE_MESSAGE_MAX_CHARS
    ? `${msg.slice(0, LATTICE_WIRE_MESSAGE_MAX_CHARS)}\n…`
    : msg;
  let next: Record<string, unknown> = { ...body, message: nextMsg };
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

export function prepareLatticeWireBody(
  body: Record<string, unknown>,
  budget = LATTICE_WIRE_BUDGET_BYTES,
): { body: Record<string, unknown>; bytes: number; trimmed: boolean } {
  const history = Array.isArray(body.history)
    ? (body.history as { role: string; content: string }[])
    : [];
  const { history: _drop, ...rest } = body;
  let trimmedHistory = trimHistoryForWireBudget(history, rest, budget);
  let next: Record<string, unknown> = { ...rest, history: trimmedHistory };
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

export function formatWireSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
