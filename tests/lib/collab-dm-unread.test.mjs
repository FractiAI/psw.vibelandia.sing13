import { describe, expect, it } from 'vitest';
import { countUnreadDms, isIncomingCollabDm, unreadCountForPeer } from '../../apps/lattice-chat/src/feed/dm.ts';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('collaborate DM unread helpers', () => {
  const items = [
    {
      id: '1',
      kind: 'chat',
      platform: 'lattice',
      actor: 'You',
      body: 'hi',
      createdAt: '2026-08-12T10:00:00.000Z',
      threadPeerId: 'peer_a',
    },
    {
      id: '2',
      kind: 'chat',
      platform: 'lattice',
      actor: 'Valet Pru',
      body: 'hello back',
      createdAt: '2026-08-12T10:01:00.000Z',
      threadPeerId: 'peer_a',
    },
    {
      id: '3',
      kind: 'chat',
      platform: 'lattice',
      actor: 'Daniel',
      body: 'ping',
      createdAt: '2026-08-12T10:02:00.000Z',
      threadPeerId: 'peer_b',
    },
  ];

  it('detects incoming collab DMs', () => {
    expect(isIncomingCollabDm(items[0])).toBe(false);
    expect(isIncomingCollabDm(items[1])).toBe(true);
  });

  it('counts unread by last-read watermark', () => {
    expect(countUnreadDms(items, {})).toBe(2);
    expect(countUnreadDms(items, { peer_a: '2026-08-12T10:01:00.000Z' })).toBe(1);
    expect(unreadCountForPeer(items, 'peer_a', {})).toBe(1);
    expect(unreadCountForPeer(items, 'peer_a', { peer_a: '2026-08-12T10:01:30.000Z' })).toBe(0);
  });

  it('stays unread until watermark advances (open ≠ read)', () => {
    // Opening a peer thread must not invent a watermark — only markDmRead does.
    expect(countUnreadDms(items, {})).toBe(2);
    expect(unreadCountForPeer(items, 'peer_b', {})).toBe(1);
    expect(countUnreadDms(items, { peer_b: '2026-08-12T10:01:59.000Z' })).toBe(2);
    expect(countUnreadDms(items, { peer_b: '2026-08-12T10:02:00.000Z' })).toBe(1);
  });
});

describe('collaborate DM click-through wiring', () => {
  it('keeps Lattice Chat quicklinks badge while unread (no path force-clear)', () => {
    const js = readFileSync(join(root, 'interfaces/site-quicklinks.js'), 'utf8');
    expect(js).toContain('lattice-collab.unread.v1');
    expect(js).toContain('Keep badge while Collaborate DMs remain unread — even on /lattice-chat.');
    expect(js).not.toMatch(
      /Clear badge when user is on the lattice-chat page[\s\S]{0,80}n = 0/,
    );
  });

  it('SPA opens Collaborate DM without marking read on activate', () => {
    const store = readFileSync(join(root, 'apps/lattice-chat/src/feed/store.ts'), 'utf8');
    expect(store).toContain('Navigate only — unread stays until the DM thread is actually viewed');
    expect(store).toMatch(/setDmActivePeerId\(peerId\) \{\s*\/\/ Navigate only/);
    expect(store).toContain('dmFocusMessageId');
    const chat = readFileSync(join(root, 'apps/lattice-chat/src/components/ChatPane.tsx'), 'utf8');
    expect(chat).toContain('jumpToCollabDm');
    expect(chat).toContain('bubble--collab-jump');
    expect(chat).toContain('collab-dm-inline');
  });
});
