/**
 * GET/POST /api/doodles — Doodles Gallery (18+ view · Player 1 elevated upload)
 *
 * GET  — public manifest (works list)
 * POST — Capitan/catalog secret required:
 *   - blob.* client token (Player 1 max 500 MiB / file)
 *   - { action: 'register' } after client upload
 *   - { action: 'limits' } → Player 1 ceiling receipt
 *   - small inline image ≤4.5 MB (fallback)
 */
const crypto = require('node:crypto');
const { put, list } = require('@vercel/blob');
const { handleUpload } = require('@vercel/blob/client');
const { loadDoodlesGallery, loadCatalogServer } = require('../lib/doodles-api-lib.cjs');

const MAX_INLINE_BYTES = 4.5 * 1024 * 1024;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Catalog-Secret, X-Catalog-Upload-Secret, X-Filename, X-Doodle-Title, X-Doodle-Caption',
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

function readInlineBuffer(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body, 'binary');
  return null;
}

async function loadManifestFromBlob(gallery) {
  const { DOODLES_MANIFEST_PATH, emptyDoodlesManifest, normalizeDoodlesManifest } = gallery;
  try {
    const listed = await list({ prefix: DOODLES_MANIFEST_PATH, limit: 5 });
    const hit = (listed.blobs || []).find((b) => b.pathname === DOODLES_MANIFEST_PATH);
    if (!hit?.url) return emptyDoodlesManifest();
    const res = await fetch(hit.url, { cache: 'no-store' });
    if (!res.ok) return emptyDoodlesManifest();
    return normalizeDoodlesManifest(await res.json());
  } catch (e) {
    console.error('[doodles] load manifest', e);
    return emptyDoodlesManifest();
  }
}

async function registerWork(res, body, gallery) {
  const { normalizeDoodleWork, upsertDoodleWork, putDoodlesManifest, titleFromFilename } = gallery;
  if (!body?.url || !body?.id) {
    return res.status(400).json({ error: 'invalid_body' });
  }
  const id = String(body.id)
    .replace(/[^\w-]/g, '')
    .slice(0, 80);
  if (!id) return res.status(400).json({ error: 'invalid_id' });

  const filename = String(body.filename || 'doodle.jpg');
  const work = normalizeDoodleWork({
    id,
    title: String(body.title || '').trim() || titleFromFilename(filename),
    src: String(body.url),
    contentType: String(body.contentType || 'image/jpeg'),
    caption: String(body.caption || '').trim().slice(0, 500) || undefined,
    filename,
    uploadedAt: new Date().toISOString(),
    mature: true,
  });
  if (!work) return res.status(400).json({ error: 'invalid_work' });

  const current = await loadManifestFromBlob(gallery);
  const next = upsertDoodleWork(current, work);
  try {
    await putDoodlesManifest(next);
  } catch (e) {
    console.error('[doodles] manifest put', e);
    return res.status(500).json({
      error: 'manifest_save_failed',
      message: 'Image may be on storage but the gallery list could not be updated.',
    });
  }
  return res.status(200).json({ work, manifest: next, limits: gallery.player1UploadLimits() });
}

async function handleBlobClientToken(req, res, body, gallery) {
  const { DOODLE_ALLOWED_CONTENT_TYPES, DOODLE_PLAYER1_MAX_BYTES } = gallery;
  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        let allowOverwrite = false;
        try {
          const p = clientPayload ? JSON.parse(clientPayload) : {};
          allowOverwrite = p.allowOverwrite === true;
        } catch {
          /* ignore */
        }
        return {
          allowedContentTypes: [...DOODLE_ALLOWED_CONTENT_TYPES],
          maximumSizeInBytes: DOODLE_PLAYER1_MAX_BYTES,
          addRandomSuffix: false,
          allowOverwrite,
        };
      },
      onUploadCompleted: async () => {},
    });
    return res.status(200).json(jsonResponse);
  } catch (e) {
    console.error('[doodles] client token', e);
    return res.status(400).json({ error: e.message || 'upload_token_failed' });
  }
}

