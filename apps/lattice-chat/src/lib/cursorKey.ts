/** Edge-only Cursor API key (BYOK). Never sent to durable server storage. */
export const USER_CURSOR_API_KEY_STORAGE = 'user_cursor_api_key';

const KEY_CHANGE_EVENT = 'lattice-cursor-key-change';

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

export function saveUserCursorApiKey(raw: string): { ok: boolean; error?: string } {
  const key = String(raw || '').trim();
  if (key.length < 8) {
    return { ok: false, error: 'Paste a valid Cursor API key (at least 8 characters).' };
  }
  try {
    localStorage.setItem(USER_CURSOR_API_KEY_STORAGE, key);
    window.dispatchEvent(new Event(KEY_CHANGE_EVENT));
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not save key on this device (storage blocked).' };
  }
}

export function clearUserCursorApiKey(): void {
  try {
    localStorage.removeItem(USER_CURSOR_API_KEY_STORAGE);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(KEY_CHANGE_EVENT));
}

export function subscribeUserCursorApiKey(onChange: () => void): () => void {
  const handler = () => onChange();
  window.addEventListener(KEY_CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(KEY_CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
