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
  const uploadTrackCover = useCatalogStore((s) => s.uploadTrackCover);
  const deleteTrack = useCatalogStore((s) => s.deleteTrack);

  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [genre, setGenre] = useState(track.genre ?? '');
  const [description, setDescription] = useState(track.description ?? '');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [plModal, setPlModal] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | undefined>(track.posterSrc);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    setTitle(track.title);
    setArtist(track.artist);
    setGenre(track.genre ?? '');
    setDescription(track.description ?? '');
    setCoverPreview(track.posterSrc);
    setCoverFile(null);
  }, [track.id, track.title, track.artist, track.genre, track.description, track.posterSrc]);

  const handleSave = async () => {
    setBusy(true);
    setMsg(null);
    setProgress('Starting…');
    try {
      await updateTrack(
        track.id,
        { title, artist, genre, description },
        {
          coverFile,
          onProgress: (line) => setProgress(line),
        },
      );
      setCoverFile(null);
      const latest = useCatalogStore.getState().getTrack(track.id);
      if (latest) {
        setTitle(latest.title);
        setArtist(latest.artist);
        setGenre(latest.genre ?? '');
        setDescription(latest.description ?? '');
        setCoverPreview(latest.posterSrc);
      }
      const synced =
        isServerUploadConfigured() && isUserUploadTrack(track.id, track);
      setMsg(synced ? 'Saved to server.' : 'Saved on this device only.');
      onSaved?.();
    } catch (err) {
      const raw =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code?: string }).code)
          : err instanceof Error
            ? err.message
            : '';
      const code = raw.toLowerCase();
      if (code === 'unauthorized') {
        setMsg('Save failed — captain / upload secret mismatch.');
      } else if (code === 'track_not_found') {
        setMsg('Save failed — track not on server catalog.');
      } else if (code === 'catalog_upload_unconfigured') {
        setMsg('Save failed — upload secret not configured in this build.');
      } else if (code === 'catalog_save_verify_failed' || code === 'catalog_save_failed') {
        const detail =
          err instanceof Error && err.message && err.message !== code ? err.message : '';
        setMsg(
          detail
            ? `Save failed — ${detail}`
            : 'Save failed — server could not persist catalog. Check Vercel Blob + catalog secret.',
        );
      } else if (code === 'upload_connection_failed') {
        setMsg('Save failed — could not reach the server. Check connection and try again.');
      } else if (code === 'cover_not_image') {
        setMsg('Save failed — cover must be JPEG, PNG, or WebP.');
      } else if (code === 'cover_too_large') {
        setMsg('Save failed — cover image is over 4 MB.');
      } else if (code === 'update_failed') {
        setMsg('Save failed — server did not confirm the track. Try again.');
      } else {
        setMsg(raw ? `Save failed — ${raw}` : 'Save failed — try again.');
      }
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    setMsg(null);
    setProgress('Deleting track…');
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
      <div className="spotify-field sp-track-cover-field">
        <span>Cover foto</span>
        <div className="sp-track-cover-row">
          {coverPreview ? (
            <img className="sp-track-cover-preview" src={coverPreview} alt="" width={72} height={72} />
          ) : (
            <span className="sp-track-cover-preview sp-track-cover-preview--empty" aria-hidden />
          )}
          <label className="spotify-btn spotify-btn--ghost spotify-btn--tiny">
            {coverFile ? coverFile.name : 'Choose image'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="spotify-file-pick-input"
              disabled={busy || disabled}
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setCoverFile(f);
                if (f) setCoverPreview(URL.createObjectURL(f));
              }}
            />
          </label>
        </div>
        <span className="spotify-field-hint">JPEG, PNG, or WebP · saved with Save</span>
      </div>
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
      {busy && progress && (
        <div className="sp-save-progress" role="status" aria-live="polite">
          <p className="sp-save-progress__label">{progress}</p>
          <div className="sp-save-progress__bar" aria-hidden>
            <span className="sp-save-progress__bar-fill" />
          </div>
        </div>
      )}
      {!busy && msg && <p className={msgClass}>{msg}</p>}
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

