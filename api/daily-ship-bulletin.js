/**
 * GET /api/daily-ship-bulletin — today’s SS Vibelandia host “News of the day”.
 * Query: ?date=YYYY-MM-DD (optional; defaults to UTC today).
 */
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ ok: false, message: 'GET only' });
  }

  try {
    const { buildDailyShipBulletin } = await import('../lib/daily-ship-bulletin.mjs');
    const date = typeof req.query?.date === 'string' ? req.query.date : undefined;
    const payload = await buildDailyShipBulletin({ date });
    return res.status(200).json({
      ...payload,
      humanInterventionRequired: false,
    });
  } catch (err) {
    console.error('[daily-ship-bulletin]', err);
    return res.status(500).json({
      ok: false,
      message: err.message || 'Daily ship bulletin failed',
    });
  }
};
