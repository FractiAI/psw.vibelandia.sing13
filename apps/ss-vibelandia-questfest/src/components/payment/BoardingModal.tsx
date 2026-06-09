import { useEffect, useRef, useState } from 'react';
import {
  EGS_MONTHLY_USD,
  PAYMENT_HANDLES,
  RAIL_LABEL,
  boardingNote,
  railCheckoutLinks,
  type LiveRail,
} from '@/lib/paymentRails';
import type { BoardingHonorPayload } from '@/lib/boardingHonor';
import {
  MACHOTE_CATALOG_SUBTITLE,
  MACHOTE_CATALOG_TITLE,
  MACHOTE_MAGAZINE_NAME,
  MACHOTE_MEMBERS_PASS_TITLE,
  MACHOTE_MAGAZINE_QUALIFIER,
  machoteMagazineFollowUrl,
} from '@/lib/machoteMembership';
import { HonorFarmstandFigure } from '@/components/payment/HonorFarmstandFigure';
import {
  clearBoardingHonorDraft,
  readBoardingHonorDraft,
  writeBoardingHonorDraft,
} from '@/lib/boardingHonorDraft';
import { localTodayISO } from '@/lib/localMonthlyHonor';
import { useSessionStore } from '@/stores/sessionStore';
import { usePlaybackStore } from '@/stores/playbackStore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface BoardingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: BoardingHonorPayload) => Promise<void>;
  busy: boolean;
  error: string | null;
}

function honorChecklist(input: {
  rail: LiveRail | null;
  magazineFollowAck: boolean;
  honorAck: boolean;
  email: string;
  paidDate: string;
}) {
  const emailOk = EMAIL_RE.test(input.email.trim());
  const dateOk = input.paidDate.length >= 10 && input.paidDate <= localTodayISO();
  return [
    { id: 'rail', label: 'Pick Venmo, PayPal, or Cash App', done: !!input.rail },
    { id: 'pay', label: 'Send $16.18 on your chosen rail', done: !!input.rail },
    { id: 'magazine', label: 'Check “I follow Machote Moderno Magazine”', done: input.magazineFollowAck },
    { id: 'honor', label: 'Check “I confirm I completed payment”', done: input.honorAck },
    { id: 'date', label: 'Enter the date you paid (today or earlier)', done: dateOk },
    { id: 'email', label: 'Enter a valid email address', done: emailOk },
  ];
}

