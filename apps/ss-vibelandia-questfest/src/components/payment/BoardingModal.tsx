import type { PaymentRail } from '@/stores/sessionStore';

interface BoardingModalProps {
  open: boolean;
  onClose: () => void;
  onPaid: (rail: PaymentRail) => void;
}

export function BoardingModal({ open, onClose, onPaid }: BoardingModalProps) {
  if (!open) return null;
  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="voxel-panel modal-card modal-card--wide">
        <h2 className="modal-title">Reno Swamp Vibe · Passenger Pass</h2>
        <p className="modal-body">
          Recurring Fair Exchange <strong>$16.18/mo</strong> (EGS constant) — unlock the full deck, the Solenoid
          lifts, and 13-channel access. Pick a payment rail (live processors wire in next sprint).
        </p>
        <div className="rail-grid">
          <button type="button" className="voxel-btn voxel-btn--orange" onClick={() => onPaid('paypal')}>
            PayPal
          </button>
          <button type="button" className="voxel-btn voxel-btn--cyan" onClick={() => onPaid('venmo')}>
            Venmo
          </button>
          <button type="button" className="voxel-btn" onClick={() => onPaid('cashapp')}>
            Cash App
          </button>
          <button type="button" className="voxel-btn voxel-btn--ghost" onClick={() => onPaid('demo')}>
            Demo · instant Pass
          </button>
        </div>
        <p className="modal-fine">
          Demo issues a Pass Token (JWT-shaped) in local storage — identity-light session. Rotate to live
          PSP webhooks when ready.
        </p>
      </div>
    </div>
  );
}
