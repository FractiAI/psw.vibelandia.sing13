import { FormEvent, useEffect, useState } from 'react';
import {
  isValidEmailShape,
  normalizeEmail,
} from '@/access';
import { useLatticeStore } from '@/store';

type Mode = 'signin' | 'signup';

/**
 * Clear Sign in / Sign up — no passwords; email remembered on this device.
 * Sign up = request access (grant is operator-side); Sign in = use granted email.
 */
export function AuthPanel({ compact = false }: { compact?: boolean }) {
  const userEmail = useLatticeStore((s) => s.userEmail);
  const setUserEmail = useLatticeStore((s) => s.setUserEmail);
  const [mode, setMode] = useState<Mode>('signin');
  const [emailDraft, setEmailDraft] = useState(userEmail);
  const [note, setNote] = useState('');
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    setEmailDraft(userEmail);
  }, [userEmail]);

  function onSignIn(e: FormEvent) {
    e.preventDefault();
    const next = normalizeEmail(emailDraft);
    if (!isValidEmailShape(next)) {
      setFlash('Enter a valid email to sign in.');
      return;
    }
    setUserEmail(next);
    setFlash(null);
  }

  function onSignUp(e: FormEvent) {
    e.preventDefault();
    const next = normalizeEmail(emailDraft);
    if (!isValidEmailShape(next)) {
      setFlash('Enter the email you want granted.');
      return;
    }
    try {
      const prev = JSON.parse(localStorage.getItem('lattice-v1618-signup-requests') || '[]');
      const list = Array.isArray(prev) ? prev : [];
      list.unshift({
        email: next,
        note: note.trim().slice(0, 280),
        at: new Date().toISOString(),
      });
      localStorage.setItem(
        'lattice-v1618-signup-requests',
        JSON.stringify(list.slice(0, 20)),
      );
    } catch {
      /* ignore */
    }
    setUserEmail(next);
    setFlash(
      'Request saved on this device. After your access is granted, you’re ready — stay signed in here.',
    );
    setMode('signin');
  }

  return (
    <section
      className={`auth-panel${compact ? ' auth-panel--compact' : ''}`}
      aria-label="Sign in or sign up"
    >
      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signin'}
          className={mode === 'signin' ? 'active' : undefined}
          onClick={() => {
            setMode('signin');
            setFlash(null);
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          className={mode === 'signup' ? 'active' : undefined}
          onClick={() => {
            setMode('signup');
            setFlash(null);
          }}
        >
          Sign up
        </button>
      </div>

      {mode === 'signin' ? (
        <form className="auth-form" onSubmit={onSignIn}>
          <p className="auth-lead">
            Already have Lattice access? Enter your email. No password — we remember you on this
            device.
          </p>
          <label htmlFor="lattice-signin-email">Email</label>
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
      ) : (
        <form className="auth-form" onSubmit={onSignUp}>
          <p className="auth-lead">
            New here? Sign up is a request for access — <strong>$200/month</strong> plus your own
            Cursor key. No password.
          </p>
          <label htmlFor="lattice-signup-email">Email to grant</label>
          <input
            id="lattice-signup-email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            value={emailDraft}
            placeholder="you@example.com"
            onChange={(e) => setEmailDraft(e.target.value)}
          />
          <label htmlFor="lattice-signup-note">Optional note</label>
          <input
            id="lattice-signup-note"
            type="text"
            value={note}
            placeholder="Company or how you’ll use Lattice"
            onChange={(e) => setNote(e.target.value)}
          />
          <button type="submit" className="auth-submit">
            Request access
          </button>
          <p className="auth-hint">
            After you’re granted, use <button type="button" className="linkish" onClick={() => setMode('signin')}>Sign in</button> with the same email.
          </p>
        </form>
      )}

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
