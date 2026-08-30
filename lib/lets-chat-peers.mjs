/**
 * Let's Chat · guest roster (creators count as guests on this surface).
 * Seating derives from lattice-access.json — no separate signup.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkLatticeEmailAccess, listCreatorEmails, normalizeEmail } from './lattice-access.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ACCESS_PATH = join(__dirname, '..', 'data', 'lattice-access.json');

export const LETS_CHAT_PRODUCT = "Let's Chat";

/** EGS frontal constant — catalog key for fractal encryption salt (not a physics claim). */
export const EGS_FRONTAL_CONSTANT = String((1 + Math.sqrt(5)) / 2);

/** Deterministic peer id from email (stable across sessions). */
export function resolveLetsChatPeerId(rawEmail) {
  const email = normalizeEmail(rawEmail);
  if (!email) return null;
  const access = checkLatticeEmailAccess(email);
  if (!access.ok) return null;
  const digest = createHash('sha256').update(`lets-chat:v1:${email}`).digest('hex');
  return `lc_${digest.slice(0, 14)}`;
}

function displayNameFromEmail(email, grant) {
  if (grant?.displayName && typeof grant.displayName === 'string') {
    return grant.displayName.trim().slice(0, 40);
  }
  const local = email.split('@')[0] || 'Guest';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function loadGrantsMap() {
  try {
    const raw = readFileSync(ACCESS_PATH, 'utf8');
    const doc = JSON.parse(raw);
    const map = new Map();
    for (const g of Array.isArray(doc.grants) ? doc.grants : []) {
      const e = normalizeEmail(g?.email);
      if (e) map.set(e, g);
    }
    return map;
  } catch {
    return new Map();
  }
}

/**
 * All allowlisted Let's Chat seats (creators + active guests).
 * @returns {{ id: string, email: string, name: string, privilege: 'creator' | 'guest' }[]}
 */
export function listLetsChatPeers() {
  const grantsMap = loadGrantsMap();
  const creators = listCreatorEmails();
  const seen = new Set();
  const peers = [];

  for (const email of creators) {
    if (seen.has(email)) continue;
    seen.add(email);
    const id = resolveLetsChatPeerId(email);
    if (!id) continue;
    peers.push({
      id,
      email,
      name: displayNameFromEmail(email, grantsMap.get(email)),
      privilege: 'creator',
    });
  }

  for (const [email, grant] of grantsMap) {
    if (seen.has(email)) continue;
    const access = checkLatticeEmailAccess(email);
    if (!access.ok) continue;
    seen.add(email);
    const id = resolveLetsChatPeerId(email);
    if (!id) continue;
    peers.push({
      id,
      email,
      name: displayNameFromEmail(email, grant),
      privilege: access.privilege === 'creator' ? 'creator' : 'guest',
    });
  }

  return peers.sort((a, b) => a.name.localeCompare(b.name));
}

/** Thread id for a pair of peers (order-independent). */
export function letsChatThreadId(peerA, peerB) {
  return [peerA, peerB].sort().join(':');
}
