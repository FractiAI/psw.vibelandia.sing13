/**
 * Module-level primary SSE abort — New chat / hard reset must kill the open stream
 * without importing api.ts from the store (circular).
 */

let activeAbort: AbortController | null = null;
let streamThreadId: string | null = null;

export function registerPrimaryStreamAbort(
  controller: AbortController,
  threadId: string,
): void {
  activeAbort = controller;
  streamThreadId = threadId;
}

export function clearPrimaryStreamAbort(controller?: AbortController): void {
  if (controller && activeAbort && controller !== activeAbort) return;
  activeAbort = null;
  streamThreadId = null;
}

export function abortActiveLatticeSend(): void {
  try {
    activeAbort?.abort();
  } catch {
    /* ignore */
  }
  activeAbort = null;
  streamThreadId = null;
}

export function activePrimaryStreamThreadId(): string | null {
  return streamThreadId;
}
