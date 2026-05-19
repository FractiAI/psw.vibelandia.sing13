/**
 * Boarding is client-only honor (QUESTFEST Bridge).
 * Pass is stored in localStorage on the device — no server JWT required for playback.
 */
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  return res.status(410).json({
    ok: false,
    error: 'client_only_honor_boarding',
    message:
      'Members pass is honor-based on this device only. Use the Bridge boarding flow — no POST /api/boarding.',
    clientOnly: true,
    honorStorageKey: 'qv-local-monthly-honor',
  });
};
