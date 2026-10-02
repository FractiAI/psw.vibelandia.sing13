/**
 * GET /api/hero-leo — Hero Leo dashboard (status, metrics, ledger summary)
 * Never fabricates activity; reads data/hero-leo/* only.
 */
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const { buildDashboard, HERO_LEO_SCHEMA } = await import('../lib/hero-leo.mjs');
    const view = String(req.query?.view || 'dashboard').toLowerCase();
    const dash = buildDashboard();
    if (view === 'status') {
      return res.status(200).json({ ok: true, schema: HERO_LEO_SCHEMA, status: dash.status });
    }
    if (view === 'metrics') {
      return res.status(200).json({ ok: true, schema: HERO_LEO_SCHEMA, metrics: dash.metrics });
    }
    if (view === 'ledger') {
      return res.status(200).json({ ok: true, schema: HERO_LEO_SCHEMA, ledger: dash.ledger });
    }
    return res.status(200).json({ ok: true, ...dash });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: 'hero_leo_read_failed',
      message: err?.message || String(err),
    });
  }
};
