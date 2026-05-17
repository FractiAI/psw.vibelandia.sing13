export type PlaylistKind = 'open_deck' | 'sovereign';

export const DEFAULT_ARTIST = "Hero Jo's Golden Bachdoor Hit Factory";
export const TRACK_DESCRIPTION_MAX = 1000;

export interface TrackDef {
  id: string;
  title: string;
  artist: string;
  description?: string;
  src: string;
  videoSrc?: string;
  posterSrc?: string;
  durationSec?: number;
  /** IndexedDB blob key — legacy edge cache only */
  localMediaKey?: string;
  /** Track file lives on server (static /media or Blob URL) */
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
