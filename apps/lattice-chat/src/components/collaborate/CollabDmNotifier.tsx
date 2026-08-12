import { useEffect } from 'react';
import { useUnifiedFeed, startCollabDmBridge } from '@/feed/store';
import { countUnreadDms } from '@/feed/dm';

/** Floating toast + document title when a Collaborate DM is received. */
export function CollabDmNotifier({
  onOpenCollaborate,
}: {
  onOpenCollaborate?: () => void;
} = {}) {
  const dmToast = useUnifiedFeed((s) => s.dmToast);
  const clearDmToast = useUnifiedFeed((s) => s.clearDmToast);
  const openPeerDm = useUnifiedFeed((s) => s.openPeerDm);
  const items = useUnifiedFeed((s) => s.items);
  const dmLastReadAt = useUnifiedFeed((s) => s.dmLastReadAt);
  const unread = countUnreadDms(items, dmLastReadAt);

  useEffect(() => startCollabDmBridge(), []);

  useEffect(() => {
    const base = 'Lattice Chat Agent V1.618';
    if (unread > 0) {
      document.title = `(${unread}) Collaborate DM · ${base}`;
    } else {
      document.title = base;
    }
  }, [unread]);

  useEffect(() => {
    if (!dmToast) return;
    const id = window.setTimeout(() => clearDmToast(), 6500);
    return () => window.clearTimeout(id);
  }, [dmToast, clearDmToast]);

  if (!dmToast) return null;

  return (
    <div className="dm-toast" role="status" aria-live="polite">
      <button
        type="button"
        className="dm-toast__card"
        onClick={() => {
          openPeerDm(dmToast.peerId);
          onOpenCollaborate?.();
          clearDmToast();
        }}
      >
        <span className="dm-toast__pill">Direct message</span>
        <strong className="dm-toast__from">{dmToast.peerName}</strong>
        <span className="dm-toast__body">{dmToast.body || 'New message'}</span>
      </button>
      <button type="button" className="dm-toast__dismiss" aria-label="Dismiss" onClick={() => clearDmToast()}>
        ×
      </button>
    </div>
  );
}

/** Compact unread badge for Collaborate entry points. */
export function CollabDmBadge({ className }: { className?: string } = {}) {
  const items = useUnifiedFeed((s) => s.items);
  const dmLastReadAt = useUnifiedFeed((s) => s.dmLastReadAt);
  const unread = countUnreadDms(items, dmLastReadAt);
  if (unread <= 0) return null;
  return (
    <span className={className || 'collab-dm-badge'} aria-label={`${unread} unread direct messages`}>
      {unread > 9 ? '9+' : unread}
    </span>
  );
}
