/**
 * Audio uploader — tuned for iPhone Safari (label tap, retain files, manual Upload).
 */
import { useCallback, useId, useRef, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { DEFAULT_ARTIST } from '@/lib/catalogTypes';
import { MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { isMediaFile, supportsDirectoryPicker, titleFromFileName } from '@/lib/deviceMediaScan';
import {
  classifyFilesAgainstCatalog,
  formatAllDuplicatesMessage,
  formatPartialDuplicatesMessage,
} from '@/lib/mediaImportPreflight';
import { isServerUploadConfigured } from '@/lib/serverCatalog';
import { MAX_MEDIA_UPLOAD_BYTES } from '@/lib/mediaUploadLimits';
import { formatFileSize } from '@/lib/formatDuration';
import {
  BULK_UPLOAD_AUTO_START_MAX,
  deferAfterFilePicker,
  isIOSDevice,
  retainPickedFilesForIOS,
  uploadFileInputAccept,
} from '@/lib/devicePlayback';

function shuffleUploadOrder<T>(files: readonly T[]): T[] {
  const out = [...files];
  for (let i = out.length - 1; i > 0; i--) {
    let j: number;
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const u = new Uint32Array(1);
      crypto.getRandomValues(u);
      j = u[0]! % (i + 1);
    } else {
      j = Math.floor(Math.random() * (i + 1));
    }
    const a = out[i]!;
    const b = out[j]!;
    out[i] = b;
    out[j] = a;
  }
  return out;
}

function filterUploadableAudio(picked: File[]): { valid: File[]; rejections: string[] } {
  const valid: File[] = [];
  const rejections: string[] = [];
  for (const f of picked) {
    if (!isMediaFile(f)) {
      rejections.push(`“${f.name}” is not a supported audio file`);
      continue;
    }
    if (f.size > MAX_MEDIA_UPLOAD_BYTES) {
      rejections.push(`“${f.name}” exceeds max size (~80 MB)`);
      continue;
    }
    valid.push(f);
  }
  return { valid, rejections };
}

const FILE_LIST_PREVIEW_MAX = 12;

type Mp3UploaderProps = {
  onUploaded?: () => void;
};

export function Mp3Uploader({ onUploaded }: Mp3UploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef<File[]>([]);
  const busyRef = useRef(false);

  const tracks = useCatalogStore((s) => s.tracks);
  const trackCount = useCatalogStore((s) => Object.keys(s.tracks).length);
  const importMediaFiles = useCatalogStore((s) => s.importMediaFiles);
  const scanDeviceLibrary = useCatalogStore((s) => s.scanDeviceLibrary);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);

  const [title, setTitle] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(
    isIOSDevice()
      ? 'Tap Choose files → pick from Browse (multi-select) → then tap Upload.'
      : 'Choose one or more audio files, then tap Upload.',
  );

  const serverReady = isServerUploadConfigured();
  const iosUpload = isIOSDevice();
  const mediaAccept = uploadFileInputAccept();

  const clearFileInput = () => {
    const el = inputRef.current;
    if (el) el.value = '';
  };

  const uploadQueue = useCallback(
    async (queue: File[], singleTitleOverride?: string) => {
      if (!queue.length) {
        setStatus('Choose one or more audio files first.');
        return;
      }
      if (busyRef.current) return;
      if (!serverReady) {
        setStatus('Server upload is not configured. Set catalog secrets on Vercel and redeploy.');
        return;
      }

      let ordered = [...queue];
      if (shuffle && ordered.length > 1) {
        ordered = shuffleUploadOrder(ordered);
      }

      const { newFiles, duplicates } = classifyFilesAgainstCatalog(ordered, tracks);
      if (!newFiles.length) {
        setStatus(formatAllDuplicatesMessage(duplicates));
        return;
      }

      busyRef.current = true;
      setBusy(true);
      setStatus('Uploading to QUESTFEST…');

      try {
        const singleTitle =
          newFiles.length !== 1
            ? undefined
            : singleTitleOverride?.trim() ||
              title.trim() ||
              titleFromFileName(newFiles[0]!.name);
        const result = await importMediaFiles(newFiles, {
          ...(singleTitle ? { title: singleTitle } : {}),
          artist: DEFAULT_ARTIST,
          playlistIds: [MASTER_PLAYLIST_ID],
          onProgress: (line) => setStatus(line),
        });
        setActivePlaylist(MASTER_PLAYLIST_ID);

        if (result.added > 0) {
          queueRef.current = [];
          setFiles([]);
          setTitle('');
          clearFileInput();
          const dupNote = duplicates.length
            ? formatPartialDuplicatesMessage(result.added, duplicates)
            : result.added === 1
              ? 'Success — track saved. Switch to Listen to play.'
              : `Success — ${result.added} tracks saved. Switch to Listen to play.`;
          const failNote =
            result.failed > 0
              ? ` ${result.failed} of ${result.added + result.failed} failed (${result.failures[0]?.name}: ${result.failures[0]?.message}).`
              : '';
          const syncNote =
            result.added > 3
              ? ' Server catalog sync continues in background.'
              : '';
          setStatus(
            `${dupNote}${failNote}${syncNote} Catalog: ${Object.keys(useCatalogStore.getState().tracks).length} tracks.`,
          );
          onUploaded?.();
        } else {
          setStatus('Upload finished but nothing new was saved. Check catalog settings or try again.');
        }
      } catch (e) {
        const err = e instanceof Error ? e.message : 'upload_failed';
        if (err === 'catalog_upload_unconfigured') {
          setStatus('Upload not configured on this server (Blob + catalog secret).');
        } else if (err === 'upload_connection_failed') {
          setStatus('Could not reach the upload server. Check connection and retry.');
        } else {
          setStatus(`Upload failed: ${err}`);
        }
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [importMediaFiles, onUploaded, serverReady, setActivePlaylist, shuffle, title, tracks],
  );

  const handleFolderImport = useCallback(async () => {
    if (!serverReady || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setStatus('Choose a folder with your audio files…');
    try {
      const { added, duplicates } = await scanDeviceLibrary({
        pickFolder: true,
        onProgress: (line) => setStatus(line),
      });
      setActivePlaylist(MASTER_PLAYLIST_ID);
      if (added === 0) {
        setStatus(
          duplicates.length
            ? formatAllDuplicatesMessage(duplicates)
            : 'No new audio files in that folder, or import was cancelled.',
        );
      } else {
        setStatus(
          `${formatPartialDuplicatesMessage(added, duplicates)} Catalog: ${Object.keys(useCatalogStore.getState().tracks).length} tracks.`,
        );
        onUploaded?.();
      }
    } catch {
      setStatus('Folder import failed or was cancelled.');
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [onUploaded, scanDeviceLibrary, serverReady, setActivePlaylist]);

  const applyPickedFiles = useCallback(
    async (picked: File[]) => {
      const largeBatch = picked.length > BULK_UPLOAD_AUTO_START_MAX;
      setStatus(
        largeBatch
          ? `Reading ${picked.length} selected files… (large batch — tap Upload when ready)`
          : 'Reading selected files…',
      );

      const retained = iosUpload ? await retainPickedFilesForIOS(picked) : picked;
      const { valid, rejections } = filterUploadableAudio(retained);

      if (!valid.length) {
        queueRef.current = [];
        setFiles([]);
        setStatus(
          rejections.length
            ? `No usable files: ${rejections.join('; ')}.`
            : 'Only audio files under ~80 MB each (MP3, M4A, WAV).',
        );
        return;
      }

      queueRef.current = valid;
      setFiles(valid);

      if (valid.length === 1 && !title.trim()) {
        setTitle(titleFromFileName(valid[0]!.name));
      } else if (valid.length > 1) {
        setTitle('');
      }

      const extra =
        rejections.length > 0
          ? ` (${rejections.length} skipped: ${rejections.slice(0, 3).join('; ')}${rejections.length > 3 ? '…' : ''})`
          : '';

      const readyMsg = `Ready: ${valid.length} file${valid.length === 1 ? '' : 's'} — tap Upload below.${extra}`;

      if (iosUpload || largeBatch) {
        setStatus(readyMsg);
        return;
      }

      setStatus(`Uploading ${valid.length} file${valid.length === 1 ? '' : 's'}…${extra}`);
      const singleTitle =
        valid.length === 1 ? title.trim() || titleFromFileName(valid[0]!.name) : undefined;
      void uploadQueue(valid, singleTitle);
    },
    [iosUpload, serverReady, title, uploadQueue],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.length ? Array.from(e.target.files) : [];
    if (!picked.length) return;

    deferAfterFilePicker(() => {
      void applyPickedFiles(picked);
    });
  };

  const runUpload = () => {
    const queue = queueRef.current.length ? queueRef.current : files;
    if (!queue.length) {
      setStatus('Choose files first, then tap Upload.');
      return;
    }
    const singleTitle =
      queue.length === 1 ? title.trim() || titleFromFileName(queue[0]!.name) : undefined;
    const go = () => void uploadQueue(queue, singleTitle);
    if (iosUpload) deferAfterFilePicker(go);
    else go();
  };

  const queueLen = files.length || queueRef.current.length;

  return (
    <section className="mp3-uploader" aria-labelledby="mp3-uploader-h">
      <header className="mp3-uploader-head">
        <p className="mp3-uploader-eyebrow">Upload</p>
        <h2 id="mp3-uploader-h" className="mp3-uploader-title">
          Add tracks to the catalog
        </h2>
        <p className="mp3-uploader-desc">
          {iosUpload ? (
            <>
              On iPhone: tap <strong>Choose files</strong> → <strong>Browse</strong> → select one or many MP3/M4A
              files → wait for the list below → tap <strong>Upload</strong>. Stay on this tab until upload finishes.
            </>
          ) : (
            <>
              Pick one or many tracks (Ctrl/Shift on desktop). Small batches upload automatically after you
              choose. For <strong>100+ tracks</strong>, use <strong>Import folder</strong> (recommended) or
              choose files then tap <strong>Upload</strong>.
            </>
          )}
        </p>
      </header>

      {!serverReady ? (
        <p className="mp3-uploader-warn" role="alert">
          Server upload is not available on this build. Configure{' '}
          <code>VITE_CATALOG_UPLOAD_SECRET</code> and Vercel <code>BLOB_READ_WRITE_TOKEN</code>.
        </p>
      ) : null}

      <div className="mp3-uploader-card">
        {files.length <= 1 ? (
          <label className="mp3-uploader-field">
            <span>Track title {files.length === 0 ? '' : '(optional)'}</span>
            <input
              type="text"
              className="mp3-uploader-text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={files.length === 1 ? 'Defaults to file name' : 'Shown when one file is selected'}
              disabled={busy}
              autoComplete="off"
            />
          </label>
        ) : (
          <p className="mp3-uploader-multi-hint">
            Titles use each file&apos;s name (e.g. <em>Artist - Song.mp3</em>).
          </p>
        )}

        <div className="mp3-uploader-file-row">
          <span className={`mp3-uploader-pick-wrap${iosUpload ? ' mp3-uploader-pick-wrap--ios' : ''}`}>
            <input
              id={inputId}
              ref={inputRef}
              type="file"
              accept={mediaAccept}
              multiple
              className="mp3-uploader-input"
              disabled={busy}
              onChange={handleFileInput}
              onInput={iosUpload ? handleFileInput : undefined}
            />
            <label
              htmlFor={inputId}
              className="mp3-uploader-btn mp3-uploader-btn--ghost mp3-uploader-pick-label"
            >
              Choose files
            </label>
          </span>
          {supportsDirectoryPicker() ? (
            <button
              type="button"
              className="mp3-uploader-btn mp3-uploader-btn--ghost"
              disabled={busy || !serverReady}
              onClick={() => void handleFolderImport()}
            >
              Import folder
            </button>
          ) : null}
          {files.length ? (
            <button
              type="button"
              className="mp3-uploader-btn mp3-uploader-btn--tiny"
              disabled={busy}
              onClick={() => {
                queueRef.current = [];
                setFiles([]);
                setTitle('');
                clearFileInput();
                setStatus(
                  iosUpload
                    ? 'Tap Choose files → Browse → select tracks → tap Upload.'
                    : 'Choose one or more audio files, then tap Upload.',
                );
              }}
            >
              Clear all
            </button>
          ) : null}
        </div>

        <label className="mp3-uploader-shuffle">
          <input
            type="checkbox"
            checked={shuffle}
            disabled={busy || files.length < 2}
            onChange={(e) => {
              const on = e.target.checked;
              setShuffle(on);
              if (files.length > 1) {
                setStatus(
                  on
                    ? 'Shuffle on: random order on next upload.'
                    : `Ready: ${files.length} files — upload order matches your selection.`,
                );
              }
            }}
          />
          <span>
            Shuffle upload order
            {files.length < 2 ? <span className="mp3-uploader-shuffle-note"> (select 2+ files)</span> : null}
          </span>
        </label>

        {files.length ? (
          <ul className="mp3-uploader-file-list" aria-label="Selected audio files">
            {files.slice(0, FILE_LIST_PREVIEW_MAX).map((f) => (
              <li key={`${f.name}-${f.size}-${f.lastModified}`}>
                <span className="mp3-uploader-file-list-name">{f.name}</span>
                <span className="mp3-uploader-file-list-meta">{formatFileSize(f.size)}</span>
              </li>
            ))}
            {files.length > FILE_LIST_PREVIEW_MAX ? (
              <li className="mp3-uploader-file-list-more">
                …and {files.length - FILE_LIST_PREVIEW_MAX} more (upload keeps file access until finished)
              </li>
            ) : null}
          </ul>
        ) : (
          <p className="mp3-uploader-file-name" aria-live="polite">
            No files selected
          </p>
        )}

        <button
          type="button"
          className="mp3-uploader-btn mp3-uploader-btn--primary"
          disabled={busy || !serverReady || !queueLen}
          onClick={() => void runUpload()}
        >
          {busy
            ? 'Uploading…'
            : files.length > 1
              ? `Upload ${files.length} files`
              : 'Upload'}
        </button>
      </div>

      <p className="mp3-uploader-status" role="status" aria-live="polite">
        {status}
        {trackCount > 0 ? (
          <span className="mp3-uploader-count"> · {trackCount} tracks in catalog</span>
        ) : null}
      </p>
    </section>
  );
}
