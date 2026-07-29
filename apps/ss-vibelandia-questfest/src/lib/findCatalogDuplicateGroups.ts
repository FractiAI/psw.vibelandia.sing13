import type { TrackDef } from '@/lib/catalogTypes';

/**
 * Normalize title/artist for duplicate grouping.
 * Collapses curly/straight apostrophe possessives (`sol’s` / `sol's` / `sol s`) so
 * near-identical masters land in one group.
 */
export function normalizeTrackLabel(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019\u201a\u2032']/g, "'")
    .replace(/(\p{L})'s\b/gu, '$1s')
    .replace(/(\p{L})\s+s\b/gu, '$1s')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export type DuplicateTrackGroup = {
  key: string;
  label: string;
  trackIds: string[];
  keepId: string;
  removeIds: string[];
};

/** Group tracks that look like duplicates (same sourceKey or title+artist). */
export function findDuplicateTrackGroups(
  trackIds: string[],
  getTrack: (id: string) => TrackDef | undefined,
): DuplicateTrackGroup[] {
  const byKey = new Map<string, string[]>();

  for (const id of trackIds) {
    const tr = getTrack(id);
    if (!tr) continue;
    const key =
      tr.sourceKey?.trim() ||
      `${normalizeTrackLabel(tr.title)}|${normalizeTrackLabel(tr.artist || '')}`;
    const list = byKey.get(key) ?? [];
    list.push(id);
    byKey.set(key, list);
  }

  const groups: DuplicateTrackGroup[] = [];
  for (const [key, ids] of byKey) {
    if (ids.length < 2) continue;
    const keepId = ids[0];
    const tr = getTrack(keepId);
    groups.push({
      key,
      label: tr?.title ?? key,
      trackIds: ids,
      keepId,
      removeIds: ids.slice(1),
    });
  }

  return groups.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
}
