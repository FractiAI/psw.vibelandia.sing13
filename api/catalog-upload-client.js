/**
 * POST /api/catalog-upload-client — token exchange for browser → Vercel Blob uploads.
 * Bypasses the 4.5 MB serverless body limit (videos up to ~10 min / 600 MB).
 */
const { handleUpload } = require('@vercel/blob/client');
const { getCatalogUploadSecret, catalogUploadConfigured } = require('../lib/catalog-server.mjs');

const MAX_BYTES = 600 * 1024 * 1024;

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
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
  'video/ogg',
  'application/octet-stream',
];

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Catalog-Secret, X-Catalog-Upload-Secret',
  );
}

function readJsonBody(req) {
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

function catalogSecretFromReq(req) {
  return String(req.headers['x-catalog-secret'] || req.headers['x-catalog-upload-secret'] || '');
}

function assertSecret(req) {
  const expected = getCatalogUploadSecret();
  if (!expected) return { ok: false, status: 503, code: 'catalog_upload_unconfigured' };
  if (catalogSecretFromReq(req) !== expected) {
    return { ok: false, status: 401, code: 'unauthorized' };
  }
  return { ok: true };
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
      message: 'Set BLOB_READ_WRITE_TOKEN and CATALOG_UPLOAD_SECRET on Vercel.',
    });
  }

  const auth = assertSecret(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.code });

  const body = readJsonBody(req);
  if (!body) return res.status(400).json({ error: 'invalid_body' });

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_CONTENT_TYPES,
        maximumSizeInBytes: MAX_BYTES,
        addRandomSuffix: false,
      }),
      onUploadCompleted: async () => {
        /* catalog-register runs from the client after upload() resolves */
      },
    });
    return res.status(200).json(jsonResponse);
  } catch (e) {
    console.error('[catalog-upload-client]', e);
    return res.status(400).json({ error: e.message || 'upload_token_failed' });
  }
};
