/**
 * Best-effort stream lock: in-memory per warm serverless instance.
 * For production fleet-wide locks, swap to Redis / Supabase presence + same contract.
 */
const TTL_MS = 120_000;

const store =
  globalThis.__qvHb ||
  (globalThis.__qvHb = new Map());

function prune() {
  const now = Date.now();
  for (const [k, v] of store) {
    if (now - v.lastSeen > TTL_MS) store.delete(k);
  }
}

module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    prune();

    if (req.method === 'GET') {
      const jti = req.query?.jti;
      const deviceId = req.query?.deviceId;
      if (!jti || !deviceId) {
        return res.status(400).json({ error: 'jti and deviceId required' });
      }
      const row = store.get(String(jti));
      if (!row) {
        return res.status(200).json({ activeDeviceId: null, kill: false });
      }
      const kill = row.activeDeviceId !== deviceId;
      return res.status(200).json({
        activeDeviceId: row.activeDeviceId,
        kill,
        lastSeen: row.lastSeen,
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'object' && req.body ? req.body : {};
      const jti = body.jti;
      const deviceId = body.deviceId;
      if (!jti || !deviceId) {
        return res.status(400).json({ error: 'jti and deviceId required' });
      }
      const now = Date.now();
      store.set(String(jti), {
        activeDeviceId: String(deviceId),
        lastSeen: now,
      });
      return res.status(200).json({
        ok: true,
        activeDeviceId: String(deviceId),
      });
    }

    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({ error: 'method not allowed' });
  } catch {
    return res.status(500).json({ error: 'server' });
  }
};
