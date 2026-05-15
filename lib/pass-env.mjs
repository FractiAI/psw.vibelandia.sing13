/**
 * Resolve HS256 secret for Passenger pass JWTs (boarding + export + heartbeat verify).
 *
 * Primary: PASS_TOKEN_SECRET (≥16 chars). Also accepts common alternates so existing
 * Vercel projects do not need a duplicate secret under a second name.
 *
 * Non-production opt-in: set QUESTFEST_ALLOW_INSECURE_PASS_SIGNING=1 only on Preview
 * or local dev if you intentionally skip a real secret (tokens are forgeable — never
 * use on Production).
 */

const MIN_LEN = 16;

const ENV_KEYS = [
  'PASS_TOKEN_SECRET',
  'JWT_SECRET',
  'AUTH_SECRET',
  'QUESTFEST_PASS_TOKEN_SECRET',
];

function firstTrimmedSecret() {
  for (const key of ENV_KEYS) {
    const raw = process.env[key];
    if (raw == null) continue;
    const t = String(raw).trim();
    if (t.length >= MIN_LEN) return t;
  }
  return null;
}

function insecureDevSecret() {
  const flag = process.env.QUESTFEST_ALLOW_INSECURE_PASS_SIGNING;
  if (flag !== '1' && flag !== 'true') return null;

  if (process.env.VERCEL === '1') {
    if (process.env.VERCEL_ENV === 'production') return null;
    if (process.env.VERCEL_ENV !== 'preview' && process.env.VERCEL_ENV !== 'development') return null;
  } else if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (typeof console !== 'undefined' && console.warn) {
    console.warn(
      '[questfest] QUESTFEST_ALLOW_INSECURE_PASS_SIGNING: using fixed dev signer (Preview/local only).',
    );
  }
  return 'qv-insecure-dev-signer-do-not-use-in-prod-32b';
}

export function getPassTokenSecret() {
  return firstTrimmedSecret() ?? insecureDevSecret();
}

export const PASS_TOKEN_SECRET_SETUP_MESSAGE =
  'Server signing is off — add PASS_TOKEN_SECRET (≥16 chars) under Vercel → Project → Settings → Environment Variables → Production, redeploy. Preview/dev only (never Production): QUESTFEST_ALLOW_INSECURE_PASS_SIGNING=1.';

