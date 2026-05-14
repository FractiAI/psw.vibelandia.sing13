import { useState } from 'react';
import {
  EGS_MONTHLY_USD,
  PAYMENT_HANDLES,
  RAIL_LABEL,
  boardingNote,
  type LiveRail,
} from '@/lib/paymentRails';
import { useSessionStore } from '@/stores/sessionStore';

interface BoardingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rail: LiveRail, receipt: string, contact: string) => Promise<void>;
  busy: boolean;
  error: string | null;
}

export function BoardingModal({ open, onClose, onSubmit, busy, error }: BoardingModalProps) {
  const tryCaptainPassword = useSessionStore((s) => s.tryCaptainPassword);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);
  const [step, setStep] = useState<'rail' | 'pay' | 'proof'>('rail');
  const [rail, setRail] = useState<LiveRail | null>(null);
  const [receipt, setReceipt] = useState('');
  const [contact, setContact] = useState('');
  const [captainPw, setCaptainPw] = useState('');
  const [captainErr, setCaptainErr] = useState<string | null>(null);

  if (!open) return null;

  const reset = () => {
    setStep('rail');
    setRail(null);
    setReceipt('');
    setContact('');
    setCaptainPw('');
    setCaptainErr(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={close} />
      <div className="voxel-panel modal-card modal-card--wide modal-card--swamp-warm">
        <h2 className="modal-title modal-title--warm">Reno Swamp monthly pass</h2>

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
                    device). You can still buy a monthly pass below if you want a real Passenger JWT.
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
                onClick={() => void onSubmit('venmo', 'dev-local-receipt', 'dev@local')}
              >
                Dev · skip payment
              </button>
            )}
          </>
        )}

        {step === 'pay' && rail && (
          <>
            <p className="modal-body">
              Send <strong>${EGS_MONTHLY_USD.toFixed(2)}</strong> via <strong>{RAIL_LABEL[rail]}</strong>{' '}
              to <code>{PAYMENT_HANDLES[rail]}</code>. Memo / note (exact vibe):{' '}
              <code>{boardingNote()}</code>. Then come back and paste proof.
            </p>
            <p className="modal-fine boarding-counterintuitive">
              Friends &amp; family if the app asks. Do not overthink it. That is the old school part.
            </p>
            <div className="modal-actions">
              <button type="button" className="voxel-btn voxel-btn--cyan" onClick={() => setStep('proof')}>
                I paid · paste proof
              </button>
              <button type="button" className="voxel-btn" onClick={() => setStep('rail')}>
                Different rail
              </button>
            </div>
          </>
        )}

        {step === 'proof' && rail && (
          <>
            <p className="modal-body">
              Paste txn id, screenshot filename, or @handle — we issue a 30-day Passenger pass on
              honor. Abuse revokes access.
            </p>
            <label className="boarding-field">
              <span>Receipt / proof</span>
              <input
                className="libretto-input boarding-input"
                value={receipt}
                onChange={(e) => setReceipt(e.target.value)}
                placeholder="txn id, last 4, @you, note text…"
                disabled={busy}
              />
            </label>
            <label className="boarding-field">
              <span>Contact (email or @)</span>
              <input
                className="libretto-input boarding-input"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="optional but helps if we need you"
                disabled={busy}
              />
            </label>
            {error && <p className="player-error">{error}</p>}
            <div className="modal-actions">
              <button
                type="button"
                className="voxel-btn voxel-btn--orange"
                disabled={busy || receipt.trim().length < 3}
                onClick={() => void onSubmit(rail, receipt.trim(), contact.trim())}
              >
                {busy ? 'Issuing pass…' : 'Generate monthly access'}
              </button>
              <button type="button" className="voxel-btn" onClick={() => setStep('pay')} disabled={busy}>
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
