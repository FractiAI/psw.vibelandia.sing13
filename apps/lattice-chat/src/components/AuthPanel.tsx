import { FormEvent, useEffect, useState } from 'react';
import {
  CREATOR_EMAIL,
  isRememberedEmailFresh,
  isValidEmailShape,
  normalizeEmail,
} from '@/access';
import { KeyStatusChip } from '@/components/KeySettings';
import {
  LATTICE_PROVIDERS,
  hasProviderApiKey,
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
  const subject = encodeURIComponent('Lattice V1.618 — free trial');
  const body = encodeURIComponent(
    [
      'Hello,',
      '',
      'I would like a free trial of Lattice V1.618 on SS Vibelandia.',
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
 * Sign in captures email (30 days) + at least one provider API key on this device.
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

  const signedIn = isRememberedEmailFresh(userEmail, emailRememberedAt);
  const meta = LATTICE_PROVIDERS.find((p) => p.id === providerDraft)!;

  useEffect(() => {
    setEmailDraft(userEmail);
  }, [userEmail]);

  function onProviderPick(next: LatticeProvider) {
    setProviderDraft(next);
    setKeyDraft(hasProviderApiKey(next) ? readProviderApiKey(next) : '');
  }

  function onSignIn(e: FormEvent) {
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
    saveActiveProvider(providerDraft);
    setProvider(providerDraft);
    if (keyResult.changed) {
      useLatticeStore.getState().clearCloudAgents();
      useLatticeStore.getState().clearPending();
    }
    setUserEmail(next);
    setFlash(`Signed in — email and ${meta.short} key saved on this device.`);
    onSignedIn?.();
  }

  return (
    <section
      className={`auth-panel${compact ? ' auth-panel--compact' : ''}`}
      aria-label="Sign in"
    >
      <form className="auth-form" onSubmit={onSignIn}>
        <p className="auth-lead">
          Enter your email / userid and an API key for Cursor, Claude, or Gemini Antigravity.
          Keys stay on this device and are proxied per request — never stored on our server.
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
        <label htmlFor="lattice-signin-provider">Provider</label>
        <select
          id="lattice-signin-provider"
          value={providerDraft}
          onChange={(e) => onProviderPick(e.target.value as LatticeProvider)}
        >
          {LATTICE_PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <label htmlFor="lattice-signin-api-key">{meta.label} API key</label>
        <input
          id="lattice-signin-api-key"
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={keyDraft}
          placeholder={meta.keyPlaceholder}
          onChange={(e) => setKeyDraft(e.target.value)}
        />
        <p className="auth-key-hint">{meta.honesty}</p>
        <button type="submit" className="auth-submit">
          Sign in
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
  const clearUserEmail = useLatticeStore((s) => s.clearUserEmail);
  const provider = useLatticeStore((s) => s.provider);

  return (
    <div className="signed-in-bar">
      <span className="signed-in-email" title={userEmail}>
        {userEmail}
      </span>
      <KeyStatusChip
        onOpenSettings={() => {
          if (onOpenKeySettings) onOpenKeySettings();
          else if (!hasProviderApiKey(provider)) {
            onOpenKeySettings?.();
          }
        }}
      />
      <button type="button" className="signed-in-out" onClick={() => clearUserEmail()}>
        Sign out
      </button>
    </div>
  );
}
