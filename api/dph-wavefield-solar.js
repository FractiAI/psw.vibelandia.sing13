/**
 * GET /api/dph-wavefield-solar — live Wavefield Oscillator state (SYN-SUN-2026-REV7).
 */
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ ok: false, message: 'GET only' });
  }

  const force = req.query?.refresh === '1' || req.query?.force === '1';

  try {
    const { runWavefieldOscillatorPipeline } = await import('../lib/dph-wavefield-solar.mjs');
    const stream = await runWavefieldOscillatorPipeline({ force });
    return res.status(200).json({ ok: true, ...stream });
  } catch (err) {
    console.error('[dph-wavefield-solar]', err);
    return res.status(500).json({
      ok: false,
      code: 'wavefield_error',
      message: err.message || 'Wavefield pipeline failed',
    });
  }
};
