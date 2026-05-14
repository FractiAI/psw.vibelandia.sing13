import crypto from 'node:crypto';

const PASS_TTL_SEC = 30 * 24 * 60 * 60; // 30-day monthly pass

function b64url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function b64urlJson(obj) {
  return b64url(JSON.stringify(obj));
}

export function signPassToken(payload, secret) {
  if (!secret || secret.length < 16) {
    throw new Error('PASS_TOKEN_SECRET missing or too short');
  }
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    tier: 'PASSENGER',
    egsMonthlyUsd: 16.18,
    iat: now,
    exp: now + PASS_TTL_SEC,
    ...payload,
  };
  const h = b64urlJson(header);
  const p = b64urlJson(body);
  const sig = crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest();
  return `${h}.${p}.${b64url(sig)}`;
}

export function verifyPassToken(token, secret) {
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const expected = b64url(
    crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest(),
  );
  if (s !== expected) return null;
  try {
    const pad = p.length % 4 === 0 ? '' : '='.repeat(4 - (p.length % 4));
    const json = Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64').toString(
      'utf8',
    );
    const payload = JSON.parse(json);
    if (payload.tier !== 'PASSENGER') return null;
    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export { PASS_TTL_SEC };
