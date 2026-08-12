/**
 * Synthio access — any Lattice allowlisted seat (creator or guest).
 * Reuses Lattice email allowlist; Synthio UI captures Lattice BYOK keys on the edge.
 */
import {
  checkLatticeEmailAccess,
  normalizeEmail,
  isValidEmailShape,
  listCreatorEmails,
} from './lattice-access.mjs';

export const SYNTHIO_AGENT_ID = 'Synthio.sandbox';
export const SYNTHIO_DISPLAY_NAME = 'Synthio';

/**
 * @returns {{
 *   ok: boolean,
 *   reason: string,
 *   privilege: 'creator' | 'guest' | 'none',
 *   email: string,
 *   expiresAt: string | null,
 *   agent: string,
 * }}
 */
export function checkSynthioAccess(rawEmail) {
  const base = checkLatticeEmailAccess(rawEmail);
  if (!base.ok) {
    return {
      ...base,
      ok: false,
      reason: base.reason || 'Synthio requires a Lattice allowlisted email.',
      agent: SYNTHIO_AGENT_ID,
    };
  }
  return {
    ...base,
    ok: true,
    reason:
      base.privilege === 'guest'
        ? 'Synthio guest seat · Lattice session.'
        : 'Synthio creator seat · Lattice session.',
    agent: SYNTHIO_AGENT_ID,
  };
}

export function isSynthioCreatorEmail(rawEmail) {
  const email = normalizeEmail(rawEmail);
  if (!email || !isValidEmailShape(email)) return false;
  return listCreatorEmails().includes(email);
}

export { normalizeEmail, isValidEmailShape, listCreatorEmails };
