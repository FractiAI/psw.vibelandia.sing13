/**
 * Minimal MP3-only uploader — no video, no cover picker.
 * Desktop: upload runs right after you pick (deferAfterFilePicker). iPhone/iPad: pick then tap Upload.
 * Playback chrome is unmounted on /dj (see App.tsx) to avoid iOS Safari blue-screen hangs.
 */
import { useRef, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { DEFAULT_ARTIST } from '@/lib/catalogTypes';
import { MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { titleFromFileName } from '@/lib/deviceMediaScan';
import {
  classifyFilesAgainstCatalog,
  formatAllDuplicatesMessage,
  formatPartialDuplicatesMessage,
} from '@/lib/mediaImportPreflight';
import { isServerUploadConfigured } from '@/lib/serverCatalog';
import { MAX_MEDIA_UPLOAD_BYTES } from '@/lib/mediaUploadLimits';
import { formatFileSize } from '@/lib/formatDuration';
import { deferAfterFilePicker, isIOSDevice } from '@/lib/devicePlayback';

const MP3_ACCEPT = '.mp3,audio/mpeg';

function isMp3File(file: File): boolean {
  const name = file.name.toLowerCase();
  return file.type === 'audio/mpeg' || name.endsWith('.mp3');
}

/** Fisher–Yates with per-swap crypto RNG when available (new order each upload, not deterministic). */
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

type Mp3UploaderProps = {
  onUploaded?: () => void;
};

export function Mp3Uploader({ onUploaded }: Mp3UploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const tracks = useCatalogStore((s) => s.tracks);
  const importMediaFiles = useCatalogStore((s) => s.importMediaFiles);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);

  const [title, setTitle] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Choose one or more MP3s — upload starts after you pick (iPhone: tap Upload).');

  const serverReady = isServerUploadConfigured();
  const iosUpload = isIOSDevice();

  const openPicker = () => {
    if (busy) return;
    inputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    /** Copy before clearing `value` — `FileList` is tied to the input and can go empty when reset. */
    const picked = list?.length ? Array.from(list) : [];
    e.target.value = '';
    if (!picked.length) {
      return;
    }
    const valid: File[] = [];
    const rejections: string[] = [];

    for (const f of picked) {
      if (!isMp3File(f)) {
        rejections.push(`“${f.name}” is not MP3`);
        continue;
      }
      if (f.size > MAX_MEDIA_UPLOAD_BYTES) {
        rejections.push(`“${f.name}” exceeds max size (~80 MB)`);
        continue;
      }
      valid.push(f);
    }

    if (!valid.length) {
      setFiles([]);
      setStatus(
        rejections.length
          ? `No usable files: ${rejections.join('; ')}.`
          : 'Only MP3 files under ~80 MB each. Export or convert, then try again.',
      );
      return;
    }

    const combined: File[] = valid;
    setFiles(combined);

    if (combined.length === 1 && !title.trim()) {
      setTitle(titleFromFileName(combined[0]!.name));
    } else if (combined.length > 1) {
      setTitle('');
    }

    const extra =
      rejections.length > 0 ? ` (${rejections.length} skipped: ${rejections.slice(0, 3).join('; ')}${rejections.length > 3 ? '…' : ''})` : '';
    setStatus(
      combined.length === 1
        ? iosUpload
          ? `Ready: ${combined[0]!.name} — tap Upload.${extra}`
          : `Uploading ${combined[0]!.name}…${extra}`
        : iosUpload
          ? `Ready: ${combined.length} MP3s — tap Upload.${shuffle ? ' Shuffle applies when you upload.' : ''}${extra}`
          : `Uploading ${combined.length} MP3s…${shuffle ? ' (shuffled order.)' : ''}${extra}`,
    );

    const singleTitleForImport =
      combined.length === 1 ? title.trim() || titleFromFileName(combined[0]!.name) : undefined;

    if (serverReady && !iosUpload) {
      deferAfterFilePicker(() => {
        void uploadQueue(combined, singleTitleForImport);
      });
    }
  };

  /** Upload a concrete file array (avoids stale React state right after file pick). */
  const uploadQueue = async (queue: File[], singleTitleOverride?: string) => {
    if (!queue.length || busy) {
      if (!queue.length) setStatus('Choose one or more MP3 files first.');
      return;
    }
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

    setBusy(true);
    setStatus('Uploading to QUESTFEST…');

    try {
      const singleTitle =
        newFiles.length !== 1
          ? undefined
          : singleTitleOverride?.trim() ||
            title.trim() ||
            titleFromFileName(newFiles[0]!.name);
      const { added } = await importMediaFiles(newFiles, {
        ...(singleTitle ? { title: singleTitle } : {}),
        artist: DEFAULT_ARTIST,
        playlistIds: [MASTER_PLAYLIST_ID],
        onProgress: (line) => setStatus(line),
      });
      setActivePlaylist(MASTER_PLAYLIST_ID);

      if (added > 0) {
        setFiles([]);
        setTitle('');
        setStatus(
          duplicates.length
            ? formatPartialDuplicatesMessage(added, duplicates)
            : added === 1
              ? 'Success — track saved on the server. Open Listen to play.'
              : `Success — ${added} tracks saved on the server. Open Listen to play.`,
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
      setBusy(false);
    }
  };

  const runUpload = () => {
    void uploadQueue(files);
  };

  return (
    <section className="mp3-uploader" aria-labelledby="mp3-uploader-h">
      <header className="mp3-uploader-head">
        <p className="mp3-uploader-eyebrow">MP3 upload</p>
        <h2 id="mp3-uploader-h" className="mp3-uploader-title">
          Add tracks to the catalog
        </h2>
        <p className="mp3-uploader-desc">
          MP3 only. Use <strong>Choose MP3 files</strong> — you can select one or many in the same dialog (Ctrl/Shift on
          desktop). Titles come from file names; you can override when exactly one file is selected. On this device,
          {iosUpload ? ' tap Upload after you pick.' : ' upload starts right after you pick.'} Optional shuffle applies
          when two or more files are queued. No video.
        </p>
      </header>

      {!serverReady ? (
        <p className="mp3-uploader-warn" role="alert">
          Server upload is not available on this build. Configure{' '}
          <code>VITE_CATALOG_UPLOAD_SECRET</code> and Vercel <code>BLOB_READ_WRITE_TOKEN</code>.
        </p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={MP3_ACCEPT}
        multiple={true}
        className="mp3-uploader-input"
        disabled={busy}
        onChange={onFileChange}
        tabIndex={-1}
        aria-hidden
      />

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
          <button type="button" className="mp3-uploader-btn mp3-uploader-btn--ghost" disabled={busy} onClick={openPicker}>
            Choose MP3 files
          </button>
          {files.length ? (
            <button
              type="button"
              className="mp3-uploader-btn mp3-uploader-btn--tiny"
              disabled={busy}
              onClick={() => {
                setFiles([]);
                setTitle('');
                setStatus('Choose one or more MP3s — upload starts after you pick (iPhone: tap Upload).');
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
                    ? `Shuffle on: random order each time files are uploaded (pick again or tap Upload).`
                    : `Ready: ${files.length} MP3s — upload order matches your selection.`,
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
          <ul className="mp3-uploader-file-list" aria-label="Selected MP3 files">
            {files.map((f) => (
              <li key={`${f.name}-${f.size}-${f.lastModified}`}>
                <span className="mp3-uploader-file-list-name">{f.name}</span>
                <span className="mp3-uploader-file-list-meta">{formatFileSize(f.size)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mp3-uploader-file-name" aria-live="polite">
            No files selected
          </p>
        )}

        <button
          type="button"
          className="mp3-uploader-btn mp3-uploader-btn--primary"
          disabled={busy || !serverReady || !files.length}
          onClick={() => void runUpload()}
        >
          {busy
            ? 'Uploading…'
            : files.length > 1
              ? `Upload ${files.length} MP3s`
              : iosUpload
                ? 'Upload MP3'
                : 'Upload again'}
        </button>
      </div>

      <p className="mp3-uploader-status" role="status" aria-live="polite">
        {status}
      </p>
    </section>
  );
}
