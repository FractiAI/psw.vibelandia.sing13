/**
 * GET /api/mining-rail — read-only autopilot status (fixed operational anchor).
 * POST not allowed on the public web.
 */
module.exports = async function handler(req, res) {
  const { getMiningRail, ensureMiningRailAutopilot } = await import('../lib/mining-rail.mjs');

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=10, stale-while-revalidate=30');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      await ensureMiningRailAutopilot();
      const rail = await getMiningRail();
      return res.status(200).json({
        ok: true,
        readOnly: true,
        changesDisabled: true,
        ...rail,
      });
    }

    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({
      ok: false,
      readOnly: true,
      code: 'read_only',
      message: 'Mining rail is display-only. Payout is fixed to the operational anchor.',
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      code: err.code || 'rail_error',
      message: err.message || 'Mining rail error',
    });
  }
};
