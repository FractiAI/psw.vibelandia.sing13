import { useMemo, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { usePlaylistReorder } from '@/hooks/usePlaylistReorder';
import { AddToPlaylistModal } from '@/components/catalog/AddToPlaylistModal';
import { hasExportLicense } from '@/lib/exportLicenses';
import { EGS_EXPORT_USD } from '@/lib/paymentRails';
import { DEFAULT_ARTIST } from '@/lib/catalogTypes';

function fmtDuration(sec?: number) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface TrackListProps {
  isPassenger: boolean;
  onDownload: (trackId: string) => void;
  onEditPlaylists?: () => void;
}

export function TrackList({ isPassenger, onDownload, onEditPlaylists }: TrackListProps) {
  const pl = useCatalogStore((s) => s.getActivePlaylist());
  const search = useCatalogStore((s) => s.search);
  const setSearch = useCatalogStore((s) => s.setSearch);
  const getTrack = useCatalogStore((s) => s.getTrack);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);
  const activePlaylistId = useCatalogStore((s) => s.activePlaylistId);
  const reorderTrackInPlaylist = useCatalogStore((s) => s.reorderTrackInPlaylist);
  const removeTrackFromPlaylist = useCatalogStore((s) => s.removeTrackFromPlaylist);

  const [addOpen, setAddOpen] = useState(false);

  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const setTrack = usePlaybackStore((s) => s.setTrack);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);

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

  const playAll = () => {
    if (!pl?.trackIds[0]) return;
    play(pl.trackIds[0]);
  };

  if (!pl) {
    return <p className="sp-empty">Pick a playlist on the left.</p>;
  }

  return (
    <section className="sp-listen">
      <header className="sp-hero">
        <div className="sp-hero-cover" aria-hidden>🎧</div>
        <div className="sp-hero-meta">
          <p className="sp-hero-type">{currentTrack ? 'Now playing' : 'Playlist'}</p>
          <h1 className="sp-hero-title">{currentTrack?.title ?? pl.name}</h1>
          <p className="sp-hero-desc">{currentTrack?.description || pl.description}</p>
          <p className="sp-hero-stats">
            <strong>{currentTrack?.artist ?? DEFAULT_ARTIST}</strong> · {pl.trackIds.length} songs ·{' '}
            {isPassenger ? 'full play' : '30s free on each track'}
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
            <button type="button" className="sp-hero-secondary" onClick={() => setAddOpen(true)}>
              + Add songs
            </button>
            {onEditPlaylists && (
              <button type="button" className="sp-hero-secondary" onClick={onEditPlaylists}>
                Edit playlists
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
            placeholder="Search in playlist"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        {canReorder && (
          <p className="sp-reorder-hint">Hold ⋮⋮ then drag to reorder</p>
        )}
      </div>

      <div className="sp-table">
        <div className={`sp-table-head${canReorder ? ' sp-table-head--reorder' : ''}`} aria-hidden>
          {canReorder && <span />}
          <span>#</span>
          <span>Title</span>
          <span>Album</span>
          <span>⏱</span>
          <span>↓</span>
          <span />
          <span />
        </div>
        <ol className="sp-rows" ref={listRef}>
          {rows.map((row, displayIndex) => {
            const tr = row.track;
            const active = currentTrackId === tr.id;
            const dragging = dragIndex === row.index;
            const dropBefore = overIndex === row.index && dragIndex !== null && dragIndex !== row.index;
            return (
              <li
                key={tr.id}
                data-reorder-idx={row.index}
                className={`sp-row${active ? ' sp-row--on' : ''}${dragging ? ' sp-row--dragging' : ''}${dropBefore ? ' sp-row--drop-target' : ''}${canReorder ? ' sp-row--reorder' : ''}`}
                onDoubleClick={() => play(tr.id)}
              >
                {canReorder && (
                  <button
                    type="button"
                    className="sp-row-grip"
                    aria-label={`Reorder ${tr.title}`}
                    onPointerDown={(e) => onGripPointerDown(row.index, e)}
                    onPointerMove={onGripPointerMove}
                    onPointerUp={(e) => onGripPointerUp(row.index, e)}
                    onPointerCancel={(e) => onGripPointerUp(row.index, e)}
                  >
                    ⋮⋮
                  </button>
                )}
                <span className="sp-row-idx">
                  {active && isPlaying ? <span className="sp-eq">♪</span> : displayIndex + 1}
                </span>
                <button type="button" className="sp-row-main" onClick={() => play(tr.id)}>
                  <span className="sp-row-title">{tr.title}</span>
                  <span className="sp-row-artist">{tr.artist}</span>
                  {tr.description && <span className="sp-row-desc">{tr.description}</span>}
                </button>
                <span className="sp-row-album">{tr.videoSrc ? 'Music video' : 'Audio'}</span>
                <span className="sp-row-dur">{fmtDuration(tr.durationSec)}</span>
                <button
                  type="button"
                  className={`sp-row-dl${hasExportLicense(tr.id) ? ' sp-row-dl--owned' : ''}`}
                  onClick={() => onDownload(tr.id)}
                  aria-label={`Download ${tr.title}`}
                  title={
                    isPassenger
                      ? hasExportLicense(tr.id)
                        ? 'Download again (licensed)'
                        : `Download · $${EGS_EXPORT_USD.toFixed(2)}`
                      : 'Monthly pass required'
                  }
                >
                  {hasExportLicense(tr.id) ? '✓' : '↓'}
                </button>
                <button
                  type="button"
                  className="sp-row-remove"
                  onClick={() => removeTrackFromPlaylist(tr.id, activePlaylistId)}
                  aria-label={`Remove ${tr.title} from playlist`}
                  title="Remove from playlist"
                >
                  ×
                </button>
                <button
                  type="button"
                  className="sp-row-play"
                  onClick={() => play(tr.id)}
                  aria-label={`Play ${tr.title}`}
                >
                  ▶
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {rows.length === 0 && (
        <p className="sp-empty">
          {search.trim()
            ? 'No tracks match your search.'
            : 'No tracks in this playlist yet. Creator: open Upload & playlists to scan your device or upload files.'}
        </p>
      )}

      <AddToPlaylistModal
        open={addOpen}
        playlistId={activePlaylistId}
        onClose={() => setAddOpen(false)}
      />
    </section>
  );
}
