import { useState } from 'react';
import {
  EGS_MONTHLY_USD,
  PAYMENT_HANDLES,
  RAIL_LABEL,
  boardingNote,
  type LiveRail,
} from '@/lib/paymentRails';

interface BoardingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rail: LiveRail, receipt: string, contact: string) => Promise<void>;
  busy: boolean;
  error: string | null;
}

export function BoardingModal({ open, onClose, onSubmit, busy, error }: BoardingModalProps) {
  const [step, setStep] = useState<'rail' | 'pay' | 'proof'>('rail');
  const [rail, setRail] = useState<LiveRail | null>(null);
  const [receipt, setReceipt] = useState('');
  const [contact, setContact] = useState('');

  if (!open) return null;

  const reset = () => {
    setStep('rail');
    setRail(null);
    setReceipt('');
    setContact('');
  };

  const close = () => {
    reset();
    onClose();
  };

  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={close} />
      <div className="voxel-panel modal-card modal-card--wide">
        <h2 className="modal-title">Reno Swamp Vibe · Passenger Pass</h2>

        {step === 'rail' && (
          <>
            <p className="modal-body">
              Fair Exchange <strong>${EGS_MONTHLY_USD.toFixed(2)}/mo</strong> (EGS φ constant) —
              unlock full video deck, Solenoid lift, 13-channel access, and the 500+ swamp catalog
              for advertising and projects. Pick a rail. No Stripe. Counterintuitive on purpose.
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
