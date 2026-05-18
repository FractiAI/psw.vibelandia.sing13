export type PlaylistKind = 'open_deck' | 'sovereign';

export const DEFAULT_ARTIST = "Hero Jo's Golden Bachdoor Hit Factory";
export const TRACK_DESCRIPTION_MAX = 1000;
export const TRACK_GENRE_MAX = 80;

/** Suggested genres — free text also allowed. */
export const TRACK_GENRE_SUGGESTIONS = [
  'Reno Swamp',
  'Bachdoor',
  'Caliente',
  'Wrong Side',
  'Holographic',
  'Salsa',
  'Country',
  'Jazz',
  'Ambient',
  'Other',
] as const;

export interface TrackDef {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  description?: string;
  src: string;
  videoSrc?: string;
  posterSrc?: string;
  durationSec?: number;
  /** IndexedDB blob key — only when user downloaded for offline */
  localMediaKey?: string;
  /** User saved this track on device; playback uses local copy */
  downloadedLocally?: boolean;
  /** Track file lives on server (static /media or Blob URL) — stream by default */
  serverHosted?: boolean;
  uploadedAt?: string;
  /** Dedup key from device file (name + size + modified) */
  sourceKey?: string;
}

export interface PlaylistDef {
  id: string;
  name: string;
  kind: PlaylistKind;
  description: string;
  trackIds: string[];
}

export interface CatalogSnapshot {
  tracks: Record<string, TrackDef>;
  playlists: PlaylistDef[];
  activePlaylistId: string;
  version: number;
}
