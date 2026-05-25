/**
 * Vercel Cron — Turner bison telemetry ingest (NOAA + RF proxy).
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
    const { runTurnerBisonPipeline } = await import('../lib/turner-bison-herd.mjs');
    const stream = await runTurnerBisonPipeline();
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      ok: true,
      cron: true,
      at: stream.pipeline?.synthesis?.at,
      f107: stream.pipeline?.ingest?.noaa?.f107Sfu,
      kpLive: stream.pipeline?.ingest?.noaa?.kpIndex,
    });
  } catch (err) {
    console.error('[cron-turner-bison-ingest]', err);
    return res.status(500).json({ ok: false, message: err.message || 'Ingest failed' });
  }
};
