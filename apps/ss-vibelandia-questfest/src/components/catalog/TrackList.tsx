import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { useActivePlaylist, useResolvedTrackIds } from '@/stores/catalogSelectors';
import { usePlaybackStore } from '@/stores/playbackStore';
import { usePlaylistReorder } from '@/hooks/usePlaylistReorder';
import { LikeButton } from '@/components/catalog/LikeButton';
import { AddToPlaylistIcon } from '@/components/catalog/AddToPlaylistIcon';
import { TrackPlaylistsModal } from '@/components/catalog/TrackPlaylistsModal';
import { TrackEditModal } from '@/components/catalog/TrackEditModal';
import { PlaylistPicker } from '@/components/catalog/PlaylistPicker';
import { isMyLikesPlaylist } from '@/lib/catalogSeed';
import { playTrackById } from '@/lib/trackPlayback';
import { fmtDuration } from '@/lib/formatDuration';
import { PLAIN } from '@/lib/plainSpeak';
import { useSessionStore } from '@/stores/sessionStore';
import type { TrackDef } from '@/lib/catalogTypes';

type SortMode = 'playlistOrder' | 'titleAsc' | 'titleDesc';

interface TrackRow {
  track: TrackDef;
  playlistIndex: number;
  canReorder: boolean;
}

