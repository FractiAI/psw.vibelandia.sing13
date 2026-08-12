/**
 * GET /api/synthio-external-telemetry
 * Public-readable external telemetry channel for Synthio pulse observe/compare.
 * Optionally probes NOAA Kp / F10.7 as read-only companions (cannot carry our signature).
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
    const {
      emitSyntheverseSynthioPulse,
      readPublishedExternalTelemetry,
      observeCompanionExternalTelemetry,
      buildExternalTelemetryEnvelope,
      persistExternalTelemetry,
      pulseFingerprint,
      SYNTHIO_EXTERNAL_TELEMETRY_SCHEMA,
      SYNTHIO_EXTERNAL_TELEMETRY_API,
    } = await import('../lib/synthio-pulse.mjs');

    const probe = req.query?.probe !== '0';
    let envelope = readPublishedExternalTelemetry();
    if (!envelope?.pulse) {
      const emitted = emitSyntheverseSynthioPulse({ force: false, publishBlob: false });
      envelope = emitted.externalPublish?.envelope || buildExternalTelemetryEnvelope(emitted.latest);
      persistExternalTelemetry(envelope);
    }

    let companions = envelope.companions || [];
    if (probe) {
      const pack = await observeCompanionExternalTelemetry({
        timeoutMs: Number(req.query?.timeoutMs || 4000),
      });
      companions = pack.companions;
      envelope = {
        ...envelope,
        companions,
        companionsProbedAt: new Date().toISOString(),
        observedAt: new Date().toISOString(),
      };
      persistExternalTelemetry(envelope);
    }

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        ok: true,
        schema: SYNTHIO_EXTERNAL_TELEMETRY_SCHEMA,
        api: SYNTHIO_EXTERNAL_TELEMETRY_API,
        channel: envelope.channel,
        observedAt: envelope.observedAt,
        pulse: envelope.pulse,
        fingerprint: envelope.pulse?.fingerprint || pulseFingerprint(envelope.pulse),
        companions,
        companionsReachable: companions.filter((c) => c.reachable === true).length,
        honesty: envelope.honesty,
      }),
    );
  } catch (err) {
    console.error('[synthio-external-telemetry]', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        ok: false,
        code: 'synthio_external_telemetry_error',
        message: err.message || 'failed',
      }),
    );
  }
}
