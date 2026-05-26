/**
 * Minimal MP3-only uploader — no video, no cover picker, no auto-upload on file select.
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
} from '@/lib/mediaImportPreflight';
import { isServerUploadConfigured } from '@/lib/serverCatalog';
import { MAX_MEDIA_UPLOAD_BYTES } from '@/lib/mediaUploadLimits';
import { formatFileSize } from '@/lib/formatDuration';

const MP3_ACCEPT = '.mp3,audio/mpeg';

function isMp3File(file: File): boolean {
  const name = file.name.toLowerCase();
  return file.type === 'audio/mpeg' || name.endsWith('.mp3');
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
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Choose an MP3, then tap Upload.');

  const serverReady = isServerUploadConfigured();

  const openPicker = () => {
    if (busy) return;
    inputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    e.target.value = '';
    if (!picked) return;
    if (!isMp3File(picked)) {
      setFile(null);
      setStatus('Only MP3 files are supported. Export or convert your track to .mp3 and try again.');
      return;
    }
    if (picked.size > MAX_MEDIA_UPLOAD_BYTES) {
      setFile(null);
      setStatus('File is too large (max ~80 MB). Use a smaller MP3 or lower bitrate.');
      return;
    }
    setFile(picked);
    if (!title.trim()) setTitle(titleFromFileName(picked.name));
    setStatus(`Ready: ${picked.name} — tap Upload MP3 when you are set.`);
  };

  const runUpload = async () => {
    if (!file || busy) {
      setStatus('Choose an MP3 file first.');
      return;
    }
    if (!serverReady) {
      setStatus('Server upload is not configured. Set catalog secrets on Vercel and redeploy.');
      return;
    }

    const { duplicates } = classifyFilesAgainstCatalog([file], tracks);
    if (duplicates.length) {
      setStatus(formatAllDuplicatesMessage(duplicates));
      return;
    }

    setBusy(true);
    setStatus('Uploading to QUESTFEST…');

    try {
      const displayTitle = title.trim() || titleFromFileName(file.name);
      const { added } = await importMediaFiles([file], {
        title: displayTitle,
        artist: DEFAULT_ARTIST,
        playlistIds: [MASTER_PLAYLIST_ID],
        onProgress: (line) => setStatus(line),
      });
      setActivePlaylist(MASTER_PLAYLIST_ID);

      if (added > 0) {
        setFile(null);
        setTitle('');
        setStatus('Success — track saved on the server. Open Listen to play.');
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

  return (
    <section className="mp3-uploader" aria-labelledby="mp3-uploader-h">
      <header className="mp3-uploader-head">
        <p className="mp3-uploader-eyebrow">MP3 upload</p>
        <h2 id="mp3-uploader-h" className="mp3-uploader-title">
          Add a track to the catalog
        </h2>
        <p className="mp3-uploader-desc">
          MP3 only — one file at a time. Pick a file, confirm the title, then upload. No video, no
          auto-upload while the file picker is open (safer on iPhone).
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
        className="mp3-uploader-input"
        disabled={busy}
        onChange={onFileChange}
        tabIndex={-1}
        aria-hidden
      />

      <div className="mp3-uploader-card">
        <label className="mp3-uploader-field">
          <span>Track title</span>
          <input
            type="text"
            className="mp3-uploader-text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Shown in Listen"
            disabled={busy}
            autoComplete="off"
          />
        </label>

        <div className="mp3-uploader-file-row">
          <button type="button" className="mp3-uploader-btn mp3-uploader-btn--ghost" disabled={busy} onClick={openPicker}>
            Choose MP3
          </button>
          {file ? (
            <button
              type="button"
              className="mp3-uploader-btn mp3-uploader-btn--tiny"
              disabled={busy}
              onClick={() => {
                setFile(null);
                setStatus('Choose an MP3, then tap Upload.');
              }}
            >
              Clear
            </button>
          ) : null}
        </div>

        <p className={`mp3-uploader-file-name${file ? ' mp3-uploader-file-name--on' : ''}`} aria-live="polite">
          {file ? (
            <>
              <strong>{file.name}</strong>
              <span className="mp3-uploader-meta">{formatFileSize(file.size)}</span>
            </>
          ) : (
            'No file selected'
          )}
        </p>

        <button
          type="button"
          className="mp3-uploader-btn mp3-uploader-btn--primary"
          disabled={busy || !serverReady || !file}
          onClick={() => void runUpload()}
        >
          {busy ? 'Uploading…' : 'Upload MP3'}
        </button>
      </div>

      <p className="mp3-uploader-status" role="status" aria-live="polite">
        {status}
      </p>
    </section>
  );
}