export function TrackList() {
  const pl = useActivePlaylist();
  const getTrack = useCatalogStore((s) => s.getTrack);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);
  const activePlaylistId = useCatalogStore((s) => s.activePlaylistId);
  const moveTrackInPlaylist = useCatalogStore((s) => s.moveTrackInPlaylist);
  const reorderTrackInPlaylist = useCatalogStore((s) => s.reorderTrackInPlaylist);
  const resolvedIds = useResolvedTrackIds(pl?.id);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);

  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);

  const [sortMode, setSortMode] = useState<SortMode>('playlistOrder');
  const [editTrackId, setEditTrackId] = useState<string | null>(null);
  const [playlistModalTrackId, setPlaylistModalTrackId] = useState<string | null>(null);

  const isMyLikes = pl ? isMyLikesPlaylist(pl.id) : false;
  const canReorderList = sortMode === 'playlistOrder' && (pl?.trackIds.length ?? 0) > 1;

  const { listRef, dragIndex, overIndex, onGripPointerDown, onGripPointerMove, onGripPointerUp } =
    usePlaylistReorder(activePlaylistId, canReorderList, reorderTrackInPlaylist);

  useEffect(() => {
    setSortMode('playlistOrder');
  }, [activePlaylistId]);

  const rows = useMemo((): TrackRow[] => {
    if (!pl) return [];
    const playlistIndexById = new Map(pl.trackIds.map((id, i) => [id, i]));
    let items = resolvedIds
      .map((id) => {
        const track = getTrack(id);
        if (!track) return null;
        const playlistIndex = playlistIndexById.get(id) ?? -1;
        return {
          track,
          playlistIndex,
          canReorder: playlistIndex >= 0,
        };
      })
      .filter((row): row is TrackRow => !!row);

    if (sortMode === 'titleAsc') {
      items = [...items].sort((a, b) =>
        a.track.title.localeCompare(b.track.title, undefined, { sensitivity: 'base' }),
      );
    } else if (sortMode === 'titleDesc') {
      items = [...items].sort((a, b) =>
        b.track.title.localeCompare(a.track.title, undefined, { sensitivity: 'base' }),
      );
    }

    return items;
  }, [pl, resolvedIds, getTrack, sortMode]);

  const play = useCallback(
    (id: string) => {
      setActivePlaylist(activePlaylistId);
      playTrackById(id, getTrack);
    },
    [activePlaylistId, getTrack, setActivePlaylist],
  );

  const moveInPlaylist = useCallback(
    (trackId: string, dir: -1 | 1) => {
      moveTrackInPlaylist(activePlaylistId, trackId, dir);
    },
    [activePlaylistId, moveTrackInPlaylist],
  );

  if (!pl) {
    return <p className="sc-empty">{PLAIN.pickPlaylist}</p>;
  }

  const playlistModalTrack = playlistModalTrackId ? getTrack(playlistModalTrackId) : undefined;
  const editTrack = editTrackId ? getTrack(editTrackId) : undefined;

  return (
    <section className="sc-feed">
      <div className="sc-feed-picker">
        <PlaylistPicker />
      </div>

      {rows.length > 0 ? (
        <div className="sc-sort-bar sc-feed-body">
          <span className="sc-sort-label">{PLAIN.sortBy}</span>
          <button
            type="button"
            className={`sc-sort-btn${sortMode === 'playlistOrder' ? ' sc-sort-btn--on' : ''}`}
            onClick={() => setSortMode('playlistOrder')}
          >
            {PLAIN.sortOrder}
          </button>
          <button
            type="button"
            className={`sc-sort-btn${sortMode === 'titleAsc' ? ' sc-sort-btn--on' : ''}`}
            onClick={() => setSortMode('titleAsc')}
          >
            {PLAIN.sortAscending}
          </button>
          <button
            type="button"
            className={`sc-sort-btn${sortMode === 'titleDesc' ? ' sc-sort-btn--on' : ''}`}
            onClick={() => setSortMode('titleDesc')}
          >
            {PLAIN.sortDescending}
          </button>
          {canReorderList ? (
            <span className="sc-sort-hint">{PLAIN.reorderHint}</span>
          ) : (
            <span className="sc-sort-hint">{PLAIN.addToPlaylistHint}</span>
          )}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <p className="sc-empty sc-feed-body">
          {isMyLikes ? PLAIN.myLikesEmpty : PLAIN.noTracksYet}
        </p>
      ) : (
        <ol className="sc-track-list sc-feed-body" ref={listRef}>
          {rows.map((row, displayIndex) => {
            const tr = row.track;
            const active = currentTrackId === tr.id;
            const dragging = canReorderList && row.canReorder && dragIndex === row.playlistIndex;
            const dropBefore =
              canReorderList &&
              row.canReorder &&
              overIndex === row.playlistIndex &&
              dragIndex !== null &&
              dragIndex !== row.playlistIndex;

            return (
              <li
                key={tr.id}
                data-reorder-idx={row.canReorder ? row.playlistIndex : undefined}
                className={`sc-track-row${active ? ' sc-track-row--on' : ''}${dragging ? ' sc-track-row--dragging' : ''}${dropBefore ? ' sc-track-row--drop' : ''}`}
                onDoubleClick={() => play(tr.id)}
              >
                {canReorderList && row.canReorder ? (
                  <button
                    type="button"
                    className="sc-track-grip"
                    aria-label={`Move ${tr.title}`}
                    onPointerDown={(e) => onGripPointerDown(row.playlistIndex, e)}
                    onPointerMove={onGripPointerMove}
                    onPointerUp={(e) => onGripPointerUp(row.playlistIndex, e)}
                    onPointerCancel={(e) => onGripPointerUp(row.playlistIndex, e)}
                  >
                    ⋮⋮
                  </button>
                ) : null}
                <button
                  type="button"
                  className="sc-track-play"
                  onClick={() => play(tr.id)}
                  aria-label={`${active && isPlaying ? 'Pause' : 'Play'} ${tr.title}`}
                >
                  {active && isPlaying ? '⏸' : '▶'}
                </button>
                <span className="sc-track-idx">{displayIndex + 1}</span>
                <button type="button" className="sc-track-main" onClick={() => play(tr.id)}>
                  <span className="sc-track-title">{tr.title}</span>
                  <span className="sc-track-sub">
                    {tr.artist}
                    {tr.genre ? ` · ${tr.genre}` : ''}
                  </span>
                  {tr.description ? (
                    <span className="sc-track-desc">{tr.description}</span>
                  ) : null}
                </button>
                {canReorderList && row.canReorder ? (
                  <span className="sc-track-moves">
                    <button
                      type="button"
                      className="sc-track-move"
                      aria-label={`${PLAIN.moveUp}: ${tr.title}`}
                      disabled={row.playlistIndex <= 0}
                      onClick={() => moveInPlaylist(tr.id, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="sc-track-move"
                      aria-label={`${PLAIN.moveDown}: ${tr.title}`}
                      disabled={row.playlistIndex >= pl.trackIds.length - 1}
                      onClick={() => moveInPlaylist(tr.id, 1)}
                    >
                      ↓
                    </button>
                  </span>
                ) : null}
                <div className="sc-track-actions">
                  <span className="sc-track-dur">{fmtDuration(tr.durationSec)}</span>
                  <AddToPlaylistIcon onClick={() => setPlaylistModalTrackId(tr.id)} />
                  <LikeButton trackId={tr.id} />
                  {captainUnlocked ? (
                    <button
                      type="button"
                      className="sc-track-edit"
                      aria-label={PLAIN.editTrack}
                      title={PLAIN.editTrack}
                      onClick={() => setEditTrackId(tr.id)}
                    >
                      ✎
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {playlistModalTrack ? (
        <TrackPlaylistsModal
          open
          trackId={playlistModalTrack.id}
          trackTitle={playlistModalTrack.title}
          onClose={() => setPlaylistModalTrackId(null)}
        />
      ) : null}

      {editTrack ? (
        <TrackEditModal track={editTrack} open onClose={() => setEditTrackId(null)} />
      ) : null}
    </section>
  );
}
