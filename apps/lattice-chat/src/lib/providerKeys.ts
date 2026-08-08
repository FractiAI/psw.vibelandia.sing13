/** Edge-only BYOK keys. Never sent to durable server storage — only request headers. */

export type LatticeProvider = 'cursor' | 'claude' | 'gemini' | 'openrouter';

export const LATTICE_PROVIDERS: {
  id: LatticeProvider;
  label: string;
  short: string;
  keyHeader: string;
  keyPlaceholder: string;
  keyHelp: string;
  honesty: string;
}[] = [
  {
    id: 'cursor',
    label: 'Cursor',
    short: 'Cursor',
    keyHeader: 'x-cursor-api-key',
    keyPlaceholder: 'key_… from cursor.com → API Keys',
    keyHelp: 'cursor.com/dashboard → API Keys',
    honesty:
      'Cursor cloud agents on FractiAI/psw.vibelandia.sing13. Guests share SING13 with an honor rail (prefer reversible exploration).',
  },
  {
    id: 'claude',
    label: 'Claude',
    short: 'Claude',
    keyHeader: 'x-anthropic-api-key',
    keyPlaceholder: 'sk-ant-… from console.anthropic.com',
    keyHelp: 'console.anthropic.com → API keys',
    honesty:
      'Anthropic Messages API (BYOK) with live stream of thought (thinking + reply deltas). Full Claude Code Agent SDK needs a local CLI binary — not on this serverless pipe.',
  },
  {
    id: 'gemini',
    label: 'Gemini Antigravity',
    short: 'Gemini',
    keyHeader: 'x-gemini-api-key',
    keyPlaceholder: 'AIza… from Google AI Studio',
    keyHelp: 'aistudio.google.com → API key',
    honesty:
      'Google Managed Antigravity via Interactions API — live thought/tool stream when the agent emits steps.',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    short: 'OpenRouter',
    keyHeader: 'x-openrouter-api-key',
    keyPlaceholder: 'sk-or-v1-… from openrouter.ai/keys',
    keyHelp: 'openrouter.ai → Keys',
    honesty:
      'OpenRouter chat completions (BYOK) with provider-reported prompt + completion token usage. Stateless: no cloud agent recovery.',
  },
];

const STORAGE: Record<LatticeProvider, { key: string; fp: string }> = {
  cursor: { key: 'user_cursor_api_key', fp: 'user_cursor_api_key_fp' },
  claude: { key: 'user_anthropic_api_key', fp: 'user_anthropic_api_key_fp' },
  gemini: { key: 'user_gemini_api_key', fp: 'user_gemini_api_key_fp' },
  openrouter: { key: 'user_openrouter_api_key', fp: 'user_openrouter_api_key_fp' },
};

const PROVIDER_STORAGE = 'lattice_active_provider';
const KEY_CHANGE_EVENT = 'lattice-provider-key-change';

function fingerprintKey(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return `${key.length}:${h.toString(16)}`;
}

export function isLatticeProvider(v: unknown): v is LatticeProvider {
  return v === 'cursor' || v === 'claude' || v === 'gemini' || v === 'openrouter';
}

export function readActiveProvider(): LatticeProvider {
  try {
    const raw = String(localStorage.getItem(PROVIDER_STORAGE) || '').trim();
    if (isLatticeProvider(raw)) return raw;
  } catch {
    /* ignore */
  }
  return 'cursor';
}

export function saveActiveProvider(provider: LatticeProvider): void {
  try {
    localStorage.setItem(PROVIDER_STORAGE, provider);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent(KEY_CHANGE_EVENT, { detail: { changed: true, provider } }),
  );
}

export function readProviderApiKey(provider: LatticeProvider): string {
  try {
    return String(localStorage.getItem(STORAGE[provider].key) || '').trim();
  } catch {
    return '';
  }
}

export function hasProviderApiKey(provider: LatticeProvider): boolean {
  return readProviderApiKey(provider).length >= 8;
}

export function saveProviderApiKey(
  provider: LatticeProvider,
  raw: string,
): { ok: boolean; error?: string; changed?: boolean } {
  const key = String(raw || '').trim();
  if (key.length < 8) {
    return { ok: false, error: `Paste a valid ${provider} API key (at least 8 characters).` };
  }
  try {
    const prevFp = String(localStorage.getItem(STORAGE[provider].fp) || '');
    const nextFp = fingerprintKey(key);
    const changed = !prevFp || prevFp !== nextFp;
    localStorage.setItem(STORAGE[provider].key, key);
    localStorage.setItem(STORAGE[provider].fp, nextFp);
    window.dispatchEvent(
      new CustomEvent(KEY_CHANGE_EVENT, { detail: { changed, provider } }),
    );
    return { ok: true, changed };
  } catch {
    return { ok: false, error: 'Could not save key on this device (storage blocked).' };
  }
}

export function clearProviderApiKey(provider: LatticeProvider): void {
  try {
    localStorage.removeItem(STORAGE[provider].key);
    localStorage.removeItem(STORAGE[provider].fp);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent(KEY_CHANGE_EVENT, { detail: { changed: true, provider } }),
  );
}

export function subscribeProviderKeys(
  onChange: (detail?: { changed?: boolean; provider?: LatticeProvider }) => void,
): () => void {
  const handler = (e: Event) => {
    const detail =
      e instanceof CustomEvent
        ? (e.detail as { changed?: boolean; provider?: LatticeProvider } | undefined)
        : undefined;
    onChange(detail);
  };
  window.addEventListener(KEY_CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(KEY_CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

/** @deprecated use hasProviderApiKey('cursor') */
export function hasUserCursorApiKey(): boolean {
  return hasProviderApiKey('cursor');
}

/** @deprecated use readProviderApiKey('cursor') */
export function readUserCursorApiKey(): string {
  return readProviderApiKey('cursor');
}

/** @deprecated use saveProviderApiKey('cursor', …) */
export function saveUserCursorApiKey(raw: string) {
  return saveProviderApiKey('cursor', raw);
}

/** @deprecated use clearProviderApiKey('cursor') */
export function clearUserCursorApiKey(): void {
  clearProviderApiKey('cursor');
}

/** @deprecated use subscribeProviderKeys */
export function subscribeUserCursorApiKey(
  onChange: (detail?: { changed?: boolean }) => void,
): () => void {
  return subscribeProviderKeys(onChange);
}

export const USER_CURSOR_API_KEY_STORAGE = STORAGE.cursor.key;
