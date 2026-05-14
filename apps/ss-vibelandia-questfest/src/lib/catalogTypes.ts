export type PlaylistKind = 'open_deck' | 'sovereign';

export interface TrackDef {
  id: string;
  title: string;
  artist: string;
  src: string;
  videoSrc?: string;
  posterSrc?: string;
  durationSec?: number;
  /** IndexedDB blob key for DJ uploads */
  localMediaKey?: string;
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
