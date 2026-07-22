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

/** Sign in = email / userid only (remembered 30 days on this device). */
export function AuthPanel({ compact = false }: { compact?: boolean }) {
  const userEmail = useLatticeStore((s) => s.userEmail);
  const emailRememberedAt = useLatticeStore((s) => s.emailRememberedAt);
  const setUserEmail = useLatticeStore((s) => s.setUserEmail);
  const [emailDraft, setEmailDraft] = useState(userEmail);
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
    setUserEmail(next);
    setFlash(null);
  }

  return (
    <section
      className={`auth-panel${compact ? ' auth-panel--compact' : ''}`}
      aria-label="Sign in"
    >
      <form className="auth-form" onSubmit={onSignIn}>
        <p className="auth-lead">
          Already have access? Enter your email / userid. No password — we remember you on this
          device for 30 days. Cloud agents run on FractiAI’s Cursor pipe (no key setup for you).
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
  const clearUserEmail = useLatticeStore((s) => s.clearUserEmail);

  return (
    <div className="signed-in-bar">
      <span className="signed-in-label">Signed in</span>
      <span className="signed-in-email" title={userEmail}>
        {userEmail}
      </span>
      <button type="button" className="sign-out-btn" onClick={clearUserEmail}>
        Sign out
      </button>
    </div>
  );
}
