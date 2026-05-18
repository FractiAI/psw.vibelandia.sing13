import { useMemo, useState } from 'react';

import { useCatalogStore } from '@/stores/catalogStore';

import { usePlaybackStore } from '@/stores/playbackStore';

import { usePlaylistReorder } from '@/hooks/usePlaylistReorder';

import { TrackPlaylistsModal } from '@/components/catalog/TrackPlaylistsModal';

import { hasExportLicense } from '@/lib/exportLicenses';

import { EGS_EXPORT_USD } from '@/lib/paymentRails';

import { isMasterPlaylist } from '@/lib/catalogSeed';
import { fmtDuration, fmtPlaylistTotalTime } from '@/lib/formatDuration';
import { PLAIN } from '@/lib/plainSpeak';
import {
  SONIC_CATALOG_DISPLAY_NAME,
  SONIC_SINGULARITY_DESCRIPTION,
  SONIC_SINGULARITY_HERO_SRC,
} from '@/lib/sonicCatalogCopy';



interface TrackListProps {

  isPassenger: boolean;

  onDownload: (trackId: string) => void;

  onEditPlaylist?: () => void;

  onBulkPlaylistDownload?: () => void;

}



export function TrackList({ isPassenger, onDownload, onEditPlaylist, onBulkPlaylistDownload }: TrackListProps) {

  const pl = useCatalogStore((s) => s.getActivePlaylist());

  const search = useCatalogStore((s) => s.search);

  const setSearch = useCatalogStore((s) => s.setSearch);

  const getTrack = useCatalogStore((s) => s.getTrack);

  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);

  const activePlaylistId = useCatalogStore((s) => s.activePlaylistId);

  const reorderTrackInPlaylist = useCatalogStore((s) => s.reorderTrackInPlaylist);

  const removeTrackFromPlaylist = useCatalogStore((s) => s.removeTrackFromPlaylist);



  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);

  const isPlaying = usePlaybackStore((s) => s.isPlaying);

  const setTrack = usePlaybackStore((s) => s.setTrack);

  const setPlaying = usePlaybackStore((s) => s.setPlaying);



  const [trackPlModal, setTrackPlModal] = useState<{ id: string; title: string } | null>(null);



  const canEditPlaylist = pl && !isMasterPlaylist(pl.id);

  const canReorder = !search.trim() && (pl?.trackIds.length ?? 0) > 1;



  const { listRef, dragIndex, overIndex, onGripPointerDown, onGripPointerMove, onGripPointerUp } =

    usePlaylistReorder(activePlaylistId, canReorder, reorderTrackInPlaylist);



  const rows = useMemo(() => {

    const q = search.trim().toLowerCase();

    const ids = pl?.trackIds ?? [];

    return ids

      .map((id, index) => ({ id, index, track: getTrack(id) }))

      .filter((row): row is { id: string; index: number; track: NonNullable<ReturnType<typeof getTrack>> } => {

        if (!row.track) return false;

        if (!q) return true;

        return (

          row.track.title.toLowerCase().includes(q) ||

          row.track.artist.toLowerCase().includes(q) ||

          (row.track.description?.toLowerCase().includes(q) ?? false)

        );

      });

  }, [pl, search, getTrack]);



  const play = (id: string) => {

    setActivePlaylist(activePlaylistId);

    setTrack(id);

    setPlaying(true);

  };



  const currentTrack = currentTrackId ? getTrack(currentTrackId) : undefined;

  const isMaster = isMasterPlaylist(pl.id);

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

    if (!pl?.trackIds[0]) return;

    play(pl.trackIds[0]);

  };



  const confirmRemove = (trackId: string, title: string) => {

    if (!pl || !canEditPlaylist) return;

    if (!window.confirm(`Remove "${title}" from ${pl.name}?`)) return;

    removeTrackFromPlaylist(trackId, pl.id);

  };



  if (!pl) {

    return <p className="sp-empty">{PLAIN.pickPlaylist}</p>;

  }



  return (

    <section className="sp-listen">

      <header className="sp-hero">

        <div
          className={`sp-hero-cover${isMaster ? ' sp-hero-cover--sonic' : ''}`}
          aria-hidden
        >
          {isMaster ? (
            <img src={SONIC_SINGULARITY_HERO_SRC} alt="" width={232} height={232} />
          ) : (
            '🎧'
          )}
        </div>

        <div className="sp-hero-meta">

          <p className="sp-hero-type">
            {currentTrack ? 'Now playing' : isMaster ? 'Sonic Singularity' : 'Playlist'}
          </p>

          <h1 className="sp-hero-title">{heroTitle}</h1>

          <p className="sp-hero-desc">{heroDescription}</p>

          <p className="sp-hero-stats">
            {heroStats}

            {isPassenger && (

              <>

                {' '}

                · download ${EGS_EXPORT_USD.toFixed(2)}/track for offline

              </>

            )}

          </p>

          <div className="sp-hero-actions">

            <button type="button" className="sp-play-fab" onClick={playAll} aria-label="Play playlist">

              ▶

            </button>

            {onEditPlaylist && (

              <button type="button" className="sp-hero-secondary" onClick={onEditPlaylist}>

                Edit playlist

              </button>

            )}

          </div>

        </div>

      </header>



      <div className="sp-toolbar">

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

        {onBulkPlaylistDownload && pl.trackIds.length > 0 && (

          <button type="button" className="sp-hero-secondary" onClick={onBulkPlaylistDownload}>

            Download playlist…

          </button>

        )}

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

      </div>



      {rows.length === 0 ? (

        <p className="sp-empty">

          {search.trim()

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

              return (

                <li

                  key={tr.id}

                  data-reorder-idx={row.index}

                  className={`sp-pl-edit-row sp-pl-edit-row--listen${active ? ' sp-pl-edit-row--listen-on' : ''}${dragging ? ' sp-pl-edit-row--dragging' : ''}${dropBefore ? ' sp-pl-edit-row--drop' : ''}`}

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

                        {tr.videoSrc ? 'Video' : 'Audio'} · {fmtDuration(tr.durationSec)}
                        {tr.downloadedLocally ? ' · On device' : ' · Stream'}

                      </span>

                    </span>

                    {tr.description && (

                      <span className="sp-pl-edit-track-desc sp-listen-track-desc">{tr.description}</span>

                    )}

                  </button>

                  <div className="sp-listen-row-actions">

                    <button

                      type="button"

                      className="sp-listen-mini"

                      onClick={() => setTrackPlModal({ id: tr.id, title: tr.title })}

                    >

                      Playlists

                    </button>

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

                      className={`sp-listen-dl${hasExportLicense(tr.id) ? ' sp-listen-dl--owned' : ''}`}

                      onClick={() => onDownload(tr.id)}

                      aria-label={`Download ${tr.title}`}

                      title={

                        isPassenger

                          ? hasExportLicense(tr.id)

                            ? 'Download again (licensed)'

                            : `Download · $${EGS_EXPORT_USD.toFixed(2)}`

                          : 'Machote members pass required'

                      }

                    >

                      {hasExportLicense(tr.id) ? '✓' : '↓'}

                    </button>

                    <button

                      type="button"

                      className="sp-pl-edit-nudge sp-listen-play"

                      onClick={() => play(tr.id)}

                      aria-label={`Play ${tr.title}`}

                    >

                      ▶

                    </button>

                  </div>

                </li>

              );

            })}

          </ol>

        </div>

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

