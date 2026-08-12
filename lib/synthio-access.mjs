/**
 * Synthio (Syntheverse Sandbox) — creator-only access gate.
 * Guests and unsigned seats cannot open Synthio request handling.
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
  if (!base.ok || base.privilege !== 'creator') {
    return {
      ...base,
      ok: false,
      reason:
        base.privilege === 'guest'
          ? 'Synthio is creator-only. Guest Lattice seats cannot open this agent.'
          : base.reason || 'Synthio requires a creator seat.',
      agent: SYNTHIO_AGENT_ID,
    };
  }
  return {
    ...base,
    ok: true,
    reason: 'Synthio creator seat.',
    agent: SYNTHIO_AGENT_ID,
  };
}

export function isSynthioCreatorEmail(rawEmail) {
  const email = normalizeEmail(rawEmail);
  if (!email || !isValidEmailShape(email)) return false;
  return listCreatorEmails().includes(email);
}

export { normalizeEmail, isValidEmailShape, listCreatorEmails };
