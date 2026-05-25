/**
 * GET /api/bulletin-board — SS Vibelandia Bulletin Board posts manifest.
 */
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ ok: false, message: 'GET only' });
  }

  try {
    const { loadBulletinBoard } = await import('../lib/bulletin-board.mjs');
    const board = await loadBulletinBoard();
    return res.status(200).json({
      ok: true,
      humanInterventionRequired: false,
      ...board,
    });
  } catch (err) {
    console.error('[bulletin-board]', err);
    return res.status(500).json({
      ok: false,
      message: err.message || 'Bulletin board load failed',
    });
  }
};
