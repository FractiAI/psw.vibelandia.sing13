/** Collaborate DM helpers — unread + incoming detection. */
import type { UnifiedFeedItem } from '@/feed/types';

export const DM_BROADCAST_CHANNEL = 'lattice-collab-dm-v1';

export function isIncomingCollabDm(item: UnifiedFeedItem | null | undefined): boolean {
  if (!item) return false;
  return (
    item.kind === 'chat' &&
    item.platform === 'lattice' &&
    Boolean(item.threadPeerId) &&
    item.actor !== 'You'
  );
}

export function countUnreadDms(
  items: UnifiedFeedItem[],
  lastReadAt: Record<string, string>,
): number {
  let n = 0;
  for (const item of items) {
    if (!isIncomingCollabDm(item) || !item.threadPeerId) continue;
    const readAt = lastReadAt[item.threadPeerId];
    if (!readAt || item.createdAt > readAt) n += 1;
  }
  return n;
}

export function unreadCountForPeer(
  items: UnifiedFeedItem[],
  peerId: string,
  lastReadAt: Record<string, string>,
): number {
  let n = 0;
  const readAt = lastReadAt[peerId];
  for (const item of items) {
    if (!isIncomingCollabDm(item) || item.threadPeerId !== peerId) continue;
    if (!readAt || item.createdAt > readAt) n += 1;
  }
  return n;
}

export type DmToastState = {
  id: string;
  peerId: string;
  peerName: string;
  body: string;
  createdAt: string;
};

export type UnreadDmPeerSummary = {
  peerId: string;
  peerName: string;
  body: string;
  createdAt: string;
  count: number;
};

/** Latest unread Collaborate DM per peer — for Lattice Chat inbox strip. */
export function latestUnreadDmsByPeer(
  items: UnifiedFeedItem[],
  lastReadAt: Record<string, string>,
): UnreadDmPeerSummary[] {
  const byPeer = new Map<string, UnreadDmPeerSummary>();
  for (const item of items) {
    if (!isIncomingCollabDm(item) || !item.threadPeerId) continue;
    const readAt = lastReadAt[item.threadPeerId];
    if (readAt && item.createdAt <= readAt) continue;
    const prev = byPeer.get(item.threadPeerId);
    const next: UnreadDmPeerSummary = {
      peerId: item.threadPeerId,
      peerName: item.actor || prev?.peerName || 'Seat',
      body: (item.body || prev?.body || 'New message').slice(0, 140),
      createdAt: item.createdAt,
      count: (prev?.count || 0) + 1,
    };
    if (!prev || item.createdAt >= prev.createdAt) {
      byPeer.set(item.threadPeerId, next);
    } else {
      byPeer.set(item.threadPeerId, { ...prev, count: next.count });
    }
  }
  return [...byPeer.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** Stable feed id when mirroring a shared-agent seat message into Collaborate DM unread. */
export function agentMirrorDmId(messageId: string): string {
  return `agent_mirror_${messageId}`;
}
