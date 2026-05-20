import { useMemo, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { TrackMetadataEditor } from '@/components/catalog/TrackMetadataEditor';
import { MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { fmtDuration } from '@/lib/formatDuration';
import { TRACK_GENRE_SUGGESTIONS, type TrackDef } from '@/lib/catalogTypes';

interface TrackLibraryManagerProps {
  tracks: TrackDef[];
  disabled?: boolean;
}

function TrackEditorRow({ track, disabled }: { track: TrackDef; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const playlists = useCatalogStore((s) => s.playlists);

  const playlistCount = useMemo(
    () => playlists.filter((p) => p.id !== MASTER_PLAYLIST_ID && p.trackIds.includes(track.id)).length,
    [playlists, track.id],
  );

  const isVideo = !!track.videoSrc;
  const durationLabel =
    track.durationSec != null && track.durationSec > 0 ? fmtDuration(track.durationSec) : null;

  return (
    <li className={`spotify-dj-order-row${open ? ' spotify-dj-order-row--open' : ''}`}>
      <div className="spotify-dj-order-summary">
        <span className="spotify-dj-order-title">{track.title}</span>
        <span className="spotify-dj-order-artist">{track.artist}</span>
        {track.genre && <span className="spotify-dj-order-tag">{track.genre}</span>}
        {isVideo && <span className="spotify-dj-order-tag spotify-dj-order-tag--video">Video</span>}
        {durationLabel && (
          <span className="spotify-dj-order-tag spotify-dj-order-tag--time">{durationLabel}</span>
        )}
        {playlistCount > 0 && (
          <span className="spotify-dj-order-tag">
            {playlistCount} playlist{playlistCount === 1 ? '' : 's'}
          </span>
        )}
        <div className="spotify-dj-order-actions">
          <button
            type="button"
            className="spotify-btn spotify-btn--tiny spotify-btn--ghost"
            disabled={disabled}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Close' : 'Edit'}
          </button>
        </div>
      </div>

      {open && (
        <TrackMetadataEditor
          track={track}
          disabled={disabled}
          variant="panel"
          onDeleted={() => setOpen(false)}
        />
      )}
    </li>
  );
}

export function TrackLibraryManager({ tracks, disabled }: TrackLibraryManagerProps) {
  const sorted = useMemo(
    () =>
      [...tracks].sort((a, b) => (b.uploadedAt ?? '').localeCompare(a.uploadedAt ?? '')),
    [tracks],
  );

  if (!sorted.length) return null;

  return (
    <article className="spotify-dj-card spotify-dj-card--wide">
      <h3>Your catalog ({sorted.length})</h3>
      <p className="spotify-main-desc" style={{ marginBottom: '0.75rem' }}>
        Edit title, artist, genre, and description. Add tracks to playlists or delete from the server
        catalog.
      </p>
      <datalist id="qf-genre-suggestions">
        {TRACK_GENRE_SUGGESTIONS.map((g) => (
          <option key={g} value={g} />
        ))}
      </datalist>
      <ol className="spotify-dj-order spotify-dj-order--stacked">
        {sorted.map((tr) => (
          <TrackEditorRow key={tr.id} track={tr} disabled={disabled} />
        ))}
      </ol>
    </article>
  );
}
