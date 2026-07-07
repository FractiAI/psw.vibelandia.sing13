/**
 * Bulk track uploader — one select, then upload progress (current / total).
 */
import { useCallback, useId, useRef, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { isServerUploadConfigured, reconcileServerCatalog } from '@/lib/serverCatalog';
import {
  BULK_UPLOAD_EYEBROW,
  BULK_UPLOAD_IDLE_HINT,
  BULK_UPLOAD_INTRO,
  BULK_UPLOAD_TITLE,
} from '@/lib/sonicCatalogCopy';
import {
  filterFilesForBulkUpload,
  retainFilesForBulkUpload,
  runBulkUploadQueue,
  scanFolderForBulkUpload,
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
  message: BULK_UPLOAD_IDLE_HINT,
};

export function BulkTrackUploader() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef<File[]>([]);
  const pausedRef = useRef(false);
  const cancelledRef = useRef(false);
  const busyRef = useRef(false);

  const trackCount = useCatalogStore((s) => Object.keys(s.tracks).length);
  const importMediaFiles = useCatalogStore((s) => s.importMediaFiles);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);
  const syncLibraryFromServer = useCatalogStore((s) => s.syncLibraryFromServer);

  const [progress, setProgress] = useState<BulkUploadProgress>(IDLE_PROGRESS);
  const [indexPct, setIndexPct] = useState(0);
  const [duplicatesSkipped, setDuplicatesSkipped] = useState(0);

  const serverReady = isServerUploadConfigured();
  const ios = isIOSDevice();
  const folderApi = supportsDirectoryPicker();
  const busy =
    progress.phase === 'indexing' ||
    progress.phase === 'uploading' ||
    progress.phase === 'paused';
  const showProgress =
    progress.phase === 'indexing' ||
    progress.phase === 'uploading' ||
    progress.phase === 'paused' ||
    progress.phase === 'done' ||
    progress.phase === 'cancelled';
  const idle = progress.phase === 'idle' || progress.phase === 'ready';

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
    setIndexPct(0);
    setDuplicatesSkipped(0);
    pausedRef.current = false;
    cancelledRef.current = false;
    busyRef.current = false;
    if (inputRef.current) inputRef.current.value = '';
    setProgress({ ...IDLE_PROGRESS });
  }, []);

  const startUpload = useCallback(
    async (queue: File[]) => {
      if (!queue.length || !serverReady) return;

      pausedRef.current = false;
      cancelledRef.current = false;
      setActivePlaylist(MASTER_PLAYLIST_ID);

      try {
        await runBulkUploadQueue(queue, importMediaFiles, controls, setProgress, {
          onChunkComplete: async () => {
            try {
              await reconcileServerCatalog();
            } catch {
              /* live index catches up on next chunk or final sync */
            }
            await syncLibraryFromServer();
          },
        });
        try {
          await reconcileServerCatalog();
        } catch {
          /* sync still pulls index-reconciled catalog after deploy */
        }
        void syncLibraryFromServer();
      } finally {
        busyRef.current = false;
        queueRef.current = [];
      }
    },
    [importMediaFiles, serverReady, setActivePlaylist, syncLibraryFromServer],
  );

  const processSelection = useCallback(
    async (picked: File[]) => {
      if (!picked.length || !serverReady || busyRef.current) return;

      busyRef.current = true;
      setProgress((p) => ({
        ...p,
        phase: 'indexing',
        fileTotal: picked.length,
        fileIndex: 0,
        message: `Scanning ${picked.length} files…`,
      }));
      setIndexPct(0);

      const { valid, rejected } = await filterFilesForBulkUpload(picked, (indexed, total) => {
        setIndexPct(Math.round((indexed / total) * 100));
        setProgress((p) => ({
          ...p,
          phase: 'indexing',
          fileIndex: indexed,
          fileTotal: total,
          message: `Checking ${indexed} of ${total}…`,
        }));
      });

      const { newFiles, duplicates } = classifyFilesAgainstCatalog(
        valid,
        useCatalogStore.getState().tracks,
      );
      setDuplicatesSkipped(duplicates.length);

      if (newFiles.length === 0) {
        busyRef.current = false;
        setProgress({
          phase: 'done',
          summary: null,
          chunkIndex: 0,
          chunkTotal: 0,
          fileIndex: 0,
          fileTotal: valid.length,
          added: 0,
          skipped: duplicates.length,
          failed: rejected,
          message:
            duplicates.length > 0
              ? `All ${valid.length} files are already in the catalog.`
              : rejected > 0
                ? `No valid audio files (${rejected} rejected).`
                : 'No valid audio files in selection.',
        });
        return;
      }

      setProgress((p) => ({
        ...p,
        phase: 'indexing',
        fileIndex: 0,
        fileTotal: newFiles.length,
        message: `Loading 0 of ${newFiles.length} into memory…`,
      }));

      const retained = await retainFilesForBulkUpload(newFiles, (loaded, total) => {
        setIndexPct(Math.round((loaded / total) * 100));
        setProgress((p) => ({
          ...p,
          phase: 'indexing',
          fileIndex: loaded,
          fileTotal: total,
          message: `Loading ${loaded} of ${total} into memory…`,
        }));
      });

      queueRef.current = retained;

      setProgress({
        phase: 'uploading',
        summary: null,
        chunkIndex: 0,
        chunkTotal: Math.ceil(retained.length / 20),
        fileIndex: 0,
        fileTotal: retained.length,
        added: 0,
        skipped: duplicates.length,
        failed: rejected,
        message: `Uploading 0 of ${retained.length}…`,
      });

      await startUpload(retained);
    },
    [serverReady, startUpload],
  );

  const handleFiles = (picked: File[]) => {
    if (busyRef.current) return;
    deferAfterFilePicker(() => {
      void processSelection(picked);
      if (inputRef.current) inputRef.current.value = '';
    });
  };

  const handlePrimarySelect = () => {
    if (!serverReady || busyRef.current) return;
    if (folderApi) {
      busyRef.current = true;
      void (async () => {
        try {
          setProgress((p) => ({
            ...p,
            phase: 'indexing',
            message: 'Opening folder picker…',
          }));
          const files = await scanFolderForBulkUpload((msg) => {
            setProgress((p) => ({ ...p, phase: 'indexing', message: msg }));
          });
          if (!files?.length) {
            busyRef.current = false;
            setProgress({ ...IDLE_PROGRESS, message: files ? 'No valid audio in folder.' : 'Selection cancelled.' });
            return;
          }
          await processSelection(files);
        } catch {
          busyRef.current = false;
          setProgress({ ...IDLE_PROGRESS, message: 'Folder scan failed — try again.' });
        }
      })();
      return;
    }
    inputRef.current?.click();
  };

  const pctUpload =
    progress.fileTotal > 0 ? Math.round((progress.fileIndex / progress.fileTotal) * 100) : 0;
  const progressPct = progress.phase === 'indexing' ? indexPct : pctUpload;
  const progressLabel =
    progress.phase === 'indexing'
      ? `Checking ${progress.fileIndex} of ${progress.fileTotal || '…'}`
      : progress.phase === 'uploading' || progress.phase === 'paused'
        ? `Uploading ${progress.fileIndex} of ${progress.fileTotal}`
        : progress.phase === 'done'
          ? `Complete — ${progress.added} uploaded`
          : progress.phase === 'cancelled'
            ? `Stopped — ${progress.added} uploaded`
            : progress.message;

  return (
    <section className="bulk-uploader" aria-labelledby="bulk-uploader-h">
      <header className="bulk-uploader-head">
        <p className="bulk-uploader-eyebrow">{BULK_UPLOAD_EYEBROW}</p>
        <h1 id="bulk-uploader-h" className="bulk-uploader-title">
          {BULK_UPLOAD_TITLE}
        </h1>
        <p className="bulk-uploader-desc">{BULK_UPLOAD_INTRO}</p>
      </header>

      {!serverReady ? (
        <p className="bulk-uploader-warn" role="alert">
          Server upload not configured. Set <code>VITE_CATALOG_UPLOAD_SECRET</code> and Vercel Blob token.
        </p>
      ) : null}

      <div className="bulk-uploader-card">
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

        {idle ? (
          <div className="bulk-uploader-actions bulk-uploader-actions--solo">
            <button
              type="button"
              className="bulk-uploader-btn bulk-uploader-btn--primary bulk-uploader-btn--hero"
              disabled={!serverReady || busy}
              onClick={handlePrimarySelect}
            >
              {folderApi ? 'Select folder to upload' : 'Select tracks to upload'}
            </button>
            {folderApi ? (
              <button
                type="button"
                className="bulk-uploader-btn bulk-uploader-btn--ghost"
                disabled={!serverReady || busy}
                onClick={() => inputRef.current?.click()}
              >
                Or choose individual files
              </button>
            ) : null}
          </div>
        ) : null}

        {showProgress ? (
          <div className="bulk-uploader-progress-panel">
            <p className="bulk-uploader-progress-count" aria-live="polite">
              {progressLabel}
            </p>
            {(progress.phase === 'indexing' ||
              progress.phase === 'uploading' ||
              progress.phase === 'paused') && (
              <div
                className="bulk-uploader-bar"
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={progressLabel}
              >
                <div className="bulk-uploader-bar-fill" style={{ width: `${progressPct}%` }} />
              </div>
            )}
            {progress.currentFile &&
            (progress.phase === 'uploading' || progress.phase === 'paused') ? (
              <p className="bulk-uploader-current-file">{progress.currentFile}</p>
            ) : null}
            <dl className="bulk-uploader-stats bulk-uploader-stats--inline">
              <div>
                <dt>In catalog</dt>
                <dd>{trackCount || progress.added || '—'}</dd>
              </div>
              <div>
                <dt>Uploaded</dt>
                <dd>{progress.added}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>{progress.fileTotal || '—'}</dd>
              </div>
              {duplicatesSkipped > 0 || progress.skipped > 0 ? (
                <div>
                  <dt>Skipped</dt>
                  <dd>{Math.max(duplicatesSkipped, progress.skipped)}</dd>
                </div>
              ) : null}
              {progress.failed > 0 ? (
                <div>
                  <dt>Failed</dt>
                  <dd>{progress.failed}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}

        {(progress.phase === 'uploading' || progress.phase === 'paused') && (
          <div className="bulk-uploader-controls">
            {progress.phase === 'uploading' ? (
              <button
                type="button"
                className="bulk-uploader-btn bulk-uploader-btn--ghost"
                onClick={() => controls.pause()}
              >
                Pause
              </button>
            ) : (
              <button
                type="button"
                className="bulk-uploader-btn bulk-uploader-btn--ghost"
                onClick={() => controls.resume()}
              >
                Resume
              </button>
            )}
            <button
              type="button"
              className="bulk-uploader-btn bulk-uploader-btn--ghost"
              onClick={() => controls.cancel()}
            >
              Stop
            </button>
          </div>
        )}

        {(progress.phase === 'done' || progress.phase === 'cancelled') && (
          <div className="bulk-uploader-controls">
            <button
              type="button"
              className="bulk-uploader-btn bulk-uploader-btn--primary"
              onClick={resetQueue}
            >
              Upload more
            </button>
          </div>
        )}

        {ios ? (
          <p className="bulk-uploader-hint">
            iPhone: select files in batches if needed. Stay on this tab until upload completes.
          </p>
        ) : null}
      </div>

      <p className="bulk-uploader-status" role="status">
        {progress.message}
        {trackCount > 0 ? (
          <span className="bulk-uploader-count"> · {trackCount} tracks in catalog</span>
        ) : null}
      </p>
    </section>
  );
}
