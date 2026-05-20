import { EGS_MONTHLY_USD } from '@/lib/paymentRails';
import {
  MACHOTE_CATALOG_SUBTITLE,
  MACHOTE_CATALOG_TITLE,
  MACHOTE_CREW_LINE,
  MACHOTE_LIFE_PITCH,
  MACHOTE_MAGAZINE_NAME,
  MACHOTE_MEMBERS_PASS_TITLE,
} from '@/lib/machoteMembership';
import { useSessionStore } from '@/stores/sessionStore';

interface FairExchangeModalProps {
  open: boolean;
  onClose: () => void;
  onBoard: () => void;
  onCaptainAccess?: () => void;
}

export function FairExchangeModal({ open, onClose, onBoard, onCaptainAccess }: FairExchangeModalProps) {
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const honorValidUntil = useSessionStore((s) => s.honorValidUntil);

  if (!open) return null;

  if (isPassenger) {
    const untilLabel = honorValidUntil
      ? new Date(honorValidUntil + 'T12:00:00').toLocaleDateString()
      : null;
    return (
      <div className="modal-root modal-root--warm" role="dialog" aria-modal="true" aria-labelledby="fe-member-title">
        <div className="modal-backdrop modal-backdrop--warm" onClick={onClose} />
        <div className="voxel-panel modal-card modal-card--swamp-warm">
          <p className="modal-eyebrow-warm">Members pass active</p>
          <h2 id="fe-member-title" className="modal-title modal-title--warm">
            You already have the pass
          </h2>
          <p className="modal-body modal-body--warm">
            {untilLabel ? (
              <>
                Your Machote members-only pass on this device is active through{' '}
                <strong>{untilLabel}</strong>. Full play and background audio are unlocked — no need to pay again.
              </>
            ) : (
              <>
                Your <strong>{MACHOTE_MAGAZINE_NAME}</strong> members pass is active on this device. Full play is
                unlocked — no need to pay again.
              </>
            )}
          </p>
          <div className="modal-actions">
            <button type="button" className="voxel-btn voxel-btn--swamp-gold" onClick={onClose}>
              Keep listening
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-root modal-root--warm" role="dialog" aria-modal="true" aria-labelledby="fe-title">
      <div className="modal-backdrop modal-backdrop--warm" onClick={onClose} />
      <div className="voxel-panel modal-card modal-card--swamp-warm">
        <p className="modal-eyebrow-warm">That was your free taste</p>
        <h2 id="fe-title" className="modal-title modal-title--warm">
          {MACHOTE_MEMBERS_PASS_TITLE}
        </h2>
        <p className="modal-body modal-body--warm">
          You just rode the first <strong>30 seconds</strong> on the house.{' '}
          <strong>{MACHOTE_MAGAZINE_NAME}</strong> members unlock the full{' '}
          <strong>{MACHOTE_CATALOG_TITLE}</strong> — {MACHOTE_CATALOG_SUBTITLE} — for{' '}
          <strong>${EGS_MONTHLY_USD.toFixed(2)}/month</strong> after you follow the magazine and pay on honor (Venmo,
          PayPal, or Cash App).
        </p>
        <p className="modal-body modal-body--warm modal-body--soft">{MACHOTE_LIFE_PITCH}</p>
        <p className="modal-body modal-body--warm modal-body--soft">{MACHOTE_CREW_LINE}</p>
        <div className="modal-actions">
          <button type="button" className="voxel-btn voxel-btn--swamp-gold" onClick={onBoard}>
            Get the members-only pass
          </button>
          {onCaptainAccess && (
            <button type="button" className="voxel-btn voxel-btn--ghost-warm" onClick={onCaptainAccess}>
              Capitan / operator — unlock with password
            </button>
          )}
          <button type="button" className="voxel-btn voxel-btn--ghost-warm" onClick={onClose}>
            Maybe later · keep browsing
          </button>
        </div>
      </div>
    </div>
  );
}
