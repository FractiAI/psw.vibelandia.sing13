import { useCallback, useMemo, useState } from 'react';

import { useCatalogStore } from '@/stores/catalogStore';
import { useActivePlaylist } from '@/stores/catalogSelectors';

import { usePlaybackStore } from '@/stores/playbackStore';

import { usePlaylistReorder } from '@/hooks/usePlaylistReorder';

import { TrackPlaylistsModal } from '@/components/catalog/TrackPlaylistsModal';
import { TrackMetadataEditor } from '@/components/catalog/TrackMetadataEditor';
import { MasterCatalogEditor } from '@/components/catalog/MasterCatalogEditor';
import { MasterCatalogFilters } from '@/components/catalog/MasterCatalogFilters';

import { LikeButton } from '@/components/catalog/LikeButton';
import { isMasterPlaylist, isMyLikesPlaylist, isUserUploadTrack } from '@/lib/catalogSeed';
import {
  applyMasterCatalogView,
  loadMasterCatalogFilter,
  saveMasterCatalogFilter,
  isMasterFilterActive,
  type MasterCatalogFilterState,
} from '@/lib/masterCatalogFilter';
import { playTrackById } from '@/lib/trackPlayback';
import {
  filterPlayableTrackIds,
  playlistOrderFingerprint,
} from '@/lib/playlistShuffle';
import { TRACK_GENRE_SUGGESTIONS } from '@/lib/catalogTypes';
import { fmtDuration, fmtPlaylistTotalTime, fmtUploadDate } from '@/lib/formatDuration';
import { PLAIN } from '@/lib/plainSpeak';
import {
  SONIC_CATALOG_DISPLAY_NAME,
  SONIC_SINGULARITY_DESCRIPTION,
  SONIC_SINGULARITY_HERO_SRC,
} from '@/lib/sonicCatalogCopy';



interface TrackListProps {
  isPassenger: boolean;
  onEditPlaylist?: () => void;
  onBulkPlaylistDownload?: () => void;
}

