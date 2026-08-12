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
