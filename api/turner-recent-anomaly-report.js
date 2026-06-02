/**
 * GET /api/turner-recent-anomaly-report
 * Live Recent Anomaly Detection Module + geomagnetic herbivore summary (JSON).
 */
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=900');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ ok: false, message: 'GET only' });
  }

  try {
    const { runRecentAnomalyModule } = await import('../lib/turner-recent-anomaly-module.mjs');
    const q = req.query || {};
    const report = await runRecentAnomalyModule({
      endDate: typeof q.end === 'string' ? q.end : undefined,
      sampleSize: q.sample ? parseInt(String(q.sample), 10) : undefined,
    });
    return res.status(200).json({
      ok: true,
      api: '/api/turner-recent-anomaly-report',
      paper: '/interfaces/whitepaper-surface.html?id=geomagnetic-herbivore-2026',
      pythonPipeline: 'research/geomagnetic-herbivore/scripts/run_pipeline.py',
      report,
    });
  } catch (err) {
    console.error('[turner-recent-anomaly-report]', err);
    return res.status(500).json({
      ok: false,
      code: 'anomaly_report_error',
      message: err.message || 'Report generation failed',
    });
  }
};