export function BoardingModal({ open, onClose, onSubmit, busy, error }: BoardingModalProps) {
  const tryCaptainPassword = useSessionStore((s) => s.tryCaptainPassword);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const localHonorOnly = useSessionStore((s) => s.localHonorOnly);
  const honorValidUntil = useSessionStore((s) => s.honorValidUntil);
  const disembark = useSessionStore((s) => s.disembark);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);
  const setGain = usePlaybackStore((s) => s.setGain);
  const [step, setStep] = useState<'rail' | 'pay' | 'honor'>('rail');
  const [rail, setRail] = useState<LiveRail | null>(null);
  const [paidDate, setPaidDate] = useState(localTodayISO);
  const [email, setEmail] = useState('');
  const [honorAck, setHonorAck] = useState(false);
  const [magazineFollowAck, setMagazineFollowAck] = useState(false);
  const [captainPw, setCaptainPw] = useState('');
  const [captainErr, setCaptainErr] = useState<string | null>(null);
  const [validationHint, setValidationHint] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const blockBackdropUntilRef = useRef(0);
  const honorAckRef = useRef(false);
  const magazineFollowAckRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const draft = readBoardingHonorDraft();
    if (!draft) return;
    if (draft.rail) setRail(draft.rail);
    if (draft.step) setStep(draft.step);
    if (draft.paidDate) setPaidDate(draft.paidDate);
    if (draft.email) setEmail(draft.email);
    if (draft.honorAck) {
      setHonorAck(true);
      honorAckRef.current = true;
    }
    if (draft.magazineFollowAck) {
      setMagazineFollowAck(true);
      magazineFollowAckRef.current = true;
    }
  }, [open]);

  useEffect(() => {
    if (!open || step !== 'honor') return;
    writeBoardingHonorDraft({
      step,
      rail,
      paidDate,
      email,
      honorAck,
      magazineFollowAck,
    });
  }, [open, step, rail, paidDate, email, honorAck, magazineFollowAck]);

  useEffect(() => {
    if (!open || step !== 'honor') return;
    const draft = readBoardingHonorDraft();
    if (!draft) return;
    if (draft.paidDate) setPaidDate(draft.paidDate);
    if (draft.email) setEmail(draft.email);
    if (draft.magazineFollowAck) {
      setMagazineFollowAck(true);
      magazineFollowAckRef.current = true;
    }
    if (draft.honorAck) {
      setHonorAck(true);
      honorAckRef.current = true;
    }
  }, [open, step]);

  useEffect(() => {
    if (!busy) submittingRef.current = false;
  }, [busy]);

  if (!open) return null;

  const reset = () => {
    setStep('rail');
    setRail(null);
    setPaidDate(localTodayISO());
    setEmail('');
    setHonorAck(false);
    setMagazineFollowAck(false);
    honorAckRef.current = false;
    magazineFollowAckRef.current = false;
    setCaptainPw('');
    setCaptainErr(null);
    setValidationHint(null);
  };

  const close = () => {
    if (busy || submittingRef.current || Date.now() < blockBackdropUntilRef.current) return;
    reset();
    onClose();
  };

  const handleSignOut = () => {
    disembark();
    setPlaying(false);
    setGain(1);
    clearBoardingHonorDraft();
    close();
  };

  const emailOk = EMAIL_RE.test(email.trim());
  const dateOk = paidDate.length >= 10 && paidDate <= localTodayISO();
  const canIssue = !!rail && honorAck && magazineFollowAck && emailOk && dateOk && !busy;
  const checklist = honorChecklist({ rail, magazineFollowAck, honorAck, email, paidDate });

  const passMemo = boardingNote();
  const payCheckout =
    step === 'pay' && rail ? railCheckoutLinks(rail, EGS_MONTHLY_USD, passMemo) : null;

  const passUntilLabel =
    localHonorOnly && honorValidUntil
      ? new Date(honorValidUntil + 'T12:00:00').toLocaleDateString()
      : '';

  const trySubmit = () => {
    if (busy || !rail) return;
    submittingRef.current = true;
    blockBackdropUntilRef.current = Date.now() + 800;

    const magazineOk = magazineFollowAckRef.current || magazineFollowAck;
    const honorOk = honorAckRef.current || honorAck;

    if (!magazineOk) {
      submittingRef.current = false;
      setValidationHint('Check the box confirming you follow Machote Moderno Magazine.');
      return;
    }
    if (!honorOk) {
      submittingRef.current = false;
      setValidationHint('Check the box confirming you completed payment on honor.');
      return;
    }
    if (!dateOk) {
      submittingRef.current = false;
      setValidationHint('Enter the date you paid (cannot be in the future).');
      return;
    }
    if (!emailOk) {
      submittingRef.current = false;
      setValidationHint('Enter a valid email address so we can match your honor pass.');
      return;
    }
    setValidationHint(null);
    void onSubmit({
      rail,
      honorConfirm: true,
      paidDate,
      email: email.trim(),
    }).finally(() => {
      submittingRef.current = false;
    });
  };

  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={close} aria-hidden="true" />
      <div
        className="voxel-panel modal-card modal-card--wide modal-card--swamp-warm"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title modal-title--warm">{MACHOTE_MEMBERS_PASS_TITLE}</h2>
        {localHonorOnly && passUntilLabel && (
          <p className="modal-fine" style={{ margin: '0 0 0.75rem', color: '#5eead4', lineHeight: 1.45 }}>
            Members pass active on this device through <strong>{passUntilLabel}</strong>. When that date passes,
            confirm again here.
          </p>
        )}

        {step === 'rail' && (
          <>
            <details className="modal-captain-details" style={{ marginBottom: '1rem' }}>
              <summary className="modal-body" style={{ cursor: 'pointer', userSelect: 'none' }}>
                Are you the captain?
              </summary>
              <div style={{ marginTop: '0.75rem' }}>
                {captainUnlocked ? (
                  <p className="modal-body" style={{ margin: 0 }}>
                    Captain access is <strong>active</strong> for this session (full play + export bypass on this
                    device). You can still get the Machote members pass below for normal catalog access.
                  </p>
                ) : (
                  <>
                    <p className="modal-body" style={{ margin: '0 0 0.5rem' }}>
                      Enter the operator password to bypass preview and payment rails on this browser only.
                    </p>
                    <label className="boarding-field">
                      <span>Captain password</span>
                      <input
                        className="libretto-input boarding-input"
                        type="password"
                        autoComplete="current-password"
                        value={captainPw}
                        onChange={(e) => setCaptainPw(e.target.value)}
                        placeholder="Password"
                      />
                    </label>
                    {captainErr && <p className="player-error">{captainErr}</p>}
                    <button
                      type="button"
                      className="voxel-btn"
                      style={{ marginTop: '0.5rem' }}
                      onClick={() => {
                        setCaptainErr(null);
                        if (!tryCaptainPassword(captainPw)) {
                          setCaptainErr('Password not recognized.');
                          return;
                        }
                        setCaptainPw('');
                        close();
                      }}
                    >
                      Unlock captain access
                    </button>
                  </>
                )}
              </div>
            </details>
            <p className="modal-body modal-body--warm">
              <strong>{MACHOTE_MAGAZINE_NAME}</strong> · members-only ·{' '}
              <strong>${EGS_MONTHLY_USD.toFixed(2)}/month</strong> — unlock the full{' '}
              <strong>{MACHOTE_CATALOG_TITLE}</strong> ({MACHOTE_CATALOG_SUBTITLE}): full playback and exports when you
              need them. {MACHOTE_MAGAZINE_QUALIFIER}{' '}
              <a href={machoteMagazineFollowUrl()} target="_blank" rel="noopener noreferrer">
                Follow the magazine
              </a>{' '}
              before you pay. Pick Venmo, PayPal, or Cash App — human and old-school on purpose.
            </p>
            <div className="rail-grid">
              {(Object.keys(PAYMENT_HANDLES) as LiveRail[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  className="voxel-btn voxel-btn--orange"
                  onClick={() => {
                    setRail(r);
                    setStep('pay');
                    setValidationHint(null);
                  }}
                >
                  {RAIL_LABEL[r]}
                </button>
              ))}
            </div>
            {import.meta.env.DEV && (
              <button
                type="button"
                className="voxel-btn voxel-btn--ghost"
                style={{ marginTop: '0.5rem' }}
                onClick={() =>
                  void onSubmit({
                    rail: 'venmo',
                    honorConfirm: true,
                    paidDate: localTodayISO(),
                    email: 'dev@local',
                  })
                }
              >
                Dev · skip payment
              </button>
            )}
          </>
        )}

        {step === 'pay' && rail && payCheckout && (
          <>
            <p className="modal-body">
              Pay <strong>${EGS_MONTHLY_USD.toFixed(2)}</strong> on <strong>{RAIL_LABEL[rail]}</strong> to{' '}
              <code>{PAYMENT_HANDLES[rail]}</code>. Use memo / note: <code>{passMemo}</code>.
            </p>
            <p className="modal-fine boarding-counterintuitive">
              Open your payment app first. After you send, continue below to confirm on honor.
            </p>
            <div className="modal-actions boarding-pay-actions">
              <a
                href={payCheckout.href}
                target="_blank"
                rel="noopener noreferrer"
                className="voxel-btn voxel-btn--cyan boarding-pay-open"
              >
                Open {RAIL_LABEL[rail]} · ${EGS_MONTHLY_USD.toFixed(2)}
              </a>
              {payCheckout.webFallbackHref && (
                <p className="modal-fine boarding-pay-fallback">
                  App did not open?{' '}
                  <a href={payCheckout.webFallbackHref} target="_blank" rel="noopener noreferrer">
                    Open {RAIL_LABEL[rail]} on the web
                  </a>
                </p>
              )}
              <button
                type="button"
                className="voxel-btn voxel-btn--orange"
                onClick={() => {
                  setStep('honor');
                  setValidationHint(null);
                }}
              >
                I've paid — continue to honor confirmation
              </button>
              <button type="button" className="voxel-btn" onClick={() => setStep('rail')}>
                Different rail
              </button>
            </div>
          </>
        )}

        {step === 'honor' && rail && (
          <>
            <p className="modal-body">
              Fair Exchange runs on trust — <strong>client-only honor</strong>. No server account: check both boxes,
              enter the date you paid and your email, then confirm. We save the pass on <strong>this browser only</strong>{' '}
              for 30 days from that date.
            </p>
            <HonorFarmstandFigure />
            <label className="boarding-field">
              <span>Date you paid</span>
              <input
                className="libretto-input boarding-input"
                type="date"
                max={localTodayISO()}
                value={paidDate}
                onChange={(e) => {
                  setPaidDate(e.target.value);
                  setValidationHint(null);
                }}
                disabled={busy}
              />
            </label>
            <label className="boarding-field">
              <span>Email (for our records)</span>
              <input
                className="libretto-input boarding-input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValidationHint(null);
                }}
                placeholder="you@example.com"
                disabled={busy}
              />
            </label>
            <div className="boarding-check-row">
              <input
                id="boarding-magazine-follow"
                type="checkbox"
                checked={magazineFollowAck}
                onChange={(e) => {
                  const checked = e.target.checked;
                  magazineFollowAckRef.current = checked;
                  setMagazineFollowAck(checked);
                  setValidationHint(null);
                }}
              />
              <div className="boarding-check-copy">
                <label htmlFor="boarding-magazine-follow">
                  I follow <strong>{MACHOTE_MAGAZINE_NAME}</strong> — my qualifier for this members-only pass.
                </label>{' '}
                <a href={machoteMagazineFollowUrl()} target="_blank" rel="noopener noreferrer">
                  Open magazine
                </a>
              </div>
            </div>
            <div className="boarding-check-row">
              <input
                id="boarding-honor-confirm"
                type="checkbox"
                checked={honorAck}
                onChange={(e) => {
                  const checked = e.target.checked;
                  honorAckRef.current = checked;
                  setHonorAck(checked);
                  setValidationHint(null);
                }}
              />
              <label htmlFor="boarding-honor-confirm" className="boarding-check-copy">
                I confirm I completed payment of <strong>${EGS_MONTHLY_USD.toFixed(2)}</strong> using{' '}
                <strong>{RAIL_LABEL[rail]}</strong>.
              </label>
            </div>
            {!canIssue && !busy && (
              <>
                <p className="boarding-honor-hint">
                  Complete every step below, then tap confirm. Email and payment date are required — both
                  honor boxes must be checked before the pass saves.
                </p>
                <ul className="boarding-honor-checklist" aria-label="Honor pass checklist">
                  {checklist.map((item) => (
                    <li key={item.id} className={item.done ? 'is-done' : undefined}>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {(validationHint || error) && (
              <p className="player-error" role="alert">
                {validationHint || error}
              </p>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="voxel-btn voxel-btn--orange"
                disabled={busy}
                aria-disabled={!canIssue}
                onClick={trySubmit}
              >
                {busy ? 'Saving honor pass…' : 'Confirm honor pass · 30 days on this device'}
              </button>
              <button type="button" className="voxel-btn" onClick={() => setStep('pay')} disabled={busy}>
                Back
              </button>
            </div>
          </>
        )}
        {(isPassenger || captainUnlocked) && (
          <p className="modal-fine boarding-signout">
            <button type="button" className="boarding-signout-btn" onClick={handleSignOut}>
              {isPassenger ? 'Sign out · clear pass & captain' : 'Clear captain unlock'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
