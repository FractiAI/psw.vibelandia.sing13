import { useMemo, useRef, useEffect } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { isMasterPlaylist, MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import {
  SONIC_CATALOG_DISPLAY_NAME,
  PLAYLIST_MENU_KICKER,
  PLAYLIST_MENU_TITLE,
} from '@/lib/sonicCatalogCopy';
import { resolvePlaylistTrackIds } from '@/lib/playlistNest';
import { PLAIN } from '@/lib/plainSpeak';

interface JukeboxPlaylistMenuProps {
  activeId: string;
  onSelect: (playlistId: string) => void;
}

type MenuItem = {
  id: string;
  name: string;
  count: number;
  isMaster: boolean;
  code: string;
};

function useMenuItems() {
  const playlists = useCatalogStore((s) => s.playlists);
  const tracks = useCatalogStore((s) => s.tracks);

  return useMemo(() => {
    const sorted = [...playlists].sort((a, b) => {
      if (a.id === MASTER_PLAYLIST_ID) return -1;
      if (b.id === MASTER_PLAYLIST_ID) return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
    return sorted.map((p, index) => ({
      id: p.id,
      name: isMasterPlaylist(p.id) ? SONIC_CATALOG_DISPLAY_NAME : p.name,
      count: resolvePlaylistTrackIds(p.id, tracks, playlists).length,
      isMaster: isMasterPlaylist(p.id),
      code: String(index + 1).padStart(2, '0'),
    }));
  }, [playlists, tracks]);
}

/** Sticky bar — kicker + title header, horizontally scrollable two-line playlist cards. */
export function JukeboxPlaylistMenu({ activeId, onSelect }: JukeboxPlaylistMenuProps) {
  const createPlaylist = useCatalogStore((s) => s.createPlaylist);
  const items = useMenuItems();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeCardRef = useRef<HTMLButtonElement>(null);

  const handleCreate = () => {
    const id = createPlaylist(PLAIN.newPlaylist);
    onSelect(id);
  };

  useEffect(() => {
    const card = activeCardRef.current;
    const rail = scrollRef.current;
    if (!card || !rail) return;
    const cardLeft = card.offsetLeft;
    const cardWidth = card.offsetWidth;
    const railWidth = rail.clientWidth;
    const target = cardLeft - (railWidth - cardWidth) / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [activeId, items.length]);

  if (!items.length) {
    return (
      <div className="jb-pl-active" aria-label="Playlist menu">
        <header className="jb-pl-active__head">
          <p className="jb-pl-menu__kicker">{PLAYLIST_MENU_KICKER}</p>
          <h2 className="jb-pl-menu__title jb-pl-active__menu-title">{PLAYLIST_MENU_TITLE}</h2>
        </header>
        <div className="jb-pl-scroll" role="tablist" aria-label="Playlists">
          <button
            type="button"
            className="jb-pl-scroll__card jb-pl-scroll__card--new"
            onClick={handleCreate}
            aria-label={PLAIN.newPlaylist}
          >
            <span className="jb-pl-scroll__title">+ {PLAIN.newPlaylist}</span>
            <span className="jb-pl-scroll__row">
              <span className="jb-pl-menu__code">+</span>
              <span className="jb-pl-menu__name">{PLAIN.newPlaylist}</span>
              <span className="jb-pl-menu__leaders" aria-hidden="true" />
              <span className="jb-pl-menu__count">new</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="jb-pl-active" aria-label="Playlist menu">
      <header className="jb-pl-active__head">
        <p className="jb-pl-menu__kicker">{PLAYLIST_MENU_KICKER}</p>
        <h2 className="jb-pl-menu__title jb-pl-active__menu-title">{PLAYLIST_MENU_TITLE}</h2>
      </header>

      <div ref={scrollRef} className="jb-pl-scroll" role="tablist" aria-label="Playlists">
        <button
          type="button"
          className="jb-pl-scroll__card jb-pl-scroll__card--new"
          onClick={handleCreate}
          aria-label={PLAIN.newPlaylist}
        >
          <span className="jb-pl-scroll__title">+ {PLAIN.newPlaylist}</span>
          <span className="jb-pl-scroll__row">
            <span className="jb-pl-menu__code">+</span>
            <span className="jb-pl-menu__name">{PLAIN.newPlaylist}</span>
            <span className="jb-pl-menu__leaders" aria-hidden="true" />
            <span className="jb-pl-menu__count">new</span>
          </span>
        </button>
        {items.map((item) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={selected ? activeCardRef : undefined}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`jb-pl-scroll__card${selected ? ' jb-pl-scroll__card--on' : ''}${item.isMaster ? ' jb-pl-scroll__card--master' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              <span className="jb-pl-scroll__title">{item.name}</span>
              <span className="jb-pl-scroll__row">
                <span className="jb-pl-menu__code">{item.code}</span>
                <span className="jb-pl-menu__name">{item.name}</span>
                <span className="jb-pl-menu__leaders" aria-hidden="true" />
                <span className="jb-pl-menu__count">{item.count}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
