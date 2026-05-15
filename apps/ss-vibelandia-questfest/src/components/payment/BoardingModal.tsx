import { useState } from 'react';
import {
  EGS_MONTHLY_USD,
  PAYMENT_HANDLES,
  RAIL_LABEL,
  boardingNote,
  railCheckoutLinks,
  type LiveRail,
} from '@/lib/paymentRails';
import type { BoardingRequestBody } from '@/lib/api';
import { HonorFarmstandFigure } from '@/components/payment/HonorFarmstandFigure';
import { useSessionStore } from '@/stores/sessionStore';
import { usePlaybackStore } from '@/stores/playbackStore';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface BoardingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: BoardingRequestBody) => Promise<void>;
  busy: boolean;
  error: string | null;
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
  const [paidDate, setPaidDate] = useState(todayISO);
  const [email, setEmail] = useState('');
  const [honorAck, setHonorAck] = useState(false);
  const [captainPw, setCaptainPw] = useState('');
  const [captainErr, setCaptainErr] = useState<string | null>(null);

  if (!open) return null;

  const reset = () => {
    setStep('rail');
    setRail(null);
    setPaidDate(todayISO());
    setEmail('');
    setHonorAck(false);
    setCaptainPw('');
    setCaptainErr(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleSignOut = () => {
    disembark();
    setPlaying(false);
    setGain(1);
    close();
  };

  const emailOk = EMAIL_RE.test(email.trim());
  const canIssue =
    !!rail && honorAck && emailOk && paidDate.length >= 10 && !busy;

  const passMemo = boardingNote();
  const payCheckout =
    step === 'pay' && rail ? railCheckoutLinks(rail, EGS_MONTHLY_USD, passMemo) : null;

  const passUntilLabel =
    localHonorOnly && honorValidUntil
      ? new Date(honorValidUntil + 'T12:00:00').toLocaleDateString()
      : '';

  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={close} />
      <div className="voxel-panel modal-card modal-card--wide modal-card--swamp-warm">
        <h2 className="modal-title modal-title--warm">Reno Swamp monthly pass</h2>
        {localHonorOnly && passUntilLabel && (
          <p className="modal-fine" style={{ margin: '0 0 0.75rem', color: '#5eead4', lineHeight: 1.45 }}>
            Monthly pass on this device through <strong>{passUntilLabel}</strong>. When that date passes, confirm again
            here.
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
                    device). You can still start a monthly pass below for normal passenger use.
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
              <strong>${EGS_MONTHLY_USD.toFixed(2)}/month</strong> — full catalog, full playback, exports
              when you need them. Pick Venmo, PayPal, or Cash App. We keep it human and old-school on
              purpose.
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
                    paidDate: todayISO(),
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
              <button type="button" className="voxel-btn voxel-btn--orange" onClick={() => setStep('honor')}>
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
              Fair Exchange runs on trust. Check the box, set the date you paid, and we unlock full play on this browser
              for 30 days from that date. When it expires, come back and confirm again.
            </p>
            <HonorFarmstandFigure />
            <label className="boarding-field" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={honorAck}
                onChange={(e) => setHonorAck(e.target.checked)}
                disabled={busy}
                style={{ marginTop: '0.2rem' }}
              />
              <span>
                I confirm I completed payment of <strong>${EGS_MONTHLY_USD.toFixed(2)}</strong> using{' '}
                <strong>{RAIL_LABEL[rail]}</strong>.
              </span>
            </label>
            <label className="boarding-field">
              <span>Date you paid</span>
              <input
                className="libretto-input boarding-input"
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={busy}
              />
            </label>
            {error && <p className="player-error">{error}</p>}
            <div className="modal-actions">
              <button
                type="button"
                className="voxel-btn voxel-btn--orange"
                disabled={!canIssue}
                onClick={() =>
                  void onSubmit({
                    rail,
                    honorConfirm: true,
                    paidDate,
                    email: email.trim(),
                  })
                }
              >
                {busy ? 'Issuing pass…' : 'Issue 30-day pass'}
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
