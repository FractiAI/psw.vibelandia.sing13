/**
 * GET  /api/hero-leo — dashboard (+ Digital Lab)
 * POST /api/hero-leo { action: 'scout' | 'complete' | 'suite-run', prospectIds?: string[] }
 *
 * Scout/complete/suite-run persist under data/hero-leo/ when the filesystem is writable
 * (local, CI, Cloud Agent). On read-only hosts, memory + Vercel Blob (when token set).
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

async function withHeroLeoPersist(fn) {
  const { hydrateHeroLeoFromBlob, persistHeroLeoToBlob, getLastWritePersist } = await import(
    '../lib/hero-leo.mjs'
  );
  await hydrateHeroLeoFromBlob();
  const result = await fn();
  const blob = await persistHeroLeoToBlob();
  return {
    ...result,
    persist: {
      lastWrite: getLastWritePersist(),
      blob: blob.ok ? { written: blob.written } : { ok: false, reason: blob.reason },
    },
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { HERO_LEO_SCHEMA, hydrateHeroLeoFromBlob } = await import('../lib/hero-leo.mjs');
    const { buildDashboardWithDigitalLab, buildDigitalLab, runDigitalLabSuite } = await import(
      '../lib/hero-leo-digital-lab.mjs'
    );

    // Always hydrate overlays before reads so production Blob state is visible.
    await hydrateHeroLeoFromBlob();

    if (req.method === 'GET') {
      const view = String(req.query?.view || 'dashboard').toLowerCase();
      const dash = buildDashboardWithDigitalLab();
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
      if (view === 'digital-lab' || view === 'digitallab') {
        return res.status(200).json({ ok: true, schema: HERO_LEO_SCHEMA, digitalLab: dash.digitalLab });
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
          const out = await withHeroLeoPersist(async () => {
            const board = runFullScout({ topN: Number(body.topN) || TOP_N });
            return {
              ok: true,
              action: 'scout',
              topN: board.nReturned,
              nSelectable: board.nSelectable,
              prospectBoard: board,
              dashboard: buildDashboardWithDigitalLab(),
            };
          });
          return res.status(200).json(out);
        } catch (err) {
          return res.status(503).json({
            ok: false,
            error: 'scout_persist_failed',
            message: err?.message || String(err),
            hint: 'Filesystem may be read-only and Blob unavailable. Run: npm run hero-leo:scout',
          });
        }
      }

      if (action === 'complete') {
        const prospectIds = Array.isArray(body.prospectIds) ? body.prospectIds : [];
        try {
          const out = await withHeroLeoPersist(async () => {
            const result = completeSelectedProspects(prospectIds);
            if (!result.ok) return result;
            return {
              ok: true,
              action: 'complete',
              ...result,
              dashboard: buildDashboardWithDigitalLab(),
            };
          });
          if (!out.ok) {
            return res.status(400).json(out);
          }
          return res.status(200).json(out);
        } catch (err) {
          return res.status(503).json({
            ok: false,
            error: 'complete_persist_failed',
            message: err?.message || String(err),
            hint: 'Filesystem may be read-only and Blob unavailable. Run: npm run hero-leo:complete -- --ids=P1,P2',
          });
        }
      }

      if (action === 'suite-run' || action === 'digital-lab-suite') {
        try {
          const out = await withHeroLeoPersist(async () => {
            const result = runDigitalLabSuite();
            return {
              ...result,
              dashboard: buildDashboardWithDigitalLab(),
              digitalLab: buildDigitalLab(),
            };
          });
          return res.status(out.ok ? 200 : 502).json(out);
        } catch (err) {
          return res.status(503).json({
            ok: false,
            error: 'suite_run_failed',
            message: err?.message || String(err),
            hint: 'Filesystem may be read-only. Run: npm run hero-leo:digital-lab',
          });
        }
      }

      return res.status(400).json({
        ok: false,
        error: 'unknown_action',
        hint: "Use action: 'scout' | 'complete' | 'suite-run'",
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
