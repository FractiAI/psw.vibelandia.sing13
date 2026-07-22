/**
 * Lattice V1.618 — old-school email allowlist (no passwords).
 * Creator email is permanent (server-side only — do not expose in public UI copy).
 * Guest grants last ~30 days.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ACCESS_PATH = join(__dirname, '..', 'data', 'lattice-access.json');
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
export const CREATOR_EMAIL = 'valetpru@gmail.com';

export function normalizeEmail(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

export function isValidEmailShape(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function loadAccessFile() {
  try {
    const raw = readFileSync(ACCESS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { creatorEmail: CREATOR_EMAIL, grants: [] };
  }
}

function creatorOf(doc) {
  return normalizeEmail(doc.creatorEmail || CREATOR_EMAIL) || CREATOR_EMAIL;
}

/**
 * @returns {{
 *   ok: boolean,
 *   reason: string,
 *   privilege: 'creator' | 'guest' | 'none',
 *   email: string,
 *   expiresAt: string | null,
 * }}
 */
export function checkLatticeEmailAccess(rawEmail) {
  const email = normalizeEmail(rawEmail);
  if (!email || !isValidEmailShape(email)) {
    return {
      ok: false,
      reason: 'Enter a valid email address to continue.',
      privilege: 'none',
      email,
      expiresAt: null,
    };
  }

  const doc = loadAccessFile();
  const creator = creatorOf(doc);
  if (email === creator) {
    return {
      ok: true,
      reason: 'Permanent access.',
      privilege: 'creator',
      email,
      expiresAt: null,
    };
  }

  const grants = Array.isArray(doc.grants) ? doc.grants : [];
  const hit = grants.find((g) => normalizeEmail(g?.email) === email);
  if (!hit) {
    return {
      ok: false,
      reason: 'No Lattice access for this email yet. Use Sign up to request access.',
      privilege: 'none',
      email,
      expiresAt: null,
    };
  }

  const grantedAt = hit.grantedAt ? new Date(hit.grantedAt).getTime() : NaN;
  const expiresAtMs = hit.expiresAt
    ? new Date(hit.expiresAt).getTime()
    : Number.isFinite(grantedAt)
      ? grantedAt + MONTH_MS
      : NaN;

  if (!Number.isFinite(expiresAtMs) || Date.now() > expiresAtMs) {
    return {
      ok: false,
      reason: 'Access expired (one-month guest window). Sign up again to request renewal.',
      privilege: 'none',
      email,
      expiresAt: Number.isFinite(expiresAtMs) ? new Date(expiresAtMs).toISOString() : null,
    };
  }

  return {
    ok: true,
    reason: 'Guest access — one month from grant.',
    privilege: 'guest',
    email,
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
}

/** Build a new grant record (for scripts / ops). */
export function makeGuestGrant(email, now = new Date()) {
  const normalized = normalizeEmail(email);
  const grantedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + MONTH_MS).toISOString();
  return { email: normalized, grantedAt, expiresAt, durationDays: 30 };
}
