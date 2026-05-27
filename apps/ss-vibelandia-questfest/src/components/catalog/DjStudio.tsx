import { useId, useState } from 'react';
import { formatFileSize } from '@/lib/formatDuration';
import { useCatalogStore } from '@/stores/catalogStore';
import {
  DEFAULT_ARTIST,
  TRACK_DESCRIPTION_MAX,
  TRACK_GENRE_MAX,
} from '@/lib/catalogTypes';
import { TrackLibraryManager } from '@/components/catalog/TrackLibraryManager';
import { MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { collectMediaFiles, titleFromFileName } from '@/lib/deviceMediaScan';
import { normalizeCoverForUpload } from '@/lib/coverImageFile';
import { isServerUploadConfigured } from '@/lib/serverCatalog';
import {
  deferAfterFilePicker,
  isIOSDevice,
  uploadCoverInputAccept,
  uploadFileInputAccept,
} from '@/lib/devicePlayback';
import { pauseSimpleAudio } from '@/lib/simplePlayback';
import { usePlaybackStore } from '@/stores/playbackStore';
import {
  filterUploadableFiles,
  formatUploadRejectSummary,
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

  const uploadFileInputId = useId();
  const coverInputId = useId();
  const [uploadInputKey, setUploadInputKey] = useState(0);
  const [multiFiles, setMultiFiles] = useState<File[]>([]);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState(DEFAULT_ARTIST);
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | undefined>();
  const [coverInputKey, setCoverInputKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [statusLine, setStatusLine] = useState('Ready to upload.');
  const [msg, setMsg] = useState<string | null>(null);
  const [msgKind, setMsgKind] = useState<MsgKind>('idle');

  const serverReady = isServerUploadConfigured();
  const iosUpload = isIOSDevice();
  const mediaAccept = uploadFileInputAccept();
  const coverAccept = uploadCoverInputAccept();

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

  const resetCoverPicker = () => {
    if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview(undefined);
    setCoverInputKey((k) => k + 1);
  };

  const applyCoverPick = async (picked: File | null) => {
    if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
    if (!picked) {
      setCoverFile(null);
      setCoverPreview(undefined);
      return;
    }
    try {
      const normalized = await normalizeCoverForUpload(picked);
      setCoverFile(normalized);
      setCoverPreview(URL.createObjectURL(normalized));
      showMsg(`Cover ready: ${normalized.name}`, 'success');
    } catch {
      showMsg(
        'Could not use that image — try JPEG or PNG, or export your photo as JPEG on this device.',
        'error',
      );
    }
  };

  const resetUploadPicker = () => {
    setMultiFiles([]);
    setUploadInputKey((k) => k + 1);
  };

  const armUploadSafe = () => {
    pauseSimpleAudio();
    usePlaybackStore.getState().setPlaying(false);
    usePlaybackStore.getState().setTrack(null);
  };

  const runImport = async (files: File[], opts?: { title?: string }) => {
    armUploadSafe();
    if (!serverReady) {
      setStatus('Upload not available.');
      showMsg(
        "Server upload is not configured. Set VITE_CATALOG_UPLOAD_SECRET (or Capitan password) in the Capitan's Bridge build and CATALOG_UPLOAD_SECRET + BLOB_READ_WRITE_TOKEN on Vercel, then redeploy.",
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
      resetUploadPicker();
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
      resetUploadPicker();
      return;
    }

    setStatus(
      duplicates.length || rejected.length
        ? `Checked: ${duplicates.length} duplicate(s) skipped${rejectNote ? ` · ${rejectNote}` : ''} · starting ${uploadable.length} upload(s)…`
        : `Starting upload of ${uploadable.length} file${uploadable.length === 1 ? '' : 's'}…`,
    );

    try {
      const { added, addedTrackIds, coverError } = await importMediaFiles(uploadable, {
        title: uploadable.length === 1 ? opts?.title : undefined,
        artist: artist.trim() || DEFAULT_ARTIST,
        description: description.trim() || undefined,
        genre: genre.trim() || undefined,
        playlistIds: [MASTER_PLAYLIST_ID],
        coverFile: coverFile ?? undefined,
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
      const coverNote = coverError
        ? ` Track saved but cover failed (${coverError}) — edit the track and choose image again.`
        : coverFile && added > 0
          ? ' Cover image saved.'
          : '';
      showMsg(
        (rejectNote ? `${dupNote} Skipped: ${rejectNote}.` : dupNote) + coverNote,
        coverError ? 'info' : 'success',
      );
      setTitle('');
      setArtist(DEFAULT_ARTIST);
      setDescription('');
      setGenre('');
      resetCoverPicker();
      resetUploadPicker();
      const playId = addedTrackIds[0];
      if (playId) {
        if (iosUpload) {
          setStatus('Upload complete — tap Listen when ready.');
          showMsg('Saved on the server. Tap Listen (top tab) to play — stay here if another upload is queued.', 'success');
        } else {
          setStatus('Opening Listen…');
          onUploadSuccess?.(playId);
        }
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : '';
      const errLower = err.toLowerCase();
      setStatus('Upload failed.');
      if (err === 'catalog_upload_unconfigured') {
        showMsg(
          "Server upload is not configured. On Vercel set BLOB_READ_WRITE_TOKEN and CATALOG_UPLOAD_SECRET (same value as VITE_CATALOG_UPLOAD_SECRET or Capitan password in the Capitan's Bridge build), then redeploy.",
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
            ? 'Upload stored the file but the catalog manifest did not save. Check Vercel Blob is connected to this project and CATALOG_UPLOAD_SECRET matches the bridge build.'
            : err === 'catalog_save_failed'
              ? 'Catalog manifest could not be saved on the server. Connect Blob storage on Vercel (FractiAI project) and redeploy.'
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

  /** `raw` must be a snapshot (e.g. `Array.from(input.files)`) — not a live `FileList` after the input resets. */
  const processPickedFiles = async (raw: File[]) => {
    if (!raw.length) {
      setMultiFiles([]);
      return;
    }
    setStatus('Reading selected files…');
    const files = await collectMediaFiles(raw);
    setMultiFiles(files);
    if (!files.length) {
      setStatus('No media in selection.');
      showMsg('No audio or video files in that selection.', 'error');
      return;
    }
    if (files.length === 1 && !title.trim()) {
      setTitle(titleFromFileName(files[0]!.name));
    }
    const importOpts =
      files.length === 1 ? { title: title.trim() || titleFromFileName(files[0]!.name) } : {};

    if (iosUpload) {
      setStatus(`${files.length} file${files.length === 1 ? '' : 's'} ready — tap Upload below.`);
      setMsg(null);
      setMsgKind('idle');
      return;
    }
    if (!serverReady) {
      setStatus('Upload not available.');
      showMsg(
        'Server upload is not configured on this deployment. Check Vercel Blob + catalog secrets.',
        'error',
      );
      return;
    }
    setStatus(`Uploading ${files.length} file${files.length === 1 ? '' : 's'}…`);
    setMsg(null);
    setMsgKind('idle');
    await runImport(files, importOpts);
  };

  const handleMultiUpload = async () => {
    if (!multiFiles.length) {
      setStatus('Pick files first.');
      showMsg('Select one or more audio or video files first.', 'error');
      return;
    }
    const importOpts =
      multiFiles.length === 1
        ? { title: title.trim() || titleFromFileName(multiFiles[0]!.name) }
        : {};
    const go = async () => {
      setStatus(`Uploading ${multiFiles.length} file${multiFiles.length === 1 ? '' : 's'}…`);
      await runImport(multiFiles, importOpts);
    };
    if (iosUpload) deferAfterFilePicker(() => void go());
    else void go();
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
            Files save to the <strong>server catalog</strong>, then appear in Listen.{' '}
            {iosUpload ? (
              <>
                On iPhone/iPad use <strong>MP3 or M4A audio</strong> — tap <strong>Upload</strong> after you choose a
                file (avoids the blue picker hang).
              </>
            ) : (
              <>
                Audio and video — videos up to <strong>10 minutes</strong> (~600 MB) upload direct to QUESTFEST
                storage.
              </>
            )}
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
          <h3>Upload tracks</h3>
          <p className="spotify-main-desc" style={{ marginBottom: '0.75rem' }}>
            Choose <strong>one or many</strong> audio files in the same dialog (multi-select on desktop). When you pick
            exactly one file, the fields below apply to that upload; with several files, each track title comes from the
            file name. Duplicates are skipped with a clear note. On iPhone/iPad, tap <strong>Upload</strong> after you
            choose files.
          </p>
          <label className="spotify-field">
            Title
            <input
              className="spotify-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Used when exactly one file is selected"
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
          <div className="spotify-field sp-track-cover-field">
            <span>Cover image (optional)</span>
            <div className="spotify-file-pick">
              <input
                key={coverInputKey}
                id={coverInputId}
                type="file"
                accept={coverAccept}
                className="spotify-file-pick-input"
                disabled={busy}
                onChange={(e) => {
                  const picked = e.target.files?.[0] ?? null;
                  e.target.value = '';
                  const apply = () => void applyCoverPick(picked);
                  if (iosUpload) deferAfterFilePicker(apply);
                  else apply();
                }}
              />
              <div className="sp-track-cover-row">
                {coverPreview ? (
                  <img className="sp-track-cover-preview" src={coverPreview} alt="" width={72} height={72} />
                ) : (
                  <span className="sp-track-cover-preview sp-track-cover-preview--empty" aria-hidden />
                )}
                <label htmlFor={coverInputId} className="spotify-btn spotify-btn--ghost spotify-btn--tiny">
                  {coverFile ? coverFile.name : 'Choose image'}
                </label>
                {coverFile && (
                  <button
                    type="button"
                    className="spotify-btn spotify-btn--tiny"
                    disabled={busy}
                    onClick={() => resetCoverPicker()}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <span className="spotify-field-hint">
              Any standard photo (JPEG, PNG, WebP, iPhone HEIC) · saved with the track when you upload a single file
            </span>
          </div>
          <div className="spotify-field">
            <span>Audio files</span>
            <div className="spotify-file-pick">
              <input
                key={uploadInputKey}
                id={uploadFileInputId}
                className="spotify-file-pick-input"
                type="file"
                accept={mediaAccept}
                multiple
                disabled={busy}
                onChange={(e) => {
                  const raw = e.target.files?.length ? Array.from(e.target.files) : [];
                  if (!raw.length) {
                    setMultiFiles([]);
                    setStatus('Ready to upload.');
                    return;
                  }
                  setMsg(null);
                  setMsgKind('idle');
                  deferAfterFilePicker(() => {
                    e.target.value = '';
                    void processPickedFiles(raw);
                  });
                }}
              />
              <div className="spotify-file-pick-row">
                <label htmlFor={uploadFileInputId} className="spotify-btn spotify-btn--ghost">
                  Choose files
                </label>
                {multiFiles.length > 0 && (
                  <button
                    type="button"
                    className="spotify-btn spotify-btn--tiny"
                    disabled={busy}
                    onClick={() => {
                      resetUploadPicker();
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
          {multiFiles.length > 0 && (
            <button
              type="button"
              className="spotify-btn spotify-btn--gold"
              disabled={busy || !serverReady}
              onClick={() => void handleMultiUpload()}
            >
              {busy
                ? 'Uploading…'
                : iosUpload
                  ? `Upload ${multiFiles.length} file${multiFiles.length === 1 ? '' : 's'}`
                  : `Upload ${multiFiles.length} file${multiFiles.length === 1 ? '' : 's'} again`}
            </button>
          )}
          {!iosUpload && (
            <button
              type="button"
              className="spotify-btn spotify-btn--ghost"
              disabled={busy || !serverReady}
              onClick={() => void handleFolderImport()}
            >
              {busy ? 'Working…' : 'Import a folder…'}
            </button>
          )}
        </article>

        <TrackLibraryManager tracks={catalogTracks} disabled={busy} />
      </div>
    </section>
  );
}
