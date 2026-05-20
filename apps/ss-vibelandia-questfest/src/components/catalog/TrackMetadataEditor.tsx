import { useEffect, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { isServerUploadConfigured } from '@/lib/serverCatalog';
import { isUserUploadTrack } from '@/lib/catalogSeed';
import { TrackPlaylistsModal } from '@/components/catalog/TrackPlaylistsModal';
import {
  TRACK_DESCRIPTION_MAX,
  TRACK_GENRE_MAX,
  TRACK_GENRE_SUGGESTIONS,
  type TrackDef,
} from '@/lib/catalogTypes';

export interface TrackMetadataEditorProps {
  track: TrackDef;
  disabled?: boolean;
  /** Compact row for listen view vs full card in DJ library */
  variant?: 'panel' | 'inline';
  onSaved?: () => void;
  onDeleted?: () => void;
}

export function TrackMetadataEditor({
  track,
  disabled,
  variant = 'panel',
  onSaved,
  onDeleted,
}: TrackMetadataEditorProps) {
  const updateTrack = useCatalogStore((s) => s.updateTrack);
  const deleteTrack = useCatalogStore((s) => s.deleteTrack);

  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [genre, setGenre] = useState(track.genre ?? '');
  const [description, setDescription] = useState(track.description ?? '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [plModal, setPlModal] = useState(false);

  useEffect(() => {
    setTitle(track.title);
    setArtist(track.artist);
    setGenre(track.genre ?? '');
    setDescription(track.description ?? '');
  }, [track.id, track.title, track.artist, track.genre, track.description]);

  const handleSave = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await updateTrack(track.id, { title, artist, genre, description });
      const latest = useCatalogStore.getState().getTrack(track.id);
      if (latest) {
        setTitle(latest.title);
        setArtist(latest.artist);
        setGenre(latest.genre ?? '');
        setDescription(latest.description ?? '');
      }
      const synced =
        isServerUploadConfigured() && isUserUploadTrack(track.id, track);
      setMsg(synced ? 'Saved to server.' : 'Saved on this device only.');
      onSaved?.();
    } catch (err) {
      const code = err && typeof err === 'object' && 'code' in err ? String((err as { code?: string }).code) : '';
      if (code === 'unauthorized') {
        setMsg('Save failed — captain / upload secret mismatch.');
      } else if (code === 'track_not_found') {
        setMsg('Save failed — track not on server catalog.');
      } else if (code === 'catalog_upload_unconfigured') {
        setMsg('Save failed — upload secret not configured in this build.');
      } else {
        setMsg('Save failed — try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteTrack(track.id);
      onDeleted?.();
    } catch {
      setMsg('Delete failed — try again.');
    } finally {
      setBusy(false);
    }
  };

  const wrapClass =
    variant === 'inline' ? 'sp-track-edit sp-track-edit--inline' : 'spotify-dj-track-edit';

  return (
    <div className={wrapClass}>
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
          rows={variant === 'inline' ? 2 : 3}
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
          className="spotify-btn spotify-btn--ghost spotify-btn--tiny sp-listen-mini--danger"
          disabled={busy || disabled}
          onClick={() => void handleDelete()}
        >
          Delete track
        </button>
      </div>

      <TrackPlaylistsModal
        open={plModal}
        trackId={track.id}
        trackTitle={track.title}
        onClose={() => setPlModal(false)}
      />
    </div>
  );
}

