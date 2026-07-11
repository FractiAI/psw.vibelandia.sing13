/**
 * POST /api/catalog-playlist — sync shared user playlists to the server catalog.
 * Body: { action: 'sync', playlists: PlaylistDef[], deleteIds?: string[] }
 */
const { loadCatalogServer } = require('../lib/catalog-api-lib.cjs');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Catalog-Secret, X-Catalog-Upload-Secret',
  );
}

function readBody(req) {
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

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  let catalog;
  try {
    catalog = await loadCatalogServer();
  } catch (e) {
    console.error('[catalog-playlist] load module', e);
    return res.status(500).json({ error: 'catalog_module_failed', message: e?.message });
  }

  const {
    assertCatalogUploadAuth,
    catalogUploadConfigured,
    loadServerCatalog,
    removeUserPlaylists,
    saveDynamicCatalog,
    upsertUserPlaylists,
  } = catalog;

  if (!catalogUploadConfigured()) {
    return res.status(503).json({
      error: 'catalog_upload_unconfigured',
      message: 'Set BLOB_READ_WRITE_TOKEN and CATALOG_UPLOAD_SECRET on Vercel.',
    });
  }

  const auth = assertCatalogUploadAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.code });

  const body = readBody(req);
  if (body?.action !== 'sync') {
    return res.status(400).json({ error: 'invalid_action' });
  }

  let dynamic = await loadServerCatalog();
  if (Array.isArray(body.deleteIds) && body.deleteIds.length) {
    dynamic = removeUserPlaylists(dynamic, body.deleteIds);
  }
  const next = upsertUserPlaylists(dynamic, body.playlists);

  try {
    const saved = await saveDynamicCatalog(next);
    if (!saved.ok) {
      return res.status(500).json({ error: 'catalog_save_failed', message: saved.message });
    }

    const playlistCount = next.playlists.filter((p) => p.id !== 'pl-main' && p.id !== 'pl-my-likes').length;
    return res.status(200).json({ ok: true, playlistCount, catalog: next });
  } catch (e) {
    console.error('[catalog-playlist] save', e);
    return res.status(500).json({ error: 'catalog_save_failed', message: e?.message });
  }
};
