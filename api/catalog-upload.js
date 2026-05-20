/**
 * POST /api/catalog-upload — one endpoint for:
 * - Vercel Blob client token exchange (large video / audio)
 * - catalog register after client upload ({ action: 'register' })
 * - small inline file upload (raw body, ≤4.5 MB)
 */
const crypto = require('node:crypto');
const { put } = require('@vercel/blob');
const { handleUpload } = require('@vercel/blob/client');
const {
  assertCatalogUploadAuth,
  appendTrackToDynamicCatalog,
  catalogUploadConfigured,
  loadDynamicCatalog,
  saveDynamicCatalog,
} = require('../lib/catalog-server.mjs');

const DEFAULT_ARTIST = "Hero Jo's Golden Bachdoor Hit Factory";
const MAX_INLINE_BYTES = 4.5 * 1024 * 1024;
const MAX_CLIENT_BYTES = 80 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/flac',
  'audio/mp4',
  'audio/m4a',
  'audio/aac',
  'audio/ogg',
  'audio/webm',
  'audio/x-m4a',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/octet-stream',
];

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Catalog-Secret, X-Catalog-Upload-Secret, X-Track-Title, X-Track-Artist, X-Filename',
  );
}

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

function titleFromFilename(name) {
  return (
    String(name || 'Untitled')
      .replace(/\.[^.]+$/, '')
      .replace(/[_-]+/g, ' ')
      .trim() || 'Untitled'
  );
}

async function registerTrack(res, body) {
  if (!body?.url || !body?.trackId) {
    return res.status(400).json({ error: 'invalid_body' });
  }

  const id = String(body.trackId).replace(/[^\w-]/g, '').slice(0, 80);
  if (!id) return res.status(400).json({ error: 'invalid_track_id' });

  const filename = String(body.filename || 'upload.bin');
  const title = String(body.title || '').trim() || titleFromFilename(filename);
  const artist = String(body.artist || '').trim() || DEFAULT_ARTIST;
  const description = String(body.description || '').trim().slice(0, 1000) || undefined;
  const genre = String(body.genre || '').trim().slice(0, 80) || undefined;
  const durationSec =
    body.durationSec != null && Number.isFinite(Number(body.durationSec))
      ? Math.max(0, Math.min(86400, Math.round(Number(body.durationSec))))
      : undefined;
  const contentType = String(body.contentType || 'application/octet-stream');
  const url = String(body.url);
  if (contentType.startsWith('video/')) {
    return res.status(400).json({
      error: 'video_not_allowed',
      message: 'Upload MP3 or WAV only — video is no longer accepted.',
    });
  }

  const track = {
    id,
    title,
    artist,
    src: url,
    ...(description ? { description } : {}),
    ...(genre ? { genre } : {}),
    ...(durationSec != null ? { durationSec } : {}),
    uploadedAt: new Date().toISOString(),
    serverHosted: true,
  };

  const dynamic = await loadDynamicCatalog();
  const next = appendTrackToDynamicCatalog(dynamic, track);
  try {
    const saved = await saveDynamicCatalog(next);
    if (!saved) {
      return res.status(500).json({
        error: 'catalog_save_failed',
        message: 'File is on storage but the catalog manifest could not be saved.',
      });
    }
  } catch (e) {
    console.error('[catalog-upload] register save', e);
    return res.status(500).json({ error: 'catalog_save_failed' });
  }

  return res.status(200).json({ track });
}

async function handleBlobClientToken(req, res, body) {
  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_CONTENT_TYPES,
        maximumSizeInBytes: MAX_CLIENT_BYTES,
        addRandomSuffix: false,
      }),
      onUploadCompleted: async () => {},
    });
    return res.status(200).json(jsonResponse);
  } catch (e) {
    console.error('[catalog-upload] client token', e);
    return res.status(400).json({ error: e.message || 'upload_token_failed' });
  }
}

function readInlineBuffer(req) {
  if (Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    return Buffer.from(req.body, 'binary');
  }
  return null;
}

async function handleInlineUpload(req, res) {
  const buffer = readInlineBuffer(req);
  if (!buffer || !buffer.length) {
    return res.status(400).json({ error: 'empty_file' });
  }
  if (buffer.length > MAX_INLINE_BYTES) {
    return res.status(413).json({
      error: 'file_too_large',
      message: 'Use client upload for files over 4.5 MB (videos up to 10 min).',
    });
  }

  const jsonBody = readBodyObject(req);
  const filename = String(req.headers['x-filename'] || jsonBody?.filename || 'upload.bin').replace(
    /[^\w.\-()+ ]/g,
    '_',
  );
  const title =
    String(req.headers['x-track-title'] || jsonBody?.title || '').trim() || titleFromFilename(filename);
  const artist =
    String(req.headers['x-track-artist'] || jsonBody?.artist || '').trim() || DEFAULT_ARTIST;
  const contentTypeHeader = String(req.headers['content-type'] || '');
  const contentType = contentTypeHeader.includes('json')
    ? jsonBody?.contentType || 'application/octet-stream'
    : contentTypeHeader || jsonBody?.contentType || 'application/octet-stream';

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
    console.error('[catalog-upload] blob put', e);
    return res.status(500).json({ error: 'blob_store_failed' });
  }

  const description =
    String(req.headers['x-track-description'] || jsonBody?.description || '').trim().slice(0, 1000) ||
    undefined;
  const genre =
    String(req.headers['x-track-genre'] || jsonBody?.genre || '').trim().slice(0, 80) || undefined;
  if (contentType.startsWith('video/') || /\.(mp4|webm|mov|mkv|m4v)$/i.test(filename)) {
    return res.status(400).json({
      error: 'video_not_allowed',
      message: 'Upload MP3 or WAV only — video is no longer accepted.',
    });
  }
  const track = {
    id,
    title,
    artist,
    src: blob.url,
    ...(description ? { description } : {}),
    ...(genre ? { genre } : {}),
    uploadedAt: new Date().toISOString(),
    serverHosted: true,
  };

  const dynamic = await loadDynamicCatalog();
  const next = appendTrackToDynamicCatalog(dynamic, track);
  try {
    const saved = await saveDynamicCatalog(next);
    if (!saved) {
      return res.status(500).json({
        error: 'catalog_save_failed',
        message: 'Audio stored but catalog manifest could not be saved.',
      });
    }
  } catch (e) {
    console.error('[catalog-upload] inline save', e);
    return res.status(500).json({ error: 'catalog_save_failed' });
  }

  return res.status(200).json({ track });
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  setCors(res);

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

  if (jsonBody?.action === 'register') {
    return registerTrack(res, jsonBody);
  }

  if (jsonBody && typeof jsonBody.type === 'string' && jsonBody.type.startsWith('blob.')) {
    return handleBlobClientToken(req, res, jsonBody);
  }

  return handleInlineUpload(req, res);
};

module.exports.config = {
  api: {
    bodyParser: {
      sizeLimit: '4.5mb',
    },
  },
};
