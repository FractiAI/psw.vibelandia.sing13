import { useMemo, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { isMasterPlaylist, MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { SONIC_CATALOG_DISPLAY_NAME } from '@/lib/sonicCatalogCopy';
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

function CatalogPickerModal({
  items,
  activeId,
  onSelect,
  onClose,
  onCreate,
}: {
  items: MenuItem[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="jb-pl-picker-backdrop" role="presentation" onClick={onClose}>
      <div
        className="jb-pl-picker"
        role="dialog"
        aria-label="Catalog menu"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="jb-pl-picker__head">
          <div>
            <p className="jb-pl-menu__kicker">Selection panel</p>
            <h2 className="jb-pl-menu__title">Catalog menu</h2>
          </div>
          <button type="button" className="jb-pl-picker__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <ul className="jb-pl-picker__list" role="list">
          {items.map((item) => (
            <li key={item.id} className="jb-pl-menu__row">
              <button
                type="button"
                className={`jb-pl-menu__item${activeId === item.id ? ' jb-pl-menu__item--on' : ''}${item.isMaster ? ' jb-pl-menu__item--master' : ''}`}
                onClick={() => {
                  onSelect(item.id);
                  onClose();
                }}
                aria-current={activeId === item.id ? 'true' : undefined}
              >
                <span className="jb-pl-menu__code">{item.code}</span>
                <span className="jb-pl-menu__name">{item.name}</span>
                <span className="jb-pl-menu__leaders" aria-hidden="true" />
                <span className="jb-pl-menu__count">{item.count}</span>
              </button>
            </li>
          ))}
        </ul>

        <footer className="jb-pl-picker__foot">
          <button
            type="button"
            className="jb-pl-menu__item jb-pl-menu__item--action"
            onClick={() => {
              onCreate();
              onClose();
            }}
          >
            <span className="jb-pl-menu__code">+</span>
            <span className="jb-pl-menu__name">{PLAIN.newPlaylist}</span>
            <span className="jb-pl-menu__leaders" aria-hidden="true" />
            <span className="jb-pl-menu__count">new</span>
          </button>
        </footer>
      </div>
    </div>
  );
}

/** Sticky bar — selected catalog only; full menu opens in a modal. */
export function JukeboxPlaylistMenu({ activeId, onSelect }: JukeboxPlaylistMenuProps) {
  const createPlaylist = useCatalogStore((s) => s.createPlaylist);
  const items = useMenuItems();
  const [pickerOpen, setPickerOpen] = useState(false);

  const active =
    items.find((item) => item.id === activeId) ??
    items.find((item) => item.id === MASTER_PLAYLIST_ID) ??
    items[0];

  const handleCreate = () => {
    const id = createPlaylist(PLAIN.newPlaylist);
    onSelect(id);
  };

  if (!active) {
    return (
      <div className="jb-pl-active">
        <p className="jb-pl-active__empty">No catalogs yet.</p>
        <button type="button" className="jb-pl-active__btn" onClick={handleCreate}>
          + {PLAIN.newPlaylist}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="jb-pl-active" aria-label="Selected catalog">
        <header className="jb-pl-active__head">
          <p className="jb-pl-menu__kicker">Now playing from</p>
          <h2 className="jb-pl-active__title">{active.name}</h2>
        </header>

        <div
          className={`jb-pl-active__row${active.isMaster ? ' jb-pl-active__row--master' : ''}`}
          aria-current="true"
        >
          <span className="jb-pl-menu__code">{active.code}</span>
          <span className="jb-pl-menu__name">{active.name}</span>
          <span className="jb-pl-menu__leaders" aria-hidden="true" />
          <span className="jb-pl-menu__count">{active.count}</span>
        </div>

        <div className="jb-pl-active__actions">
          <button type="button" className="jb-pl-active__btn" onClick={() => setPickerOpen(true)}>
            Change catalog
          </button>
          <button type="button" className="jb-pl-active__btn jb-pl-active__btn--ghost" onClick={handleCreate}>
            + {PLAIN.newPlaylist}
          </button>
        </div>
      </div>

      {pickerOpen ? (
        <CatalogPickerModal
          items={items}
          activeId={activeId}
          onSelect={onSelect}
          onClose={() => setPickerOpen(false)}
          onCreate={handleCreate}
        />
      ) : null}
    </>
  );
}
