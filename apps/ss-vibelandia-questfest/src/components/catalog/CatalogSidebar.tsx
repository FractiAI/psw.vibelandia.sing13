import { useCatalogStore } from '@/stores/catalogStore';
import { isMasterPlaylist, MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { useMemo } from 'react';

interface CatalogSidebarProps {
  onDjClick: () => void;
}

export function CatalogSidebar({ onDjClick }: CatalogSidebarProps) {
  const playlists = useCatalogStore((s) => s.playlists);
  const activeId = useCatalogStore((s) => s.activePlaylistId);
  const setActive = useCatalogStore((s) => s.setActivePlaylist);
  const createPlaylist = useCatalogStore((s) => s.createPlaylist);
  const djMode = useCatalogStore((s) => s.djMode);
  const setDjMode = useCatalogStore((s) => s.setDjMode);
  const trackCount = useCatalogStore((s) => Object.keys(s.tracks).length);

  const openListen = (id: string) => {
    setDjMode(false);
    setActive(id);
  };

  const sortedPls = useMemo(() => {
    return [...playlists].sort((a, b) => {
      if (a.id === MASTER_PLAYLIST_ID) return -1;
      if (b.id === MASTER_PLAYLIST_ID) return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
  }, [playlists]);

  const sidebarPls = useMemo(
    () =>
      sortedPls.filter(
        (pl) => isMasterPlaylist(pl.id) || pl.trackIds.length > 0 || pl.id === activeId,
      ),
    [sortedPls, activeId],
  );

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
            if (!activeId && playlists[0]) {
              const first =
                playlists.find((p) => p.id === MASTER_PLAYLIST_ID) ?? playlists[0];
              setActive(first.id);
            }
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
        <div className="sp-side-label-row">
          <p className="sp-side-label">Your playlists</p>
          <button
            type="button"
            className="sp-side-new"
            onClick={() => createPlaylist('New playlist')}
            aria-label="New playlist"
          >
            +
          </button>
        </div>
        <ul className="sp-pl-list">
          {sidebarPls.map((pl) => (
            <li key={pl.id}>
              <button
                type="button"
                className={`sp-pl-item${pl.id === activeId && !djMode ? ' sp-pl-item--on' : ''}`}
                onClick={() => openListen(pl.id)}
              >
                <span className="sp-pl-cover" aria-hidden>
                  {isMasterPlaylist(pl.id) ? '📚' : '🎵'}
                </span>
                <span className="sp-pl-text">
                  <span className="sp-pl-name">
                    {pl.name}
                  </span>
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
