/**
 * GET  /api/hero-leo — dashboard
 * POST /api/hero-leo { action: 'scout' | 'complete', prospectIds?: string[] }
 *
 * Scout/complete persist under data/hero-leo/ when the filesystem is writable
 * (local, CI, Cloud Agent). On read-only hosts, returns an error hint to use CLI.
 */
function parseBody(req) {
  if (req.body == null || req.body === '') return {};
  if (typeof req.body === 'object') return req.body;
  try {
    return JSON.parse(req.body || '{}');
  } catch {
    return {};
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { buildDashboard, HERO_LEO_SCHEMA } = await import('../lib/hero-leo.mjs');

    if (req.method === 'GET') {
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
      if (view === 'prospects') {
        return res.status(200).json({
          ok: true,
          schema: HERO_LEO_SCHEMA,
          prospectBoard: dash.prospectBoard,
        });
      }
      return res.status(200).json({ ok: true, ...dash });
    }

    if (req.method === 'POST') {
      const body = parseBody(req);
      const action = String(body.action || '').toLowerCase();
      const { runFullScout, completeSelectedProspects, TOP_N } = await import(
        '../lib/hero-leo-scout.mjs'
      );

      if (action === 'scout') {
        try {
          const board = runFullScout({ topN: Number(body.topN) || TOP_N });
          return res.status(200).json({
            ok: true,
            action: 'scout',
            topN: board.nReturned,
            prospectBoard: board,
            dashboard: buildDashboard(),
          });
        } catch (err) {
          return res.status(503).json({
            ok: false,
            error: 'scout_persist_failed',
            message: err?.message || String(err),
            hint: 'Filesystem may be read-only. Run: npm run hero-leo:scout',
          });
        }
      }

      if (action === 'complete') {
        const prospectIds = Array.isArray(body.prospectIds) ? body.prospectIds : [];
        try {
          const result = completeSelectedProspects(prospectIds);
          if (!result.ok) {
            return res.status(400).json(result);
          }
          return res.status(200).json({
            ok: true,
            action: 'complete',
            ...result,
            dashboard: buildDashboard(),
          });
        } catch (err) {
          return res.status(503).json({
            ok: false,
            error: 'complete_persist_failed',
            message: err?.message || String(err),
            hint: 'Filesystem may be read-only. Run: npm run hero-leo:complete -- --ids=P1,P2',
          });
        }
      }

      return res.status(400).json({
        ok: false,
        error: 'unknown_action',
        hint: "Use action: 'scout' or 'complete'",
      });
    }

    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: 'hero_leo_failed',
      message: err?.message || String(err),
    });
  }
};
