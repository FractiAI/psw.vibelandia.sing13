/**
 * POST /api/catalog-upload — store track on Vercel Blob; append to server catalog (Upstash).
 * Body: raw file bytes. Headers: X-Catalog-Secret, X-Track-Title, X-Track-Artist, X-Filename, Content-Type.
 */
const crypto = require('node:crypto');
const { put } = require('@vercel/blob');
const {
  assertCatalogUploadAuth,
  catalogUploadConfigured,
  loadServerCatalog,
  mergeCatalogSnapshots,
  saveDynamicCatalog,
  requestOrigin,
} = require('../lib/catalog-server.mjs');

const DEFAULT_ARTIST = "Hero Jo's Golden Bachdoor Hit Factory";
/** Vercel Hobby request limit ~4.5 MB — use media/catalog/tracks/ deploy for larger files. */
const MAX_BYTES = 4.5 * 1024 * 1024;

async function readRawBody(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('payload_too_large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function titleFromFilename(name) {
  return String(name || 'Untitled')
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim() || 'Untitled';
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
        'Set BLOB_READ_WRITE_TOKEN and CATALOG_UPLOAD_SECRET on Vercel, or add MP3s under media/catalog/tracks/ and deploy catalog.json.',
    });
  }

  const auth = assertCatalogUploadAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.code });

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

  const filename = String(req.headers['x-filename'] || 'upload.bin').replace(/[^\w.\-()+ ]/g, '_');
  const title = String(req.headers['x-track-title'] || '').trim() || titleFromFilename(filename);
  const artist = String(req.headers['x-track-artist'] || '').trim() || DEFAULT_ARTIST;
  const contentType = String(req.headers['content-type'] || 'application/octet-stream');

  const id = `trk-srv-${crypto.randomUUID()}`;
  const pathname = `catalog/${id}-${filename}`;

  let blob;
  try {
    blob = await put(pathname, buffer, {
      access: 'public',
      contentType,
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
    return res.status(200).json({
      track,
      warning: 'blob_saved_catalog_not_persisted',
      message: 'File is on Blob storage but catalog overlay needs UPSTASH_REDIS_REST_URL.',
    });
  }

  return res.status(200).json({ track, catalog: next });
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
