/**
 * GET /api/websdr-iq — live/cached OpenWebRX RF frame for Panama Canal demo.
 * Query: live=1 (force capture), format=json|bin
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ ok: false, message: 'GET only' });
  }

  const live = req.query?.live === '1' || req.query?.live === 'true';
  const format = String(req.query?.format || 'json').toLowerCase();

  try {
    const { getWebSdrFrame } = await import('../lib/openwebrx-ingest.mjs');
    const { frame, live: wasLive, stale } = await getWebSdrFrame({ live });

    if (format === 'bin' && frame?.iqBase64) {
      const buf = Buffer.from(frame.iqBase64, 'base64');
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('X-WebSDR-Source', frame.endpointLabel || 'openwebrx');
      res.setHeader('X-WebSDR-Captured-At', frame.capturedAt || '');
      return res.status(200).send(buf);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', live ? 'no-store' : 'public, max-age=60, stale-while-revalidate=300');
    return res.status(200).json({
      ok: true,
      live: wasLive,
      stale,
      frame,
    });
  } catch (err) {
    console.error('[websdr-iq]', err);
    return res.status(502).json({
      ok: false,
      code: 'capture_failed',
      message: err.message || 'WebSDR capture failed',
      hint: 'Cron may still serve last good frame; retry with ?live=1',
    });
  }
};
