import { useEffect, useState } from 'react';
import {
  CREATOR_EMAIL,
  LATTICE_ACCESS_EMAIL,
  LATTICE_ACCESS_MAILTO,
  isCreatorEmail,
  isRememberedEmailFresh,
  isValidEmailShape,
  normalizeEmail,
} from '@/access';
import { useLatticeStore } from '@/store';

export function HistoryRail() {
  const threads = useLatticeStore((s) => s.threads);
  const activeThreadId = useLatticeStore((s) => s.activeThreadId);
  const userEmail = useLatticeStore((s) => s.userEmail);
  const emailRememberedAt = useLatticeStore((s) => s.emailRememberedAt);
  const setUserEmail = useLatticeStore((s) => s.setUserEmail);
  const clearUserEmail = useLatticeStore((s) => s.clearUserEmail);
  const newChat = useLatticeStore((s) => s.newChat);
  const selectThread = useLatticeStore((s) => s.selectThread);
  const renameThread = useLatticeStore((s) => s.renameThread);
  const deleteThread = useLatticeStore((s) => s.deleteThread);
  const [emailDraft, setEmailDraft] = useState(userEmail);

  useEffect(() => {
    setEmailDraft(userEmail);
  }, [userEmail]);

  const sorted = [...threads].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const remembered = isRememberedEmailFresh(userEmail, emailRememberedAt);
  const creator = remembered && isCreatorEmail(userEmail);

  function saveEmail() {
    const next = normalizeEmail(emailDraft);
    if (!isValidEmailShape(next)) {
      window.alert('Please enter a valid email address.');
      return;
    }
    setUserEmail(next);
  }

  return (
    <aside className="history-rail" aria-label="Chat history">
      <div className="rail-brand">
        <p className="wordmark">Lattice V1.618</p>
        <p className="byline">by FractiAI</p>
        <p className="edge-note">UI on this edge device · histories stay local</p>
      </div>

      <a className="access-cta" href={LATTICE_ACCESS_MAILTO}>
        Email me for access and pricing
      </a>
      <p className="access-email">{LATTICE_ACCESS_EMAIL}</p>

      <div className="access-key-box">
        <label htmlFor="lattice-user-email">Your email (remembered here)</label>
        <input
          id="lattice-user-email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          value={emailDraft}
          placeholder="you@example.com"
          onChange={(e) => setEmailDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              saveEmail();
            }
          }}
        />
        <button type="button" className="save-key" onClick={saveEmail}>
          Remember on this device
        </button>
        {remembered ? (
          <p className="email-status">
            {creator
              ? `Creator · permanent (${CREATOR_EMAIL})`
              : `Remembered · guest window ~1 month`}
            <button type="button" className="linkish" onClick={clearUserEmail}>
              Forget
            </button>
          </p>
        ) : (
          <p className="email-status muted">No passwords — just your email, once.</p>
        )}
      </div>

      <button type="button" className="new-chat" onClick={newChat}>
        New chat
      </button>
      <ul className="thread-list">
        {sorted.length === 0 ? (
          <li className="thread-empty">No chats yet</li>
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
