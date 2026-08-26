import { FormEvent, useEffect, useState } from 'react';
import {
  CREATOR_EMAIL,
  isCreatorEmail,
  isRememberedEmailFresh,
  isValidEmailShape,
  normalizeEmail,
} from '@/access';
import { verifyLatticeAccess } from '@/api';
import { KeyStatusChip } from '@/components/KeySettings';
import {
  LATTICE_PROVIDERS,
  hasProviderApiKey,
  mirrorEmailToSynthio,
  mirrorKeysToSynthio,
  readActiveProvider,
  readProviderApiKey,
  saveActiveProvider,
  saveProviderApiKey,
  type LatticeProvider,
} from '@/lib/providerKeys';
import { useLatticeStore } from '@/store';

/** Prefills a free-trial / access email to the operator (old school · honor). */
export function buildRequestMailto(fromEmail = ''): string {
  const who = normalizeEmail(fromEmail) || '(add your email here)';
  const subject = encodeURIComponent('Infinite Octaves Omniversal Lattice Chat Agent V1.618 — free trial');
  const body = encodeURIComponent(
    [
      'Hello,',
      '',
      'I would like a free trial of Infinite Octaves Omniversal Lattice Chat Agent V1.618 on SS Vibelandia.',
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
      Email for a free trial
    </a>
  );
}

/**
 * Sign in: email + provider + API key. Privilege (creator vs guest) comes from the allowlist.
 * All seats use SING13; guests get an honor rail in the agent prompt.
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
  const setProvider = useLatticeStore((s) => s.setProvider);
  const [emailDraft, setEmailDraft] = useState(userEmail);
  const [providerDraft, setProviderDraft] = useState<LatticeProvider>(() => readActiveProvider());
  const [keyDraft, setKeyDraft] = useState(() =>
    hasProviderApiKey(readActiveProvider()) ? readProviderApiKey(readActiveProvider()) : '',
  );
  const [flash, setFlash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signedIn = isRememberedEmailFresh(userEmail, emailRememberedAt);
  const meta = LATTICE_PROVIDERS.find((p) => p.id === providerDraft)!;

  useEffect(() => {
    setEmailDraft(userEmail);
  }, [userEmail]);

  function onProviderPick(next: LatticeProvider) {
    setProviderDraft(next);
    setKeyDraft(hasProviderApiKey(next) ? readProviderApiKey(next) : '');
  }

  async function onSignIn(e: FormEvent) {
    e.preventDefault();
    const next = normalizeEmail(emailDraft);
    if (!isValidEmailShape(next)) {
      setFlash('Enter your email / userid to sign in.');
      return;
    }
    const keyResult = saveProviderApiKey(providerDraft, keyDraft);
    if (!keyResult.ok) {
      setFlash(keyResult.error || `Paste your ${meta.short} API key to sign in.`);
      return;
    }
    setBusy(true);
    setFlash(null);
    try {
      const access = await verifyLatticeAccess(next);
      if (!access.ok) {
        setFlash(
          access.reason ||
            'This email is not on the access list yet. Request a free trial, then sign in.',
        );
        return;
      }
      saveActiveProvider(providerDraft);
      setProvider(providerDraft);
      if (keyResult.changed) {
        useLatticeStore.getState().clearCloudAgents();
        useLatticeStore.getState().clearPending();
      }
      setUserEmail(next);
      mirrorEmailToSynthio(next);
      mirrorKeysToSynthio();
      const seat =
        access.privilege === 'creator'
          ? 'Player 1 · creator seat — SING13 agents (commit / push / merge on)'
          : 'guest seat — SING13 agents (honor rail)';
      setFlash(`Signed in · ${meta.short} key on this device · ${seat}.`);
      onSignedIn?.();
    } catch {
      setFlash('Could not reach Lattice access check. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={`auth-panel${compact ? ' auth-panel--compact' : ''}`}
      aria-label="Sign in"
    >
      <form className="auth-form" onSubmit={(e) => void onSignIn(e)}>
        <p className="auth-lead">
          Enter your email and your provider API key (Cursor, Claude, or Gemini).{' '}
          <strong>Your key is your password</strong> for Infinite Octaves Omniversal Lattice Chat — it stays
          with you on this device. No separate passwords to manage. We never store the key on the
          server.
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
          disabled={busy}
        />
        <label htmlFor="lattice-signin-provider">Provider</label>
        <select
          id="lattice-signin-provider"
          value={providerDraft}
          onChange={(e) => onProviderPick(e.target.value as LatticeProvider)}
          disabled={busy}
        >
          {LATTICE_PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <label htmlFor="lattice-signin-api-key">
          {meta.label} API key · your password
        </label>
        <input
          id="lattice-signin-api-key"
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={keyDraft}
          placeholder={meta.keyPlaceholder}
          onChange={(e) => setKeyDraft(e.target.value)}
          disabled={busy}
        />
        <p className="auth-key-hint">{meta.honesty}</p>
        <button type="submit" className="auth-submit" disabled={busy}>
          {busy ? 'Checking access…' : 'Board · Sign in'}
        </button>
      </form>
      {flash ? (
        <p className="auth-flash" role="status">
          {flash}
        </p>
      ) : null}
      {!signedIn ? (
        <p className="auth-request">
          Need access? <RequestAccessLink fromEmail={emailDraft} />
        </p>
      ) : null}
    </section>
  );
}

export function SignedInBar({ onOpenKeySettings }: { onOpenKeySettings?: () => void }) {
  const userEmail = useLatticeStore((s) => s.userEmail);
  const privilege = useLatticeStore((s) => s.privilege);
  const clearUserEmail = useLatticeStore((s) => s.clearUserEmail);
  const hardRefreshEdge = useLatticeStore((s) => s.hardRefreshEdge);
  const [refreshing, setRefreshing] = useState(false);

  return (
    <div className="signed-in-bar">
      <span className="signed-in-email" title={userEmail}>
        {userEmail}
      </span>
      {privilege === 'creator' || isCreatorEmail(userEmail) ? (
        <span className="signed-in-seat" title="Player 1 creator seat — SING13 commit, push, and merge stay on">
          Player 1 · creator
        </span>
      ) : privilege === 'guest' ? (
        <span className="signed-in-seat signed-in-seat--guest">guest</span>
      ) : null}
      <KeyStatusChip
        onOpenSettings={() => {
          if (onOpenKeySettings) onOpenKeySettings();
        }}
      />
      <button
        type="button"
        className="signed-in-refresh"
        disabled={refreshing}
        title="Clear chat cache and stuck runs, then reload. Keeps your email and API keys."
        onClick={() => {
          setRefreshing(true);
          hardRefreshEdge();
        }}
      >
        {refreshing ? 'Refreshing…' : 'Hard refresh'}
      </button>
      <button type="button" className="signed-in-out" onClick={() => clearUserEmail()}>
        Sign out
      </button>
    </div>
  );
}
