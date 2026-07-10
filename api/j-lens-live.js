/**
 * GET /api/j-lens-live
 * SynthOBS J-Lens Live Dashboard payload (R3 · φ compression under King Bee nodes).
 */
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ ok: false, message: 'GET only' });
  }

  try {
    const { runJLensLiveDashboard } = await import('../lib/ip-infringement-draft.mjs');
    const payload = await runJLensLiveDashboard();
    return res.status(200).json({ ok: true, api: '/api/j-lens-live', ...payload });
  } catch (err) {
    console.error('[j-lens-live]', err);
    return res.status(500).json({
      ok: false,
      code: 'j_lens_live_error',
      message: err.message || 'J-Lens live probe failed',
    });
  }
};
