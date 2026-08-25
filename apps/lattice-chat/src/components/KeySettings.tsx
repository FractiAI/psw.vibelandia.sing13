import { FormEvent, useEffect, useState } from 'react';
import {
  LATTICE_PROVIDERS,
  clearProviderApiKey,
  hasProviderApiKey,
  readProviderApiKey,
  saveProviderApiKey,
  subscribeProviderKeys,
  type LatticeProvider,
} from '@/lib/providerKeys';
import { useLatticeStore } from '@/store';

/**
 * Edge settings: BYOK keys for Cursor / Claude / Gemini Antigravity.
 * Keys stay in localStorage and are sent only as request headers.
 */
export function KeySettingsPanel({
  compact = false,
  onSaved,
}: {
  compact?: boolean;
  onSaved?: () => void;
}) {
  const provider = useLatticeStore((s) => s.provider);
  const setProvider = useLatticeStore((s) => s.setProvider);
  const [drafts, setDrafts] = useState<Record<LatticeProvider, string>>({
    cursor: '',
    claude: '',
    gemini: '',
  });
  const [hasKeys, setHasKeys] = useState<Record<LatticeProvider, boolean>>({
    cursor: false,
    claude: false,
    gemini: false,
  });
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      const nextDrafts: Record<LatticeProvider, string> = {
        cursor: '',
        claude: '',
        gemini: '',
      };
      const nextHas: Record<LatticeProvider, boolean> = {
        cursor: false,
        claude: false,
        gemini: false,
      };
      for (const p of LATTICE_PROVIDERS) {
        nextHas[p.id] = hasProviderApiKey(p.id);
        nextDrafts[p.id] = nextHas[p.id] ? readProviderApiKey(p.id) : '';
      }
      setDrafts(nextDrafts);
      setHasKeys(nextHas);
    };
    sync();
    return subscribeProviderKeys(sync);
  }, []);

  function onSave(e: FormEvent, id: LatticeProvider) {
    e.preventDefault();
    const meta = LATTICE_PROVIDERS.find((p) => p.id === id);
    const result = saveProviderApiKey(id, drafts[id]);
    if (!result.ok) {
      setFlash(result.error || 'Could not save key.');
      return;
    }
    if (result.changed) useLatticeStore.getState().clearCloudAgents();
    setFlash(`${meta?.short || id} API key saved on this device.`);
    setHasKeys((h) => ({ ...h, [id]: true }));
    onSaved?.();
  }

  function onClear(id: LatticeProvider) {
    clearProviderApiKey(id);
    setDrafts((d) => ({ ...d, [id]: '' }));
    setHasKeys((h) => ({ ...h, [id]: false }));
    useLatticeStore.getState().clearCloudAgents();
    setFlash(`${id} API key cleared from this device.`);
  }

  return (
    <section
      className={`key-settings${compact ? ' key-settings--compact' : ''}`}
      aria-label="Provider API keys"
    >
      <p className="auth-lead">
        Bring your key — Cursor, Claude, or Gemini. <strong>Your key is your password</strong> for
        Infinite Octaves Omniversal Lattice Chat: it stays with you in this browser, sent only with each turn —
        we do not store it on the server. No separate passwords to manage. OpenRouter is on the
        Omni-Lattice Bridge product, not here. Toggle the active provider under Advanced.
      </p>
      <div className="provider-tabs" role="tablist" aria-label="Active provider">
        {LATTICE_PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={provider === p.id}
            className={provider === p.id ? 'is-active' : undefined}
            onClick={() => setProvider(p.id)}
          >
            {p.short}
          </button>
        ))}
      </div>
      {LATTICE_PROVIDERS.map((p) => (
        <form
          key={p.id}
          className={`auth-form provider-key-form${provider === p.id ? ' is-active' : ''}`}
          onSubmit={(e) => onSave(e, p.id)}
          hidden={provider !== p.id}
        >
          <label htmlFor={`lattice-key-${p.id}`}>{p.label} API key · your password</label>
          <input
            id={`lattice-key-${p.id}`}
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={drafts[p.id]}
            placeholder={p.keyPlaceholder}
            onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
          />
          <p className="auth-key-hint">
            Status: {hasKeys[p.id] ? 'key on this edge' : 'no key yet'} · {p.keyHelp}
          </p>
          <p className="auth-key-hint">{p.honesty}</p>
          <div className="key-settings-actions">
            <button type="submit" className="auth-submit">
              {hasKeys[p.id] ? 'Update key' : 'Save key'}
            </button>
            {hasKeys[p.id] ? (
              <button type="button" className="key-clear-btn" onClick={() => onClear(p.id)}>
                Clear
              </button>
            ) : null}
          </div>
        </form>
      ))}
      {flash ? (
        <p className="auth-flash" role="status">
          {flash}
        </p>
      ) : null}
    </section>
  );
}

export function KeyStatusChip({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const provider = useLatticeStore((s) => s.provider);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const sync = () => setHasKey(hasProviderApiKey(provider));
    sync();
    return subscribeProviderKeys(sync);
  }, [provider]);

  const label =
    LATTICE_PROVIDERS.find((p) => p.id === provider)?.short || provider;

  return (
    <button
      type="button"
      className={`signed-in-key${hasKey ? ' signed-in-key--ok' : ' signed-in-key--missing'}`}
      title={hasKey ? `${label} API key on this device` : `Add your ${label} API key`}
      onClick={onOpenSettings}
    >
      {hasKey ? `${label} key` : `Add ${label} key`}
    </button>
  );
}