async function handleInlineUpload(req, res, gallery) {
  const {
    doodlePathname,
    normalizeDoodleWork,
    upsertDoodleWork,
    putDoodlesManifest,
    titleFromFilename,
    player1UploadLimits,
  } = gallery;

  const buffer = readInlineBuffer(req);
  if (!buffer || !buffer.length) {
    return res.status(400).json({ error: 'empty_file' });
  }
  if (buffer.length > MAX_INLINE_BYTES) {
    return res.status(413).json({
      error: 'file_too_large_for_inline',
      message:
        'Use the Player 1 client upload path for files over 4.5 MB (up to 500 MB per doodle).',
      limits: player1UploadLimits(),
    });
  }

  const jsonBody = readBodyObject(req);
  const filename = String(req.headers['x-filename'] || jsonBody?.filename || 'doodle.jpg').replace(
    /[^\w.\-()+ ]/g,
    '_',
  );
  const title =
    String(req.headers['x-doodle-title'] || jsonBody?.title || '').trim() ||
    titleFromFilename(filename);
  const caption = String(req.headers['x-doodle-caption'] || jsonBody?.caption || '')
    .trim()
    .slice(0, 500);
  const contentTypeHeader = String(req.headers['content-type'] || '');
  const contentType = contentTypeHeader.includes('json')
    ? jsonBody?.contentType || 'image/jpeg'
    : contentTypeHeader.split(';')[0].trim() || 'image/jpeg';

  const id = `ddl-${crypto.randomUUID()}`;
  const pathname = doodlePathname(id, filename);

  let blob;
  try {
    blob = await put(pathname, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
    });
  } catch (e) {
    console.error('[doodles] blob put', e);
    return res.status(500).json({ error: 'blob_store_failed' });
  }

  const work = normalizeDoodleWork({
    id,
    title,
    src: blob.url,
    contentType,
    caption: caption || undefined,
    filename,
    uploadedAt: new Date().toISOString(),
    mature: true,
  });

  const current = await loadManifestFromBlob(gallery);
  const next = upsertDoodleWork(current, work);
  try {
    await putDoodlesManifest(next);
  } catch (e) {
    console.error('[doodles] manifest put after inline', e);
    return res.status(500).json({
      error: 'manifest_save_failed',
      work,
      message: 'Image stored but gallery list could not be updated.',
    });
  }

  return res.status(200).json({ work, manifest: next, limits: player1UploadLimits() });
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(204).end();

  let gallery;
  let catalog;
  try {
    gallery = await loadDoodlesGallery();
    catalog = await loadCatalogServer();
  } catch (e) {
    console.error('[doodles] load module', e);
    return res.status(500).json({ error: 'doodles_module_failed', message: e?.message });
  }

  if (req.method === 'GET') {
    const manifest = await loadManifestFromBlob(gallery);
    return res.status(200).json({
      ok: true,
      meta: gallery.DOODLES_GALLERY_META,
      guestLimits: gallery.guestUploadLimits(),
      /** Public hint only — actual Player 1 ceilings require auth POST action:limits */
      player1Hint: {
        exceedsCatalogMediaLimit: gallery.player1ExceedsCatalogMediaLimit(),
        maxBytesLabel: '500 MiB per file when Capitan-unlocked',
        maxBatchLabel: 'up to 500 files per dump',
      },
      manifest,
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  if (!catalog.catalogUploadConfigured()) {
    return res.status(503).json({
      error: 'doodles_upload_unconfigured',
      message:
        'Set BLOB_READ_WRITE_TOKEN and CATALOG_UPLOAD_SECRET (same Capitan secret as the Bridge) on Vercel.',
    });
  }

  const auth = catalog.assertCatalogUploadAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.code });

  const jsonBody = readBodyObject(req);

  if (jsonBody?.action === 'limits') {
    return res.status(200).json({
      ok: true,
      seat: 'player1',
      limits: gallery.player1UploadLimits(),
      message:
        'Player 1 may exceed the ~80 MB catalog media rail. Doodles allow 500 MiB per file and up to 500 files per dump.',
    });
  }

  if (jsonBody?.action === 'register') {
    return registerWork(res, jsonBody, gallery);
  }

  if (jsonBody && typeof jsonBody.type === 'string' && jsonBody.type.startsWith('blob.')) {
    return handleBlobClientToken(req, res, jsonBody, gallery);
  }

  return handleInlineUpload(req, res, gallery);
};

module.exports.config = {
  api: {
    bodyParser: {
      sizeLimit: '4.5mb',
    },
  },
};
