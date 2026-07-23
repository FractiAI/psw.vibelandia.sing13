import { FormEvent, useEffect, useState } from 'react';
import {
  clearUserCursorApiKey,
  hasUserCursorApiKey,
  readUserCursorApiKey,
  saveUserCursorApiKey,
  subscribeUserCursorApiKey,
} from '@/lib/cursorKey';

/**
 * Edge settings: enter / update / clear Cursor API key in localStorage (`user_cursor_api_key`).
 * Key is forwarded per-request as `x-cursor-api-key` — never persisted on our server.
 */
export function KeySettingsPanel({
  compact = false,
  onSaved,
}: {
  compact?: boolean;
  onSaved?: () => void;
}) {
  const [draft, setDraft] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setHasKey(hasUserCursorApiKey());
      setDraft(hasUserCursorApiKey() ? readUserCursorApiKey() : '');
    };
    sync();
    return subscribeUserCursorApiKey(sync);
  }, []);

  function onSave(e: FormEvent) {
    e.preventDefault();
    const result = saveUserCursorApiKey(draft);
    if (!result.ok) {
      setFlash(result.error || 'Could not save key.');
      return;
    }
    setFlash('Cursor API key saved on this device.');
    setHasKey(true);
    onSaved?.();
  }

  function onClear() {
    clearUserCursorApiKey();
    setDraft('');
    setHasKey(false);
    setFlash('Cursor API key cleared from this device.');
  }

  return (
    <section
      className={`key-settings${compact ? ' key-settings--compact' : ''}`}
      aria-label="Cursor API key"
    >
      <form className="auth-form" onSubmit={onSave}>
        <p className="auth-lead">
          Paste your Cursor API key. It stays in this browser only and is sent with each Lattice
          turn — Vercel proxies it to Cursor and does not store it.
        </p>
        <label htmlFor="lattice-cursor-api-key">Cursor API key</label>
        <input
          id="lattice-cursor-api-key"
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={draft}
          placeholder="key_… from cursor.com → API Keys"
          onChange={(e) => setDraft(e.target.value)}
        />
        <p className="auth-key-hint">
          Status: {hasKey ? 'key on this edge' : 'no key yet'} · get one at cursor.com/dashboard
        </p>
        <div className="key-settings-actions">
          <button type="submit" className="auth-submit">
            {hasKey ? 'Update key' : 'Save key'}
          </button>
          {hasKey ? (
            <button type="button" className="key-clear-btn" onClick={onClear}>
              Clear
            </button>
          ) : null}
        </div>
      </form>
      {flash ? (
        <p className="auth-flash" role="status">
          {flash}
        </p>
      ) : null}
    </section>
  );
}

export function KeyStatusChip({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const sync = () => setHasKey(hasUserCursorApiKey());
    sync();
    return subscribeUserCursorApiKey(sync);
  }, []);

  return (
    <button
      type="button"
      className={`signed-in-key${hasKey ? ' signed-in-key--ok' : ' signed-in-key--missing'}`}
      title={hasKey ? 'Cursor API key on this device' : 'Add your Cursor API key'}
      onClick={onOpenSettings}
    >
      {hasKey ? 'Key on edge' : 'Add Cursor key'}
    </button>
  );
}
