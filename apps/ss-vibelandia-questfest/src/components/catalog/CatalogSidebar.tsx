import { useCatalogStore } from '@/stores/catalogStore';

interface CatalogSidebarProps {
  onDjClick: () => void;
}

export function CatalogSidebar({ onDjClick }: CatalogSidebarProps) {
  const playlists = useCatalogStore((s) => s.playlists);
  const activeId = useCatalogStore((s) => s.activePlaylistId);
  const setActive = useCatalogStore((s) => s.setActivePlaylist);
  const djMode = useCatalogStore((s) => s.djMode);
  const setDjMode = useCatalogStore((s) => s.setDjMode);
  const trackCount = useCatalogStore((s) => Object.keys(s.tracks).length);

  const openListen = (id: string) => {
    setDjMode(false);
    setActive(id);
  };

  return (
    <aside className="sp-side">
      <div className="sp-side-logo">
        <span className="sp-logo-mark" aria-hidden>♪</span>
        <div>
          <strong>Reno Swamp</strong>
          <span>{trackCount} tracks</span>
        </div>
      </div>

      <nav className="sp-side-nav">
        <button
          type="button"
          className={`sp-side-link${!djMode ? ' sp-side-link--on' : ''}`}
          onClick={() => {
            setDjMode(false);
            if (!activeId && playlists[0]) setActive(playlists[0].id);
          }}
        >
          <span className="sp-side-icon">🏠</span> Listen
        </button>
        <button
          type="button"
          className={`sp-side-link sp-side-link--dj${djMode ? ' sp-side-link--on' : ''}`}
          onClick={() => {
            setDjMode(true);
            onDjClick();
          }}
        >
          <span className="sp-side-icon">⬆</span> Upload
        </button>
      </nav>

      <div className="sp-side-section">
        <p className="sp-side-label">Your playlists</p>
        <ul className="sp-pl-list">
          {playlists.map((pl) => (
            <li key={pl.id}>
              <button
                type="button"
                className={`sp-pl-item${pl.id === activeId && !djMode ? ' sp-pl-item--on' : ''}`}
                onClick={() => openListen(pl.id)}
              >
                <span className="sp-pl-cover" aria-hidden>🎵</span>
                <span className="sp-pl-text">
                  <span className="sp-pl-name">{pl.name}</span>
                  <span className="sp-pl-count">{pl.trackIds.length} tracks</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
