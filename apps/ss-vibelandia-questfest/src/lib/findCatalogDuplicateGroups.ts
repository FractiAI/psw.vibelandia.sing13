import type { TrackDef } from '@/lib/catalogTypes';

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
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
    const key = tr.sourceKey?.trim() || `${norm(tr.title)}|${norm(tr.artist || '')}`;
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
