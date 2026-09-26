/**
 * Lattice Chat SSE safety helpers — keep outer/error paths from flipping an
 * open event-stream pipe to application/json (client hang → "session crash").
 */

/** True once SSE headers (or any response) have already left the pipe. */
export function latticeResponseAlreadyStreaming(res) {
  if (!res) return false;
  if (res.writableEnded) return true;
  if (res.headersSent) return true;
  try {
    const ct = String(typeof res.getHeader === 'function' ? res.getHeader('Content-Type') || '' : '');
    return /text\/event-stream/i.test(ct);
  } catch {
    return false;
  }
}

/**
 * Prefer SSE `event: error` when the stream is already open; otherwise JSON.
 * `sseWrite` / `jsonWrite` are injected so api/lattice-chat.js can reuse without circular imports in tests.
 */
export function safeLatticeErrorResponse(res, status, payload, { sseWrite, jsonWrite } = {}) {
  const body = payload && typeof payload === 'object' ? payload : { error: String(payload || 'error') };
  if (latticeResponseAlreadyStreaming(res)) {
    if (typeof sseWrite === 'function') {
      try {
        sseWrite(res, 'error', { ...body, status });
        if (res && !res.writableEnded && typeof res.end === 'function') res.end();
      } catch {
        /* client gone */
      }
      return { mode: 'sse' };
    }
    try {
      if (res && !res.writableEnded && typeof res.end === 'function') {
        res.end(`event: error\ndata: ${JSON.stringify({ ...body, status })}\n\n`);
      }
    } catch {
      /* ignore */
    }
    return { mode: 'sse' };
  }
  if (typeof jsonWrite === 'function') {
    jsonWrite(res, status, body);
    return { mode: 'json' };
  }
  if (res && typeof res.end === 'function') {
    res.statusCode = status;
    if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
    }
    res.end(JSON.stringify(body ?? {}));
  }
  return { mode: 'json' };
}
