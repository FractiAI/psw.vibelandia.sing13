import { useMemo, useState, type CSSProperties } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { PlaylistCoverArt } from '@/components/catalog/PlaylistCoverArt';
import { PlaylistMetaModal } from '@/components/catalog/PlaylistMetaModal';
import {
  isMasterPlaylist,
  isMyLikesPlaylist,
  MASTER_PLAYLIST_DEFAULT_NAME,
  MASTER_PLAYLIST_ID,
  MY_LIKES_PLAYLIST_ID,
} from '@/lib/catalogSeed';
import { getDirectChildPlaylists, topLevelUserPlaylists } from '@/lib/playlistNest';
import { PLAIN } from '@/lib/plainSpeak';
import { useSessionStore } from '@/stores/sessionStore';
import type { PlaylistDef } from '@/lib/catalogTypes';

function PickerRow({
  pl,
  depth,
  activeId,
  onSelect,
  onClose,
}: {
  pl: PlaylistDef;
  depth: number;
  activeId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const playlists = useCatalogStore((s) => s.playlists);
  const getResolvedTrackIds = useCatalogStore((s) => s.getResolvedTrackIds);
  const children = getDirectChildPlaylists(pl.id, playlists);
  const count = isMasterPlaylist(pl.id) ? pl.trackIds.length : getResolvedTrackIds(pl.id).length;
  const label = isMasterPlaylist(pl.id) ? MASTER_PLAYLIST_DEFAULT_NAME : pl.name;

  return (
    <>
      <li className="sc-pick-item" style={{ '--sc-pick-depth': depth } as CSSProperties}>
        <button
          type="button"
          className={`sc-pick-row${pl.id === activeId ? ' sc-pick-row--on' : ''}`}
          onClick={() => {
            onSelect(pl.id);
            onClose();
          }}
        >
          <PlaylistCoverArt playlist={pl} size={36} className="sc-pick-cover" />
          <span className="sc-pick-meta">
            <span className="sc-pick-name">{label}</span>
            <span className="sc-pick-count">
              {count} {PLAIN.tracks}
            </span>
          </span>
        </button>
      </li>
      {children.map((child) => (
        <PickerRow
          key={child.id}
          pl={child}
          depth={depth + 1}
          activeId={activeId}
          onSelect={onSelect}
          onClose={onClose}
        />
      ))}
    </>
  );
}

export function PlaylistPicker() {
  const [open, setOpen] = useState(false);
  const [metaOpen, setMetaOpen] = useState(false);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);
  const activeId = useCatalogStore((s) => s.activePlaylistId);
  const setActive = useCatalogStore((s) => s.setActivePlaylist);
  const createPlaylist = useCatalogStore((s) => s.createPlaylist);
  const playlists = useCatalogStore((s) => s.playlists);

  const activePl = useMemo(() => playlists.find((p) => p.id === activeId), [playlists, activeId]);
  const myLikes = useMemo(() => playlists.find((p) => p.id === MY_LIKES_PLAYLIST_ID), [playlists]);
  const topLevel = useMemo(() => topLevelUserPlaylists(playlists), [playlists]);
  const masterPl = useMemo(() => playlists.find((p) => p.id === MASTER_PLAYLIST_ID), [playlists]);

  const buttonLabel =
    activeId === MASTER_PLAYLIST_ID || !activePl
      ? MASTER_PLAYLIST_DEFAULT_NAME
      : isMyLikesPlaylist(activeId)
        ? PLAIN.myLikes
        : activePl.name;

  return (
    <>
      <div className="sc-feed-picker-row">
        <button type="button" className="sc-pick-trigger" onClick={() => setOpen(true)} aria-expanded={open}>
          {buttonLabel}
          <span aria-hidden> ▾</span>
        </button>
        {captainUnlocked && !isMyLikesPlaylist(activeId) ? (
          <button
            type="button"
            className="sc-pick-edit"
            onClick={() => setMetaOpen(true)}
            aria-label={PLAIN.editCover}
            title={PLAIN.editCover}
          >
            ✎
          </button>
        ) : null}
      </div>

      {activePl?.description?.trim() ? (
        <p className="sc-feed-pl-desc">{activePl.description}</p>
      ) : null}

      <PlaylistMetaModal playlistId={activeId} open={metaOpen} onClose={() => setMetaOpen(false)} />

      {open ? (
        <div className="sc-pick-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="sc-pick-panel"
            role="dialog"
            aria-label={PLAIN.playlists}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sc-pick-head">
              <h2>{PLAIN.playlists}</h2>
              <button type="button" className="sc-pick-close" onClick={() => setOpen(false)} aria-label="Close">
                ×
              </button>
            </div>
            <ul className="sc-pick-list">
              {masterPl ? (
                <PickerRow
                  pl={masterPl}
                  depth={0}
                  activeId={activeId}
                  onSelect={setActive}
                  onClose={() => setOpen(false)}
                />
              ) : null}
              {myLikes ? (
                <PickerRow
                  pl={myLikes}
                  depth={0}
                  activeId={activeId}
                  onSelect={setActive}
                  onClose={() => setOpen(false)}
                />
              ) : null}
              {topLevel.map((pl) => (
                <PickerRow
                  key={pl.id}
                  pl={pl}
                  depth={0}
                  activeId={activeId}
                  onSelect={setActive}
                  onClose={() => setOpen(false)}
                />
              ))}
            </ul>
            <div className="sc-pick-foot">
              <button
                type="button"
                className="sc-pick-new"
                onClick={() => {
                  createPlaylist(PLAIN.newPlaylist);
                  setOpen(false);
                }}
              >
                + {PLAIN.newPlaylist}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
