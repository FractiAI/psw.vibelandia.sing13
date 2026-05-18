import { useMemo, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { TrackPlaylistsModal } from '@/components/catalog/TrackPlaylistsModal';
import {
  TRACK_DESCRIPTION_MAX,
  TRACK_GENRE_MAX,
  TRACK_GENRE_SUGGESTIONS,
  type TrackDef,
} from '@/lib/catalogTypes';
import { fmtDuration } from '@/lib/formatDuration';

interface TrackLibraryManagerProps {
  tracks: TrackDef[];
  disabled?: boolean;
}

function TrackEditorRow({ track, disabled }: { track: TrackDef; disabled?: boolean }) {
  const updateTrack = useCatalogStore((s) => s.updateTrack);
  const deleteTrack = useCatalogStore((s) => s.deleteTrack);
  const playlists = useCatalogStore((s) => s.playlists);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [genre, setGenre] = useState(track.genre ?? '');
  const [description, setDescription] = useState(track.description ?? '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [plModal, setPlModal] = useState(false);

  const playlistCount = useMemo(
    () => playlists.filter((p) => p.id !== 'pl-main' && p.trackIds.includes(track.id)).length,
    [playlists, track.id],
  );

  const isVideo = !!track.videoSrc;
  const durationLabel =
    track.durationSec != null && track.durationSec > 0 ? fmtDuration(track.durationSec) : null;

  const resetFields = () => {
    setTitle(track.title);
    setArtist(track.artist);
    setGenre(track.genre ?? '');
    setDescription(track.description ?? '');
  };

  const handleOpen = () => {
    resetFields();
    setOpen((v) => !v);
    setMsg(null);
  };

  const handleSave = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await updateTrack(track.id, {
        title,
        artist,
        genre,
        description,
      });
      setMsg('Saved.');
    } catch {
      setMsg('Save failed — try again.');
    } finally {
      setBusy(false);
    }
  };

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
            onClick={handleOpen}
          >
            {open ? 'Close' : 'Edit'}
          </button>
        </div>
      </div>

      {open && (
        <div className="spotify-dj-track-edit">
          <label className="spotify-field">
            Title
            <input
              className="spotify-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy || disabled}
            />
          </label>
          <label className="spotify-field">
            Artist
            <input
              className="spotify-input"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              disabled={busy || disabled}
            />
          </label>
          <label className="spotify-field">
            Genre
            <input
              className="spotify-input"
              list="qf-genre-suggestions"
              value={genre}
              onChange={(e) => setGenre(e.target.value.slice(0, TRACK_GENRE_MAX))}
              placeholder="e.g. Reno Swamp"
              disabled={busy || disabled}
            />
          </label>
          <label className="spotify-field">
            Description
            <textarea
              className="spotify-input spotify-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, TRACK_DESCRIPTION_MAX))}
              rows={3}
              disabled={busy || disabled}
            />
            <span className="spotify-field-hint">
              {description.length}/{TRACK_DESCRIPTION_MAX}
            </span>
          </label>
          {msg && <p className="spotify-dj-msg spotify-dj-msg--info">{msg}</p>}
          <div className="spotify-dj-track-edit-actions">
            <button
              type="button"
              className="spotify-btn spotify-btn--gold spotify-btn--tiny"
              disabled={busy || disabled}
              onClick={() => void handleSave()}
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              className="spotify-btn spotify-btn--ghost spotify-btn--tiny"
              disabled={busy || disabled}
              onClick={() => setPlModal(true)}
            >
              Playlists
            </button>
            <button
              type="button"
              className="spotify-btn spotify-btn--ghost spotify-btn--tiny"
              disabled={busy || disabled}
              onClick={() => void deleteTrack(track.id)}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      <TrackPlaylistsModal
        open={plModal}
        trackId={track.id}
        trackTitle={track.title}
        onClose={() => setPlModal(false)}
      />
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
