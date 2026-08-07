import { useState } from 'react';
import { useUnifiedFeed } from '@/feed/store';
import type { EventFilterKey, IntegrationId } from '@/feed/types';
import {
  displayName,
  placeholderFor,
  verifyIntegration,
} from '@/feed/verifyConnection';

const FILTER_LABELS: { key: EventFilterKey; label: string }[] = [
  { key: 'commits', label: 'Commits' },
  { key: 'pushes', label: 'Pushes' },
  { key: 'merges', label: 'Merges' },
  { key: 'whitepapers', label: 'New Whitepapers' },
  { key: 'social_posts', label: 'Social Posts' },
  { key: 'messaging', label: 'Messaging' },
];

export function IntegrationSettings() {
  const integrations = useUnifiedFeed((s) => s.integrations);
  const eventFilters = useUnifiedFeed((s) => s.eventFilters);
  const setIntegrationEnabled = useUnifiedFeed((s) => s.setIntegrationEnabled);
  const setIntegrationAccount = useUnifiedFeed((s) => s.setIntegrationAccount);
  const setIntegrationConnection = useUnifiedFeed((s) => s.setIntegrationConnection);
  const setEventFilter = useUnifiedFeed((s) => s.setEventFilter);
  const peers = useUnifiedFeed((s) => s.peers);
  const clearFeed = useUnifiedFeed((s) => s.clearFeed);
  const resetWorkspace = useUnifiedFeed((s) => s.resetWorkspace);
  const anyEnabled = integrations.some((i) => i.enabled);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<IntegrationId | null>(null);

  const draftFor = (id: IntegrationId, fallback: string) =>
    drafts[id] !== undefined ? drafts[id] : fallback;

  const connect = async (id: IntegrationId) => {
    const integ = integrations.find((i) => i.id === id);
    if (!integ) return;
    const label = draftFor(id, integ.accountLabel).trim();
    setBusyId(id);
    setIntegrationConnection(id, {
      connectionStatus: 'checking',
      connectionMessage: 'Checking connection…',
      connectionHint: undefined,
      enabled: false,
      accountLabel: label,
    });
    const result = await verifyIntegration(id, label);
    setIntegrationConnection(id, {
      connectionStatus: result.status,
      connectionMessage: result.message,
      connectionHint: result.hint,
      enabled: result.ok,
      accountLabel: result.resolvedLabel || label,
    });
    if (result.ok && result.resolvedLabel) {
      setDrafts((d) => ({ ...d, [id]: result.resolvedLabel! }));
    }
    setBusyId(null);
  };

  return (
    <div className="int-settings">
      <header className="int-settings__hero">
        <p className="int-settings__eyebrow">Lattice Workspace</p>
        <h2>Settings</h2>
        <p className="int-settings__lede">
          Enter each account, then tap Connect — we confirm it works or ask you to correct it.
        </p>
      </header>

      <section className="int-card" aria-label="Centralized Feed">
        <header className="int-card__head">
          <span className="int-card__icon" aria-hidden>
            ◎
          </span>
          <h3>Integrations</h3>
        </header>
        {!anyEnabled ? (
          <p className="int-card__hint">
            Nothing is live until a connection succeeds. Webhooks still POST to{' '}
            <code>/api/lattice-collaborate-feed</code>.
          </p>
        ) : null}
        <ul className="int-list">
          {integrations.map((integ) => {
            const id = integ.id as IntegrationId;
            const name = displayName(id);
            const draft = draftFor(id, integ.accountLabel);
            const status = integ.connectionStatus || 'idle';
            const checking = busyId === id || status === 'checking';
            return (
              <li key={id} className="int-row int-row--verify">
                <div className="int-row__top">
                  <span className="int-toggle__badge" data-id={id}>
                    {badge(id)}
                  </span>
                  <span className="int-row__name">{name}</span>
                  {integ.enabled && status === 'connected' ? (
                    <span className="int-status int-status--ok">Connected</span>
                  ) : null}
                  {integ.enabled ? (
                    <button
                      type="button"
                      className="int-disconnect"
                      onClick={() => setIntegrationEnabled(id, false)}
                    >
                      Disconnect
                    </button>
                  ) : null}
                </div>
                <label className="int-field">
                  <span className="int-field__label">Account</span>
                  <input
                    className="int-account"
                    type="text"
                    placeholder={placeholderFor(id)}
                    value={draft}
                    disabled={checking}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDrafts((d) => ({ ...d, [id]: v }));
                      setIntegrationAccount(id, v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void connect(id);
                      }
                    }}
                    aria-label={`${name} account`}
                    autoComplete="off"
                    enterKeyHint="go"
                  />
                </label>
                <div className="int-row__actions">
                  <button
                    type="button"
                    className="int-connect"
                    disabled={checking || !draft.trim()}
                    onClick={() => void connect(id)}
                  >
                    {checking ? 'Checking…' : integ.enabled ? 'Re-check' : 'Connect'}
                  </button>
                </div>
                {integ.connectionMessage ? (
                  <p
                    className={`int-verify-msg${status === 'error' ? ' int-verify-msg--err' : status === 'connected' ? ' int-verify-msg--ok' : ''}`}
                    role="status"
                  >
                    {integ.connectionMessage}
                  </p>
                ) : null}
                {status === 'error' && integ.connectionHint ? (
                  <p className="int-verify-hint">{integ.connectionHint}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
        <div className="int-filters" role="group" aria-label="Event filters">
          <p className="int-filters__label">Show in feed</p>
          {FILTER_LABELS.map(({ key, label }) => (
            <label key={key} className="int-check">
              <input
                type="checkbox"
                checked={Boolean(eventFilters[key])}
                onChange={(e) => setEventFilter(key, e.target.checked)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="int-card" aria-label="Connected Peers">
        <h3>Workspace seats</h3>
        <p className="int-card__hint">Lattice access for now — you and Daniel.</p>
        <ul className="int-peers">
          {peers.map((p) => (
            <li key={p.id} title={p.name}>
              <span className="int-peer" data-hue={p.hue}>
                {p.name.slice(0, 1)}
                {p.online ? <i className="int-peer__online" /> : null}
              </span>
              <span className="int-peer__name">{p.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="int-actions">
        <button type="button" className="int-reset" onClick={() => clearFeed()}>
          Clear feed
        </button>
        <button type="button" className="int-reset" onClick={() => resetWorkspace()}>
          Reset integrations
        </button>
      </div>
    </div>
  );
}

function badge(id: string): string {
  if (id === 'facebook') return 'f';
  if (id === 'whatsapp') return 'W';
  if (id === 'github') return 'G';
  if (id === 'gitlab') return 'GL';
  return '·';
}
