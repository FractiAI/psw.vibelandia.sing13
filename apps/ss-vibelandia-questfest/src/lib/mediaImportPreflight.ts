import type { TrackDef } from '@/lib/catalogTypes';
import { fileSourceKey } from '@/lib/deviceMediaScan';

export type ImportDuplicate = {
  fileName: string;
  catalogTitle: string;
};

/** Split files into new imports vs ones already stored (same name, size, modified time). */
export function classifyFilesAgainstCatalog(
  files: File[],
  tracks: Record<string, TrackDef>,
): { newFiles: File[]; duplicates: ImportDuplicate[] } {
  const bySourceKey = new Map<string, TrackDef>();
  for (const tr of Object.values(tracks)) {
    if (tr.sourceKey) bySourceKey.set(tr.sourceKey, tr);
  }

  const newFiles: File[] = [];
  const duplicates: ImportDuplicate[] = [];

  for (const file of files) {
    const key = fileSourceKey(file);
    const existing = bySourceKey.get(key);
    if (existing) {
      duplicates.push({ fileName: file.name, catalogTitle: existing.title });
    } else {
      newFiles.push(file);
    }
  }

  return { newFiles, duplicates };
}

function duplicateListSnippet(duplicates: ImportDuplicate[], max = 3): string {
  const parts = duplicates.slice(0, max).map((d) => `“${d.catalogTitle}”`);
  if (duplicates.length > max) {
    parts.push(`and ${duplicates.length - max} more`);
  }
  return parts.join(', ');
}

/** User-facing copy when everything selected was already uploaded. */
export function formatAllDuplicatesMessage(duplicates: ImportDuplicate[]): string {
  if (duplicates.length === 1) {
    const d = duplicates[0];
    return `Already in your catalog as “${d.catalogTitle}” (${d.fileName}). Switch to Listen to play it — no need to upload again.`;
  }
  return `All ${duplicates.length} files are already saved in your catalog (${duplicateListSnippet(duplicates)}). Switch to Listen to play them — do not re-select the same files.`;
}

/** Shown when some files import and others were skipped as duplicates. */
export function formatPartialDuplicatesMessage(added: number, duplicates: ImportDuplicate[]): string {
  const addedLabel = `Added ${added} new track${added === 1 ? '' : 's'}.`;
  if (!duplicates.length) return `${addedLabel} Switch to Listen to play.`;
  const skippedLabel =
    duplicates.length === 1
      ? `1 file was already uploaded (“${duplicates[0].catalogTitle}”) and was not added again.`
      : `${duplicates.length} files were already uploaded (${duplicateListSnippet(duplicates)}) and were not added again.`;
  return `${addedLabel} ${skippedLabel} Switch to Listen to play.`;
}
