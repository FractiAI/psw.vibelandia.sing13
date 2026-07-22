import { FormEvent, useEffect, useState } from 'react';
import {
  CREATOR_EMAIL,
  isRememberedEmailFresh,
  isValidEmailShape,
  normalizeEmail,
} from '@/access';
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
 * Sign in = email + Cursor API key on this device.
 * Key stays in edge localStorage and is sent only per request — never stored on our server.
 */
export function AuthPanel({ compact = false }: { compact?: boolean }) {
  const userEmail = useLatticeStore((s) => s.userEmail);
  const emailRememberedAt = useLatticeStore((s) => s.emailRememberedAt);
  const cursorApiKey = useLatticeStore((s) => s.cursorApiKey);
  const setUserEmail = useLatticeStore((s) => s.setUserEmail);
  const setCursorApiKey = useLatticeStore((s) => s.setCursorApiKey);
  const [emailDraft, setEmailDraft] = useState(userEmail);
  const [keyDraft, setKeyDraft] = useState(cursorApiKey);
  const [flash, setFlash] = useState<string | null>(null);

  const signedIn = isRememberedEmailFresh(userEmail, emailRememberedAt);

  useEffect(() => {
    setEmailDraft(userEmail);
  }, [userEmail]);

  useEffect(() => {
    setKeyDraft(cursorApiKey);
  }, [cursorApiKey]);

  function onSignIn(e: FormEvent) {
    e.preventDefault();
    const next = normalizeEmail(emailDraft);
    const key = keyDraft.trim();
    if (!isValidEmailShape(next)) {
      setFlash('Enter your email / userid to sign in.');
      return;
    }
    if (key.length < 8) {
      setFlash('Paste your Cursor API key (kept only on this device).');
      return;
    }
    setUserEmail(next);
    setCursorApiKey(key);
    setFlash(null);
  }

  return (
    <section
      className={`auth-panel${compact ? ' auth-panel--compact' : ''}`}
      aria-label="Sign in"
    >
      <form className="auth-form" onSubmit={onSignIn}>
        <p className="auth-lead">
          Enter your email / userid and your Cursor API key. No password vault on our cloud — the
          key stays on this device and is only forwarded for each chat turn.
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
          placeholder="key_… from cursor.com → Integrations / API"
          onChange={(e) => setKeyDraft(e.target.value)}
        />
        <p className="auth-key-hint">
          Get a key from your Cursor account. We never persist it on our server — only on your
          edge.
        </p>
        <button type="submit" className="auth-submit">
          {signedIn ? 'Update on this device' : 'Sign in'}
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

export function SignedInBar() {
  const userEmail = useLatticeStore((s) => s.userEmail);
  const hasKey = useLatticeStore((s) => Boolean(s.cursorApiKey.trim()));
  const clearUserEmail = useLatticeStore((s) => s.clearUserEmail);

  return (
    <div className="signed-in-bar">
      <span className="signed-in-label">Signed in</span>
      <span className="signed-in-email" title={userEmail}>
        {userEmail}
      </span>
      <span
        className={`signed-in-key${hasKey ? ' signed-in-key--ok' : ' signed-in-key--missing'}`}
        title={
          hasKey
            ? 'Cursor API key is on this device only'
            : 'Add your Cursor API key in Sign in'
        }
      >
        {hasKey ? 'Key on edge' : 'Key missing'}
      </span>
      <button type="button" className="sign-out-btn" onClick={clearUserEmail}>
        Sign out
      </button>
    </div>
  );
}
