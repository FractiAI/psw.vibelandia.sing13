import { buildEmptyCatalog } from '@/lib/catalogSeed';
import type { CatalogSnapshot, TrackDef } from '@/lib/catalogTypes';
import catalogJson from '../../../../media/catalog/catalog.json';

function normalize(raw: unknown): CatalogSnapshot {
  if (!raw || typeof raw !== 'object') return buildEmptyCatalog();
  const o = raw as CatalogSnapshot;
  const tracks =
    o.tracks && typeof o.tracks === 'object' ? (o.tracks as Record<string, TrackDef>) : {};
  const playlists = Array.isArray(o.playlists) ? o.playlists : buildEmptyCatalog().playlists;
  return {
    version: Number(o.version) || 1,
    tracks,
    playlists,
    activePlaylistId: o.activePlaylistId || 'pl-main',
  };
}

/** Shipped with the edge — no network read required. */
export function readBundledCatalog(): CatalogSnapshot {
  return normalize(catalogJson);
}
