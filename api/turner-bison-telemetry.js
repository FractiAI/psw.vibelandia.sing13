/**
 * GET /api/turner-bison-telemetry — live NSPFRNP herd stream (NOAA + RF + registry).
 * Query:
 *   refresh=1 — force new ingest cycle.
 *   start=YYYY-MM-DD&end=YYYY-MM-DD — date-range model synthesis (soil history × radar fuse).
 *   sample=96 — optional sample head count for range mode (8–128).
 */
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ ok: false, message: 'GET only' });
  }

  const q = req.query || {};
  const start = typeof q.start === 'string' ? q.start : '';
  const end = typeof q.end === 'string' ? q.end : '';
  const hasRange = start.length > 0 && end.length > 0;

  if (hasRange) {
    res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=90');
  }

  try {
    const { loadPublicRegistry } = await import('../lib/turner-bison-herd.mjs');

    if (hasRange) {
      const { runTurnerBisonTimeseries, MAX_SAMPLE_HEADS } = await import('../lib/turner-bison-timeseries.mjs');
      let sample = parseInt(String(q.sample || '96'), 10);
      if (!Number.isFinite(sample)) sample = 96;
      sample = Math.min(Math.max(sample, 8), MAX_SAMPLE_HEADS);
      const series = await runTurnerBisonTimeseries({ startDate: start, endDate: end, sampleSize: sample });
      if (!series.ok) {
        return res.status(400).json({
          ok: false,
          code: series.error || 'range_invalid',
          message: series.message || 'Invalid date range',
        });
      }
      const registry = await loadPublicRegistry();
      return res.status(200).json({
        ok: true,
        mode: 'range',
        api: '/api/turner-bison-telemetry',
        registry: {
          documentRef: registry.documentRef,
          sources: registry.sources,
        },
        series,
      });
    }

    const { getTurnerBisonStream } = await import('../lib/turner-bison-herd.mjs');
    const refresh = q.refresh === '1' || q.refresh === 'true';
    const stream = await getTurnerBisonStream({ refresh });
    const registry = await loadPublicRegistry();

    return res.status(200).json({
      ok: true,
      mode: 'live',
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
