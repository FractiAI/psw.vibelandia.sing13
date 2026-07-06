import { useMemo } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { isMasterPlaylist, MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { SONIC_CATALOG_DISPLAY_NAME } from '@/lib/sonicCatalogCopy';
import { resolvePlaylistTrackIds } from '@/lib/playlistNest';
import { PLAIN } from '@/lib/plainSpeak';

interface JukeboxPlaylistMenuProps {
  activeId: string;
  onSelect: (playlistId: string) => void;
}

export function JukeboxPlaylistMenu({ activeId, onSelect }: JukeboxPlaylistMenuProps) {
  const playlists = useCatalogStore((s) => s.playlists);
  const tracks = useCatalogStore((s) => s.tracks);
  const createPlaylist = useCatalogStore((s) => s.createPlaylist);

  const items = useMemo(() => {
    const sorted = [...playlists].sort((a, b) => {
      if (a.id === MASTER_PLAYLIST_ID) return -1;
      if (b.id === MASTER_PLAYLIST_ID) return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
    return sorted.map((p) => ({
      id: p.id,
      name: isMasterPlaylist(p.id) ? SONIC_CATALOG_DISPLAY_NAME : p.name,
      count: resolvePlaylistTrackIds(p.id, tracks, playlists).length,
      isMaster: isMasterPlaylist(p.id),
    }));
  }, [playlists, tracks]);

  return (
    <nav className="jb-pl-menu" aria-label="Catalog menu">
      <header className="jb-pl-menu__head">
        <p className="jb-pl-menu__kicker">Selection panel</p>
        <h2 className="jb-pl-menu__title">Catalog menu</h2>
      </header>

      <ul className="jb-pl-menu__list" role="list">
        {items.map((item, index) => (
          <li key={item.id} className="jb-pl-menu__row">
            <button
              type="button"
              className={`jb-pl-menu__item${activeId === item.id ? ' jb-pl-menu__item--on' : ''}${item.isMaster ? ' jb-pl-menu__item--master' : ''}`}
              onClick={() => onSelect(item.id)}
              aria-current={activeId === item.id ? 'true' : undefined}
            >
              <span className="jb-pl-menu__code">{String(index + 1).padStart(2, '0')}</span>
              <span className="jb-pl-menu__name">{item.name}</span>
              <span className="jb-pl-menu__leaders" aria-hidden="true" />
              <span className="jb-pl-menu__count">{item.count}</span>
            </button>
          </li>
        ))}
      </ul>

      <footer className="jb-pl-menu__foot">
        <button
          type="button"
          className="jb-pl-menu__item jb-pl-menu__item--action"
          onClick={() => {
            const id = createPlaylist(PLAIN.newPlaylist);
            onSelect(id);
          }}
        >
          <span className="jb-pl-menu__code">+</span>
          <span className="jb-pl-menu__name">{PLAIN.newPlaylist}</span>
          <span className="jb-pl-menu__leaders" aria-hidden="true" />
          <span className="jb-pl-menu__count">new</span>
        </button>
      </footer>
    </nav>
  );
}
