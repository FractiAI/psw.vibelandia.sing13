/**
 * GET /api/lattice-agent-status — durable background-agent receipt
 * (survives missing chat replies in Cloud Agent / Lattice long runs)
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
    const { readAgentStatus, AGENT_STATUS_SCHEMA } = await import(
      '../lib/lattice-agent-status.mjs'
    );
    const status = readAgentStatus();
    if (!status) {
      return res.status(200).json({
        ok: true,
        schema: AGENT_STATUS_SCHEMA,
        status: null,
        hint: 'No receipt yet. Agents write via scripts/write-agent-status.mjs',
      });
    }
    return res.status(200).json({ ok: true, status });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: 'status_read_failed',
      message: err?.message || String(err),
    });
  }
};
