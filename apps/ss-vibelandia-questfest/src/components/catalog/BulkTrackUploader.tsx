/**
 * Bulk track uploader — 500+ files without preloading metadata or rendering huge lists.
 */
import { useCallback, useId, useRef, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { isServerUploadConfigured } from '@/lib/serverCatalog';
import {
  BULK_UPLOAD_MIN_RECOMMENDED,
  filterFilesForBulkUpload,
  runBulkUploadQueue,
  scanFolderForBulkUpload,
  summarizeBulkQueue,
  type BulkQueueSummary,
  type BulkUploadProgress,
} from '@/lib/bulkTrackUpload';
import {
  deferAfterFilePicker,
  isIOSDevice,
  uploadFileInputAccept,
} from '@/lib/devicePlayback';
import { supportsDirectoryPicker } from '@/lib/deviceMediaScan';
import { classifyFilesAgainstCatalog } from '@/lib/mediaImportPreflight';

const IDLE_PROGRESS: BulkUploadProgress = {
  phase: 'idle',
  summary: null,
  chunkIndex: 0,
  chunkTotal: 0,
  fileIndex: 0,
  fileTotal: 0,
  added: 0,
  skipped: 0,
  failed: 0,
  message: 'Pick a folder or many files — uploads run in small batches so the page stays responsive.',
};

export function BulkTrackUploader() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef<File[]>([]);
  const pausedRef = useRef(false);
  const cancelledRef = useRef(false);
  const busyRef = useRef(false);

  const tracks = useCatalogStore((s) => s.tracks);
  const trackCount = useCatalogStore((s) => Object.keys(s.tracks).length);
  const importMediaFiles = useCatalogStore((s) => s.importMediaFiles);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);
  const syncLibraryFromServer = useCatalogStore((s) => s.syncLibraryFromServer);

  const [summary, setSummary] = useState<BulkQueueSummary | null>(null);
  const [progress, setProgress] = useState<BulkUploadProgress>(IDLE_PROGRESS);
  const [indexPct, setIndexPct] = useState(0);

  const serverReady = isServerUploadConfigured();
  const ios = isIOSDevice();
  const busy = progress.phase === 'indexing' || progress.phase === 'uploading';
  const canStart = summary != null && summary.toUpload > 0 && progress.phase === 'ready';

  const controls = {
    pause: () => {
      pausedRef.current = true;
    },
    resume: () => {
      pausedRef.current = false;
    },
    cancel: () => {
      cancelledRef.current = true;
      pausedRef.current = false;
    },
    isPaused: () => pausedRef.current,
    isCancelled: () => cancelledRef.current,
  };

  const resetQueue = useCallback(() => {
    queueRef.current = [];
    setSummary(null);
    setIndexPct(0);
    pausedRef.current = false;
    cancelledRef.current = false;
    if (inputRef.current) inputRef.current.value = '';
    setProgress({
      ...IDLE_PROGRESS,
      message: 'Queue cleared. Pick files or a folder to start again.',
    });
  }, []);

  const finalizeQueue = useCallback(
    (valid: File[], rejected: number) => {
      const { newFiles, duplicates } = classifyFilesAgainstCatalog(valid, tracks);
      queueRef.current = newFiles;
      const sum = summarizeBulkQueue(valid, tracks);
      setSummary({ ...sum, rejected });
      setProgress({
        phase: 'ready',
        summary: sum,
        chunkIndex: 0,
        chunkTotal: Math.ceil(newFiles.length / 20) || 0,
        fileIndex: 0,
        fileTotal: newFiles.length,
        added: 0,
        skipped: duplicates.length,
        failed: 0,
        message:
          newFiles.length === 0
            ? duplicates.length
              ? `All ${valid.length} files are already in the catalog.`
              : 'No valid audio files in selection.'
            : `Ready: ${newFiles.length} new tracks (${duplicates.length} duplicates skipped, ${rejected} rejected). Tap Start bulk upload.`,
      });
    },
    [tracks],
  );

  const indexFiles = useCallback(
    async (picked: File[]) => {
      if (!picked.length) return;
      busyRef.current = true;
      setProgress((p) => ({
        ...p,
        phase: 'indexing',
        message: `Indexing ${picked.length} files…`,
      }));
      setIndexPct(0);

      const { valid, rejected } = await filterFilesForBulkUpload(picked, (indexed, total) => {
        setIndexPct(Math.round((indexed / total) * 100));
        setProgress((p) => ({
          ...p,
          phase: 'indexing',
          message: `Checking ${indexed} of ${total}…`,
        }));
      });

      finalizeQueue(valid, rejected);
      busyRef.current = false;
    },
    [finalizeQueue],
  );

  const handleFiles = (picked: File[]) => {
    deferAfterFilePicker(() => {
      void indexFiles(picked);
    });
  };

  const handleFolder = async () => {
    if (!serverReady || busyRef.current) return;
    busyRef.current = true;
    setProgress((p) => ({ ...p, phase: 'indexing', message: 'Opening folder picker…' }));
    const files = await scanFolderForBulkUpload((msg) => {
      setProgress((p) => ({ ...p, phase: 'indexing', message: msg }));
    });
    busyRef.current = false;
    if (!files?.length) {
      setProgress((p) => ({
        ...p,
        phase: 'idle',
        message: 'Folder import cancelled or no audio files found.',
      }));
      return;
    }
    await indexFiles(files);
  };

  const startUpload = async () => {
    const queue = queueRef.current;
    if (!queue.length || !serverReady || busyRef.current) return;

    busyRef.current = true;
    pausedRef.current = false;
    cancelledRef.current = false;
    setActivePlaylist(MASTER_PLAYLIST_ID);

    await runBulkUploadQueue(queue, importMediaFiles, controls, setProgress);

    busyRef.current = false;
    queueRef.current = [];
    setSummary(null);
    void syncLibraryFromServer();
  };

  const pctUpload =
    progress.fileTotal > 0 ? Math.round((progress.fileIndex / progress.fileTotal) * 100) : 0;

  return (
    <section className="bulk-uploader" aria-labelledby="bulk-uploader-h">
      <header className="bulk-uploader-head">
        <p className="bulk-uploader-eyebrow">Bulk ingest · {BULK_UPLOAD_MIN_RECOMMENDED}+ tracks</p>
        <h1 id="bulk-uploader-h" className="bulk-uploader-title">
          Large-batch track uploader
        </h1>
        <p className="bulk-uploader-desc">
          Built for huge libraries. Files are indexed in small slices, then uploaded in batches of 20 —
          no metadata preloading, no giant file list, no UI freeze. Use <strong>Import folder</strong> for
          500+ tracks (recommended on desktop).
        </p>
      </header>

      {!serverReady ? (
        <p className="bulk-uploader-warn" role="alert">
          Server upload not configured. Set <code>VITE_CATALOG_UPLOAD_SECRET</code> and Vercel Blob token.
        </p>
      ) : null}

      <div className="bulk-uploader-card">
        <div className="bulk-uploader-actions">
          <span className="bulk-uploader-pick-wrap">
            <input
              id={inputId}
              ref={inputRef}
              type="file"
              accept={uploadFileInputAccept()}
              multiple
              className="bulk-uploader-input"
              disabled={busy}
              onChange={(e) => {
                const picked = e.target.files?.length ? Array.from(e.target.files) : [];
                if (picked.length) handleFiles(picked);
              }}
            />
            <label htmlFor={inputId} className="bulk-uploader-btn bulk-uploader-btn--ghost">
              Choose many files
            </label>
          </span>
          {supportsDirectoryPicker() ? (
            <button
              type="button"
              className="bulk-uploader-btn bulk-uploader-btn--ghost"
              disabled={busy || !serverReady}
              onClick={() => void handleFolder()}
            >
              Import folder
            </button>
          ) : null}
          <button
            type="button"
            className="bulk-uploader-btn bulk-uploader-btn--tiny"
            disabled={busy}
            onClick={resetQueue}
          >
            Clear queue
          </button>
        </div>

        {summary ? (
          <dl className="bulk-uploader-stats">
            <div>
              <dt>Valid audio</dt>
              <dd>{summary.valid}</dd>
            </div>
            <div>
              <dt>New uploads</dt>
              <dd>{summary.toUpload}</dd>
            </div>
            <div>
              <dt>Already in catalog</dt>
              <dd>{summary.duplicates}</dd>
            </div>
            {summary.rejected > 0 ? (
              <div>
                <dt>Rejected</dt>
                <dd>{summary.rejected}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        {(progress.phase === 'indexing' || progress.phase === 'uploading') && (
          <div className="bulk-uploader-bar" role="progressbar" aria-valuenow={progress.phase === 'indexing' ? indexPct : pctUpload} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="bulk-uploader-bar-fill"
              style={{ width: `${progress.phase === 'indexing' ? indexPct : pctUpload}%` }}
            />
          </div>
        )}

        <div className="bulk-uploader-controls">
          <button
            type="button"
            className="bulk-uploader-btn bulk-uploader-btn--primary"
            disabled={!canStart || busy}
            onClick={() => void startUpload()}
          >
            {progress.phase === 'uploading'
              ? 'Uploading…'
              : summary?.toUpload
                ? `Start bulk upload (${summary.toUpload})`
                : 'Start bulk upload'}
          </button>
          {progress.phase === 'uploading' && (
            <button
              type="button"
              className="bulk-uploader-btn bulk-uploader-btn--ghost"
              onClick={() => controls.pause()}
            >
              Pause
            </button>
          )}
          {progress.phase === 'paused' && (
            <button
              type="button"
              className="bulk-uploader-btn bulk-uploader-btn--ghost"
              onClick={() => controls.resume()}
            >
              Resume
            </button>
          )}
          {(progress.phase === 'uploading' || progress.phase === 'paused') && (
            <button
              type="button"
              className="bulk-uploader-btn bulk-uploader-btn--ghost"
              onClick={() => controls.cancel()}
            >
              Stop
            </button>
          )}
        </div>

        {ios ? (
          <p className="bulk-uploader-hint">
            iPhone: prefer smaller batches or upload from desktop for 500+ files. Stay on this tab until
            finished.
          </p>
        ) : null}
      </div>

      <p className="bulk-uploader-status" role="status" aria-live="polite">
        {progress.message}
        {progress.phase === 'uploading' || progress.phase === 'done' ? (
          <span className="bulk-uploader-status-detail">
            {' '}
            · {progress.added} added · {progress.failed} failed
          </span>
        ) : null}
        {trackCount > 0 ? (
          <span className="bulk-uploader-count"> · {trackCount} tracks in catalog</span>
        ) : null}
      </p>
    </section>
  );
}
