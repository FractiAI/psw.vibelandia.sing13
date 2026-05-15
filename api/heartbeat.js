/**
 * Single-active-stream heartbeat — Upstash Redis when configured, else in-memory per instance.
 */
let passLib;
let upstashLib;

async function libs() {
  if (!passLib) {
    passLib = await import('../lib/pass-token.mjs');
    upstashLib = await import('../lib/upstash.mjs');
  }
  return { passLib, upstashLib };
}

const TTL_SEC = 120;

const memStore =
  globalThis.__qvHb || (globalThis.__qvHb = new Map());

function pruneMem() {
  const now = Date.now();
  for (const [k, v] of memStore) {
    if (now - v.lastSeen > TTL_SEC * 1000) memStore.delete(k);
  }
}

async function readRow(jti) {
  const { upstashLib } = await libs();
  if (upstashLib.upstashConfigured()) {
    return upstashLib.redisGetJson(`qv:hb:${jti}`);
  }
  pruneMem();
  return memStore.get(String(jti)) ?? null;
}

async function writeRow(jti, deviceId) {
  const { upstashLib } = await libs();
  const row = { activeDeviceId: String(deviceId), lastSeen: Date.now() };
  if (upstashLib.upstashConfigured()) {
    await upstashLib.redisSetJson(`qv:hb:${jti}`, row, TTL_SEC);
  } else {
    memStore.set(String(jti), row);
  }
  return row;
}

function readBody(req) {
  if (typeof req.body === 'object' && req.body) return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

async function optionalVerifyToken(token) {
  if (!token) return true;
  const { getPassTokenSecret } = await import('../lib/pass-env.mjs');
  const secret = getPassTokenSecret();
  if (!secret) return true;
  const { passLib } = await libs();
  return !!passLib.verifyPassToken(String(token), secret);
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const jti = req.query?.jti;
      const deviceId = req.query?.deviceId;
      if (!jti || !deviceId) {
        return res.status(400).json({ error: 'jti and deviceId required' });
      }
      const row = await readRow(jti);
      const { upstashLib } = await libs();
      const backend = upstashLib.upstashConfigured() ? 'upstash' : 'memory';
      if (!row) {
        return res.status(200).json({ activeDeviceId: null, kill: false, backend });
      }
      const kill = row.activeDeviceId !== deviceId;
      return res.status(200).json({
        activeDeviceId: row.activeDeviceId,
        kill,
        lastSeen: row.lastSeen,
        backend,
      });
    }

    if (req.method === 'POST') {
      const body = readBody(req);
      const jti = body.jti;
      const deviceId = body.deviceId;
      const token = body.token;
      if (!jti || !deviceId) {
        return res.status(400).json({ error: 'jti and deviceId required' });
      }
      if (!(await optionalVerifyToken(token))) {
        return res.status(401).json({ error: 'invalid_pass' });
      }
      const row = await writeRow(jti, deviceId);
      const { upstashLib } = await libs();
      return res.status(200).json({
        ok: true,
        activeDeviceId: row.activeDeviceId,
        backend: upstashLib.upstashConfigured() ? 'upstash' : 'memory',
      });
    }

    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({ error: 'method not allowed' });
  } catch {
    return res.status(500).json({ error: 'server' });
  }
};
