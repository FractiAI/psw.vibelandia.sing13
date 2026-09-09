/**
 * Let's Chat · personal network registry (Blob-backed when configured).
 * Boarding is email-only inside Let's Chat — not Lattice Chat allowlist.
 * Roster = accepted edges only; invites use Let's Chat peer ids (lc_*).
 */
import { list, put } from '@vercel/blob';
import {
  CREATOR_EMAIL,
  normalizeEmail,
  isValidEmailShape,
  listCreatorEmails,
} from './lattice-access.mjs';
import { resolveLetsChatPeerId, displayNameFromEmail } from './lets-chat-peers.mjs';

const BLOB_PATH = 'lets-chat/network-v1.json';
const PEER_ID_RE = /^lc_[a-f0-9]{14}$/;
/** Purser seat — new guests auto-link here and generate an approval message. */
export const LETS_CHAT_PURSER_EMAIL = CREATOR_EMAIL || 'valetpru@gmail.com';

const mem =
  globalThis.__letsChatNetwork ||
  (globalThis.__letsChatNetwork = {
    doc: emptyDoc(),
    loaded: false,
  });

function emptyDoc() {
  return {
    version: 1,
    users: {},
    invites: {},
    edges: {},
  };
}

function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function blobRead(path) {
  if (!blobConfigured()) return null;
  try {
    const { blobs } = await list({ prefix: path, limit: 8 });
    const hit = blobs.find((b) => b.pathname === path) ?? blobs[0];
    if (!hit?.url) return null;
    const res = await fetch(`${hit.url}${hit.url.includes('?') ? '&' : '?'}_=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('[lets-chat-network] blob read', path, e);
    return null;
  }
}

async function blobWrite(path, data) {
  if (!blobConfigured()) return false;
  try {
    await put(path, JSON.stringify(data), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 3,
    });
    return true;
  } catch (e) {
    console.error('[lets-chat-network] blob write', path, e);
    return false;
  }
}

function edgeKey(a, b) {
  return [a, b].sort().join(':');
}

function inviteKey(toPeerId, fromPeerId) {
  return `${toPeerId}|${fromPeerId}`;
}

function isPeerId(id) {
  return typeof id === 'string' && PEER_ID_RE.test(id.trim());
}

async function loadDoc() {
  if (blobConfigured()) {
    const data = await blobRead(BLOB_PATH);
    if (data && typeof data === 'object') {
      mem.doc = {
        version: 1,
        users: data.users && typeof data.users === 'object' ? data.users : {},
        invites: data.invites && typeof data.invites === 'object' ? data.invites : {},
        edges: data.edges && typeof data.edges === 'object' ? data.edges : {},
      };
      mem.loaded = true;
      return mem.doc;
    }
  }
  if (!mem.loaded) {
    mem.doc = emptyDoc();
    mem.loaded = true;
  }
  return mem.doc;
}

async function saveDoc(doc) {
  mem.doc = doc;
  mem.loaded = true;
  if (blobConfigured()) {
    await blobWrite(BLOB_PATH, {
      ...doc,
      updatedAt: new Date().toISOString(),
    });
  }
}

function findUserByPeerId(doc, peerId) {
  for (const user of Object.values(doc.users)) {
    if (user?.peerId === peerId) return user;
  }
  return null;
}

function privilegeForEmail(email) {
  const creators = new Set(listCreatorEmails());
  return creators.has(email) ? 'creator' : 'guest';
}

function ensureUserOnDoc(doc, email) {
  const peerId = resolveLetsChatPeerId(email);
  if (!peerId) return null;
  const existing = doc.users[email];
  const privilege = privilegeForEmail(email);
  const name = existing?.name || displayNameFromEmail(email);
  doc.users[email] = {
    email,
    peerId,
    name,
    privilege,
    createdAt: existing?.createdAt || new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };
  return doc.users[email];
}

function ensureAcceptedEdge(doc, peerA, peerB) {
  if (!peerA || !peerB || peerA === peerB) return false;
  const ek = edgeKey(peerA, peerB);
  if (doc.edges[ek]?.status === 'accepted') return false;
  const sorted = [peerA, peerB].sort();
  doc.edges[ek] = { a: sorted[0], b: sorted[1], status: 'accepted', at: Date.now() };
  // Clear any pending invites either direction.
  delete doc.invites[inviteKey(peerA, peerB)];
  delete doc.invites[inviteKey(peerB, peerA)];
  return true;
}

/**
 * Generated Purser approval message for a new guest seat.
 * @param {{ email: string, peerId: string, name: string }} seat
 */
export function buildPurserApprovalMessage(seat) {
  const to = LETS_CHAT_PURSER_EMAIL;
  const subject = `Let's Chat approval · ${seat.email}`;
  const body = [
    'Hello Purser (valetpru),',
    '',
    'Please approve my Let\'s Chat seat on SS Vibelandia.',
    '',
    `Name: ${seat.name}`,
    `Email: ${seat.email}`,
    `Let's Chat id: ${seat.peerId}`,
    '',
    'I boarded at /lets-chat and am ready for Fair Exchange hospitality.',
    '',
    'Thank you,',
    seat.name,
  ].join('\n');
  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { to, subject, body, mailto };
}

/**
 * Board (or refresh) a Let's Chat seat from email — no Lattice grant required.
 * New guests: auto-link to Purser (valetpru) private network + approval message payload.
 * @param {string} rawEmail
 */
export async function boardLetsChat(rawEmail) {
  const email = normalizeEmail(rawEmail);
  if (!email || !isValidEmailShape(email)) {
    return { ok: false, message: 'Enter a valid email to come aboard.' };
  }
  const peerId = resolveLetsChatPeerId(email);
  if (!peerId) {
    return { ok: false, message: 'Enter a valid email to come aboard.' };
  }
  const doc = await loadDoc();
  const isNew = !doc.users[email];
  const user = ensureUserOnDoc(doc, email);
  const privilege = user.privilege;

  let linkedPurser = false;
  let approval = null;
  if (privilege !== 'creator' && email !== normalizeEmail(LETS_CHAT_PURSER_EMAIL)) {
    const purserEmail = normalizeEmail(LETS_CHAT_PURSER_EMAIL);
    const purser = ensureUserOnDoc(doc, purserEmail);
    if (purser) {
      linkedPurser = ensureAcceptedEdge(doc, peerId, purser.peerId) || Boolean(doc.edges[edgeKey(peerId, purser.peerId)]);
    }
    if (isNew) {
      approval = buildPurserApprovalMessage({ email, peerId, name: user.name });
      doc.users[email].approvalRequestedAt = new Date().toISOString();
    } else if (!doc.users[email].approvalRequestedAt) {
      approval = buildPurserApprovalMessage({ email, peerId, name: user.name });
      doc.users[email].approvalRequestedAt = new Date().toISOString();
    }
  }

  await saveDoc(doc);
  return {
    ok: true,
    email,
    peerId,
    name: user.name,
    privilege,
    isNew,
    linkedPurser,
    approval,
  };
}

/**
 * @param {string} peerId
 * @returns {Promise<object | null>}
 */
export async function getLetsChatUserByPeerId(peerId) {
  if (!isPeerId(peerId)) return null;
  const doc = await loadDoc();
  return findUserByPeerId(doc, peerId.trim());
}

/**
 * Accepted personal-network peers for a seat (never the global ship roster).
 * @param {string} myPeerId
 */
export async function listNetworkPeers(myPeerId) {
  const doc = await loadDoc();
  const peers = [];
  for (const edge of Object.values(doc.edges)) {
    if (!edge || edge.status !== 'accepted') continue;
    const other = edge.a === myPeerId ? edge.b : edge.b === myPeerId ? edge.a : null;
    if (!other) continue;
    const user = findUserByPeerId(doc, other);
    if (!user) continue;
    peers.push({
      id: user.peerId,
      name: user.name,
      privilege: user.privilege === 'creator' ? 'creator' : 'guest',
    });
  }
  return peers.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Invites waiting for this peer to accept.
 * @param {string} myPeerId
 */
export async function listPendingInvites(myPeerId) {
  const doc = await loadDoc();
  const pending = [];
  for (const invite of Object.values(doc.invites)) {
    if (!invite || invite.toPeerId !== myPeerId) continue;
    const from = findUserByPeerId(doc, invite.fromPeerId);
    pending.push({
      fromPeerId: invite.fromPeerId,
      fromName: from?.name || 'Guest',
      at: invite.at,
    });
  }
  return pending.sort((a, b) => (b.at || 0) - (a.at || 0));
}

/**
 * True when two peers share an accepted edge.
 */
export async function areNetworkPeers(peerA, peerB) {
  if (!peerA || !peerB || peerA === peerB) return false;
  const doc = await loadDoc();
  const edge = doc.edges[edgeKey(peerA, peerB)];
  return Boolean(edge && edge.status === 'accepted');
}

/**
 * Invite someone into your personal network by their Let's Chat id.
 * Instant mutual add — both private networks update immediately (no pending accept).
 * @param {string} fromPeerId
 * @param {string} toPeerIdRaw
 */
export async function inviteByPeerId(fromPeerId, toPeerIdRaw) {
  const toPeerId = String(toPeerIdRaw || '').trim().toLowerCase();
  if (!isPeerId(fromPeerId) || !isPeerId(toPeerId)) {
    return { ok: false, code: 'invalid_peer_id', message: 'Use a valid Let\'s Chat id (lc_…).' };
  }
  if (fromPeerId === toPeerId) {
    return { ok: false, code: 'self_invite', message: 'You cannot invite your own id.' };
  }
  const doc = await loadDoc();
  const target = findUserByPeerId(doc, toPeerId);
  if (!target) {
    return {
      ok: false,
      code: 'unknown_peer',
      message: 'That Let\'s Chat id is not aboard yet. Ask them to Come aboard first, then invite with +.',
    };
  }
  const ek = edgeKey(fromPeerId, toPeerId);
  if (doc.edges[ek]?.status === 'accepted') {
    return {
      ok: true,
      alreadyConnected: true,
      connected: true,
      peer: { id: target.peerId, name: target.name, privilege: target.privilege },
    };
  }
  ensureAcceptedEdge(doc, fromPeerId, toPeerId);
  await saveDoc(doc);
  return {
    ok: true,
    connected: true,
    accepted: true,
    peer: { id: target.peerId, name: target.name, privilege: target.privilege },
  };
}

/**
 * Accept a pending invite from another peer.
 * @param {string} myPeerId
 * @param {string} fromPeerIdRaw
 */
export async function acceptInvite(myPeerId, fromPeerIdRaw) {
  const fromPeerId = String(fromPeerIdRaw || '').trim().toLowerCase();
  if (!isPeerId(myPeerId) || !isPeerId(fromPeerId)) {
    return { ok: false, code: 'invalid_peer_id', message: 'Use a valid Let\'s Chat id (lc_…).' };
  }
  const doc = await loadDoc();
  const ik = inviteKey(myPeerId, fromPeerId);
  if (!doc.invites[ik]) {
    return { ok: false, code: 'no_invite', message: 'No pending invite from that id.' };
  }
  const from = findUserByPeerId(doc, fromPeerId);
  if (!from) {
    return { ok: false, code: 'unknown_peer', message: 'That guest is no longer aboard.' };
  }
  delete doc.invites[ik];
  const sorted = [myPeerId, fromPeerId].sort();
  doc.edges[edgeKey(myPeerId, fromPeerId)] = {
    a: sorted[0],
    b: sorted[1],
    status: 'accepted',
    at: Date.now(),
  };
  await saveDoc(doc);
  return {
    ok: true,
    peer: { id: from.peerId, name: from.name, privilege: from.privilege },
  };
}

/** Decline / cancel a pending invite. */
export async function declineInvite(myPeerId, fromPeerIdRaw) {
  const fromPeerId = String(fromPeerIdRaw || '').trim().toLowerCase();
  const doc = await loadDoc();
  const ik = inviteKey(myPeerId, fromPeerId);
  if (doc.invites[ik]) {
    delete doc.invites[ik];
    await saveDoc(doc);
  }
  return { ok: true };
}

/** Test helper — clear in-memory network (does not delete Blob). */
export function resetLetsChatNetworkForTests() {
  mem.doc = emptyDoc();
  mem.loaded = true;
}
