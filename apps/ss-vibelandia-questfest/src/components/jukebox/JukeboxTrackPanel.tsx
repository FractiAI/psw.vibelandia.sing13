import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { useResolvedTrackIds } from '@/stores/catalogSelectors';
import { usePlaybackStore } from '@/stores/playbackStore';
import { usePlaylistReorder } from '@/hooks/usePlaylistReorder';
import { useJukeboxRowGestures, JB_SWIPE_REVEAL_PX } from '@/hooks/useJukeboxRowGestures';
import { TrackPlaylistsModal } from '@/components/catalog/TrackPlaylistsModal';
import { PlaylistMetaModal } from '@/components/catalog/PlaylistMetaModal';
import { LikeButton } from '@/components/catalog/LikeButton';
import { isMasterPlaylist, isMyLikesPlaylist } from '@/lib/catalogSeed';
import { playTrackById } from '@/lib/trackPlayback';
import { fmtDuration } from '@/lib/formatDuration';
import { findDuplicateTrackGroups } from '@/lib/findCatalogDuplicateGroups';
import { nextSequentialTrackId, nextShuffledTrackId } from '@/lib/playlistShuffle';
import { PLAIN } from '@/lib/plainSpeak';
import type { TrackDef } from '@/lib/catalogTypes';

interface JukeboxTrackPanelProps {
  playlistId: string;
}

