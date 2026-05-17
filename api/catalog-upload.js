/**
 * POST /api/catalog-upload — Vercel Blob audio + dynamic catalog manifest (server only).
 * Accepts raw bytes (application/octet-stream) or JSON { dataBase64, filename, title, artist, contentType }.
 */
const crypto = require('node:crypto');
const { put } = require('@vercel/blob');
const {
  assertCatalogUploadAuth,
  catalogUploadConfigured,
  loadServerCatalog,
  saveDynamicCatalog,
} = require('../lib/catalog-server.mjs');

const DEFAULT_ARTIST = "Hero Jo's Golden Bachdoor Hit Factory";
const MAX_BYTES = 4.5 * 1024 * 1024;

function readBodyObject(req) {
  if (typeof req.body === 'object' && req.body && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return null;
}

async function readRawBody(req, limit) {
  if (Buffer.isBuffer(req.body)) {
    if (req.body.length > limit) throw new Error('payload_too_large');
    return req.body;
  }

  const json = readBodyObject(req);
  if (json?.dataBase64) {
    const buf = Buffer.from(String(json.dataBase64), 'base64');
    if (buf.length > limit) throw new Error('payload_too_large');
    return buf;
  }

  const chunks = [];
  let size = 0;
  const readable = req;
  if (typeof readable[Symbol.asyncIterator] === 'function') {
    for await (const chunk of readable) {
      const piece = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += piece.length;
      if (size > limit) throw new Error('payload_too_large');
      chunks.push(piece);
    }
    return Buffer.concat(chunks);
  }

  return Buffer.alloc(0);
}

function titleFromFilename(name) {
  return (
    String(name || 'Untitled')
      .replace(/\.[^.]+$/, '')
      .replace(/[_-]+/g, ' ')
      .trim() || 'Untitled'
  );
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Catalog-Secret, X-Catalog-Upload-Secret, X-Track-Title, X-Track-Artist, X-Filename',
  );

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  if (!catalogUploadConfigured()) {
    return res.status(503).json({
      error: 'catalog_upload_unconfigured',
      message:
        'Set BLOB_READ_WRITE_TOKEN and CATALOG_UPLOAD_SECRET (match VITE_CATALOG_UPLOAD_SECRET in the Bridge build) on Vercel.',
    });
  }

  const auth = assertCatalogUploadAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.code });

  const jsonBody = readBodyObject(req);

  let buffer;
  try {
    buffer = await readRawBody(req, MAX_BYTES);
  } catch (e) {
    if (e.message === 'payload_too_large') {
      return res.status(413).json({ error: 'file_too_large' });
    }
    return res.status(400).json({ error: 'invalid_body' });
  }

  if (!buffer.length) return res.status(400).json({ error: 'empty_file' });

  const filename = String(
    req.headers['x-filename'] || jsonBody?.filename || 'upload.bin',
  ).replace(/[^\w.\-()+ ]/g, '_');
  const title =
    String(req.headers['x-track-title'] || jsonBody?.title || '').trim() ||
    titleFromFilename(filename);
  const artist =
    String(req.headers['x-track-artist'] || jsonBody?.artist || '').trim() || DEFAULT_ARTIST;
  const contentType = String(
    req.headers['content-type']?.includes('json')
      ? jsonBody?.contentType || 'application/octet-stream'
      : req.headers['content-type'] || jsonBody?.contentType || 'application/octet-stream',
  );

  const id = `trk-srv-${crypto.randomUUID()}`;
  const pathname = `catalog/${id}-${filename}`;

  let blob;
  try {
    blob = await put(pathname, buffer, {
      access: 'public',
      contentType: contentType.split(';')[0].trim(),
      addRandomSuffix: false,
    });
  } catch (e) {
    console.error('[catalog-upload] blob', e);
    return res.status(500).json({ error: 'blob_store_failed' });
  }

  const isVideo = contentType.startsWith('video/');
  const track = {
    id,
    title,
    artist,
    src: blob.url,
    ...(isVideo ? { videoSrc: blob.url } : {}),
    uploadedAt: new Date().toISOString(),
    serverHosted: true,
  };

  const current = await loadServerCatalog(req);
  const tracks = { ...current.tracks, [id]: track };
  const playlists = current.playlists.map((p) => {
    if (p.id !== 'pl-main') return p;
    const ids = p.trackIds.includes(id) ? p.trackIds : [...p.trackIds, id];
    return { ...p, trackIds: ids };
  });

  const next = { ...current, tracks, playlists };
  const saved = await saveDynamicCatalog(next);
  if (!saved) {
    return res.status(500).json({
      error: 'catalog_save_failed',
      message: 'Audio stored but catalog manifest could not be saved.',
    });
  }

  return res.status(200).json({ track, catalog: next });
};
