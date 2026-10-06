/**
 * Module-level primary SSE abort — New chat / hard reset must kill the open stream
 * without importing api.ts from the store (circular).
 */

export type PrimaryAbortReason = 'user' | 'background' | 'watchdog';

let activeAbort: AbortController | null = null;
let streamThreadId: string | null = null;
let lastAbortReason: PrimaryAbortReason | null = null;

export function registerPrimaryStreamAbort(
  controller: AbortController,
  threadId: string,
): void {
  activeAbort = controller;
  streamThreadId = threadId;
  lastAbortReason = null;
}

export function clearPrimaryStreamAbort(controller?: AbortController): void {
  if (controller && activeAbort && controller !== activeAbort) return;
  activeAbort = null;
  streamThreadId = null;
}

export function abortActiveLatticeSend(
  reason: PrimaryAbortReason = 'user',
): void {
  lastAbortReason = reason;
  try {
    activeAbort?.abort();
  } catch {
    /* ignore */
  }
  activeAbort = null;
  streamThreadId = null;
}

/** Read + clear the reason for the most recent abort (for catch-path retain policy). */
export function consumeLastAbortReason(): PrimaryAbortReason | null {
  const r = lastAbortReason;
  lastAbortReason = null;
  return r;
}

export function peekLastAbortReason(): PrimaryAbortReason | null {
  return lastAbortReason;
}

export function activePrimaryStreamThreadId(): string | null {
  return streamThreadId;
}