export function JukeboxTrackPanel({ playlistId }: JukeboxTrackPanelProps) {
  const getTrack = useCatalogStore((s) => s.getTrack);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);
  const removeTrackFromPlaylist = useCatalogStore((s) => s.removeTrackFromPlaylist);
  const reorderTrackInPlaylist = useCatalogStore((s) => s.reorderTrackInPlaylist);
  const deleteTracks = useCatalogStore((s) => s.deleteTracks);
  const resolvedIds = useResolvedTrackIds(playlistId);

  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [playlistModalTrackId, setPlaylistModalTrackId] = useState<string | null>(null);
  const [dupDismissed, setDupDismissed] = useState(false);
  const [dupBusy, setDupBusy] = useState(false);
  const [dupMessage, setDupMessage] = useState<string | null>(null);
  const [metaOpen, setMetaOpen] = useState(false);

  const shuffleEnabled = usePlaybackStore((s) => s.shuffleEnabled);
  const shuffleQueue = usePlaybackStore((s) => s.shuffleQueue);

  const isMaster = isMasterPlaylist(playlistId);
  const isMyLikes = isMyLikesPlaylist(playlistId);
  const canEditPlaylist = !isMyLikes;
  const canReorder = !isMaster && resolvedIds.length > 1;

  const { listRef, dragIndex, overIndex, onGripPointerDown, onGripPointerMove, onGripPointerUp } =
    usePlaylistReorder(playlistId, canReorder, reorderTrackInPlaylist);

  useEffect(() => {
    setSelectMode(false);
    setSelected(new Set());
    setDupDismissed(false);
    setDupMessage(null);
  }, [playlistId]);

  const rows = useMemo(() => {
    const playlistIndexById = new Map(resolvedIds.map((id, i) => [id, i]));
    return resolvedIds
      .map((id) => {
        const track = getTrack(id);
        if (!track) return null;
        return { track, playlistIndex: playlistIndexById.get(id) ?? -1 };
      })
      .filter((row): row is { track: TrackDef; playlistIndex: number } => !!row);
  }, [resolvedIds, getTrack]);

  const duplicateGroups = useMemo(
    () => findDuplicateTrackGroups(resolvedIds, getTrack),
    [resolvedIds, getTrack],
  );
  const duplicateRemoveIds = useMemo(
    () => duplicateGroups.flatMap((g) => g.removeIds),
    [duplicateGroups],
  );

  const play = useCallback(
    (id: string) => {
      setActivePlaylist(playlistId);
      playTrackById(id, getTrack);
    },
    [getTrack, playlistId, setActivePlaylist],
  );

  const canPlayAll = useMemo(() => {
    const firstId =
      shuffleEnabled && shuffleQueue?.length
        ? nextShuffledTrackId(shuffleQueue, null, 1, getTrack)
        : nextSequentialTrackId(resolvedIds, null, 1, getTrack);
    return Boolean(firstId);
  }, [getTrack, resolvedIds, shuffleEnabled, shuffleQueue]);

  const playAll = useCallback(() => {
    const firstId =
      shuffleEnabled && shuffleQueue?.length
        ? nextShuffledTrackId(shuffleQueue, null, 1, getTrack)
        : nextSequentialTrackId(resolvedIds, null, 1, getTrack);
    if (!firstId) return;
    setActivePlaylist(playlistId);
    playTrackById(firstId, getTrack);
  }, [getTrack, playlistId, resolvedIds, setActivePlaylist, shuffleEnabled, shuffleQueue]);

  const confirmRemoveFromPlaylist = useCallback(
    (id: string) => {
      const tr = getTrack(id);
      const label = tr?.title ?? 'this track';
      if (!window.confirm(`Remove "${label}" from this playlist?`)) return;
      removeTrackFromPlaylist(id, playlistId);
    },
    [getTrack, playlistId, removeTrackFromPlaylist],
  );

  const toggleSelected = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
    setSelectMode(false);
  }, []);

  const removeSelectedFromPlaylist = useCallback(() => {
    if (isMaster) return;
    for (const id of selected) removeTrackFromPlaylist(id, playlistId);
    clearSelection();
  }, [clearSelection, isMaster, playlistId, removeTrackFromPlaylist, selected]);

  const openPlaylistForSelected = useCallback(() => {
    const first = [...selected][0];
    if (first) setPlaylistModalTrackId(first);
  }, [selected]);

  const handleDeleteDuplicates = useCallback(async () => {
    if (!duplicateRemoveIds.length || dupBusy) return;
    const ok = window.confirm(
      `Remove ${duplicateRemoveIds.length} duplicate track${duplicateRemoveIds.length === 1 ? '' : 's'}? The first copy in each group stays.`,
    );
    if (!ok) return;
    setDupBusy(true);
    setDupMessage(null);
    try {
      const removed = await deleteTracks(duplicateRemoveIds, {
        skipConfirm: true,
        purgeLocalOrphans: true,
        skipSync: true,
      });
      if (!removed.length) {
        setDupMessage('Delete failed — try Refresh, then delete duplicates again.');
        return;
      }
      if (removed.length < duplicateRemoveIds.length) {
        setDupMessage(
          `Removed ${removed.length} of ${duplicateRemoveIds.length} duplicates. Tap Delete duplicates again for any left.`,
        );
        return;
      }
      setDupDismissed(true);
      setDupMessage(`Removed ${removed.length} duplicate${removed.length === 1 ? '' : 's'}.`);
    } catch (e) {
      setDupMessage(e instanceof Error ? e.message : 'Delete duplicates failed.');
    } finally {
      setDupBusy(false);
    }
  }, [deleteTracks, duplicateRemoveIds, dupBusy]);

  const playlistModalTrack = playlistModalTrackId ? getTrack(playlistModalTrackId) : undefined;

  return (
    <section className="jb-track-panel" aria-label="Playlist tracks">
      <header className="jb-track-panel__head">
        <div>
          <p className="jb-track-panel__meta">
            {rows.length} track{rows.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="jb-track-panel__tools">
          <button
            type="button"
            className="jb-tool-btn jb-tool-btn--gold"
            disabled={!canPlayAll}
            onClick={playAll}
          >
            ▶ {PLAIN.playAll}
          </button>
          {canEditPlaylist ? (
            <button type="button" className="jb-tool-btn" onClick={() => setMetaOpen(true)}>
              {PLAIN.editPlaylist}
            </button>
          ) : null}
          <button
            type="button"
            className={`jb-tool-btn${selectMode ? ' jb-tool-btn--on' : ''}`}
            onClick={() => {
              setSelectMode((v) => !v);
              setSelected(new Set());
            }}
          >
            {selectMode ? 'Done' : 'Select'}
          </button>
        </div>
      </header>

      {!dupDismissed && duplicateGroups.length > 0 ? (
        <div className="jb-dup-banner" role="status">
          <p>
            Found {duplicateGroups.length} duplicate group{duplicateGroups.length === 1 ? '' : 's'} (
            {duplicateRemoveIds.length} extra cop{duplicateRemoveIds.length === 1 ? 'y' : 'ies'}).
          </p>
          <div className="jb-dup-banner__actions">
            <button
              type="button"
              className="jb-tool-btn jb-tool-btn--gold"
              disabled={dupBusy}
              onClick={() => void handleDeleteDuplicates()}
            >
              {dupBusy ? 'Deleting…' : 'Delete duplicates'}
            </button>
            <button type="button" className="jb-tool-btn" disabled={dupBusy} onClick={() => setDupDismissed(true)}>
              Dismiss
            </button>
          </div>
          {dupMessage ? <p className="jb-dup-banner__note">{dupMessage}</p> : null}
        </div>
      ) : null}

      {selectMode && selected.size > 0 ? (
        <div className="jb-batch-bar">
          <span>{selected.size} selected</span>
          {!isMaster ? (
            <button type="button" className="jb-tool-btn" onClick={removeSelectedFromPlaylist}>
              Remove from playlist
            </button>
          ) : null}
          <button type="button" className="jb-tool-btn" onClick={openPlaylistForSelected}>
            Playlists…
          </button>
          <button type="button" className="jb-tool-btn" onClick={clearSelection}>
            Clear
          </button>
        </div>
      ) : null}

      <p className="jb-gesture-hint">
        Scroll for more · swipe left for remove · hold &amp; drag to reorder · double-tap for playlists
      </p>

      {rows.length === 0 ? (
        <p className="jb-empty">{PLAIN.noTracksYet}</p>
      ) : (
        <ol className="jb-track-list" ref={listRef}>
          {rows.map((row, displayIndex) => (
            <JukeboxTrackRow
              key={row.track.id}
              track={row.track}
              index={displayIndex + 1}
                playlistIndex={row.playlistIndex}
                active={currentTrackId === row.track.id}
                playing={isPlaying}
                canReorder={canReorder}
                canRemove={!isMaster}
                selectMode={selectMode}
                selected={selected.has(row.track.id)}
                dragging={canReorder && dragIndex === row.playlistIndex}
                dropBefore={
                  canReorder &&
                  overIndex === row.playlistIndex &&
                  dragIndex !== null &&
                  dragIndex !== row.playlistIndex
                }
                onPlay={() => play(row.track.id)}
                onToggleSelect={() => toggleSelected(row.track.id)}
                onRemove={() => confirmRemoveFromPlaylist(row.track.id)}
                onOpenPlaylists={() => setPlaylistModalTrackId(row.track.id)}
                onGripPointerDown={(e) => onGripPointerDown(row.playlistIndex, e)}
                onGripPointerMove={onGripPointerMove}
              onGripPointerUp={(e) => onGripPointerUp(row.playlistIndex, e)}
            />
          ))}
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

      {canEditPlaylist ? (
        <PlaylistMetaModal
          playlistId={playlistId}
          open={metaOpen}
          onClose={() => setMetaOpen(false)}
        />
      ) : null}
    </section>
  );
}

type RowProps = {
  track: TrackDef;
  index: number;
  playlistIndex: number;
  active: boolean;
  playing: boolean;
  canReorder: boolean;
  canRemove: boolean;
  selectMode: boolean;
  selected: boolean;
  dragging: boolean;
  dropBefore: boolean;
  onPlay: () => void;
  onToggleSelect: () => void;
  onRemove: () => void;
  onOpenPlaylists: () => void;
  onGripPointerDown: (e: React.PointerEvent) => void;
  onGripPointerMove: (e: React.PointerEvent) => void;
  onGripPointerUp: (e: React.PointerEvent) => void;
};

function JukeboxTrackRow({
  track,
  index,
  playlistIndex,
  active,
  playing,
  canReorder,
  canRemove,
  selectMode,
  selected,
  dragging,
  dropBefore,
  onPlay,
  onToggleSelect,
  onRemove,
  onOpenPlaylists,
  onGripPointerDown,
  onGripPointerMove,
  onGripPointerUp,
}: RowProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setSwipeOffset(0);
    setRevealed(false);
  }, [track.id]);

  const { rowGestureProps } = useJukeboxRowGestures({
    enabled: !selectMode,
    onSwipeProgress: canRemove
      ? (dx) => {
          setRevealed(false);
          setSwipeOffset(dx);
        }
      : undefined,
    onSwipeReveal: canRemove
      ? () => {
          setSwipeOffset(-JB_SWIPE_REVEAL_PX);
          setRevealed(true);
        }
      : undefined,
    onSwipeReset: canRemove
      ? () => {
          setSwipeOffset(0);
          setRevealed(false);
        }
      : undefined,
    onDoubleTap: onOpenPlaylists,
    onLongPressDragStart: canReorder ? onGripPointerDown : undefined,
    onLongPressDragMove: canReorder ? onGripPointerMove : undefined,
    onLongPressDragEnd: canReorder ? onGripPointerUp : undefined,
  });

  const offset = revealed ? -JB_SWIPE_REVEAL_PX : swipeOffset;
  const swipeOpen = canRemove && (revealed || offset < 0);

  return (
    <li
      data-reorder-idx={canReorder ? playlistIndex : undefined}
      className={`jb-track-row-wrap${active ? ' jb-track-row-wrap--on' : ''}${selected ? ' jb-track-row-wrap--selected' : ''}${swipeOpen ? ' jb-track-row-wrap--swipe-open' : ''}`}
    >
      {canRemove ? (
        <div className="jb-track-row__reveal" aria-hidden={!swipeOpen}>
          <button
            type="button"
            className="jb-track-row__remove"
            tabIndex={swipeOpen ? 0 : -1}
            onClick={() => {
              onRemove();
              setSwipeOffset(0);
              setRevealed(false);
            }}
          >
            {PLAIN.removeFromPlaylist}
          </button>
        </div>
      ) : null}
      <div
        className={`jb-track-row${active ? ' jb-track-row--on' : ''}${dragging ? ' jb-track-row--dragging' : ''}${dropBefore ? ' jb-track-row--drop' : ''}${selected ? ' jb-track-row--selected' : ''}`}
        style={swipeOpen ? { transform: `translateX(${offset}px)` } : undefined}
        {...rowGestureProps}
      >
      {selectMode ? (
        <input
          type="checkbox"
          className="jb-track-check"
          checked={selected}
          onChange={onToggleSelect}
          aria-label={`Select ${track.title}`}
        />
      ) : null}
      <button type="button" className="jb-track-play" onClick={onPlay} aria-label={`Play ${track.title}`}>
        {active && playing ? '⏸' : '▶'}
      </button>
      <span className="jb-track-idx">{index}</span>
      <button type="button" className="jb-track-main" onClick={onPlay}>
        <span className="jb-track-title">{track.title}</span>
        <span className="jb-track-sub">
          {track.artist}
          {track.genre ? ` · ${track.genre}` : ''}
        </span>
      </button>
      <span className="jb-track-dur">{fmtDuration(track.durationSec)}</span>
      <LikeButton trackId={track.id} />
      </div>
    </li>
  );
}
