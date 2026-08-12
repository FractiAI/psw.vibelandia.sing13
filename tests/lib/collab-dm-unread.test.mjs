import { describe, expect, it } from 'vitest';
import { countUnreadDms, isIncomingCollabDm, unreadCountForPeer } from '../../apps/lattice-chat/src/feed/dm.ts';

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
});
