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
    <nav className="jb-catalog-menu" aria-label="Playlist catalog">
      <p className="jb-catalog-menu__label">Catalogs</p>
      <ul className="jb-catalog-menu__list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`jb-catalog-btn${activeId === item.id ? ' jb-catalog-btn--on' : ''}${item.isMaster ? ' jb-catalog-btn--master' : ''}`}
              onClick={() => onSelect(item.id)}
              aria-current={activeId === item.id ? 'true' : undefined}
            >
              <span className="jb-catalog-btn__name">{item.name}</span>
              <span className="jb-catalog-btn__count">{item.count} tracks</span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="jb-catalog-new"
        onClick={() => {
          const id = createPlaylist(PLAIN.newPlaylist);
          onSelect(id);
        }}
      >
        + {PLAIN.newPlaylist}
      </button>
    </nav>
  );
}
