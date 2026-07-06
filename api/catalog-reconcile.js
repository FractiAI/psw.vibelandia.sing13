/**
 * POST /api/catalog-reconcile — repair manifest from Redis upload index + orphan blobs.
 * Requires X-Catalog-Secret (same as bulk upload).
 */
const { loadCatalogServer } = require('../lib/catalog-api-lib.cjs');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Catalog-Secret, X-Catalog-Upload-Secret');
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const lib = await loadCatalogServer();
    const { assertCatalogUploadAuth, catalogUploadConfigured, reconcileCatalogFully, loadServerCatalog } =
      lib;

    if (!catalogUploadConfigured()) {
      return res.status(503).json({
        error: 'catalog_upload_unconfigured',
        message: 'Blob + catalog secret required for reconcile.',
      });
    }

    const auth = assertCatalogUploadAuth(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.code });

    const body = typeof req.body === 'object' && req.body ? req.body : {};
    const includeBlobOrphans = body.includeBlobOrphans !== false;

    const result = await reconcileCatalogFully({ includeBlobOrphans });
    const merged = await loadServerCatalog(req);

    return res.status(200).json({
      ok: true,
      before: result.before,
      after: result.after,
      indexRecovered: result.indexRecovered,
      blobRecovered: result.blobRecovered,
      masterTrackIds:
        merged.playlists?.find((p) => p.id === 'pl-main')?.trackIds?.length ??
        Object.keys(merged.tracks || {}).length,
      version: merged.version,
    });
  } catch (e) {
    console.error('[catalog-reconcile]', e);
    return res.status(500).json({ error: 'reconcile_failed', message: e?.message });
  }
};
