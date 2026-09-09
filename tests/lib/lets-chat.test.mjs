import { describe, it, expect, beforeEach } from 'vitest';
import {
  EGS_FRONTAL_CONSTANT,
  letsChatThreadId,
  resolveLetsChatPeerId,
} from '../../lib/lets-chat-peers.mjs';
import {
  areNetworkPeers,
  boardLetsChat,
  inviteByPeerId,
  listNetworkPeers,
  resetLetsChatNetworkForTests,
} from '../../lib/lets-chat-network.mjs';
import { deriveThreadKeyMaterial } from '../../lib/lets-chat-crypto.mjs';
import {
  pushEnvelope,
  pullInbox,
  resetLetsChatSignalForTests,
  sanitizeEnvelope,
  setPresence,
  snapshotPresence,
} from '../../lib/lets-chat-signal.mjs';

describe('lets-chat-peers', () => {
  it('resolves stable peer ids for any valid email (not Lattice allowlist)', () => {
    expect(resolveLetsChatPeerId('valetpru@gmail.com')).toMatch(/^lc_[a-f0-9]{14}$/);
    expect(resolveLetsChatPeerId('brand-new-guest@example.com')).toMatch(/^lc_/);
    expect(resolveLetsChatPeerId('not-an-email')).toBeNull();
  });

  it('uses order-independent thread ids', () => {
    const a = resolveLetsChatPeerId('valetpru@gmail.com');
    const b = resolveLetsChatPeerId('brand-new-guest@example.com');
    expect(letsChatThreadId(a, b)).toBe(letsChatThreadId(b, a));
  });

  it('exports EGS frontal constant near phi', () => {
    expect(Number(EGS_FRONTAL_CONSTANT)).toBeCloseTo(1.618, 3);
  });
});

describe('lets-chat-network', () => {
  beforeEach(() => resetLetsChatNetworkForTests());

  it('boards a new guest, auto-links Purser, and generates valetpru approval message', async () => {
    const seat = await boardLetsChat('fresh.guest@example.com');
    expect(seat.ok).toBe(true);
    expect(seat.peerId).toMatch(/^lc_/);
    expect(seat.isNew).toBe(true);
    expect(seat.approval?.to).toBe('valetpru@gmail.com');
    expect(seat.approval?.body).toContain(seat.peerId);
    expect(seat.approval?.mailto).toMatch(/^mailto:/);
    const peers = await listNetworkPeers(seat.peerId);
    expect(peers.some((p) => p.id === resolveLetsChatPeerId('valetpru@gmail.com'))).toBe(true);
  });

  it('invites by peer id and instantly adds both private networks', async () => {
    const a = await boardLetsChat('alice.network@example.com');
    const b = await boardLetsChat('bob.network@example.com');
    expect(a.ok && b.ok).toBe(true);

    const invite = await inviteByPeerId(a.peerId, b.peerId);
    expect(invite.ok).toBe(true);
    expect(invite.connected).toBe(true);
    expect(await areNetworkPeers(a.peerId, b.peerId)).toBe(true);

    const aPeers = await listNetworkPeers(a.peerId);
    const bPeers = await listNetworkPeers(b.peerId);
    expect(aPeers.map((p) => p.id)).toContain(b.peerId);
    expect(bPeers.map((p) => p.id)).toContain(a.peerId);
  });

  it('rejects unknown peer ids and does not leak global roster', async () => {
    const a = await boardLetsChat('solo@example.com');
    const miss = await inviteByPeerId(a.peerId, 'lc_deadbeefdeadbe');
    expect(miss.ok).toBe(false);
    expect(miss.code).toBe('unknown_peer');
    // solo still only sees Purser, not arbitrary peers
    const peers = await listNetworkPeers(a.peerId);
    expect(peers.every((p) => p.id !== 'lc_deadbeefdeadbe')).toBe(true);
  });
});

describe('lets-chat-crypto', () => {
  it('derives deterministic thread key material', () => {
    const a = resolveLetsChatPeerId('valetpru@gmail.com');
    const b = resolveLetsChatPeerId('danielarifriedman@gmail.com');
    const one = deriveThreadKeyMaterial(a, b);
    const two = deriveThreadKeyMaterial(b, a);
    expect(one.threadId).toBe(two.threadId);
    expect(one.keyBytes.equals(two.keyBytes)).toBe(true);
  });
});

