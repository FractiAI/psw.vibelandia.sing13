import { FormEvent, useEffect, useState } from 'react';
import {
  CREATOR_EMAIL,
  isValidEmailShape,
  normalizeEmail,
} from '@/access';
import { useLatticeStore } from '@/store';

function buildRequestMailto(fromEmail: string): string {
  const who = fromEmail.trim() || '(add your email here)';
  const subject = encodeURIComponent('Lattice V1.618 — request access');
  const body = encodeURIComponent(
    [
      'Hello,',
      '',
      'I would like Lattice V1.618 access.',
      '',
      `My email / userid: ${who}`,
      '',
      'Thanks.',
    ].join('\n'),
  );
  return `mailto:${CREATOR_EMAIL}?subject=${subject}&body=${body}`;
}

/**
 * Sign in = enter email (remembered 30 days on this device).
 * Request access = opens mail to operator only (prefilled).
 */
export function AuthPanel({ compact = false }: { compact?: boolean }) {
  const userEmail = useLatticeStore((s) => s.userEmail);
  const setUserEmail = useLatticeStore((s) => s.setUserEmail);
  const [emailDraft, setEmailDraft] = useState(userEmail);
  const [flash, setFlash] = useState<string | null>(null);

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
          Already signed up? Enter your email / userid. No password — we remember you on this
          device for 30 days.
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
          Sign in
        </button>
      </form>

      <p className="auth-request-line">
        New here or need a grant?{' '}
        <a
          className="auth-request-link"
          href={buildRequestMailto(normalizeEmail(emailDraft))}
        >
          Request access
        </a>
        <span className="auth-request-hint"> — opens email to request access</span>
      </p>

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
