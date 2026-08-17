import { EGS_EXPORT_USD } from '@/lib/paymentRails';
import { MACHOTE_CATALOG_SUBTITLE, MACHOTE_CATALOG_TITLE } from '@/lib/machoteMembership';

interface FairExchangeModalProps {
  open: boolean;
  onClose: () => void;
  onBoard: () => void;
  onCaptainAccess?: () => void;
  onDownload?: () => void;
}

/** Explains free streaming + paid downloads (no monthly stream pass). */
export function FairExchangeModal({ open, onClose, onBoard, onCaptainAccess, onDownload }: FairExchangeModalProps) {
  if (!open) return null;

  return (
    <div className="modal-root modal-root--warm" role="dialog" aria-modal="true" aria-labelledby="fe-title">
      <div className="modal-backdrop modal-backdrop--warm" onClick={onClose} />
      <div className="voxel-panel modal-card modal-card--swamp-warm">
        <p className="modal-eyebrow-warm">Sonic Singularity · Fair Exchange</p>
        <h2 id="fe-title" className="modal-title modal-title--warm">
          Stream free · download ${EGS_EXPORT_USD.toFixed(2)}
        </h2>
        <p className="modal-body modal-body--warm">
          The full <strong>{MACHOTE_CATALOG_TITLE}</strong> ({MACHOTE_CATALOG_SUBTITLE}) streams free on this device —
          no monthly pass, no 30-second cutoff. Want a file for offline or your projects? Each track download is{' '}
          <strong>${EGS_EXPORT_USD.toFixed(2)}</strong> on honor (Venmo · PayPal · Cash App).
        </p>
        <p className="modal-body modal-body--warm modal-body--soft">
          Optional tip jar still lives under Capitan if you want to support the ship — listening never depends on it.
        </p>
        <div className="modal-actions">
          {onDownload ? (
            <button
              type="button"
              className="voxel-btn voxel-btn--swamp-gold"
              onClick={() => {
                onDownload();
              }}
            >
              Download · ${EGS_EXPORT_USD.toFixed(2)}
            </button>
          ) : null}
          <button type="button" className="voxel-btn voxel-btn--swamp-gold" onClick={onClose}>
            Keep listening
          </button>
          <button
            type="button"
            className="voxel-btn voxel-btn--ghost-warm"
            onClick={() => {
              onBoard();
            }}
          >
            Optional tip jar
          </button>
          {onCaptainAccess && (
            <button type="button" className="voxel-btn voxel-btn--ghost-warm" onClick={onCaptainAccess}>
              Capitan / operator
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
