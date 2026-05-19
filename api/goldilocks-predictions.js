/**
 * GET /api/goldilocks-predictions — public open forecast + resolved scoreboard.
 */
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ ok: false, message: 'GET only' });
  }

  try {
    const { runGoldilocksPulse } = await import('../lib/goldilocks-pulse.mjs');
    const { getPredictionLedger } = await import('../lib/goldilocks-predictions.mjs');

    await runGoldilocksPulse({ force: req.query?.refresh === '1' });
    const ledger = await getPredictionLedger();

    return res.status(200).json({
      ok: true,
      api: '/api/goldilocks-predictions',
      humanInterventionRequired: false,
      ...ledger,
    });
  } catch (err) {
    console.error('[goldilocks-predictions]', err);
    return res.status(500).json({
      ok: false,
      code: 'predictions_error',
      message: err.message || 'Prediction ledger failed',
    });
  }
};
