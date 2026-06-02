import type { PlaylistDef, TrackDef } from '@/lib/catalogTypes';
import { isMasterPlaylist, isMyLikesPlaylist } from '@/lib/catalogSeed';

const STORAGE_KEY = 'hjghf-master-filter-v1';

/** Preserves master playlist drag order (no re-sort). */
export type MasterSortKey = 'playlistOrder' | 'title' | 'artist' | 'genre' | 'uploadedAt';
export type SortDir = 'asc' | 'desc';
export type PlaylistFilterMode = 'all' | 'in' | 'notIn';

export interface MasterCatalogFilterState {
  titleQuery: string;
  /** Empty string = any genre */
  genre: string;
  playlistMode: PlaylistFilterMode;
  playlistId: string;
  sortKey: MasterSortKey;
  sortDir: SortDir;
}

export const DEFAULT_MASTER_FILTER: MasterCatalogFilterState = {
  titleQuery: '',
  genre: '',
  playlistMode: 'all',
  playlistId: '',
  sortKey: 'playlistOrder',
  sortDir: 'asc',
};

export type MasterCatalogRow = {
  id: string;
  /** Index in the active playlist trackIds (for drag-reorder). */
  index: number;
  track: TrackDef;
};

export function loadMasterCatalogFilter(): MasterCatalogFilterState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_MASTER_FILTER };
    const o = JSON.parse(raw) as Partial<MasterCatalogFilterState>;
    return {
      titleQuery: typeof o.titleQuery === 'string' ? o.titleQuery : '',
      genre: typeof o.genre === 'string' ? o.genre : '',
      playlistMode:
        o.playlistMode === 'in' || o.playlistMode === 'notIn' || o.playlistMode === 'all'
          ? o.playlistMode
          : 'all',
      playlistId: typeof o.playlistId === 'string' ? o.playlistId : '',
      sortKey:
        o.sortKey === 'playlistOrder' ||
        o.sortKey === 'title' ||
        o.sortKey === 'artist' ||
        o.sortKey === 'genre' ||
        o.sortKey === 'uploadedAt'
          ? o.sortKey
          : DEFAULT_MASTER_FILTER.sortKey,
      sortDir: o.sortDir === 'asc' || o.sortDir === 'desc' ? o.sortDir : DEFAULT_MASTER_FILTER.sortDir,
    };
  } catch {
    return { ...DEFAULT_MASTER_FILTER };
  }
}

export function saveMasterCatalogFilter(state: MasterCatalogFilterState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function isMasterFilterActive(
  filter: MasterCatalogFilterState,
  defaultSort: MasterCatalogFilterState = DEFAULT_MASTER_FILTER,
): boolean {
  if (filter.titleQuery.trim()) return true;
  if (filter.genre.trim()) return true;
  if (filter.playlistMode !== 'all') return true;
  if (filter.sortKey !== defaultSort.sortKey || filter.sortDir !== defaultSort.sortDir) return true;
  return false;
}

export function collectGenreOptions(
  trackIds: string[],
  getTrack: (id: string) => TrackDef | undefined,
): string[] {
  const set = new Set<string>();
  for (const id of trackIds) {
    const g = getTrack(id)?.genre?.trim();
    if (g) set.add(g);
  }
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

export function userPlaylistsForFilter(playlists: PlaylistDef[]): PlaylistDef[] {
  return playlists
    .filter((p) => !isMasterPlaylist(p.id) && !isMyLikesPlaylist(p.id))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

function compareTracks(a: TrackDef, b: TrackDef, key: MasterSortKey, dir: SortDir): number {
  let cmp = 0;
  switch (key) {
    case 'title':
      cmp = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      break;
    case 'artist':
      cmp = a.artist.localeCompare(b.artist, undefined, { sensitivity: 'base' });
      break;
    case 'genre':
      cmp = (a.genre ?? '').localeCompare(b.genre ?? '', undefined, { sensitivity: 'base' });
      break;
    case 'uploadedAt':
      cmp = (a.uploadedAt ?? '').localeCompare(b.uploadedAt ?? '');
      break;
  }
  return dir === 'asc' ? cmp : -cmp;
}

function matchesPlaylistFilter(
  trackId: string,
  mode: PlaylistFilterMode,
  playlistId: string,
  playlists: PlaylistDef[],
): boolean {
  if (mode === 'all' || !playlistId) return true;
  const pl = playlists.find((p) => p.id === playlistId);
  if (!pl) return true;
  const inList = pl.trackIds.includes(trackId);
  return mode === 'in' ? inList : !inList;
}

export function applyMasterCatalogView(
  trackIds: string[],
  playlists: PlaylistDef[],
  filter: MasterCatalogFilterState,
  getTrack: (id: string) => TrackDef | undefined,
): MasterCatalogRow[] {
  const q = filter.titleQuery.trim().toLowerCase();
  const genreQ = filter.genre.trim().toLowerCase();

  const rows: MasterCatalogRow[] = [];
  for (let index = 0; index < trackIds.length; index++) {
    const id = trackIds[index]!;
    const track = getTrack(id);
    if (!track) continue;

    if (q) {
      const hay = `${track.title} ${track.artist} ${track.description ?? ''}`.toLowerCase();
      if (!hay.includes(q)) continue;
    }

    if (genreQ) {
      const g = (track.genre ?? '').toLowerCase();
      if (g !== genreQ && !g.includes(genreQ)) continue;
    }

    if (!matchesPlaylistFilter(id, filter.playlistMode, filter.playlistId, playlists)) continue;

    rows.push({ id, index, track });
  }

  if (filter.sortKey !== 'playlistOrder') {
    rows.sort((a, b) => compareTracks(a.track, b.track, filter.sortKey, filter.sortDir));
  }
  return rows;
}

export function sortLabel(key: MasterSortKey): string {
  switch (key) {
    case 'playlistOrder':
      return 'Playlist order';
    case 'title':
      return 'Title';
    case 'artist':
      return 'Artist';
    case 'genre':
      return 'Genre';
    case 'uploadedAt':
      return 'Upload date';
  }
}
