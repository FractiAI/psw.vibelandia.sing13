/**
 * Per-track export license — active monthly Passenger JWT + Fair Exchange honor or receipt proof.
 */
const crypto = require('node:crypto');

const RAILS = new Set(['venmo', 'paypal', 'cashapp']);
const LOG_KEY = 'qv:export:log';
const EXPORT_USD = 1.61;

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { verifyPassToken } = await import('../lib/pass-token.mjs');
  const { redisLpush, upstashConfigured } = await import('../lib/upstash.mjs');
  const { getPassTokenSecret, PASS_TOKEN_SECRET_SETUP_MESSAGE } = await import('../lib/pass-env.mjs');

  const secret = getPassTokenSecret();
  if (!secret) {
    return res.status(503).json({
      error: 'export_unconfigured',
      message: PASS_TOKEN_SECRET_SETUP_MESSAGE,
    });
  }

  const { validateHonorAttestation } = require('./honor-attest.js');

  const body = readBody(req);
  const authHeader = String(req.headers.authorization || '');
  const passToken =
    String(body.passToken || '').trim() ||
    (authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '');

  const passenger = verifyPassToken(passToken, secret);
  if (!passenger) {
    return res.status(401).json({
      error: 'monthly_pass_required',
      message: 'Active Machote Magazine members pass required before track download.',
    });
  }

  const rail = String(body.rail || '').toLowerCase();
  const trackId = String(body.trackId || '').trim();
  const trackTitle = String(body.trackTitle || '').trim();

  if (!trackId) {
    return res.status(400).json({ error: 'track_id_required' });
  }
  if (!RAILS.has(rail)) {
    return res.status(400).json({ error: 'invalid_rail' });
  }

  const honorConfirm = body.honorConfirm === true || body.honorConfirm === 'true';
  let receipt = String(body.receipt || '').trim();
  let honorMeta = null;

  if (honorConfirm) {
    const honor = validateHonorAttestation(body);
    if (!honor.ok) {
      return res.status(honor.status).json({ error: honor.code, message: honor.message });
    }
    receipt = `honor:export:v1|${honor.paidDate}|${honor.email}|${rail}|${trackId}`;
    honorMeta = { paidDate: honor.paidDate, email: honor.email };
  } else if (receipt.length < 3) {
    return res.status(400).json({
      error: 'receipt_required',
      message: 'Confirm payment on the honor system, or paste txn id / @handle.',
    });
  }

  const licenseId = crypto.randomUUID();
  const logEntry = JSON.stringify({
    ts: new Date().toISOString(),
    licenseId,
    trackId,
    trackTitle: trackTitle || null,
    rail,
    passengerJti: passenger.jti,
    passengerSub: passenger.sub,
    exportUsd: EXPORT_USD,
    honor: !!honorMeta,
    honorPaidDate: honorMeta?.paidDate ?? null,
    honorEmail: honorMeta?.email ?? null,
    receiptLen: receipt.length,
    receiptHash: crypto.createHash('sha256').update(receipt).digest('hex').slice(0, 16),
    upstash: upstashConfigured(),
  });

  if (upstashConfigured()) {
    await redisLpush(LOG_KEY, logEntry);
  } else {
    const mem = globalThis.__qvExportLog || (globalThis.__qvExportLog = []);
    mem.unshift(logEntry);
    if (mem.length > 500) mem.length = 500;
  }

  return res.status(200).json({
    ok: true,
    licenseId,
    trackId,
    exportUsd: EXPORT_USD,
    passengerJti: passenger.jti,
    message: 'Export licensed. Save the file to your device for offline play.',
  });
};
