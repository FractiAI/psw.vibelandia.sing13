/**
 * Let's Chat · peer ids + helpers.
 * Peer ids are deterministic from email (lc_*). Seating / network lives in lets-chat-network.mjs —
 * not lattice-access.json (Lattice Chat BYOK allowlist stays separate).
 */
import { createHash } from 'node:crypto';
import { normalizeEmail, isValidEmailShape } from './lattice-access.mjs';

export const LETS_CHAT_PRODUCT = "Let's Chat";

/** EGS frontal constant — catalog key for fractal encryption salt (not a physics claim). */
export const EGS_FRONTAL_CONSTANT = String((1 + Math.sqrt(5)) / 2);

/**
 * Deterministic peer id from email (stable across sessions).
 * Does not require Lattice Chat allowlist — any valid email shape resolves.
 * @param {string} rawEmail
 * @returns {string | null}
 */
export function resolveLetsChatPeerId(rawEmail) {
  const email = normalizeEmail(rawEmail);
  if (!email || !isValidEmailShape(email)) return null;
  const digest = createHash('sha256').update(`lets-chat:v1:${email}`).digest('hex');
  return `lc_${digest.slice(0, 14)}`;
}

/**
 * @param {string} email
 * @param {{ displayName?: string } | null} [grant]
 */
export function displayNameFromEmail(email, grant = null) {
  if (grant?.displayName && typeof grant.displayName === 'string') {
    return grant.displayName.trim().slice(0, 40);
  }
  const local = String(email || '').split('@')[0] || 'Guest';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

/** Thread id for a pair of peers (order-independent). */
export function letsChatThreadId(peerA, peerB) {
  return [peerA, peerB].sort().join(':');
}
