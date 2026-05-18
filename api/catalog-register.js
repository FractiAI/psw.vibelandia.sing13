/**
 * POST /api/catalog-register — add a Blob URL to the dynamic catalog (small JSON body).
 */
const {
  assertCatalogUploadAuth,
  appendTrackToDynamicCatalog,
  catalogUploadConfigured,
  loadDynamicCatalog,
  saveDynamicCatalog,
} = require('../lib/catalog-server.mjs');

const DEFAULT_ARTIST = "Hero Jo's Golden Bachdoor Hit Factory";

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
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  if (!catalogUploadConfigured()) {
    return res.status(503).json({ error: 'catalog_upload_unconfigured' });
  }

  const auth = assertCatalogUploadAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.code });

  const body = readJsonBody(req);
  if (!body?.url || !body?.trackId) {
    return res.status(400).json({ error: 'invalid_body' });
  }

  const id = String(body.trackId).replace(/[^\w-]/g, '').slice(0, 80);
  if (!id) return res.status(400).json({ error: 'invalid_track_id' });

  const filename = String(body.filename || 'upload.bin');
  const title = String(body.title || '').trim() || titleFromFilename(filename);
  const artist = String(body.artist || '').trim() || DEFAULT_ARTIST;
  const contentType = String(body.contentType || 'application/octet-stream');
  const url = String(body.url);

  const isVideo = contentType.startsWith('video/');
  const track = {
    id,
    title,
    artist,
    src: url,
    ...(isVideo ? { videoSrc: url } : {}),
    uploadedAt: new Date().toISOString(),
    serverHosted: true,
  };

  const dynamic = await loadDynamicCatalog();
  const next = appendTrackToDynamicCatalog(dynamic, track);
  const saved = await saveDynamicCatalog(next);
  if (!saved) {
    return res.status(500).json({
      error: 'catalog_save_failed',
      message: 'File is on Blob storage but the catalog manifest could not be saved.',
    });
  }

  return res.status(200).json({ track });
};
