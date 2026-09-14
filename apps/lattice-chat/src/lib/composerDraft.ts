/** Composer draft survival across remount / soft reload (session only). */

const DRAFT_PREFIX = 'lattice-composer-draft:';
const MAX_DRAFT_CHARS = 100_000;

function draftKey(threadId: string | null | undefined): string {
  return `${DRAFT_PREFIX}${threadId || 'new'}`;
}

export function readComposerDraft(threadId: string | null | undefined): string {
  try {
    return sessionStorage.getItem(draftKey(threadId)) || '';
  } catch {
    return '';
  }
}

export function writeComposerDraft(threadId: string | null | undefined, text: string): void {
  try {
    const key = draftKey(threadId);
    const next = String(text || '');
    if (!next.trim()) {
      sessionStorage.removeItem(key);
      return;
    }
    sessionStorage.setItem(key, next.slice(0, MAX_DRAFT_CHARS));
  } catch {
    /* quota / private mode — typing still works in memory */
  }
}

export function clearComposerDraft(threadId: string | null | undefined): void {
  try {
    sessionStorage.removeItem(draftKey(threadId));
  } catch {
    /* ignore */
  }
}