describe('lets-chat-signal', () => {
  beforeEach(() => resetLetsChatSignalForTests());

  it('allows larger ciphertext for photo and file kinds', () => {
    const photo = sanitizeEnvelope({
      id: 'lc_photo_1',
      kind: 'photo',
      fromPeerId: 'lc_peer_a',
      toPeerId: 'lc_peer_b',
      threadId: 'lc_peer_a:lc_peer_b',
      ciphertext: 'x'.repeat(50_000),
    });
    expect(photo).toBeTruthy();
    const msg = sanitizeEnvelope({
      id: 'lc_msg_1',
      kind: 'msg',
      fromPeerId: 'lc_peer_a',
      toPeerId: 'lc_peer_b',
      threadId: 'lc_peer_a:lc_peer_b',
      ciphertext: 'x'.repeat(20_000),
    });
    expect(msg).toBeNull();
  });

  it('relays ciphertext envelopes without persisting beyond memory', async () => {
    const env = sanitizeEnvelope({
      id: 'lc_test_1',
      fromPeerId: 'lc_peer_a',
      toPeerId: 'lc_peer_b',
      threadId: 'lc_peer_a:lc_peer_b',
      ciphertext: 'cipher_blob',
    });
    expect(env).toBeTruthy();
    await pushEnvelope(env);
    const inbox = await pullInbox({ toPeerId: 'lc_peer_b', since: 0 });
    expect(inbox).toHaveLength(1);
    expect(inbox[0].ciphertext).toBe('cipher_blob');
  });

  it('tracks ephemeral DND presence and clears when set offline', async () => {
    await setPresence('lc_peer_a', { dnd: true, label: 'dnd' });
    expect((await snapshotPresence()).lc_peer_a.dnd).toBe(true);
    await setPresence('lc_peer_a', { dnd: false, label: 'online' });
    expect((await snapshotPresence()).lc_peer_a.dnd).toBe(false);
    expect((await snapshotPresence()).lc_peer_a.label).toBe('online');
  });
});

describe('lets-chat surfaces', () => {
  it('ships standalone app and intro pages with personal-network invite UX', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const root = join(process.cwd());
    const app = readFileSync(join(root, 'interfaces/lets-chat.html'), 'utf8');
    const intro = readFileSync(join(root, 'interfaces/lets-chat-intro.html'), 'utf8');
    const css = readFileSync(join(root, 'interfaces/lets-chat.css'), 'utf8');
    const client = readFileSync(join(root, 'interfaces/lets-chat-client.js'), 'utf8');
    expect(app).toContain('lets-chat-client.js');
    expect(app).toContain('lc-chat-list');
    expect(app).toContain('lc-shell');
    expect(app).toContain('lc-back-btn');
    expect(app).toContain('id="lc-dnd-btn"');
    expect(app).toContain('id="lc-dnd-btn-thread"');
    expect(app).toContain('lc-dnd-toggle');
    expect(app).toContain('id="lc-invite-form"');
    expect(app).toContain('id="lc-my-id"');
    expect(app).toContain('id="lc-add-btn"');
    expect(app).toContain('id="lc-approval-send"');
    expect(app).not.toContain('No Lattice access');
    expect(css).toContain('.lc-dnd-toggle');
    expect(css).toContain('.lc-unread-badge');
    expect(css).toContain('.lc-invite');
    expect(css).toContain('.lc-add-btn');
    expect(client).toContain('function toggleDnd');
    expect(client).toContain("localStorage.removeItem(STORAGE_DND)");
    expect(client).toContain('letschat.unread.v1');
    expect(client).toContain('lc-unread-badge');
    expect(client).toContain('inviteById');
    expect(client).toContain('?invite=1');
    expect(client).toContain('toggleInvitePanel');
    expect(client).toContain('sendApprovalMessage');
    expect(intro).toContain('No harvesting');
    expect(intro).toContain('Predators never welcome');
    expect(intro).toContain('personal network');
    expect(intro).toContain('Let\'s Chat id');
  });
});
