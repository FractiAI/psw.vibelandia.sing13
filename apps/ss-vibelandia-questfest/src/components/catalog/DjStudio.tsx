import { useRef, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { DEFAULT_ARTIST, TRACK_DESCRIPTION_MAX } from '@/lib/catalogTypes';
import { MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { collectMediaFiles } from '@/lib/deviceMediaScan';

interface DjStudioProps {
  onUploadSuccess?: (trackId: string) => void;
}

export function DjStudio({ onUploadSuccess }: DjStudioProps) {
  const hydrated = useCatalogStore((s) => s.hydrated);
  const importMediaFiles = useCatalogStore((s) => s.importMediaFiles);
  const scanDeviceLibrary = useCatalogStore((s) => s.scanDeviceLibrary);
  const deleteTrack = useCatalogStore((s) => s.deleteTrack);
  const listAllTracks = useCatalogStore((s) => s.listAllTracks);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState(DEFAULT_ARTIST);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const handleDescriptionChange = (value: string) => {
    setDescription(value.slice(0, TRACK_DESCRIPTION_MAX));
  };

  const resetFilePicker = () => {
    setFile(null);
    setFileInputKey((k) => k + 1);
  };

  const runImport = async (files: File[], opts?: { title?: string }) => {
    if (!files.length) {
      setMsg('No audio or video files found.');
      return;
    }
    setBusy(true);
    setMsg(null);
    setProgress(`Importing 0 / ${files.length}…`);
    try {
      const { added, skipped } = await importMediaFiles(files, {
        title: opts?.title,
        artist: artist.trim() || DEFAULT_ARTIST,
        description: description.trim() || undefined,
        playlistIds: [MASTER_PLAYLIST_ID],
      });
      setActivePlaylist(MASTER_PLAYLIST_ID);
      const tracks = listAllTracks();
      const latest = tracks.sort((a, b) => (b.uploadedAt ?? '').localeCompare(a.uploadedAt ?? ''))[0];

      if (added === 0) {
        setMsg(
          skipped > 0
            ? `No new files added (${skipped} already in your catalog).`
            : 'Import failed — check browser storage or try smaller files.',
        );
        setProgress(null);
        return;
      }

      setMsg(
        `Added ${added} track${added === 1 ? '' : 's'}${skipped ? ` · ${skipped} skipped (duplicates)` : ''}. Open Listen to play.`,
      );
      setProgress(null);
      setTitle('');
      setArtist(DEFAULT_ARTIST);
      setDescription('');
      resetFilePicker();
      if (latest?.id) onUploadSuccess?.(latest.id);
    } catch (e) {
      const err = e instanceof Error ? e.message : '';
      setMsg(
        err === 'storage_failed'
          ? 'Could not save to device storage (quota or permission). Free space and try again.'
          : 'Upload failed. Try again or fewer files at once.',
      );
      setProgress(null);
    } finally {
      setBusy(false);
    }
  };

  const handleSingleUpload = async () => {
    if (!file) {
      setMsg('Pick an audio or video file first.');
      return;
    }
    if (!title.trim()) {
      setMsg('Enter a title — that is what the player shows when playing.');
      return;
    }
    await runImport([file], { title: title.trim() });
  };

  const handleMultiUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const files = await collectMediaFiles(fileList);
    await runImport(files);
    resetFilePicker();
  };

  const handleFolderImport = async () => {
    setBusy(true);
    setMsg(null);
    setProgress('Reading folder…');
    try {
      const { added, skipped } = await scanDeviceLibrary({ pickFolder: true });
      setActivePlaylist(MASTER_PLAYLIST_ID);
      const tracks = listAllTracks();
      const latest = tracks.sort((a, b) => (b.uploadedAt ?? '').localeCompare(a.uploadedAt ?? ''))[0];
      if (added === 0) {
        setMsg(skipped > 0 ? 'All files in that folder are already in your catalog.' : 'No media files found in folder.');
      } else {
        setMsg(`Added ${added} from folder${skipped ? ` · ${skipped} duplicates skipped` : ''}. Open Listen to play.`);
        if (latest?.id) onUploadSuccess?.(latest.id);
      }
    } catch {
      setMsg('Folder import failed or was cancelled.');
    } finally {
      setProgress(null);
      setBusy(false);
    }
  };

  const tracks = listAllTracks();

  return (
    <section className="spotify-main-panel spotify-dj">
      <header className="spotify-main-head">
        <div>
          <p className="spotify-main-eyebrow">Upload</p>
          <h2 className="spotify-main-title">Add tracks</h2>
          <p className="spotify-main-desc">
            Single file with a custom title, or import many at once. Everything lands in{' '}
            <strong>Master catalog</strong> — then open <strong>Listen</strong>.
          </p>
        </div>
      </header>

      <div className="spotify-dj-grid">
        <article className="spotify-dj-card spotify-dj-card--wide">
          <h3>1 · One file (custom title)</h3>
          <label className="spotify-field">
            Title
            <input
              className="spotify-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Shown in the player when playing"
              disabled={busy || !hydrated}
            />
          </label>
          <label className="spotify-field">
            Artist
            <input
              className="spotify-input"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              disabled={busy || !hydrated}
            />
          </label>
          <label className="spotify-field">
            Description (optional)
            <textarea
              className="spotify-input spotify-textarea"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              maxLength={TRACK_DESCRIPTION_MAX}
              rows={3}
              placeholder="What's this track about?"
              disabled={busy || !hydrated}
            />
            <span className="spotify-field-hint">
              {description.length}/{TRACK_DESCRIPTION_MAX} characters
            </span>
          </label>
          <label className="spotify-field">
            Audio or video
            <input
              key={fileInputKey}
              ref={fileInputRef}
              className="spotify-input"
              type="file"
              accept="audio/*,video/*"
              disabled={busy || !hydrated}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button
            type="button"
            className="spotify-btn spotify-btn--gold"
            disabled={busy || !hydrated}
            onClick={() => void handleSingleUpload()}
          >
            {busy ? 'Working…' : 'Upload one · go to Listen'}
          </button>
        </article>

        <article className="spotify-dj-card spotify-dj-card--wide">
          <h3>2 · Many files at once</h3>
          <p className="spotify-main-desc" style={{ marginBottom: '0.75rem' }}>
            Uses each file name as the track title. Duplicates are skipped automatically.
          </p>
          <label className="spotify-field">
            Select multiple audio / video files
            <input
              className="spotify-input"
              type="file"
              accept="audio/*,video/*"
              multiple
              disabled={busy || !hydrated}
              onChange={(e) => void handleMultiUpload(e.target.files)}
            />
          </label>
          <button
            type="button"
            className="spotify-btn spotify-btn--ghost"
            disabled={busy || !hydrated}
            onClick={() => void handleFolderImport()}
          >
            Import a folder…
          </button>
        </article>

        {(progress || msg) && (
          <article className="spotify-dj-card spotify-dj-card--wide">
            {progress && <p className="spotify-dj-msg">{progress}</p>}
            {msg && <p className="spotify-dj-msg">{msg}</p>}
          </article>
        )}

        {tracks.length > 0 && (
          <article className="spotify-dj-card spotify-dj-card--wide">
            <h3>Your catalog ({tracks.length})</h3>
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
