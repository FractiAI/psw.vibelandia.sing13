/**
 * Manual Fair Exchange boarding — Venmo / PayPal / Cash App (no Stripe).
 * Honor system: user confirms paid + date + email + rail; we issue 30-day Passenger JWT and log for audit.
 */
const crypto = require('node:crypto');

const RAILS = new Set(['venmo', 'paypal', 'cashapp']);
const LOG_KEY = 'qv:boarding:log';

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

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { signPassToken } = await import('../lib/pass-token.mjs');
  const { redisLpush, upstashConfigured } = await import('../lib/upstash.mjs');
  const { getPassTokenSecret, PASS_TOKEN_SECRET_SETUP_MESSAGE } = await import('../lib/pass-env.mjs');

  const secret = getPassTokenSecret();
  if (!secret) {
    return res.status(503).json({
      error: 'boarding_unconfigured',
      message: PASS_TOKEN_SECRET_SETUP_MESSAGE,
    });
  }

  const { validateHonorAttestation } = require('./honor-attest.js');

  const body = readBody(req);
  const rail = String(body.rail || '').toLowerCase();

  if (!RAILS.has(rail)) {
    return res.status(400).json({ error: 'invalid_rail' });
  }

  const honor = validateHonorAttestation(body);
  if (!honor.ok) {
    return res.status(honor.status).json({ error: honor.code, message: honor.message });
  }

  const receipt = `honor:boarding:v1|${honor.paidDate}|${honor.email}|${rail}`;
  const sub = honor.email;

  const jti = crypto.randomUUID();

  const token = signPassToken(
    {
      sub,
      jti,
      rail,
      receiptHash: crypto.createHash('sha256').update(receipt).digest('hex').slice(0, 16),
    },
    secret,
  );

  const logEntry = JSON.stringify({
    ts: new Date().toISOString(),
    rail,
    jti,
    honor: true,
    paidDate: honor.paidDate,
    email: honor.email,
    receiptFingerprint: 'honor_boarding_v1',
    upstash: upstashConfigured(),
  });

  if (upstashConfigured()) {
    await redisLpush(LOG_KEY, logEntry);
  } else {
    const mem = globalThis.__qvBoardingLog || (globalThis.__qvBoardingLog = []);
    mem.unshift(logEntry);
    if (mem.length > 200) mem.length = 200;
  }

  const payload = JSON.parse(
    Buffer.from(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(),
  );

  return res.status(200).json({
    ok: true,
    token,
    tier: 'PASSENGER',
    jti,
    expiresAt: payload.exp,
    egsMonthlyUsd: 16.18,
    message:
      'Pass issued on Fair Exchange honor. Abuse revokes access. Old school — you paid, you ride.',
  });
};
