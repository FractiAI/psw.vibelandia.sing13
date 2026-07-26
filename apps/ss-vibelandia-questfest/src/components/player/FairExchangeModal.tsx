import { EGS_MONTHLY_USD } from '@/lib/paymentRails';
import {
  MACHOTE_CATALOG_SUBTITLE,
  MACHOTE_CATALOG_TITLE,
  MACHOTE_CREW_LINE,
  MACHOTE_LIFE_PITCH,
  MACHOTE_MAGAZINE_NAME,
  MACHOTE_MEMBERS_PASS_TITLE,
} from '@/lib/machoteMembership';
import { hasClaimedCatalogTrial } from '@/lib/localMonthlyHonor';
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
  const honorIsTrial = useSessionStore((s) => s.honorIsTrial);
  const trialUsed = typeof window !== 'undefined' ? hasClaimedCatalogTrial() : false;

  if (!open) return null;

  if (isPassenger) {
    const untilLabel = honorValidUntil
      ? new Date(honorValidUntil + 'T12:00:00').toLocaleDateString()
      : null;
    return (
      <div className="modal-root modal-root--warm" role="dialog" aria-modal="true" aria-labelledby="fe-member-title">
        <div className="modal-backdrop modal-backdrop--warm" onClick={onClose} />
        <div className="voxel-panel modal-card modal-card--swamp-warm">
          <p className="modal-eyebrow-warm">{honorIsTrial ? 'Free month active' : 'Members pass active'}</p>
          <h2 id="fe-member-title" className="modal-title modal-title--warm">
            {honorIsTrial ? 'First month is on us' : 'You already have the pass'}
          </h2>
          <p className="modal-body modal-body--warm">
            {untilLabel ? (
              honorIsTrial ? (
                <>
                  Full catalog play on this device through <strong>{untilLabel}</strong>. After that, tip{' '}
                  <strong>${EGS_MONTHLY_USD.toFixed(2)}</strong> in the tip jar to keep listening — or fall back to
                  30-second previews.
                </>
              ) : (
                <>
                  Your Machote members-only pass on this device is active through <strong>{untilLabel}</strong>. Full
                  play and background audio are unlocked — no need to tip again until then.
                </>
              )
            ) : (
              <>
                Your <strong>{MACHOTE_MAGAZINE_NAME}</strong> members pass is active on this device. Full play is
                unlocked.
              </>
            )}
          </p>
          <div className="modal-actions">
            {honorIsTrial && (
              <button type="button" className="voxel-btn voxel-btn--swamp-gold" onClick={onBoard}>
                Tip jar · stay after free month
              </button>
            )}
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
        <p className="modal-eyebrow-warm">That was your free 30-second taste</p>
        <h2 id="fe-title" className="modal-title modal-title--warm">
          {MACHOTE_MEMBERS_PASS_TITLE}
        </h2>
        <p className="modal-body modal-body--warm">
          You just rode the first <strong>30 seconds</strong> on the house — that preview stays for guests without a
          pass. <strong>First month of full {MACHOTE_CATALOG_TITLE} access is on us</strong> (
          {MACHOTE_CATALOG_SUBTITLE}
          ). After that month, tip <strong>${EGS_MONTHLY_USD.toFixed(2)}</strong> in the tip jar (Venmo · PayPal · Cash
          App) to keep full listens.
        </p>
        {trialUsed && (
          <p className="modal-body modal-body--warm modal-body--soft">
            Your free month was already claimed on this device — tip ${EGS_MONTHLY_USD.toFixed(2)} to unlock another 30
            days, or keep browsing with 30-second previews.
          </p>
        )}
        <p className="modal-body modal-body--warm modal-body--soft">{MACHOTE_LIFE_PITCH}</p>
        <p className="modal-body modal-body--warm modal-body--soft">{MACHOTE_CREW_LINE}</p>
        <div className="modal-actions">
          <button type="button" className="voxel-btn voxel-btn--swamp-gold" onClick={onBoard}>
            {trialUsed ? 'Tip jar · keep full access' : 'Claim first month free'}
          </button>
          {onCaptainAccess && (
            <button type="button" className="voxel-btn voxel-btn--ghost-warm" onClick={onCaptainAccess}>
              Capitan / operator — unlock with password
            </button>
          )}
          <button type="button" className="voxel-btn voxel-btn--ghost-warm" onClick={onClose}>
            Maybe later · keep 30s previews
          </button>
        </div>
      </div>
    </div>
  );
}
