import { EGS_MONTHLY_USD } from '@/lib/paymentRails';

interface FairExchangeModalProps {
  open: boolean;
  onClose: () => void;
  onBoard: () => void;
}

export function FairExchangeModal({ open, onClose, onBoard }: FairExchangeModalProps) {
  if (!open) return null;
  return (
    <div className="modal-root modal-root--warm" role="dialog" aria-modal="true" aria-labelledby="fe-title">
      <div className="modal-backdrop modal-backdrop--warm" onClick={onClose} />
      <div className="voxel-panel modal-card modal-card--swamp-warm">
        <p className="modal-eyebrow-warm">That was your free taste</p>
        <h2 id="fe-title" className="modal-title modal-title--warm">
          Want the whole swamp?
        </h2>
        <p className="modal-body modal-body--warm">
          You just rode the first <strong>30 seconds</strong> on the house — that is how we say hello
          in Reno. The monthly pass is <strong>${EGS_MONTHLY_USD.toFixed(2)}</strong>, keeps the full
          catalog unlocked, and stays friendly: Venmo, PayPal, or Cash App, no cage, no surprise fees.
        </p>
        <p className="modal-body modal-body--warm modal-body--soft">
          Stay on the free preview anytime. When you are ready, we will have the pass waiting.
        </p>
        <div className="modal-actions">
          <button type="button" className="voxel-btn voxel-btn--swamp-gold" onClick={onBoard}>
            Yes — get the monthly pass
          </button>
          <button type="button" className="voxel-btn voxel-btn--ghost-warm" onClick={onClose}>
            Maybe later · keep browsing
          </button>
        </div>
      </div>
    </div>
  );
}
