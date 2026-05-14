import { useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { DEFAULT_ARTIST, TRACK_DESCRIPTION_MAX } from '@/lib/catalogTypes';
import { MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';

interface DjStudioProps {
  onUploadSuccess?: (trackId: string) => void;
}

export function DjStudio({ onUploadSuccess }: DjStudioProps) {
  const uploadTrack = useCatalogStore((s) => s.uploadTrack);
  const deleteTrack = useCatalogStore((s) => s.deleteTrack);
  const listAllTracks = useCatalogStore((s) => s.listAllTracks);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState(DEFAULT_ARTIST);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleDescriptionChange = (value: string) => {
    setDescription(value.slice(0, TRACK_DESCRIPTION_MAX));
  };

  const handleUpload = async () => {
    if (!file) {
      setMsg('Pick an audio or video file first.');
      return;
    }
    if (!title.trim()) {
      setMsg('Enter a title — that is what the player shows when playing.');
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const id = await uploadTrack(file, {
        title: title.trim(),
        artist: artist.trim() || DEFAULT_ARTIST,
        description,
        playlistIds: [MASTER_PLAYLIST_ID],
      });
      setMsg(`Uploaded “${title.trim()}”. Switching to Listen…`);
      setTitle('');
      setArtist(DEFAULT_ARTIST);
      setDescription('');
      setFile(null);
      onUploadSuccess?.(id);
    } catch (e) {
      setMsg(
        e instanceof Error && e.message === 'duplicate'
          ? 'That file is already in your catalog.'
          : 'Upload failed. Try another file.',
      );
    } finally {
      setBusy(false);
    }
  };

  const tracks = listAllTracks();

  return (
    <section className="spotify-main-panel spotify-dj">
      <header className="spotify-main-head">
        <div>
          <p className="spotify-main-eyebrow">Upload</p>
          <h2 className="spotify-main-title">Add a track</h2>
          <p className="spotify-main-desc">
            Catalog starts empty. Upload one audio or video file, then go to Listen and press play.
          </p>
        </div>
      </header>

      <div className="spotify-dj-grid">
        <article className="spotify-dj-card spotify-dj-card--wide">
          <h3>1 · Pick a file</h3>
          <label className="spotify-field">
            Title
            <input
              className="spotify-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Shown in the player when playing"
              required
            />
          </label>
          <label className="spotify-field">
            Artist
            <input
              className="spotify-input"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
          </label>
          <label className="spotify-field">
            Description (optional)
            <textarea
              className="spotify-input spotify-textarea"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              maxLength={TRACK_DESCRIPTION_MAX}
              rows={4}
              placeholder="What's this track about?"
            />
            <span className="spotify-field-hint">
              {description.length}/{TRACK_DESCRIPTION_MAX} characters
            </span>
          </label>
          <label className="spotify-field">
            Audio or video
            <input
              className="spotify-input"
              type="file"
              accept="audio/*,video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button type="button" className="spotify-btn spotify-btn--gold" disabled={busy} onClick={handleUpload}>
            {busy ? 'Uploading…' : 'Upload and go to Listen'}
          </button>
          {msg && <p className="spotify-dj-msg">{msg}</p>}
        </article>

        {tracks.length > 0 && (
          <article className="spotify-dj-card spotify-dj-card--wide">
            <h3>Your uploads ({tracks.length})</h3>
            <ol className="spotify-dj-order">
              {tracks.map((tr, idx) => (
                <li key={tr.id} className="spotify-dj-order-row">
                  <span className="spotify-dj-order-idx">{idx + 1}</span>
                  <span className="spotify-dj-order-title">{tr.title}</span>
                  <span className="spotify-dj-order-artist">{tr.artist}</span>
                  <div className="spotify-dj-order-actions">
                    <button
                      type="button"
                      className="spotify-btn spotify-btn--tiny spotify-btn--ghost"
                      onClick={() => deleteTrack(tr.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </article>
        )}
      </div>
    </section>
  );
}
