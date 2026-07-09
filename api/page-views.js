/**
 * POST /api/page-views — increment and return visit count for a page key.
 * GET /api/page-views?path=... — read count without incrementing.
 */
function readBody(req) {
  if (typeof req.body === 'object' && req.body) return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { normalizePageKey, getPageVisits, incrementPageVisits } = await import('../lib/page-views.mjs');
    const { upstashConfigured } = await import('../lib/upstash.mjs');

    if (req.method === 'GET') {
      const path = req.query?.path || req.query?.key || '';
      const key = normalizePageKey(String(path));
      const visits = await getPageVisits(key);
      return res.status(200).json({ ok: true, key, visits, backend: upstashConfigured() ? 'upstash' : 'memory' });
    }

    if (req.method === 'POST') {
      const body = readBody(req);
      const path = body.path || body.key || '';
      if (!path) return res.status(400).json({ ok: false, error: 'path required' });
      const { key, visits } = await incrementPageVisits(String(path));
      return res.status(200).json({ ok: true, key, visits, backend: upstashConfigured() ? 'upstash' : 'memory' });
    }

    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({ ok: false, error: 'method not allowed' });
  } catch (err) {
    console.error('[page-views]', err);
    return res.status(500).json({ ok: false, error: 'server' });
  }
};
