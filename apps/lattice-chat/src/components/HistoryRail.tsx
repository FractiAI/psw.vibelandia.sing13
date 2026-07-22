import { useEffect } from 'react';
import { useLatticeStore } from '@/store';
import { isRememberedEmailFresh } from '@/access';

export function HistoryRail({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const threads = useLatticeStore((s) => s.threads);
  const activeThreadId = useLatticeStore((s) => s.activeThreadId);
  const userEmail = useLatticeStore((s) => s.userEmail);
  const emailRememberedAt = useLatticeStore((s) => s.emailRememberedAt);
  const newChat = useLatticeStore((s) => s.newChat);
  const selectThread = useLatticeStore((s) => s.selectThread);
  const renameThread = useLatticeStore((s) => s.renameThread);
  const deleteThread = useLatticeStore((s) => s.deleteThread);

  const sorted = [...threads].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  const pastChats = sorted.filter((t) => t.messages.length > 0 || t.id === activeThreadId);

  const signedIn = isRememberedEmailFresh(userEmail, emailRememberedAt);

  function handleNewChat() {
    newChat();
    onClose?.();
  }

  function handleSelect(id: string) {
    selectThread(id);
    onClose?.();
  }

  return (
    <aside
      className={`history-rail${open ? ' is-open' : ''}`}
      aria-label="Chat history"
    >
      <div className="rail-top">
        <div className="rail-brand">
          <p className="wordmark">Lattice</p>
          <p className="byline">V1.618 · FractiAI</p>
        </div>
        {onClose ? (
          <button type="button" className="rail-close" aria-label="Close sidebar" onClick={onClose}>
            ×
          </button>
        ) : null}
      </div>

      <button
        type="button"
        className="new-chat"
        onClick={handleNewChat}
        disabled={!signedIn}
      >
        <span className="new-chat-plus" aria-hidden="true">
          +
        </span>
        New chat
      </button>

      <div className="rail-section">
        <h2 className="rail-section-title">Past chats</h2>
        <ul className="thread-list">
          {!signedIn ? (
            <li className="thread-empty">Sign in to keep chats on this device</li>
          ) : pastChats.length === 0 ? (
            <li className="thread-empty">No past chats yet</li>
          ) : (
            pastChats.map((t) => (
              <li key={t.id} className={t.id === activeThreadId ? 'active' : undefined}>
                <button
                  type="button"
                  className="thread-select"
                  onClick={() => handleSelect(t.id)}
                  title={t.title}
                >
                  {t.title}
                </button>
                <div className="thread-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Rename chat"
                    onClick={() => {
                      const next = window.prompt('Rename chat', t.title);
                      if (next != null) renameThread(t.id, next);
                    }}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="icon-btn danger"
                    aria-label="Delete chat"
                    onClick={() => {
                      if (window.confirm('Delete this chat?')) deleteThread(t.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <p className="edge-note">Chats stay on this device — like Cursor history.</p>
    </aside>
  );
}

/** Mobile / narrow: overlay backdrop when the Cursor-style sidebar is open. */
export function HistoryRailOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return <button type="button" className="rail-backdrop" aria-label="Close chats" onClick={onClose} />;
}
