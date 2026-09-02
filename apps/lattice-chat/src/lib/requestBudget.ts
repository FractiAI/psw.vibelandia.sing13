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

  return { body: next, bytes, trimmed };
}

export function formatWireSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
