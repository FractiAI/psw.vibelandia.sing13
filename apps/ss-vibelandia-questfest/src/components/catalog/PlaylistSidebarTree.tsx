import { useMemo, type CSSProperties } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { PlaylistCoverArt } from '@/components/catalog/PlaylistCoverArt';
import {
  isMasterPlaylist,
  isMyLikesPlaylist,
  MASTER_PLAYLIST_ID,
  MY_LIKES_PLAYLIST_ID,
} from '@/lib/catalogSeed';
import { getDirectChildPlaylists, getParentPlaylistId, topLevelUserPlaylists } from '@/lib/playlistNest';
import { PLAIN } from '@/lib/plainSpeak';
import type { PlaylistDef } from '@/lib/catalogTypes';

interface PlaylistSidebarTreeProps {
  activeId: string;
  djMode: boolean;
  onSelect: (id: string) => void;
  onCreate: (parentId?: string) => void;
}

function PlaylistTreeRow({
  pl,
  depth,
  activeId,
  djMode,
  playlists,
  onSelect,
  onCreate,
}: {
  pl: PlaylistDef;
  depth: number;
  activeId: string;
  djMode: boolean;
  playlists: PlaylistDef[];
  onSelect: (id: string) => void;
  onCreate: (parentId?: string) => void;
}) {
  const getResolvedTrackIds = useCatalogStore((s) => s.getResolvedTrackIds);
  const children = getDirectChildPlaylists(pl.id, playlists);
  const count = isMasterPlaylist(pl.id) ? pl.trackIds.length : getResolvedTrackIds(pl.id).length;

  return (
    <>
      <li className="sc-tree-item" style={{ '--sc-depth': depth } as CSSProperties}>
        <button
          type="button"
          className={`sc-tree-btn${pl.id === activeId && !djMode ? ' sc-tree-btn--on' : ''}`}
          onClick={() => onSelect(pl.id)}
        >
          <PlaylistCoverArt playlist={pl} size={28} className="sc-tree-icon" />
          <span className="sc-tree-text">
            <span className="sc-tree-name">{pl.name}</span>
            <span className="sc-tree-count">
              {count} {PLAIN.tracks}
            </span>
          </span>
        </button>
        {!isMasterPlaylist(pl.id) && !isMyLikesPlaylist(pl.id) && (
          <button
            type="button"
            className="sc-tree-add"
            title={PLAIN.newNestedPlaylist}
            aria-label={PLAIN.newNestedPlaylist}
            onClick={(e) => {
              e.stopPropagation();
              onCreate(pl.id);
            }}
          >
            +
          </button>
        )}
      </li>
      {children.map((child) => (
        <PlaylistTreeRow
          key={child.id}
          pl={child}
          depth={depth + 1}
          activeId={activeId}
          djMode={djMode}
          playlists={playlists}
          onSelect={onSelect}
          onCreate={onCreate}
        />
      ))}
    </>
  );
}

export function PlaylistSidebarTree({ activeId, djMode, onSelect, onCreate }: PlaylistSidebarTreeProps) {
  const playlists = useCatalogStore((s) => s.playlists);
  const masterPl = useMemo(() => playlists.find((p) => p.id === MASTER_PLAYLIST_ID), [playlists]);
  const myLikes = useMemo(() => playlists.find((p) => p.id === MY_LIKES_PLAYLIST_ID), [playlists]);
  const topLevel = useMemo(() => topLevelUserPlaylists(playlists), [playlists]);

  return (
    <div className="sc-tree">
      <div className="sc-tree-section">
        <button
          type="button"
          className={`sc-tree-btn sc-tree-btn--master${activeId === MASTER_PLAYLIST_ID && !djMode ? ' sc-tree-btn--on' : ''}`}
          onClick={() => onSelect(MASTER_PLAYLIST_ID)}
        >
          <PlaylistCoverArt playlist={masterPl ?? { id: MASTER_PLAYLIST_ID }} size={28} className="sc-tree-icon" />
          <span className="sc-tree-text">
            <span className="sc-tree-name">{PLAIN.library}</span>
            <span className="sc-tree-count">
              {masterPl?.trackIds.length ?? 0} {PLAIN.tracks}
            </span>
          </span>
        </button>
      </div>

      {myLikes ? (
        <div className="sc-tree-section">
          <button
            type="button"
            className={`sc-tree-btn${activeId === MY_LIKES_PLAYLIST_ID && !djMode ? ' sc-tree-btn--on' : ''}`}
            onClick={() => onSelect(MY_LIKES_PLAYLIST_ID)}
          >
            <span className="sc-tree-icon" aria-hidden>
              ♥
            </span>
            <span className="sc-tree-text">
              <span className="sc-tree-name">{PLAIN.myLikes}</span>
              <span className="sc-tree-count">
                {myLikes.trackIds.length} {PLAIN.tracks}
              </span>
            </span>
          </button>
        </div>
      ) : null}

      <div className="sc-tree-section">
        <div className="sc-tree-head">
          <span className="sc-tree-label">{PLAIN.playlists}</span>
          <button type="button" className="sc-tree-add" onClick={() => onCreate()} aria-label={PLAIN.newPlaylist}>
            +
          </button>
        </div>
        <ul className="sc-tree-list">
          {topLevel.map((pl) => (
            <PlaylistTreeRow
              key={pl.id}
              pl={pl}
              depth={0}
              activeId={activeId}
              djMode={djMode}
              playlists={playlists}
              onSelect={onSelect}
              onCreate={onCreate}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Breadcrumb when viewing a nested playlist. */
export function PlaylistBreadcrumb({
  playlistId,
  onNavigate,
}: {
  playlistId: string;
  onNavigate: (id: string) => void;
}) {
  const playlists = useCatalogStore((s) => s.playlists);
  const chain = useMemo(() => {
    const out: PlaylistDef[] = [];
    let id: string | null = playlistId;
    const guard = new Set<string>();
    while (id && !guard.has(id)) {
      guard.add(id);
      const pl = playlists.find((p) => p.id === id);
      if (!pl) break;
      out.unshift(pl);
      id = getParentPlaylistId(id, playlists);
    }
    return out;
  }, [playlistId, playlists]);

  if (chain.length <= 1) return null;

  return (
    <nav className="sc-crumb" aria-label="Playlist path">
      {chain.map((pl, i) => (
        <span key={pl.id} className="sc-crumb-seg">
          {i > 0 ? <span className="sc-crumb-sep">/</span> : null}
          <button type="button" className="sc-crumb-link" onClick={() => onNavigate(pl.id)}>
            {pl.name}
          </button>
        </span>
      ))}
    </nav>
  );
}
