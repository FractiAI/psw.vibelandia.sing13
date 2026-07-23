import { FormEvent, useEffect, useState } from 'react';
import {
  CREATOR_EMAIL,
  isRememberedEmailFresh,
  isValidEmailShape,
  normalizeEmail,
} from '@/access';
import { KeyStatusChip } from '@/components/KeySettings';
import {
  hasUserCursorApiKey,
  readUserCursorApiKey,
  saveUserCursorApiKey,
} from '@/lib/cursorKey';
import { useLatticeStore } from '@/store';

/** Prefills a request-access email to the operator. */
export function buildRequestMailto(fromEmail = ''): string {
  const who = normalizeEmail(fromEmail) || '(add your email here)';
  const subject = encodeURIComponent('Lattice V1.618 — request access');
  const body = encodeURIComponent(
    [
      'Hello,',
      '',
      'I would like Lattice V1.618 access for the monthly period.',
      '',
      `My email / userid: ${who}`,
      '',
      'Thanks.',
    ].join('\n'),
  );
  return `mailto:${CREATOR_EMAIL}?subject=${subject}&body=${body}`;
}

export function RequestAccessLink({
  fromEmail = '',
  className = 'auth-request-link',
}: {
  fromEmail?: string;
  className?: string;
}) {
  return (
    <a className={className} href={buildRequestMailto(fromEmail)}>
      Request access
    </a>
  );
}

/**
 * Sign in captures email (30 days) + Cursor API key (`user_cursor_api_key` on this device).
 * Key is required on Sign in — edge-only; never sent to durable server storage.
 */
export function AuthPanel({
  compact = false,
  onSignedIn,
}: {
  compact?: boolean;
  onSignedIn?: () => void;
}) {
  const userEmail = useLatticeStore((s) => s.userEmail);
  const emailRememberedAt = useLatticeStore((s) => s.emailRememberedAt);
  const setUserEmail = useLatticeStore((s) => s.setUserEmail);
  const [emailDraft, setEmailDraft] = useState(userEmail);
  const [keyDraft, setKeyDraft] = useState(() =>
    hasUserCursorApiKey() ? readUserCursorApiKey() : '',
  );
  const [flash, setFlash] = useState<string | null>(null);

  const signedIn = isRememberedEmailFresh(userEmail, emailRememberedAt);

  useEffect(() => {
    setEmailDraft(userEmail);
  }, [userEmail]);

  function onSignIn(e: FormEvent) {
    e.preventDefault();
    const next = normalizeEmail(emailDraft);
    if (!isValidEmailShape(next)) {
      setFlash('Enter your email / userid to sign in.');
      return;
    }
    const keyResult = saveUserCursorApiKey(keyDraft);
    if (!keyResult.ok) {
      setFlash(keyResult.error || 'Paste your Cursor API key to sign in.');
      return;
    }
    setUserEmail(next);
    setFlash('Signed in — email and Cursor API key saved on this device.');
    onSignedIn?.();
  }

  return (
    <section
      className={`auth-panel${compact ? ' auth-panel--compact' : ''}`}
      aria-label="Sign in"
    >
      <form className="auth-form" onSubmit={onSignIn}>
        <p className="auth-lead">
          Enter your email / userid and Cursor API key. Both stay on this device — the key is
          proxied per request and never stored on our server.
        </p>
        <label htmlFor="lattice-signin-email">Email / userid</label>
        <input
          id="lattice-signin-email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          value={emailDraft}
          placeholder="you@example.com"
          onChange={(e) => setEmailDraft(e.target.value)}
        />
        <label htmlFor="lattice-signin-cursor-key">Cursor API key</label>
        <input
          id="lattice-signin-cursor-key"
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={keyDraft}
          placeholder="key_… from cursor.com → API Keys"
          onChange={(e) => setKeyDraft(e.target.value)}
        />
        <p className="auth-key-hint">
          Required at sign in · saved as <code>user_cursor_api_key</code> in this browser only
        </p>
        <button type="submit" className="auth-submit">
          {signedIn ? 'Update email & key' : 'Sign in'}
        </button>
      </form>

      {!signedIn ? (
        <p className="auth-request-line">
          Need a monthly grant?{' '}
          <RequestAccessLink fromEmail={emailDraft} />
          <span className="auth-request-hint">
            {' '}
            — opens a prefilled email to {CREATOR_EMAIL}
          </span>
        </p>
      ) : null}

      {flash ? (
        <p className="auth-flash" role="status">
          {flash}
        </p>
      ) : null}
    </section>
  );
}

export function SignedInBar({ onOpenKeySettings }: { onOpenKeySettings?: () => void }) {
  const userEmail = useLatticeStore((s) => s.userEmail);
  const clearUserEmail = useLatticeStore((s) => s.clearUserEmail);

  return (
    <div className="signed-in-bar">
      <span className="signed-in-label">Signed in</span>
      <span className="signed-in-email" title={userEmail}>
        {userEmail}
      </span>
      <KeyStatusChip
        onOpenSettings={() => {
          if (onOpenKeySettings) onOpenKeySettings();
          else if (!hasUserCursorApiKey()) {
            window.alert('Add your Cursor API key in settings.');
          }
        }}
      />
      <button type="button" className="sign-out-btn" onClick={clearUserEmail}>
        Sign out
      </button>
    </div>
  );
}
