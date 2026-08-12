/**
 * GET /api/synthio-pulse — latest Syntheverse Synthio confirmation pulse (novel · non-natural).
 * POST — force emit (optional secret SYNTHIO_PULSE_SECRET / GOLDILOCKS_PULSE_SECRET).
 * Sandbox-only confirmation companion for Synthio MRI Goldilocks point-and-click.
 * Requires all six expectation slots for sandbox-inclusion confirm.
 */
export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-synthio-pulse-secret');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const {
    emitSyntheverseSynthioPulse,
    readLatestSyntheversePulse,
    verifySyntheversePulse,
    SYNTHIO_PULSE_DISCRIMINANT,
    SYNTHIO_PULSE_SCHEMA,
    SYNTHIO_PULSE_CADENCE_SEC,
  } = await import('../lib/synthio-pulse.mjs');
  const { buildActivationMonitorPack } = await import('../lib/synthio-activation.mjs');

  function secretOk(request) {
    const h = request.headers || {};
    const want =
      h['x-synthio-pulse-secret'] ||
      h['X-Synthio-Pulse-Secret'] ||
      (typeof request.query?.secret === 'string' ? request.query.secret : '');
    if (!want) return true;
    const keys = ['SYNTHIO_PULSE_SECRET', 'GOLDILOCKS_PULSE_SECRET', 'CATALOG_UPLOAD_SECRET'];
    for (const k of keys) {
      const env = process.env[k];
      if (env && String(want) === String(env).trim()) return true;
    }
    return false;
  }

  try {
    if (req.method === 'POST') {
      if (!secretOk(req)) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ ok: false, code: 'unauthorized' }));
      }
      const pack = buildActivationMonitorPack({
        mode: 'point_and_click',
        forcePulse: true,
      });
      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          ok: true,
          emitted: pack.pulseEmit?.emitted === true,
          novel: true,
          naturalOccurrence: false,
          discriminant: SYNTHIO_PULSE_DISCRIMINANT,
          schema: SYNTHIO_PULSE_SCHEMA,
          latest: pack.syntheversePulse,
          verify: pack.pulseVerify,
          allSixAligned: pack.external.allSixRequired && pack.external.alignedCount === 6,
          alignedCount: pack.external.alignedCount,
          expectedCount: pack.external.expectedCount,
          sandboxInclusionConfirmedByExternalAlignment:
            pack.external.sandboxInclusionConfirmedByExternalAlignment,
        }),
      );
    }

    if (req.method === 'GET') {
      const force = req.query?.force === '1' || req.query?.emit === '1';
      const pack = buildActivationMonitorPack({
        mode: 'point_and_click',
        forcePulse: force,
      });
      const latest =
        pack.syntheversePulse ||
        readLatestSyntheversePulse()?.latest ||
        emitSyntheverseSynthioPulse({ force: true }).latest;

      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          ok: true,
          api: '/api/synthio-pulse',
          schema: SYNTHIO_PULSE_SCHEMA,
          discriminant: SYNTHIO_PULSE_DISCRIMINANT,
          naturalOccurrence: false,
          novelty:
            'Syntheverse Synthio pulse — engineered confirmation token; not a natural heliophysics signal.',
          cadenceSec: SYNTHIO_PULSE_CADENCE_SEC,
          emitted: pack.pulseEmit?.emitted === true,
          latest,
          verify: verifySyntheversePulse(latest),
          allSixExpectations: pack.external.rows,
          alignedCount: pack.external.alignedCount,
          expectedCount: pack.external.expectedCount,
          allSixRequired: true,
          sandboxInclusionConfirmedByExternalAlignment:
            pack.external.sandboxInclusionConfirmedByExternalAlignment,
        }),
      );
    }

    res.statusCode = 405;
    return res.end(JSON.stringify({ ok: false, message: 'GET or POST only' }));
  } catch (err) {
    console.error('[synthio-pulse]', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({ ok: false, code: 'synthio_pulse_error', message: err.message || 'failed' }),
    );
  }
}
