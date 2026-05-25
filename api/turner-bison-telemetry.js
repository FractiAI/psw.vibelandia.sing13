/**
 * GET /api/turner-bison-telemetry — live NSPFRNP herd stream (NOAA + RF + registry).
 * Query: refresh=1 forces new ingest cycle.
 */
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=90');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ ok: false, message: 'GET only' });
  }

  try {
    const { getTurnerBisonStream, loadPublicRegistry } = await import('../lib/turner-bison-herd.mjs');
    const refresh = req.query?.refresh === '1' || req.query?.refresh === 'true';
    const stream = await getTurnerBisonStream({ refresh });
    const registry = await loadPublicRegistry();

    return res.status(200).json({
      ok: true,
      humanInterventionRequired: false,
      publicAccess: true,
      api: '/api/turner-bison-telemetry',
      registry: {
        documentRef: registry.documentRef,
        sources: registry.sources,
        reconciliationSlices: registry.reconciliationSlices,
      },
      stream,
    });
  } catch (err) {
    console.error('[turner-bison-telemetry]', err);
    return res.status(500).json({
      ok: false,
      code: 'telemetry_error',
      message: err.message || 'Telemetry pipeline failed',
    });
  }
};
