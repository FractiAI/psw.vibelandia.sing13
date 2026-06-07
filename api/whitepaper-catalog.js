/**
 * GET /api/whitepaper-catalog — searchable whitepaper + surface index.
 * Query: q=search&category=dph-gpu
 */
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ ok: false, message: 'GET only' });
  }

  try {
    const { buildWhitepaperCatalog, filterCatalog } = await import('../lib/whitepaper-catalog.mjs');
    const base = await buildWhitepaperCatalog();
    const q = typeof req.query?.q === 'string' ? req.query.q : '';
    const category = typeof req.query?.category === 'string' ? req.query.category : 'all';
    const out = filterCatalog(base, { q, category });
    return res.status(200).json({ ok: true, ...out });
  } catch (err) {
    console.error('[whitepaper-catalog]', err);
    return res.status(500).json({ ok: false, code: 'catalog_error', message: err.message });
  }
};
