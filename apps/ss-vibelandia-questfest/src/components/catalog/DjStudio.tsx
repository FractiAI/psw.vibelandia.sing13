import { useId, useRef, useState } from 'react';
import { formatFileSize } from '@/lib/formatDuration';
import { useCatalogStore } from '@/stores/catalogStore';
import {
  DEFAULT_ARTIST,
  TRACK_DESCRIPTION_MAX,
  TRACK_GENRE_MAX,
} from '@/lib/catalogTypes';
import { TrackLibraryManager } from '@/components/catalog/TrackLibraryManager';
import { MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { collectMediaFiles } from '@/lib/deviceMediaScan';
import { isServerUploadConfigured } from '@/lib/serverCatalog';
import {
  filterUploadableFiles,
  formatUploadRejectSummary,
  probeVideoDurationSec,
  MAX_MEDIA_UPLOAD_BYTES,
  MAX_VIDEO_DURATION_SEC,
} from '@/lib/mediaUploadLimits';
import {
  classifyFilesAgainstCatalog,
  formatAllDuplicatesMessage,
  formatPartialDuplicatesMessage,
} from '@/lib/mediaImportPreflight';

interface DjStudioProps {
  onUploadSuccess?: (trackId: string) => void;
}

type MsgKind = 'info' | 'success' | 'error' | 'idle';

export function DjStudio({ onUploadSuccess }: DjStudioProps) {
  const tracks = useCatalogStore((s) => s.tracks);
  const importMediaFiles = useCatalogStore((s) => s.importMediaFiles);
  const scanDeviceLibrary = useCatalogStore((s) => s.scanDeviceLibrary);
  const listAllTracks = useCatalogStore((s) => s.listAllTracks);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const singleFileInputId = useId();
  const multiFileInputId = useId();
  const [fileInputKey, setFileInputKey] = useState(0);
  const [multiInputKey, setMultiInputKey] = useState(0);
  const [multiFiles, setMultiFiles] = useState<File[]>([]);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState(DEFAULT_ARTIST);
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [statusLine, setStatusLine] = useState('Ready to upload.');
  const [msg, setMsg] = useState<string | null>(null);
  const [msgKind, setMsgKind] = useState<MsgKind>('idle');

  const serverReady = isServerUploadConfigured();

  const showMsg = (text: string, kind: MsgKind) => {
    setMsg(text);
    setMsgKind(kind);
  };

  const setStatus = (text: string) => {
    setStatusLine(text);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value.slice(0, TRACK_DESCRIPTION_MAX));
  };

  const resetFilePicker = () => {
    setFile(null);
    setFileInputKey((k) => k + 1);
  };

  const resetMultiPicker = () => {
    setMultiFiles([]);
    setMultiInputKey((k) => k + 1);
  };

  const runImport = async (files: File[], opts?: { title?: string }) => {
    if (!serverReady) {
      setStatus('Upload not available.');
      showMsg(
        'Server upload is not configured. Set VITE_CATALOG_UPLOAD_SECRET (or captain password) in the Bridge build and CATALOG_UPLOAD_SECRET + BLOB_READ_WRITE_TOKEN on Vercel, then redeploy.',
        'error',
      );
      return;
    }

    if (!files.length) {
      setStatus('No files selected.');
      showMsg('No audio or video files found.', 'error');
      return;
    }

    const { newFiles, duplicates } = classifyFilesAgainstCatalog(files, tracks);

    if (!newFiles.length) {
      setStatus('Nothing new to upload.');
      showMsg(formatAllDuplicatesMessage(duplicates), 'info');
      resetFilePicker();
      return;
    }

    setBusy(true);
    setMsg(null);
    setMsgKind('idle');
    setStatus('Checking length and size…');

    const { uploadable, rejected } = await filterUploadableFiles(newFiles);
    const rejectNote = formatUploadRejectSummary(rejected);

    if (!uploadable.length) {
      setStatus('Cannot upload selection.');
      showMsg(
        rejectNote
          ? `${rejectNote}. Videos must be 10 minutes or less and under ~600 MB.`
          : formatAllDuplicatesMessage(duplicates),
        'error',
      );
      setBusy(false);
      resetFilePicker();
      return;
    }

    setStatus(
      duplicates.length || rejected.length
        ? `Checked: ${duplicates.length} duplicate(s) skipped${rejectNote ? ` · ${rejectNote}` : ''} · starting ${uploadable.length} upload(s)…`
        : `Starting upload of ${uploadable.length} file${uploadable.length === 1 ? '' : 's'}…`,
    );

    try {
      const { added, addedTrackIds } = await importMediaFiles(uploadable, {
        title: opts?.title,
        artist: artist.trim() || DEFAULT_ARTIST,
        description: description.trim() || undefined,
        genre: genre.trim() || undefined,
        playlistIds: [MASTER_PLAYLIST_ID],
        onProgress: (line) => setStatus(line),
      });
      setActivePlaylist(MASTER_PLAYLIST_ID);

      if (added === 0) {
        setStatus('Upload finished — nothing saved.');
        showMsg(
          'Nothing new was saved on the server. Check Vercel Blob settings or try one file at a time.',
          'error',
        );
        return;
      }

      setStatus(`Done — ${added} track${added === 1 ? '' : 's'} saved on the server.`);
      const dupNote = formatPartialDuplicatesMessage(added, duplicates);
      showMsg(
        rejectNote ? `${dupNote} Skipped: ${rejectNote}.` : dupNote,
        'success',
      );
      setTitle('');
      setArtist(DEFAULT_ARTIST);
      setDescription('');
      resetFilePicker();
      const playId = addedTrackIds[0];
      if (playId) {
        setStatus('Opening Listen…');
        onUploadSuccess?.(playId);
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : '';
      const errLower = err.toLowerCase();
      setStatus('Upload failed.');
      if (err === 'catalog_upload_unconfigured') {
        showMsg(
          'Server upload is not configured. On Vercel set BLOB_READ_WRITE_TOKEN and CATALOG_UPLOAD_SECRET (same value as VITE_CATALOG_UPLOAD_SECRET or captain password in the Bridge build), then redeploy.',
          'error',
        );
      } else if (err === 'video_too_long') {
        showMsg(
          `Video is longer than ${Math.floor(MAX_VIDEO_DURATION_SEC / 60)} minutes. Trim or export a shorter cut, then try again.`,
          'error',
        );
      } else if (err === 'upload_connection_failed') {
        showMsg(
          'Could not reach the upload server. Check your connection, wait a minute after deploy, and try again.',
          'error',
        );
      } else if (
        err === 'file_too_large' ||
        err === 'payload_too_large' ||
        errLower.includes('out of memory') ||
        errLower.includes('allocation failed')
      ) {
        showMsg(
          'File is too large for this upload path. Videos: up to 10 minutes and ~600 MB. Audio: try a smaller MP3 or upload one file at a time.',
          'error',
        );
      } else {
        showMsg(
          err === 'storage_failed' || err === 'blob_store_failed' || err === 'register_failed'
            ? 'Could not save to the server. Blob storage may be unavailable — check Vercel Blob on the deployment.'
            : err
              ? `Upload failed: ${err}`
              : 'Upload failed. Try one smaller file at a time.',
          'error',
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSingleUpload = async () => {
    if (!file) {
      setStatus('Pick a file first.');
      showMsg('Pick an audio or video file first.', 'error');
      return;
    }
    if (!title.trim()) {
      setStatus('Enter a title.');
      showMsg('Enter a title — that is what the player shows when playing.', 'error');
      return;
    }

    const { duplicates } = classifyFilesAgainstCatalog([file], tracks);
    if (duplicates.length) {
      setStatus('Already in catalog.');
      showMsg(formatAllDuplicatesMessage(duplicates), 'info');
      resetFilePicker();
      return;
    }
    if (file.size > MAX_MEDIA_UPLOAD_BYTES) {
      setStatus('File too large.');
      showMsg('This file is over the ~600 MB upload limit. Use a shorter or more compressed export.', 'error');
      return;
    }
    const durationSec = await probeVideoDurationSec(file);
    if (durationSec !== null && durationSec > MAX_VIDEO_DURATION_SEC) {
      setStatus('Video too long.');
      showMsg(
        `Video is ${Math.ceil(durationSec / 60)} minutes — max is ${MAX_VIDEO_DURATION_SEC / 60} minutes. Trim and try again.`,
        'error',
      );
      return;
    }

    setStatus(`Preparing "${title.trim()}"…`);
    await runImport([file], { title: title.trim() });
  };

  const handleMultiFilePick = async (fileList: FileList | null) => {
    if (!fileList?.length) {
      setMultiFiles([]);
      return;
    }
    setStatus('Reading selected files…');
    const files = await collectMediaFiles(fileList);
    setMultiFiles(files);
    if (!files.length) {
      setStatus('No media in selection.');
      showMsg('No audio or video files in that selection.', 'error');
      return;
    }
    setStatus(`${files.length} file${files.length === 1 ? '' : 's'} ready to upload.`);
    setMsg(null);
    setMsgKind('idle');
  };

  const handleMultiUpload = async () => {
    if (!multiFiles.length) {
      setStatus('Pick files first.');
      showMsg('Select one or more audio or video files first.', 'error');
      return;
    }
    await runImport(multiFiles);
    resetMultiPicker();
  };

  const handleFolderImport = async () => {
    if (!serverReady) {
      setStatus('Upload not available.');
      showMsg('Server upload is not configured on this deployment.', 'error');
      return;
    }
    setBusy(true);
    setMsg(null);
    setStatus('Choose a folder…');
    try {
      const { added, duplicates, addedTrackIds } = await scanDeviceLibrary({
        pickFolder: true,
        onProgress: (line) => setStatus(line),
      });
      setActivePlaylist(MASTER_PLAYLIST_ID);

      if (added === 0) {
        setStatus(duplicates.length ? 'All files already in catalog.' : 'No media in folder.');
        showMsg(
          duplicates.length
            ? formatAllDuplicatesMessage(duplicates)
            : 'No media files found in that folder, or import was cancelled.',
          duplicates.length ? 'info' : 'error',
        );
      } else {
        setStatus(`Done — ${added} track${added === 1 ? '' : 's'} imported.`);
        showMsg(formatPartialDuplicatesMessage(added, duplicates), 'success');
        const playId = addedTrackIds[0];
        if (playId) onUploadSuccess?.(playId);
      }
    } catch {
      setStatus('Folder import failed.');
      showMsg('Folder import failed or was cancelled.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const catalogTracks = listAllTracks();
  const msgClass =
    msgKind === 'error'
      ? 'spotify-dj-msg spotify-dj-msg--error'
      : msgKind === 'success'
        ? 'spotify-dj-msg spotify-dj-msg--success'
        : msgKind === 'info'
          ? 'spotify-dj-msg spotify-dj-msg--info'
          : 'spotify-dj-msg';

  return (
    <section className="spotify-main-panel spotify-dj">
      <header className="spotify-main-head">
        <div>
          <p className="spotify-main-eyebrow">Upload</p>
          <h2 className="spotify-main-title">Add tracks</h2>
          <p className="spotify-main-desc">
            Files save to the <strong>server catalog</strong>, then appear in Listen. Audio and video — videos up
            to <strong>10 minutes</strong> (~600 MB) upload direct to QUESTFEST storage.
          </p>
        </div>
      </header>

      <div
        className={`spotify-dj-status${busy ? ' spotify-dj-status--busy' : ''}${!serverReady ? ' spotify-dj-status--warn' : ''}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {busy && <span className="spotify-dj-status-spinner" aria-hidden />}
        <div className="spotify-dj-status-text">
          <strong>{busy ? 'Working' : serverReady ? 'Status' : 'Setup needed'}</strong>
          <span>{statusLine}</span>
        </div>
        {msg && <p className={msgClass}>{msg}</p>}
      </div>

      <datalist id="qf-genre-suggestions">
        <option value="Reno Swamp" />
        <option value="Bachdoor" />
        <option value="Caliente" />
        <option value="Wrong Side" />
        <option value="Holographic" />
        <option value="Salsa" />
        <option value="Country" />
        <option value="Jazz" />
        <option value="Ambient" />
        <option value="Other" />
      </datalist>

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
              disabled={busy}
            />
          </label>
          <label className="spotify-field">
            Artist
            <input
              className="spotify-input"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              disabled={busy}
            />
          </label>
          <label className="spotify-field">
            Genre (optional)
            <input
              className="spotify-input"
              list="qf-genre-suggestions"
              value={genre}
              onChange={(e) => setGenre(e.target.value.slice(0, TRACK_GENRE_MAX))}
              placeholder="e.g. Reno Swamp"
              disabled={busy}
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
              disabled={busy}
            />
            <span className="spotify-field-hint">
              {description.length}/{TRACK_DESCRIPTION_MAX} characters
            </span>
          </label>
          <div className="spotify-field">
            <span>Audio or video</span>
            <div className="spotify-file-pick">
              <input
                key={fileInputKey}
                id={singleFileInputId}
                ref={fileInputRef}
                className="spotify-file-pick-input"
                type="file"
                accept="audio/*,video/*"
                disabled={busy}
                onChange={(e) => {
                  const picked = e.target.files?.[0] ?? null;
                  setFile(picked);
                  if (picked) {
                    setStatus(`Selected: ${picked.name}`);
                    setMsg(null);
                    setMsgKind('idle');
                  } else {
                    setStatus('Ready to upload.');
                  }
                }}
              />
              <div className="spotify-file-pick-row">
                <label htmlFor={singleFileInputId} className="spotify-btn spotify-btn--ghost">
                  Choose file
                </label>
                {file && (
                  <button
                    type="button"
                    className="spotify-btn spotify-btn--tiny"
                    disabled={busy}
                    onClick={() => {
                      resetFilePicker();
                      setStatus('Ready to upload.');
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <p
                className={`spotify-file-pick-name${file ? ' spotify-file-pick-name--selected' : ''}`}
                aria-live="polite"
              >
                {file ? (
                  <>
                    <strong>{file.name}</strong>
                    <span className="spotify-file-pick-meta">{formatFileSize(file.size)}</span>
                  </>
                ) : (
                  'No file selected yet'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="spotify-btn spotify-btn--gold"
            disabled={busy || !serverReady || !file}
            onClick={() => void handleSingleUpload()}
          >
            {busy ? 'Uploading…' : 'Upload · go to Listen'}
          </button>
        </article>

        <article className="spotify-dj-card spotify-dj-card--wide">
          <h3>2 · Many files at once</h3>
          <p className="spotify-main-desc" style={{ marginBottom: '0.75rem' }}>
            Uses each file name as the track title. Duplicates are skipped with a clear note.
          </p>
          <div className="spotify-field">
            <span>Select multiple audio / video files</span>
            <div className="spotify-file-pick">
              <input
                key={multiInputKey}
                id={multiFileInputId}
                className="spotify-file-pick-input"
                type="file"
                accept="audio/*,video/*"
                multiple
                disabled={busy || !serverReady}
                onChange={(e) => void handleMultiFilePick(e.target.files)}
              />
              <div className="spotify-file-pick-row">
                <label htmlFor={multiFileInputId} className="spotify-btn spotify-btn--ghost">
                  Choose files
                </label>
                {multiFiles.length > 0 && (
                  <button
                    type="button"
                    className="spotify-btn spotify-btn--tiny"
                    disabled={busy}
                    onClick={() => {
                      resetMultiPicker();
                      setStatus('Ready to upload.');
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <p
                className={`spotify-file-pick-name${multiFiles.length ? ' spotify-file-pick-name--selected' : ''}`}
                aria-live="polite"
              >
                {multiFiles.length ? (
                  <>
                    <strong>
                      {multiFiles.length} file{multiFiles.length === 1 ? '' : 's'} selected
                    </strong>
                  </>
                ) : (
                  'No files selected yet'
                )}
              </p>
              {multiFiles.length > 0 && (
                <ul className="spotify-file-pick-list">
                  {multiFiles.slice(0, 6).map((f) => (
                    <li key={`${f.name}-${f.size}-${f.lastModified}`}>
                      {f.name}
                      <span className="spotify-file-pick-meta">{formatFileSize(f.size)}</span>
                    </li>
                  ))}
                  {multiFiles.length > 6 && (
                    <li className="spotify-file-pick-more">+{multiFiles.length - 6} more</li>
                  )}
                </ul>
              )}
            </div>
          </div>
          <button
            type="button"
            className="spotify-btn spotify-btn--gold"
            disabled={busy || !serverReady || multiFiles.length === 0}
            onClick={() => void handleMultiUpload()}
          >
            {busy
              ? 'Uploading…'
              : multiFiles.length
                ? `Upload ${multiFiles.length} file${multiFiles.length === 1 ? '' : 's'}`
                : 'Upload files'}
          </button>
          <button
            type="button"
            className="spotify-btn spotify-btn--ghost"
            disabled={busy || !serverReady}
            onClick={() => void handleFolderImport()}
          >
            {busy ? 'Working…' : 'Import a folder…'}
          </button>
        </article>

        <TrackLibraryManager tracks={catalogTracks} disabled={busy} />
      </div>
    </section>
  );
}
