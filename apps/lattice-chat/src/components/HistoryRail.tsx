import { useLatticeStore } from '@/store';
import { isRememberedEmailFresh } from '@/access';
import { SignedInBar } from '@/components/AuthPanel';

export function HistoryRail() {
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

  const signedIn = isRememberedEmailFresh(userEmail, emailRememberedAt);

  return (
    <aside className="history-rail" aria-label="Chat history">
      <div className="rail-brand">
        <p className="wordmark">Lattice V1.618</p>
        <p className="byline">by FractiAI</p>
        <p className="edge-note">Histories stay on this device</p>
      </div>

      {signedIn ? (
        <SignedInBar />
      ) : (
        <p className="rail-auth-nudge">
          Sign in in the main panel →
        </p>
      )}

      <button type="button" className="new-chat" onClick={newChat} disabled={!signedIn}>
        New chat
      </button>
      <ul className="thread-list">
        {sorted.length === 0 ? (
          <li className="thread-empty">{signedIn ? 'No chats yet' : 'Sign in to start'}</li>
        ) : (
          sorted.map((t) => (
            <li key={t.id} className={t.id === activeThreadId ? 'active' : undefined}>
              <button
                type="button"
                className="thread-select"
                onClick={() => selectThread(t.id)}
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
    </aside>
  );
}
