/**
 * GET /api/ip-infringement-draft
 * IP Infringement Draft · Immediate Audit Recommendations (R1–R3).
 */
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ ok: false, message: 'GET only' });
  }

  try {
    const { loadIpInfringementReport } = await import('../lib/ip-infringement-draft.mjs');
    const refresh = req.query?.refresh === '1';
    const report = await loadIpInfringementReport({ refresh });
    return res.status(200).json({
      ok: true,
      api: '/api/ip-infringement-draft',
      paper: '/whitepaper/ip-infringement-draft',
      jLensDashboard: '/special-projects/j-lens-live',
      pipeline: 'research/ip-infringement-draft/scripts/run_empirical_pipeline.mjs',
      report,
    });
  } catch (err) {
    console.error('[ip-infringement-draft]', err);
    return res.status(500).json({
      ok: false,
      code: 'ip_infringement_draft_error',
      message: err.message || 'Report generation failed',
    });
  }
};
