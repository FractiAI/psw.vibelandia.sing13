import { buildEmptyCatalog } from '@/lib/catalogSeed';
import { expectedCaptainPassword } from '@/lib/captainAuth';
import type { CatalogSnapshot, TrackDef } from '@/lib/catalogTypes';

/** Blob + catalog API host when the public www edge lacks upload env (FractiVerse pipe). */
const DEFAULT_CATALOG_PIPE = 'https://psw-vibelandia-sing13.vercel.app';

const API_CATALOG = '/api/catalog';
const STATIC_CATALOG = '/media/catalog/catalog.json';

export function catalogPipeOrigin(): string {
  const fromEnv = import.meta.env.VITE_CATALOG_PIPE_ORIGIN;
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim().replace(/\/$/, '');
  if (typeof location !== 'undefined' && /ssvibelandiaquestfest24x365\.com$/i.test(location.hostname)) {
    return DEFAULT_CATALOG_PIPE;
  }
  return '';
}

function catalogApiUrl(path: string): string {
  const base = catalogPipeOrigin();
  return base ? `${base}${path}` : path;
}

/** Must match server CATALOG_UPLOAD_SECRET (or shared captain password on Vercel). */
export function catalogUploadSecret(): string {
  const upload = import.meta.env.VITE_CATALOG_UPLOAD_SECRET;
  if (typeof upload === 'string' && upload.trim().length >= 8) return upload.trim();
  const captain = import.meta.env.VITE_CAPTAIN_BYPASS_PASSWORD;
  if (typeof captain === 'string' && captain.trim().length >= 8) return captain.trim();
  const edgeDefault = expectedCaptainPassword();
  if (edgeDefault.length >= 8) return edgeDefault;
  return '';
}

export function isServerUploadConfigured(): boolean {
  return catalogUploadSecret().length >= 8;
}

function normalizeServerCatalog(raw: unknown): CatalogSnapshot {
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

/** Load master library from server (API merges static JSON + dynamic manifest). */
export async function fetchServerCatalog(): Promise<CatalogSnapshot> {
  const pipe = catalogPipeOrigin();
  const apiPaths = pipe ? [catalogApiUrl(API_CATALOG), API_CATALOG] : [API_CATALOG, catalogApiUrl(API_CATALOG)];

  for (const url of apiPaths) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const remote = normalizeServerCatalog(await res.json());
        if (pipe && url.startsWith(pipe)) return remote;
        if (!pipe) return remote;
        if (Object.keys(remote.tracks).length > 0) return remote;
      }
    } catch {
      /* try next */
    }
  }

  try {
    const res = await fetch(STATIC_CATALOG, { cache: 'no-store' });
    if (res.ok) return normalizeServerCatalog(await res.json());
  } catch {
    /* */
  }
  return buildEmptyCatalog();
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('read_failed'));
        return;
      }
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error('read_failed'));
    reader.readAsDataURL(file);
  });
}

export type UploadTrackResult = {
  track: TrackDef;
  catalog?: CatalogSnapshot;
};

/** Upload audio to Vercel Blob + server catalog manifest. No browser storage. */
export async function uploadTrackToServer(
  file: File,
  meta: { title?: string; artist?: string },
): Promise<UploadTrackResult> {
  const secret = catalogUploadSecret();
  if (!secret) {
    const err = new Error('catalog_upload_unconfigured') as Error & { code?: string };
    err.code = 'catalog_upload_unconfigured';
    throw err;
  }

  const payload = {
    dataBase64: await fileToBase64(file),
    filename: file.name,
    title: meta.title?.trim() || '',
    artist: meta.artist?.trim() || '',
    contentType: file.type || 'application/octet-stream',
  };

  const res = await fetch(catalogApiUrl('/api/catalog-upload'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Catalog-Secret': secret,
      'X-Track-Title': payload.title,
      'X-Track-Artist': payload.artist,
      'X-Filename': payload.filename,
    },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as {
    track?: TrackDef;
    catalog?: CatalogSnapshot;
    error?: string;
    message?: string;
  };

  if (!res.ok) {
    const err = new Error(data.error || data.message || 'upload_failed') as Error & { code?: string };
    err.code = data.error;
    throw err;
  }
  if (!data.track?.src) throw new Error('upload_failed');
  return { track: data.track, catalog: data.catalog };
}
