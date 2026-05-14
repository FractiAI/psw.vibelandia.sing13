import { useCatalogStore } from '@/stores/catalogStore';

export function CatalogSidebar() {
  const playlists = useCatalogStore((s) => s.playlists);
  const activeId = useCatalogStore((s) => s.activePlaylistId);
  const setActive = useCatalogStore((s) => s.setActivePlaylist);
  const djMode = useCatalogStore((s) => s.djMode);
  const setDjMode = useCatalogStore((s) => s.setDjMode);
  const trackCount = useCatalogStore((s) => Object.keys(s.tracks).length);

  return (
    <aside className="spotify-side">
      <div className="spotify-brand">
        <p className="spotify-brand-eyebrow">SS Vibelandia · QUESTFEST</p>
        <h1 className="spotify-brand-title">Reno Swamp Player</h1>
        <p className="spotify-brand-sub">{trackCount} tracks in catalog</p>
      </div>

      <nav className="spotify-nav" aria-label="Playlists">
        <p className="spotify-nav-label">Playlists</p>
        <ul className="spotify-nav-list">
          {playlists.map((pl) => (
            <li key={pl.id}>
              <button
                type="button"
                className={`spotify-nav-item${pl.id === activeId && !djMode ? ' spotify-nav-item--on' : ''}`}
                onClick={() => {
                  setDjMode(false);
                  setActive(pl.id);
                }}
              >
                <span className="spotify-nav-name">{pl.name}</span>
                <span className="spotify-nav-count">{pl.trackIds.length}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="spotify-side-foot">
        <button
          type="button"
          className={`spotify-dj-btn${djMode ? ' spotify-dj-btn--on' : ''}`}
          onClick={() => setDjMode(!djMode)}
        >
          {djMode ? '← Back to catalog' : 'DJ Studio · upload & edit'}
        </button>
        <p className="spotify-side-hint">30 seconds free on every track. Pass unlocks full play.</p>
      </div>
    </aside>
  );
}
