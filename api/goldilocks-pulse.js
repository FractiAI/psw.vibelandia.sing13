/**
 * GET /api/goldilocks-pulse — latest signed 10-minute coherence pulse + history.
 * POST — force emit pulse (secret matches GOLDILOCKS_PULSE_SECRET or catalog secret).
 */
module.exports = async function handler(req, res) {
  const { runGoldilocksPulse, getGoldilocksPulseState, OPERATIONAL_ANCHOR } = await import(
    '../lib/goldilocks-pulse.mjs'
  );

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') return res.status(204).end();

  function readSecret() {
    const q = req.query?.secret;
    if (q) return String(q);
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      return body.secret ? String(body.secret) : '';
    } catch {
      return '';
    }
  }

  function secretOk() {
    const want = readSecret();
    const keys = ['GOLDILOCKS_PULSE_SECRET', 'CATALOG_UPLOAD_SECRET', 'QUESTFEST_CATALOG_UPLOAD_SECRET'];
    for (const k of keys) {
      const env = process.env[k];
      if (env && want === String(env).trim()) return true;
    }
    return false;
  }

  try {
    const { ensureMiningRailAutopilot } = await import('../lib/mining-rail.mjs');

    if (req.method === 'POST') {
      if (!secretOk()) {
        return res.status(401).json({ ok: false, code: 'unauthorized', message: 'Invalid pulse secret.' });
      }
      await ensureMiningRailAutopilot();
      const out = await runGoldilocksPulse({ force: true });
      return res.status(200).json({ ok: true, emitted: out.emitted, latest: out.latest, history: out.history });
    }

    if (req.method === 'GET') {
      await ensureMiningRailAutopilot();
      const out = await runGoldilocksPulse({ force: req.query?.force === '1' });
      const state = await getGoldilocksPulseState();
      return res.status(200).json({
        ok: true,
        emitted: out.emitted,
        humanInterventionRequired: false,
        autopilot: true,
        operationalAnchor: OPERATIONAL_ANCHOR,
        api: '/api/goldilocks-pulse',
        cadenceSec: state.cadenceSec,
        latest: state.latest,
        history: state.history,
      });
    }

    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({ ok: false, message: 'GET or POST only' });
  } catch (err) {
    console.error('[goldilocks-pulse]', err);
    return res.status(500).json({
      ok: false,
      code: 'pulse_error',
      message: err.message || 'Pulse generation failed',
      operationalAnchor: OPERATIONAL_ANCHOR,
    });
  }
};
