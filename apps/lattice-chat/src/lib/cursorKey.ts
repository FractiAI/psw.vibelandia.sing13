/** Edge-only Cursor API key (BYOK). Never sent to durable server storage. */
export const USER_CURSOR_API_KEY_STORAGE = 'user_cursor_api_key';
const KEY_FP_STORAGE = 'user_cursor_api_key_fp';

const KEY_CHANGE_EVENT = 'lattice-cursor-key-change';

function fingerprintKey(key: string): string {
  // Short non-secret fingerprint so we can detect key swaps without logging the key.
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return `${key.length}:${h.toString(16)}`;
}

export function readUserCursorApiKey(): string {
  try {
    return String(localStorage.getItem(USER_CURSOR_API_KEY_STORAGE) || '').trim();
  } catch {
    return '';
  }
}

export function hasUserCursorApiKey(): boolean {
  return readUserCursorApiKey().length >= 8;
}

export function saveUserCursorApiKey(raw: string): { ok: boolean; error?: string; changed?: boolean } {
  const key = String(raw || '').trim();
  if (key.length < 8) {
    return { ok: false, error: 'Paste a valid Cursor API key (at least 8 characters).' };
  }
  try {
    const prevFp = String(localStorage.getItem(KEY_FP_STORAGE) || '');
    const nextFp = fingerprintKey(key);
    const changed = !prevFp || prevFp !== nextFp;
    localStorage.setItem(USER_CURSOR_API_KEY_STORAGE, key);
    localStorage.setItem(KEY_FP_STORAGE, nextFp);
    window.dispatchEvent(
      new CustomEvent(KEY_CHANGE_EVENT, { detail: { changed } }),
    );
    return { ok: true, changed };
  } catch {
    return { ok: false, error: 'Could not save key on this device (storage blocked).' };
  }
}

export function clearUserCursorApiKey(): void {
  try {
    localStorage.removeItem(USER_CURSOR_API_KEY_STORAGE);
    localStorage.removeItem(KEY_FP_STORAGE);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(KEY_CHANGE_EVENT, { detail: { changed: true } }));
}

export function subscribeUserCursorApiKey(
  onChange: (detail?: { changed?: boolean }) => void,
): () => void {
  const handler = (e: Event) => {
    const detail =
      e instanceof CustomEvent ? (e.detail as { changed?: boolean } | undefined) : undefined;
    onChange(detail);
  };
  window.addEventListener(KEY_CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(KEY_CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
