interface FairExchangeModalProps {
  open: boolean;
  onClose: () => void;
  onBoard: () => void;
}

export function FairExchangeModal({ open, onClose, onBoard }: FairExchangeModalProps) {
  if (!open) return null;
  return (
    <div className="modal-root" role="dialog" aria-modal="true" aria-labelledby="fe-title">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="voxel-panel modal-card">
        <h2 id="fe-title" className="modal-title">
          Fair Exchange Required
        </h2>
        <p className="modal-body">
          The Solenoid closed the channel. Board the ship with the EGS constant —{' '}
          <strong>$16.18/mo</strong> — via Venmo, PayPal, or Cash App (manual Fair Exchange). Unlock
          full-track video playback and 13-channel access across the Sovereign Master Playlist.
        </p>
        <div className="modal-actions">
          <button type="button" className="voxel-btn voxel-btn--orange" onClick={onBoard}>
            Board the Ship
          </button>
          <button type="button" className="voxel-btn" onClick={onClose}>
            Stay on Deck
          </button>
        </div>
      </div>
    </div>
  );
}
