/**
 * Vercel Cron — capture live OpenWebRX frame for hydrogen-line demo cache.
 */
module.exports = async function handler(req, res) {
  const cronHeader = req.headers['x-vercel-cron'];
  const auth = req.headers.authorization || '';
  const secret = process.env.CRON_SECRET || process.env.GOLDILOCKS_PULSE_SECRET;
  const authOk = secret && auth === `Bearer ${secret}`;
  const vercelCron = cronHeader === '1' || cronHeader === 'true';

  if (!vercelCron && !authOk) {
    return res.status(401).json({ ok: false, message: 'Cron auth required.' });
  }

  try {
    const { captureOpenWebRxFrame, storeWebSdrFrame } = await import('../lib/openwebrx-ingest.mjs');
    const frame = await captureOpenWebRxFrame({ timeoutMs: 25000 });
    await storeWebSdrFrame(frame);
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      ok: true,
      cron: true,
      endpoint: frame.endpointLabel,
      frameType: frame.frameType,
      sampleCount: frame.sampleCount,
      captureMs: frame.captureMs,
      capturedAt: frame.capturedAt,
    });
  } catch (err) {
    console.error('[cron-websdr-capture]', err);
    return res.status(500).json({
      ok: false,
      message: err.message || 'WebSDR cron capture failed',
    });
  }
};
