/**
 * GET /api/catalog-plays?trackId= — read global play count for a track (no increment).
 * POST /api/catalog-plays { trackId } — increment and return total plays (all listeners).
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
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { getTrackPlays, incrementTrackPlays, normalizeTrackId } = await import('../lib/catalog-plays.mjs');
    const { pageViewsBackend } = await import('../lib/page-views.mjs');

    if (req.method === 'GET') {
      const trackId = normalizeTrackId(req.query?.trackId || req.query?.id || '');
      if (!trackId) return res.status(400).json({ ok: false, error: 'trackId required' });
      const { plays, key } = await getTrackPlays(trackId);
      return res.status(200).json({
        ok: true,
        trackId,
        key,
        plays,
        visits: plays,
        backend: pageViewsBackend(),
      });
    }

    if (req.method === 'POST') {
      const body = readBody(req);
      const trackId = normalizeTrackId(body.trackId || body.id || '');
      if (!trackId) return res.status(400).json({ ok: false, error: 'trackId required' });
      const { plays, key, backend } = await incrementTrackPlays(trackId);
      return res.status(200).json({
        ok: true,
        trackId,
        key,
        plays,
        visits: plays,
        backend: backend || pageViewsBackend(),
      });
    }

    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({ ok: false, error: 'method not allowed' });
  } catch (err) {
    console.error('[catalog-plays]', err);
    return res.status(500).json({ ok: false, error: 'server' });
  }
};
