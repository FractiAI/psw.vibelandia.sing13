/**
 * GET /api/catalog — server-hosted master library (static JSON + optional Upstash overlay).
 */
const { loadServerCatalog } = require('../lib/catalog-server.mjs');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const catalog = await loadServerCatalog(req);
    return res.status(200).json(catalog);
  } catch (e) {
    console.error('[catalog]', e);
    return res.status(500).json({ error: 'catalog_load_failed' });
  }
};
