import { describe, it, expect, beforeEach } from 'vitest';
import {
  EGS_FRONTAL_CONSTANT,
  letsChatThreadId,
  resolveLetsChatPeerId,
} from '../../lib/lets-chat-peers.mjs';
import {
  approveGuestByPeerId,
  areNetworkPeers,
  boardLetsChat,
  inviteByPeerId,
  listNetworkPeers,
  resetLetsChatNetworkForTests,
} from '../../lib/lets-chat-network.mjs';
import { deriveThreadKeyMaterial, encryptLetsChatPlaintext } from '../../lib/lets-chat-crypto.mjs';
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
  beforeEach(() => {
    resetLetsChatNetworkForTests();
    resetLetsChatSignalForTests();
  });

  it('boards a new guest, auto-links Purser, and sends in-app approval DM (no mailto)', async () => {
    const seat = await boardLetsChat('fresh.guest@example.com');
    expect(seat.ok).toBe(true);
    expect(seat.peerId).toMatch(/^lc_/);
    expect(seat.isNew).toBe(true);
    expect(seat.approvalDmSent).toBe(true);
    expect(seat.approval).toBeUndefined();
    const purserId = resolveLetsChatPeerId('valetpru@gmail.com');
    expect(await areNetworkPeers(seat.peerId, purserId)).toBe(true);
    const inbox = await pullInbox({ toPeerId: purserId, since: 0 });
    expect(inbox.some((e) => e.kind === 'approval' && e.fromPeerId === seat.peerId)).toBe(true);
  });

  it('lets Purser approve from the DM and confirms in-app', async () => {
    const seat = await boardLetsChat('needs.approval@example.com');
    const approved = await approveGuestByPeerId('valetpru@gmail.com', seat.peerId);
    expect(approved.ok).toBe(true);
    expect(approved.peer.approved).toBe(true);
    const guestInbox = await pullInbox({ toPeerId: seat.peerId, since: 0 });
    expect(guestInbox.some((e) => e.kind === 'msg' && e.fromPeerId === resolveLetsChatPeerId('valetpru@gmail.com'))).toBe(
      true,
    );
  });

  it('invites by peer id and instantly adds both private networks', async () => {
    const a = await boardLetsChat('alice.network@example.com');
    const b = await boardLetsChat('bob.network@example.com');
    expect(a.ok && b.ok).toBe(true);

    const invite = await inviteByPeerId(a.peerId, b.peerId);
    expect(invite.ok).toBe(true);
    expect(invite.connected).toBe(true);
    expect(await areNetworkPeers(a.peerId, b.peerId)).toBe(true);
  });

  it('rejects unknown peer ids', async () => {
    const a = await boardLetsChat('solo@example.com');
    const miss = await inviteByPeerId(a.peerId, 'lc_deadbeefdeadbe');
    expect(miss.ok).toBe(false);
    expect(miss.code).toBe('unknown_peer');
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

  it('encrypts server-side approval payloads', () => {
    const a = resolveLetsChatPeerId('valetpru@gmail.com');
    const b = resolveLetsChatPeerId('fresh.guest@example.com');
    const enc = encryptLetsChatPlaintext(a, b, '{"type":"approval_request"}');
    expect(enc.threadId).toBe(letsChatThreadId(a, b));
    expect(enc.ciphertext.length).toBeGreaterThan(20);
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
  it('ships + invite and in-app Purser approval (no mailto)', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const root = join(process.cwd());
    const app = readFileSync(join(root, 'interfaces/lets-chat.html'), 'utf8');
    const intro = readFileSync(join(root, 'interfaces/lets-chat-intro.html'), 'utf8');
    const css = readFileSync(join(root, 'interfaces/lets-chat.css'), 'utf8');
    const client = readFileSync(join(root, 'interfaces/lets-chat-client.js'), 'utf8');
    expect(app).toContain('id="lc-add-btn"');
    expect(app).toContain('id="lc-invite-form"');
    expect(app).not.toContain('lc-approval-send');
    expect(app).not.toContain('mailto:valetpru');
    expect(css).toContain('.lc-add-btn');
    expect(css).toContain('.lc-msg__approve');
    expect(client).toContain('approveGuest');
    expect(client).toContain('?approve=1');
    expect(client).toContain("env.kind === 'approval'");
    expect(client).not.toContain('sendApprovalMessage');
    expect(intro).toContain('in-app');
    expect(intro).toContain('Approve');
    expect(intro).toContain('No harvesting');
  });
});
