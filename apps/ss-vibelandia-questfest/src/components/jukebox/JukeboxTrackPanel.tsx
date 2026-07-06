import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { useResolvedTrackIds } from '@/stores/catalogSelectors';
import { usePlaybackStore } from '@/stores/playbackStore';
import { usePlaylistReorder } from '@/hooks/usePlaylistReorder';
import { useJukeboxRowGestures } from '@/hooks/useJukeboxRowGestures';
import { TrackPlaylistsModal } from '@/components/catalog/TrackPlaylistsModal';
import { LikeButton } from '@/components/catalog/LikeButton';
import { isMasterPlaylist } from '@/lib/catalogSeed';
import { playTrackById } from '@/lib/trackPlayback';
import { fmtDuration } from '@/lib/formatDuration';
import { findDuplicateTrackGroups } from '@/lib/findCatalogDuplicateGroups';
import { PLAIN } from '@/lib/plainSpeak';
import type { TrackDef } from '@/lib/catalogTypes';

const TRACKS_PER_PAGE = 18;

interface JukeboxTrackPanelProps {
  playlistId: string;
  playlistName: string;
}

export function JukeboxTrackPanel({ playlistId, playlistName }: JukeboxTrackPanelProps) {
  const getTrack = useCatalogStore((s) => s.getTrack);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);
  const removeTrackFromPlaylist = useCatalogStore((s) => s.removeTrackFromPlaylist);
  const reorderTrackInPlaylist = useCatalogStore((s) => s.reorderTrackInPlaylist);
  const deleteTracks = useCatalogStore((s) => s.deleteTracks);
  const resolvedIds = useResolvedTrackIds(playlistId);

  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);

  const [page, setPage] = useState(0);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [playlistModalTrackId, setPlaylistModalTrackId] = useState<string | null>(null);
  const [dupDismissed, setDupDismissed] = useState(false);

  const isMaster = isMasterPlaylist(playlistId);
  const canReorder = !isMaster && resolvedIds.length > 1;

  const { listRef, dragIndex, overIndex, onGripPointerDown, onGripPointerMove, onGripPointerUp } =
    usePlaylistReorder(playlistId, canReorder, reorderTrackInPlaylist);

  useEffect(() => {
    setPage(0);
    setSelectMode(false);
    setSelected(new Set());
    setDupDismissed(false);
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

  const pageCount = Math.max(1, Math.ceil(rows.length / TRACKS_PER_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const pageStart = safePage * TRACKS_PER_PAGE;
  const pageRows = rows.slice(pageStart, pageStart + TRACKS_PER_PAGE);

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
    if (!duplicateRemoveIds.length) return;
    const ok = window.confirm(
      `Remove ${duplicateRemoveIds.length} duplicate track${duplicateRemoveIds.length === 1 ? '' : 's'}? The first copy in each group stays.`,
    );
    if (!ok) return;
    await deleteTracks(duplicateRemoveIds, { skipConfirm: true });
    setDupDismissed(true);
  }, [deleteTracks, duplicateRemoveIds]);

  const pageDown = () => setPage((p) => Math.min(p + 1, pageCount - 1));
  const pageUp = () => setPage((p) => Math.max(p - 1, 0));

  const playlistModalTrack = playlistModalTrackId ? getTrack(playlistModalTrackId) : undefined;

  return (
    <section className="jb-track-panel" aria-label={`Tracks in ${playlistName}`}>
      <header className="jb-track-panel__head">
        <div>
          <h2 className="jb-track-panel__title">{playlistName}</h2>
          <p className="jb-track-panel__meta">
            {rows.length} track{rows.length === 1 ? '' : 's'}
            {pageCount > 1 ? ` · page ${safePage + 1} of ${pageCount}` : ''}
          </p>
        </div>
        <div className="jb-track-panel__tools">
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
            <button type="button" className="jb-tool-btn jb-tool-btn--gold" onClick={() => void handleDeleteDuplicates()}>
              Delete duplicates
            </button>
            <button type="button" className="jb-tool-btn" onClick={() => setDupDismissed(true)}>
              Dismiss
            </button>
          </div>
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
        Swipe left to remove · hold &amp; drag to reorder · double-tap for playlists
      </p>

      {rows.length === 0 ? (
        <p className="jb-empty">{PLAIN.noTracksYet}</p>
      ) : (
        <>
          <ol className="jb-track-list" ref={listRef}>
            {pageRows.map((row, displayIndex) => (
              <JukeboxTrackRow
                key={row.track.id}
                track={row.track}
                index={pageStart + displayIndex + 1}
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
                onRemove={() => removeTrackFromPlaylist(row.track.id, playlistId)}
                onOpenPlaylists={() => setPlaylistModalTrackId(row.track.id)}
                onGripPointerDown={(e) => onGripPointerDown(row.playlistIndex, e)}
                onGripPointerMove={onGripPointerMove}
                onGripPointerUp={(e) => onGripPointerUp(row.playlistIndex, e)}
              />
            ))}
          </ol>

          {pageCount > 1 ? (
            <div className="jb-pager">
              <button type="button" className="jb-pager-btn" disabled={safePage <= 0} onClick={pageUp}>
                Page up
              </button>
              <span className="jb-pager-label">
                {safePage + 1} / {pageCount}
              </span>
              <button
                type="button"
                className="jb-pager-btn jb-pager-btn--primary"
                disabled={safePage >= pageCount - 1}
                onClick={pageDown}
              >
                Page down
              </button>
            </div>
          ) : null}
        </>
      )}

      {playlistModalTrack ? (
        <TrackPlaylistsModal
          open
          trackId={playlistModalTrack.id}
          trackTitle={playlistModalTrack.title}
          onClose={() => setPlaylistModalTrackId(null)}
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
  const { rowGestureProps } = useJukeboxRowGestures({
    enabled: !selectMode,
    onSwipeLeft: canRemove ? onRemove : undefined,
    onDoubleTap: onOpenPlaylists,
    onLongPressDragStart: canReorder ? onGripPointerDown : undefined,
    onLongPressDragMove: canReorder ? onGripPointerMove : undefined,
    onLongPressDragEnd: canReorder ? onGripPointerUp : undefined,
  });

  return (
    <li
      data-reorder-idx={canReorder ? playlistIndex : undefined}
      className={`jb-track-row${active ? ' jb-track-row--on' : ''}${dragging ? ' jb-track-row--dragging' : ''}${dropBefore ? ' jb-track-row--drop' : ''}${selected ? ' jb-track-row--selected' : ''}`}
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
    </li>
  );
}
