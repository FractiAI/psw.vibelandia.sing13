/**
 * GET /api/synthio-activation — Synthio engineering + activation dashboard JSON.
 * Includes industry MRI simulator (KomaMRI), state conditions, metrics, all-six + pulse.
 */
export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ ok: false, message: 'GET only' }));
  }

  try {
    const { buildSynthioEngineeringPack } = await import('../lib/synthio-engineering.mjs');
    const forcePulse = req.query?.forcePulse === '1';
    const mode = typeof req.query?.mode === 'string' ? req.query.mode : 'point_and_click';
    const octave = Number(req.query?.octave || 99);
    const pack = buildSynthioEngineeringPack({ mode, octave, forcePulse });

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        ok: true,
        activated: pack.metrics.activeInSandbox === true,
        forcePulse,
        pulsePersist: pack.pulse?.persist || null,
        ...pack,
      }),
    );
  } catch (err) {
    console.error('[synthio-activation]', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        ok: false,
        code: 'synthio_activation_error',
        message: err.message || 'failed',
      }),
    );
  }
}
