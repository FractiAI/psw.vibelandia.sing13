import { describe, it, expect, beforeEach } from 'vitest';
import {
  EGS_FRONTAL_CONSTANT,
  letsChatThreadId,
  listLetsChatPeers,
  resolveLetsChatPeerId,
} from '../../lib/lets-chat-peers.mjs';
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
  it('resolves stable peer ids for creators and guests', () => {
    expect(resolveLetsChatPeerId('valetpru@gmail.com')).toMatch(/^lc_[a-f0-9]{14}$/);
    expect(resolveLetsChatPeerId('danielarifriedman@gmail.com')).toMatch(/^lc_/);
    expect(resolveLetsChatPeerId('not-a-seat@example.com')).toBeNull();
  });

  it('lists allowlisted peers including creators', () => {
    const peers = listLetsChatPeers();
    expect(peers.length).toBeGreaterThanOrEqual(2);
    expect(peers.some((p) => p.email === 'valetpru@gmail.com')).toBe(true);
    expect(peers.some((p) => p.email === 'danielarifriedman@gmail.com')).toBe(true);
  });

  it('uses order-independent thread ids', () => {
    const a = resolveLetsChatPeerId('valetpru@gmail.com');
    const b = resolveLetsChatPeerId('danielarifriedman@gmail.com');
    expect(letsChatThreadId(a, b)).toBe(letsChatThreadId(b, a));
  });

  it('exports EGS frontal constant near phi', () => {
    expect(Number(EGS_FRONTAL_CONSTANT)).toBeCloseTo(1.618, 3);
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

  it('relays ciphertext envelopes without persisting beyond memory', () => {
    const env = sanitizeEnvelope({
      id: 'lc_test_1',
      fromPeerId: 'lc_peer_a',
      toPeerId: 'lc_peer_b',
      threadId: 'lc_peer_a:lc_peer_b',
      ciphertext: 'cipher_blob',
    });
    expect(env).toBeTruthy();
    pushEnvelope(env);
    const inbox = pullInbox({ toPeerId: 'lc_peer_b', since: 0 });
    expect(inbox).toHaveLength(1);
    expect(inbox[0].ciphertext).toBe('cipher_blob');
  });

  it('tracks ephemeral DND presence', () => {
    setPresence('lc_peer_a', { dnd: true, label: 'dnd' });
    expect(snapshotPresence().lc_peer_a.dnd).toBe(true);
  });
});

describe('lets-chat surfaces', () => {
  it('ships standalone app and intro pages', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const root = join(process.cwd());
    const app = readFileSync(join(root, 'interfaces/lets-chat.html'), 'utf8');
    const intro = readFileSync(join(root, 'interfaces/lets-chat-intro.html'), 'utf8');
    expect(app).toContain('lets-chat-client.js');
    expect(intro).toContain('No harvesting');
    expect(intro).toContain('Predators never welcome');
  });
});
