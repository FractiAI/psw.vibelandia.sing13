/**
 * GET /api/synthio-pulse — latest Syntheverse Synthio confirmation pulse (novel · non-natural).
 * POST — force emit (optional secret SYNTHIO_PULSE_SECRET / GOLDILOCKS_PULSE_SECRET).
 * Publishes into /api/synthio-external-telemetry for independent observe/compare.
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
    SYNTHIO_EXTERNAL_TELEMETRY_API,
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

  const origin =
    (typeof req.headers?.['x-forwarded-proto'] === 'string' &&
    typeof req.headers?.['x-forwarded-host'] === 'string'
      ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`
      : null) ||
    (typeof req.headers?.host === 'string' ? `https://${req.headers.host}` : null);

  try {
    if (req.method === 'POST') {
      if (!secretOk(req)) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ ok: false, code: 'unauthorized' }));
      }
      const pack = await buildActivationMonitorPack({
        mode: 'point_and_click',
        forcePulse: true,
        origin,
        skipCompanionProbe: req.query?.probe === '0',
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
          externalTelemetryApi: SYNTHIO_EXTERNAL_TELEMETRY_API,
          latest: pack.syntheversePulse,
          verify: pack.pulseVerify,
          pulseCompare: pack.pulseCompare,
          pulseObservation: pack.pulseObservation,
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
      const pack = await buildActivationMonitorPack({
        mode: 'point_and_click',
        forcePulse: force,
        origin,
        skipCompanionProbe: req.query?.probe === '0',
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
          externalTelemetryApi: SYNTHIO_EXTERNAL_TELEMETRY_API,
          schema: SYNTHIO_PULSE_SCHEMA,
          discriminant: SYNTHIO_PULSE_DISCRIMINANT,
          naturalOccurrence: false,
          novelty:
            'Syntheverse Synthio pulse — engineered confirmation token published to public external telemetry for observe/compare; not a natural heliophysics signal.',
          cadenceSec: SYNTHIO_PULSE_CADENCE_SEC,
          emitted: pack.pulseEmit?.emitted === true,
          latest,
          verify: verifySyntheversePulse(latest),
          pulseCompare: pack.pulseCompare,
          pulseObservation: pack.pulseObservation,
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
