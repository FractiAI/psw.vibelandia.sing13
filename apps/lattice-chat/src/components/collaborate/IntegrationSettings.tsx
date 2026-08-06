import { useUnifiedFeed } from '@/feed/store';
import type { EventFilterKey, IntegrationId } from '@/feed/types';

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
  const setEventFilter = useUnifiedFeed((s) => s.setEventFilter);
  const peers = useUnifiedFeed((s) => s.peers);
  const clearFeed = useUnifiedFeed((s) => s.clearFeed);
  const resetWorkspace = useUnifiedFeed((s) => s.resetWorkspace);
  const anyEnabled = integrations.some((i) => i.enabled);

  return (
    <div className="int-settings">
      <header className="int-settings__hero">
        <p className="int-settings__eyebrow">Lattice Workspace</p>
        <h2>Settings</h2>
        <p className="int-settings__lede">
          Turn on the feeds you use. Empty until you enable one — no sample stream.
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
            Enable GitHub, WhatsApp, or Facebook when you are ready. Webhooks POST to{' '}
            <code>/api/lattice-collaborate-feed</code>, then land in your feed.
          </p>
        ) : null}
        <ul className="int-list">
          {integrations.map((integ) => (
            <li key={integ.id} className="int-row">
              <label className="int-toggle">
                <input
                  type="checkbox"
                  checked={integ.enabled}
                  onChange={(e) => setIntegrationEnabled(integ.id as IntegrationId, e.target.checked)}
                />
                <span className="int-toggle__badge" data-id={integ.id}>
                  {badge(integ.id)}
                </span>
                <span>{integ.id === 'facebook' ? 'Facebook' : integ.id === 'whatsapp' ? 'WhatsApp' : integ.id === 'github' ? 'GitHub' : 'GitLab'}</span>
              </label>
              {integ.enabled ? (
                <input
                  className="int-account"
                  type="text"
                  placeholder="Account or repo label (optional)"
                  value={integ.accountLabel}
                  onChange={(e) => setIntegrationAccount(integ.id as IntegrationId, e.target.value)}
                  aria-label={`${integ.id} account label`}
                />
              ) : null}
            </li>
          ))}
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