export function TrackList({ isPassenger, onEditPlaylist, onBulkPlaylistDownload }: TrackListProps) {

  const pl = useActivePlaylist();

  const search = useCatalogStore((s) => s.search);

  const setSearch = useCatalogStore((s) => s.setSearch);

  const playlists = useCatalogStore((s) => s.playlists);

  const getTrack = useCatalogStore((s) => s.getTrack);

  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);

  const activePlaylistId = useCatalogStore((s) => s.activePlaylistId);

  const reorderTrackInPlaylist = useCatalogStore((s) => s.reorderTrackInPlaylist);

  const removeTrackFromPlaylist = useCatalogStore((s) => s.removeTrackFromPlaylist);



  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);

  const isPlaying = usePlaybackStore((s) => s.isPlaying);

  const shuffleEnabled = usePlaybackStore((s) => s.shuffleEnabled);

  const [trackPlModal, setTrackPlModal] = useState<{ id: string; title: string } | null>(null);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [masterEditMode, setMasterEditMode] = useState(false);
  const [masterFilter, setMasterFilter] = useState<MasterCatalogFilterState>(loadMasterCatalogFilter);

  const isMaster = pl ? isMasterPlaylist(pl.id) : false;
  const canEditPlaylist = pl && !isMasterPlaylist(pl.id) && !isMyLikesPlaylist(pl.id);
  const isMyLikes = pl ? isMyLikesPlaylist(pl.id) : false;

  const onMasterFilterChange = useCallback((next: MasterCatalogFilterState) => {
    setMasterFilter(next);
    saveMasterCatalogFilter(next);
  }, []);

  const canReorder = useMemo(() => {
    if ((pl?.trackIds.length ?? 0) <= 1) return false;
    if (isMaster) {
      return (
        !isMasterFilterActive(masterFilter) &&
        masterFilter.sortKey === 'playlistOrder' &&
        !masterFilter.titleQuery.trim() &&
        !masterFilter.genre.trim() &&
        masterFilter.playlistMode === 'all'
      );
    }
    return !search.trim();
  }, [isMaster, masterFilter, pl?.trackIds.length, search]);



  const { listRef, dragIndex, overIndex, onGripPointerDown, onGripPointerMove, onGripPointerUp } =

    usePlaylistReorder(activePlaylistId, canReorder, reorderTrackInPlaylist);



  const totalTimeLabel = useMemo(
    () => fmtPlaylistTotalTime(pl?.trackIds ?? [], getTrack),
    [pl?.trackIds, getTrack],
  );

  const rows = useMemo(() => {
    const ids = pl?.trackIds ?? [];
    if (isMaster) {
      return applyMasterCatalogView(ids, playlists, masterFilter, getTrack);
    }
    const q = search.trim().toLowerCase();
    return ids
      .map((id, index) => ({ id, index, track: getTrack(id) }))
      .filter((row): row is { id: string; index: number; track: NonNullable<ReturnType<typeof getTrack>> } => {
        if (!row.track) return false;
        if (!q) return true;
        return (
          row.track.title.toLowerCase().includes(q) ||
          row.track.artist.toLowerCase().includes(q) ||
          (row.track.description?.toLowerCase().includes(q) ?? false) ||
          (row.track.genre?.toLowerCase().includes(q) ?? false)
        );
      });
  }, [isMaster, masterFilter, pl, playlists, search, getTrack]);



  const play = (id: string) => {
    setActivePlaylist(activePlaylistId);
    playTrackById(id, getTrack);
  };



  const canManageAnyMasterTrack = useMemo(() => {
    if (!isMaster || !pl) return false;
    return pl.trackIds.some((id) => {
      const tr = getTrack(id);
      return tr && isUserUploadTrack(id, tr);
    });
  }, [isMaster, pl, getTrack]);

  if (masterEditMode && isMaster) {
    return <MasterCatalogEditor onDone={() => setMasterEditMode(false)} />;
  }

  if (!pl) {
    return <p className="sp-empty">{PLAIN.pickPlaylist}</p>;
  }

  const currentTrack = currentTrackId ? getTrack(currentTrackId) : undefined;
  const heroTitle = currentTrack?.title ?? (isMaster ? SONIC_CATALOG_DISPLAY_NAME : pl.name);
  const heroDescription = currentTrack?.description?.trim()
    ? currentTrack.description
    : isMaster
      ? SONIC_SINGULARITY_DESCRIPTION
      : pl.description;
  const heroStats = currentTrack
    ? [
        currentTrack.artist?.trim() || undefined,
        currentTrack.durationSec != null ? fmtDuration(currentTrack.durationSec) : undefined,
        isPassenger ? PLAIN.fullPlay : PLAIN.freePreview,
      ]
        .filter(Boolean)
        .join(' · ')
    : [
        `${pl.trackIds.length} ${PLAIN.songs}`,
        `${totalTimeLabel} ${PLAIN.totalTime}`,
        isPassenger ? PLAIN.fullPlay : PLAIN.freePreview,
      ].join(' · ');

  const playAll = () => {
    const visibleIds = rows.map((r) => r.id);
    if (!visibleIds[0]) return;
    const playable = filterPlayableTrackIds(visibleIds, getTrack);
    if (!playable.length) return;
    let first = playable[0]!;
    if (shuffleEnabled && pl) {
      const fp = playlistOrderFingerprint(pl.id, visibleIds);
      usePlaybackStore.getState().syncShuffleQueue(fp, playable);
      const q = usePlaybackStore.getState().shuffleQueue;
      if (q?.[0]) first = q[0];
    }
    play(first);
  };



  const confirmRemove = (trackId: string, title: string) => {

    if (!pl || !canEditPlaylist) return;

    if (!window.confirm(`Remove "${title}" from ${pl.name}?`)) return;

    removeTrackFromPlaylist(trackId, pl.id);

  };



  return (

    <section className="sp-listen">

      <header className="sp-hero sp-hero--compact">

        <div
          className={`sp-hero-cover${isMaster ? ' sp-hero-cover--sonic' : ''}`}
          aria-hidden
        >
          {isMaster ? (
            <img
              src={SONIC_SINGULARITY_HERO_SRC}
              alt=""
              width={120}
              height={120}
              loading="lazy"
              decoding="async"
            />
          ) : pl?.posterSrc ? (
            <img
              src={pl.posterSrc}
              alt=""
              width={120}
              height={120}
              loading="lazy"
              decoding="async"
            />
          ) : isMyLikes ? (
            '♥'
          ) : (
            '🎧'
          )}
        </div>

        <div className="sp-hero-meta">

          <p className="sp-hero-type">
            {currentTrack ? 'Now playing' : isMaster ? 'Sonic Singularity' : isMyLikes ? PLAIN.myLikes : 'Playlist'}
          </p>

          <h1 className="sp-hero-title">{heroTitle}</h1>

          {isMyLikes && !currentTrack ? (
            <p className="sp-hero-desc">{PLAIN.myLikesHint}</p>
          ) : null}
          {(currentTrack || (!isMaster && !isMyLikes)) && heroDescription ? (
            <p className="sp-hero-desc">{heroDescription}</p>
          ) : null}

          <p className="sp-hero-stats">
            {heroStats}

          </p>

          <div className="sp-hero-actions">

            <button type="button" className="sp-play-fab" onClick={playAll} aria-label="Play playlist">

              ▶

            </button>

            {canManageAnyMasterTrack && (
              <button type="button" className="sp-hero-secondary" onClick={() => setMasterEditMode(true)}>
                {PLAIN.editMasterCatalog}
              </button>
            )}

            {onEditPlaylist && (

              <button type="button" className="sp-hero-secondary" onClick={onEditPlaylist}>

                Edit playlist

              </button>

            )}

          </div>

        </div>

      </header>



      <div className="sp-toolbar">
        {isMaster ? (
          <MasterCatalogFilters
            filter={masterFilter}
            onChange={onMasterFilterChange}
            trackIds={pl?.trackIds ?? []}
            playlists={playlists}
            getTrack={getTrack}
            shownCount={rows.length}
            totalCount={pl?.trackIds.length ?? 0}
          />
        ) : (
          <>
            <label className="sp-search-wrap">
              <span className="sr-only">Search</span>
              <input
                className="sp-search"
                type="search"
                placeholder={PLAIN.searchPlaylist}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            {rows.length > 0 && (
              <span className="sp-toolbar-total" aria-live="polite">
                {rows.length === pl.trackIds.length
                  ? `${totalTimeLabel} ${PLAIN.totalTime}`
                  : `${fmtPlaylistTotalTime(
                      rows.map((r) => r.id),
                      getTrack,
                    )} shown`}
              </span>
            )}
          </>
        )}

        {onBulkPlaylistDownload && isPassenger && pl.trackIds.length > 0 && (
          <button type="button" className="sp-hero-secondary" onClick={onBulkPlaylistDownload}>
            Download playlist…
          </button>
        )}
      </div>



      {rows.length === 0 ? (

        <p className="sp-empty">

          {isMaster && isMasterFilterActive(masterFilter)
            ? PLAIN.noFilterMatch
            : search.trim()
              ? 'No tracks match your search.'
              : PLAIN.noTracksYet}

        </p>

      ) : (

        <div className="sp-pl-edit-tracks sp-listen-tracks">

          {canReorder && (

            <p className="sp-reorder-hint sp-pl-edit-hint">Hold ⋮⋮ and drag to reorder</p>

          )}

          <ol className="sp-pl-edit-list" ref={listRef}>

            {rows.map((row, displayIndex) => {

              const tr = row.track;

              const active = currentTrackId === tr.id;

              const dragging = dragIndex === row.index;

              const dropBefore = overIndex === row.index && dragIndex !== null && dragIndex !== row.index;
              const canManageTrack = isUserUploadTrack(tr.id, tr);
              const isEditing = editingTrackId === tr.id;

              return (

                <li

                  key={tr.id}

                  data-reorder-idx={row.index}

                  className={`sp-pl-edit-row sp-pl-edit-row--listen${active ? ' sp-pl-edit-row--listen-on' : ''}${dragging ? ' sp-pl-edit-row--dragging' : ''}${dropBefore ? ' sp-pl-edit-row--drop' : ''}${isEditing ? ' sp-pl-edit-row--editing' : ''}`}

                  onDoubleClick={() => play(tr.id)}

                >

                  <button

                    type="button"

                    className="sp-row-grip"

                    aria-label={`Reorder ${tr.title}`}

                    onPointerDown={(e) => onGripPointerDown(row.index, e)}

                    onPointerMove={onGripPointerMove}

                    onPointerUp={(e) => onGripPointerUp(row.index, e)}

                    onPointerCancel={(e) => onGripPointerUp(row.index, e)}

                    disabled={!canReorder}

                  >

                    ⋮⋮

                  </button>

                  <span className="sp-pl-edit-idx">

                    {active && isPlaying ? <span className="sp-eq">♪</span> : displayIndex + 1}

                  </span>

                  <button

                    type="button"

                    className="sp-pl-edit-track-info sp-pl-edit-track-info--btn sp-listen-track-btn"

                    onClick={() => play(tr.id)}

                  >

                    <strong className="sp-listen-track-title">{tr.title}</strong>

                    <span className="sp-listen-track-line2">

                      <span className="sp-listen-artist">{tr.artist}</span>

                      <span className="sp-listen-sep" aria-hidden>

                        {' '}

                        ·{' '}

                      </span>

                      <span className="sp-listen-type-dur">
                        Audio · {fmtDuration(tr.durationSec)}
                        {isMaster && tr.uploadedAt ? ` · ${fmtUploadDate(tr.uploadedAt)}` : ''}
                      </span>

                    </span>

                    {tr.genre && (
                      <span className="sp-listen-track-genre">{tr.genre}</span>
                    )}

                    {tr.description && (

                      <span className="sp-pl-edit-track-desc sp-listen-track-desc">{tr.description}</span>

                    )}

                  </button>

                  <div className="sp-listen-row-actions">

                    <LikeButton trackId={tr.id} />

                    <button

                      type="button"

                      className="sp-listen-mini"

                      onClick={() => setTrackPlModal({ id: tr.id, title: tr.title })}

                    >

                      Playlists

                    </button>

                    {canManageTrack && (
                      <button
                        type="button"
                        className="sp-listen-mini"
                        onClick={() => setEditingTrackId(isEditing ? null : tr.id)}
                        aria-expanded={isEditing}
                      >
                        {isEditing ? 'Close' : 'Edit'}
                      </button>
                    )}

                    {canEditPlaylist && (

                      <button

                        type="button"

                        className="sp-listen-mini sp-listen-mini--danger"

                        onClick={() => confirmRemove(tr.id, tr.title)}

                      >

                        Remove

                      </button>

                    )}

                    <button

                      type="button"

                      className="sp-pl-edit-nudge sp-listen-play"

                      onClick={() => play(tr.id)}

                      aria-label={`Play ${tr.title}`}

                    >

                      ▶

                    </button>

                  </div>

                  {isEditing && canManageTrack && (
                    <TrackMetadataEditor
                      track={tr}
                      variant="inline"
                      onSaved={() => setEditingTrackId(null)}
                      onDeleted={() => setEditingTrackId(null)}
                    />
                  )}

                </li>

              );

            })}

          </ol>

        </div>

      )}

      {editingTrackId && (
        <datalist id="qf-genre-suggestions">
          {TRACK_GENRE_SUGGESTIONS.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
      )}



      <TrackPlaylistsModal

        open={!!trackPlModal}

        trackId={trackPlModal?.id ?? ''}

        trackTitle={trackPlModal?.title ?? ''}

        onClose={() => setTrackPlModal(null)}

      />

    </section>

  );

}

