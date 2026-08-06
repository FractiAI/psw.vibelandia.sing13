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
  const setEventFilter = useUnifiedFeed((s) => s.setEventFilter);
  const peers = useUnifiedFeed((s) => s.peers);
  const resetDemoFeed = useUnifiedFeed((s) => s.resetDemoFeed);

  return (
    <div className="int-settings">
      <header className="int-settings__hero">
        <p className="int-settings__eyebrow">Lattice Workspace</p>
        <h2>Settings</h2>
        <p className="int-settings__lede">Integrations · Centralized Feed</p>
      </header>

      <section className="int-card" aria-label="Centralized Feed">
        <header className="int-card__head">
          <span className="int-card__icon" aria-hidden>
            ◎
          </span>
          <h3>Centralized Feed</h3>
        </header>
        <ul className="int-list">
          {integrations.map((integ) => (
            <li key={integ.id}>
              <label className="int-toggle">
                <input
                  type="checkbox"
                  checked={integ.enabled}
                  onChange={(e) => setIntegrationEnabled(integ.id as IntegrationId, e.target.checked)}
                />
                <span className="int-toggle__badge" data-id={integ.id}>
                  {badge(integ.id)}
                </span>
                <span>{integ.label}</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="int-filters" role="group" aria-label="Event filters">
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
        <h3>Connected Peers</h3>
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

      <button type="button" className="int-reset" onClick={() => resetDemoFeed()}>
        Reset demo feed
      </button>
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
