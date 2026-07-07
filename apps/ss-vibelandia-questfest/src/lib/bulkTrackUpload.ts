import { DEFAULT_ARTIST } from '@/lib/catalogTypes';
import { isMediaFile, supportsDirectoryPicker, pickMediaDirectory, scanDirectoryHandle } from '@/lib/deviceMediaScan';
import { loadDeviceDirHandle, saveDeviceDirHandle } from '@/lib/catalogPersistence';
import { retainFileForBulkUpload } from '@/lib/devicePlayback';
import { classifyFilesAgainstCatalog } from '@/lib/mediaImportPreflight';
import { MAX_MEDIA_UPLOAD_BYTES } from '@/lib/mediaUploadLimits';
import { MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { useCatalogStore } from '@/stores/catalogStore';
import type { TrackDef } from '@/lib/catalogTypes';

export const BULK_UPLOAD_MIN_RECOMMENDED = 500;
export const BULK_INDEX_YIELD_EVERY = 40;
export const BULK_UPLOAD_CHUNK_SIZE = 20;

export type BulkUploadPhase =
  | 'idle'
  | 'indexing'
  | 'ready'
  | 'uploading'
  | 'paused'
  | 'done'
  | 'cancelled';

export interface BulkQueueSummary {
  picked: number;
  valid: number;
  rejected: number;
  duplicates: number;
  toUpload: number;
}

export interface BulkUploadProgress {
  phase: BulkUploadPhase;
  summary: BulkQueueSummary | null;
  chunkIndex: number;
  chunkTotal: number;
  fileIndex: number;
  fileTotal: number;
  added: number;
  skipped: number;
  failed: number;
  currentFile?: string;
  message: string;
}

export interface BulkUploadControls {
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  isPaused: () => boolean;
  isCancelled: () => boolean;
}

function yieldMain(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

export async function filterFilesForBulkUpload(
  picked: readonly File[],
  onProgress?: (indexed: number, total: number) => void,
): Promise<{ valid: File[]; rejected: number }> {
  const valid: File[] = [];
  let rejected = 0;
  const total = picked.length;

  for (let i = 0; i < total; i += 1) {
    const f = picked[i]!;
    if (!isMediaFile(f) || f.size > MAX_MEDIA_UPLOAD_BYTES) {
      rejected += 1;
    } else {
      valid.push(f);
    }
    if ((i + 1) % BULK_INDEX_YIELD_EVERY === 0 || i === total - 1) {
      onProgress?.(i + 1, total);
      await yieldMain();
    }
  }

  return { valid, rejected };
}

export async function retainFilesForBulkUpload(
  files: readonly File[],
  onProgress?: (loaded: number, total: number) => void,
): Promise<File[]> {
  const total = files.length;
  const out: File[] = [];
  for (let i = 0; i < total; i += 1) {
    out.push(await retainFileForBulkUpload(files[i]!));
    if ((i + 1) % BULK_INDEX_YIELD_EVERY === 0 || i === total - 1) {
      onProgress?.(i + 1, total);
      await yieldMain();
    }
  }
  return out;
}

/** Pick folder once (user gesture), scan audio, load into memory — then upload without re-opening. */
export async function scanFolderForBulkUpload(
  onProgress?: (message: string) => void,
): Promise<File[] | null> {
  if (!supportsDirectoryPicker()) return null;

  onProgress?.('Opening folder picker…');
  const handle = await pickMediaDirectory();
  if (!handle) return null;

  try {
    await saveDeviceDirHandle(handle);
  } catch {
    /* optional persistence */
  }

  onProgress?.('Scanning folder…');
  const scanned = await scanDirectoryHandle(handle);
  const valid = scanned.filter((f) => isMediaFile(f) && f.size <= MAX_MEDIA_UPLOAD_BYTES);
  onProgress?.(`Found ${valid.length} audio files`);
  return valid;
}

export function summarizeBulkQueue(
  valid: File[],
  tracks: Record<string, TrackDef>,
): BulkQueueSummary {
  const { newFiles, duplicates } = classifyFilesAgainstCatalog(valid, tracks);
  return {
    picked: valid.length,
    valid: valid.length,
    rejected: 0,
    duplicates: duplicates.length,
    toUpload: newFiles.length,
  };
}

type ImportFn = (
  files: File[],
  opts?: {
    artist?: string;
    playlistIds?: string[];
    onProgress?: (message: string) => void;
    onTrackAdded?: (info: {
      catalogSize: number;
      addedInBatch: number;
      fileIndex: number;
      fileTotal: number;
    }) => void;
    skipDurationProbe?: boolean;
    deferServerSync?: boolean;
    skipBulkRetain?: boolean;
  },
) => Promise<{
  added: number;
  skipped: number;
  failed: number;
  failures: Array<{ name: string; message: string }>;
}>;

export type BulkChunkSyncInfo = {
  added: number;
  skipped: number;
  failed: number;
  fileIndex: number;
  fileTotal: number;
  catalogSize: number;
};

export async function runBulkUploadQueue(
  files: File[],
  importMediaFiles: ImportFn,
  controls: BulkUploadControls,
  onUpdate: (p: BulkUploadProgress) => void,
  opts?: { onChunkComplete?: (info: BulkChunkSyncInfo) => Promise<void> },
): Promise<{ added: number; skipped: number; failed: number }> {
  const fileTotal = files.length;
  const chunkTotal = Math.max(1, Math.ceil(fileTotal / BULK_UPLOAD_CHUNK_SIZE));
  let added = 0;
  let skipped = 0;
  let failed = 0;
  let fileIndex = 0;

  for (let c = 0; c < chunkTotal; c += 1) {
    while (controls.isPaused() && !controls.isCancelled()) {
      onUpdate({
        phase: 'paused',
        summary: null,
        chunkIndex: c + 1,
        chunkTotal,
        fileIndex,
        fileTotal,
        added,
        skipped,
        failed,
        message: `Paused at ${fileIndex} of ${fileTotal}`,
      });
      await new Promise((r) => window.setTimeout(r, 250));
    }
    if (controls.isCancelled()) break;

    const chunk = files.slice(c * BULK_UPLOAD_CHUNK_SIZE, (c + 1) * BULK_UPLOAD_CHUNK_SIZE);
    const chunkStart = fileIndex;

    onUpdate({
      phase: 'uploading',
      summary: null,
      chunkIndex: c + 1,
      chunkTotal,
      fileIndex,
      fileTotal,
      added,
      skipped,
      failed,
      currentFile: chunk[0]?.name,
      message: `Uploading batch ${c + 1} of ${chunkTotal} (${chunk.length} files)…`,
    });

    try {
      const result = await importMediaFiles(chunk, {
        artist: DEFAULT_ARTIST,
        playlistIds: [MASTER_PLAYLIST_ID],
        skipDurationProbe: true,
        deferServerSync: true,
        skipBulkRetain: true,
        onTrackAdded: ({ catalogSize, addedInBatch, fileIndex: withinChunk }) => {
          const globalIndex = Math.min(fileTotal, chunkStart + withinChunk);
          onUpdate({
            phase: 'uploading',
            summary: null,
            chunkIndex: c + 1,
            chunkTotal,
            fileIndex: globalIndex,
            fileTotal,
            added: added + addedInBatch,
            skipped,
            failed,
            currentFile: chunk[withinChunk - 1]?.name ?? chunk[0]?.name,
            message: `Uploading ${globalIndex} of ${fileTotal} · ${catalogSize} in catalog`,
          });
        },
        onProgress: (line) => {
          const withinChunk = line.match(/(\d+)\s+of\s+(\d+)/i);
          const globalIndex = withinChunk
            ? Math.min(fileTotal, chunkStart + Number(withinChunk[1]))
            : fileIndex;
          onUpdate({
            phase: 'uploading',
            summary: null,
            chunkIndex: c + 1,
            chunkTotal,
            fileIndex: globalIndex,
            fileTotal,
            added,
            skipped,
            failed,
            currentFile: chunk[Math.max(0, globalIndex - chunkStart - 1)]?.name,
            message:
              globalIndex > 0 && fileTotal > 0
                ? `Uploading ${globalIndex} of ${fileTotal}…`
                : line,
          });
        },
      });
      added += result.added;
      skipped += result.skipped;
      failed += result.failed;
      fileIndex = chunkStart + chunk.length;

      if (opts?.onChunkComplete && result.added > 0) {
        const catalogSize = Object.keys(useCatalogStore.getState().tracks).length;
        await opts.onChunkComplete({
          added,
          skipped,
          failed,
          fileIndex,
          fileTotal,
          catalogSize,
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'batch_failed';
      failed += chunk.length;
      fileIndex = chunkStart + chunk.length;
      onUpdate({
        phase: controls.isCancelled() ? 'cancelled' : 'uploading',
        summary: null,
        chunkIndex: c + 1,
        chunkTotal,
        fileIndex,
        fileTotal,
        added,
        skipped,
        failed,
        message: `Batch failed: ${msg}`,
      });
    }

    await yieldMain();
  }

  const finalPhase: BulkUploadPhase = controls.isCancelled() ? 'cancelled' : 'done';
  onUpdate({
    phase: finalPhase,
    summary: null,
    chunkIndex: chunkTotal,
    chunkTotal,
    fileIndex: fileTotal,
    fileTotal,
    added,
    skipped,
    failed,
    message:
      finalPhase === 'cancelled'
        ? `Cancelled — ${added} uploaded before stop.`
        : `Finished — ${added} added, ${skipped} skipped, ${failed} failed.`,
  });

  return { added, skipped, failed };
}
