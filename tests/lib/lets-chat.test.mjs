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
  buildInviteMailto,
  inviteByEmail,
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

  it('boards a new guest, auto-links Purser, and sends in-app approval DM', async () => {
    const seat = await boardLetsChat('fresh.guest@example.com');
    expect(seat.ok).toBe(true);
    expect(seat.approvalDmSent).toBe(true);
    const purserId = resolveLetsChatPeerId('valetpru@gmail.com');
    expect(await areNetworkPeers(seat.peerId, purserId)).toBe(true);
    const inbox = await pullInbox({ toPeerId: purserId, since: 0 });
    expect(inbox.some((e) => e.kind === 'approval' && e.fromPeerId === seat.peerId)).toBe(true);
  });

  it('invites by email with mailto intro and auto-links when invitee boards', async () => {
    const a = await boardLetsChat('alice.invite@example.com');
    const invite = await inviteByEmail(a.peerId, 'bob.invite@example.com');
    expect(invite.ok).toBe(true);
    expect(invite.pending).toBe(true);
    expect(invite.mailto.href).toMatch(/^mailto:/);
    expect(invite.mailto.body).toContain('/lets-chat');
    expect(invite.mailto.body).toContain('Lattice Chat');
    expect(invite.mailto.subject).toContain("Let's Chat");

    const b = await boardLetsChat('bob.invite@example.com');
    expect(b.ok).toBe(true);
    expect(await areNetworkPeers(a.peerId, b.peerId)).toBe(true);
  });

  it('invites an already-boarded email with instant mutual network + mailto', async () => {
    const a = await boardLetsChat('carol.invite@example.com');
    const b = await boardLetsChat('dave.invite@example.com');
    const invite = await inviteByEmail(a.peerId, 'dave.invite@example.com');
    expect(invite.ok).toBe(true);
    expect(invite.connected).toBe(true);
    expect(invite.mailto.href).toMatch(/^mailto:/);
    expect(await areNetworkPeers(a.peerId, b.peerId)).toBe(true);
  });

  it('builds invite mailto without peer ids', () => {
    const m = buildInviteMailto({
      inviterName: 'Valet',
      inviterEmail: 'valetpru@gmail.com',
      toEmail: 'friend@example.com',
    });
    expect(m.body).not.toMatch(/lc_[a-f0-9]{14}/);
    expect(m.body).toContain('ssvibelandiaquestfest24x365.com/lets-chat');
  });

  it('lets Purser approve from the DM', async () => {
    const seat = await boardLetsChat('needs.approval@example.com');
    const approved = await approveGuestByPeerId('valetpru@gmail.com', seat.peerId);
    expect(approved.ok).toBe(true);
    expect(approved.peer.approved).toBe(true);
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
  });

  it('relays ciphertext envelopes', async () => {
    const env = sanitizeEnvelope({
      id: 'lc_test_1',
      fromPeerId: 'lc_peer_a',
      toPeerId: 'lc_peer_b',
      threadId: 'lc_peer_a:lc_peer_b',
      ciphertext: 'cipher_blob',
    });
    await pushEnvelope(env);
    const inbox = await pullInbox({ toPeerId: 'lc_peer_b', since: 0 });
    expect(inbox).toHaveLength(1);
  });

  it('tracks ephemeral DND presence', async () => {
    await setPresence('lc_peer_a', { dnd: true, label: 'dnd' });
    expect((await snapshotPresence()).lc_peer_a.dnd).toBe(true);
  });
});

describe('lets-chat surfaces', () => {
  it('hides peer ids and invites by email only', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const root = join(process.cwd());
    const app = readFileSync(join(root, 'interfaces/lets-chat.html'), 'utf8');
    const intro = readFileSync(join(root, 'interfaces/lets-chat-intro.html'), 'utf8');
    const client = readFileSync(join(root, 'interfaces/lets-chat-client.js'), 'utf8');
    expect(app).toContain('id="lc-add-btn"');
    expect(app).toContain('id="lc-invite-email"');
    expect(app).not.toContain('lc-my-id');
    expect(app).not.toContain('lc-copy-id');
    expect(app).not.toContain('Copy id');
    expect(app).not.toContain('lc_…');
    expect(app.toLowerCase()).not.toContain('copy id');
    expect(client).toContain('inviteByEmail');
    expect(client).not.toContain('copyMyId');
    expect(client).not.toContain('lc-my-id');
    expect(intro).toContain('inviting friends by email');
    expect(intro).not.toContain('lc_…');
  });
});
