/**
 * Lattice V1.618 — old-school email allowlist (no passwords).
 * Creator (valetpru@gmail.com) is permanent. Guest grants last ~30 days.
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
 *   contactEmail: string,
 * }}
 */
export function checkLatticeEmailAccess(rawEmail) {
  const email = normalizeEmail(rawEmail);
  const contactEmail = CREATOR_EMAIL;
  if (!email || !isValidEmailShape(email)) {
    return {
      ok: false,
      reason: 'Enter a valid email address to continue.',
      privilege: 'none',
      email,
      expiresAt: null,
      contactEmail,
    };
  }

  const doc = loadAccessFile();
  const creator = creatorOf(doc);
  if (email === creator) {
    return {
      ok: true,
      reason: 'Creator privilege — permanent access.',
      privilege: 'creator',
      email,
      expiresAt: null,
      contactEmail,
    };
  }

  const grants = Array.isArray(doc.grants) ? doc.grants : [];
  const hit = grants.find((g) => normalizeEmail(g?.email) === email);
  if (!hit) {
    return {
      ok: false,
      reason: `No Lattice access for this email. Email ${contactEmail} for access and pricing.`,
      privilege: 'none',
      email,
      expiresAt: null,
      contactEmail,
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
      reason: `Access expired (one-month guest window). Email ${contactEmail} to renew.`,
      privilege: 'none',
      email,
      expiresAt: Number.isFinite(expiresAtMs) ? new Date(expiresAtMs).toISOString() : null,
      contactEmail,
    };
  }

  return {
    ok: true,
    reason: 'Guest access — one month from grant.',
    privilege: 'guest',
    email,
    expiresAt: new Date(expiresAtMs).toISOString(),
    contactEmail,
  };
}

/** Build a new grant record (for scripts / ops). */
export function makeGuestGrant(email, now = new Date()) {
  const normalized = normalizeEmail(email);
  const grantedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + MONTH_MS).toISOString();
  return { email: normalized, grantedAt, expiresAt, durationDays: 30 };
}
