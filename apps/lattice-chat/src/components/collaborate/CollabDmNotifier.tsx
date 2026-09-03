import { useEffect } from 'react';
import { useUnifiedFeed, startCollabDmBridge } from '@/feed/store';
import { countUnreadDms } from '@/feed/dm';
import { syncCollaborateDms } from '@/feed/syncCollaborateDms';
import { applyTabFaviconBadge } from '@/lib/tabFavicon';

/** Floating toast + document title + tab favicon badge when a Collaborate DM is received. */
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

  // Keep Collaborate DMs flowing while on Lattice Chat (not only inside Collaborate).
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) void syncCollaborateDms();
    };
    run();
    const id = window.setInterval(run, 12_000);
    const onVis = () => {
      if (document.visibilityState === 'visible') run();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  useEffect(() => {
    const base = 'Infinite Octaves Omniversal Lattice Chat';
    if (unread > 0) {
      document.title = `(${unread}) Collaborate DM · ${base}`;
    } else {
      document.title = base;
    }
    applyTabFaviconBadge(unread);

    // Broadcast unread count to other tabs / the site-quicklinks badge.
    try {
      localStorage.setItem('lattice-collab.unread.v1', String(unread));
    } catch (_) {}
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        new BroadcastChannel('lattice-collab-unread-v1').postMessage({ total: unread });
      }
    } catch (_) {}
  }, [unread]);

  // Toast stays until clicked or dismissed — dismissing does NOT mark read.

  if (!dmToast) return null;

  return (
    <div className="dm-toast" role="status" aria-live="polite">
      <button
        type="button"
        className="dm-toast__card"
        onClick={() => {
          openPeerDm(dmToast.peerId, { focusMessageId: dmToast.id });
          onOpenCollaborate?.();
          clearDmToast();
        }}
      >
        <span className="dm-toast__pill">Direct message</span>
        <strong className="dm-toast__from">{dmToast.peerName}</strong>
        <span className="dm-toast__body">{dmToast.body || 'New message'}</span>
        <span className="dm-toast__cta">Open in Collaborate chat</span>
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
