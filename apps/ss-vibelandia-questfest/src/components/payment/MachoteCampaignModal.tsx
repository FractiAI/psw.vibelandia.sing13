import { EGS_MONTHLY_USD } from '@/lib/paymentRails';
import {
  MACHOTE_BEEHIVE_CAMPAIGN_BLURB,
  MACHOTE_BEEHIVE_CTA,
  MACHOTE_BEEHIVE_RESIDENCY_PATH,
  MACHOTE_BEEHIVE_RESIDENCY_TITLE,
  MACHOTE_CAMPAIGN_CTA,
  MACHOTE_CAMPAIGN_EYEBROW,
  MACHOTE_CAMPAIGN_LEDE,
  MACHOTE_CAMPAIGN_REASONS,
  MACHOTE_MAGAZINE_COVER_ALT,
  MACHOTE_MAGAZINE_COVER_SRC,
  MACHOTE_MAGAZINE_NAME,
  MACHOTE_MEMBERS_PASS_TITLE,
  machoteMagazineFollowUrl,
} from '@/lib/machoteMembership';

interface MachoteCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onGetPass: () => void;
}

export function MachoteCampaignModal({ open, onClose, onGetPass }: MachoteCampaignModalProps) {
  if (!open) return null;

  return (
    <div
      className="modal-root modal-root--warm machote-campaign-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="machote-campaign-title"
    >
      <div className="modal-backdrop modal-backdrop--warm" onClick={onClose} aria-hidden />
      <div className="voxel-panel modal-card modal-card--swamp-warm machote-campaign-card">
        <button
          type="button"
          className="machote-campaign-close"
          onClick={onClose}
          aria-label="Close campaign"
        >
          ×
        </button>
        <img
          className="machote-campaign-cover"
          src={MACHOTE_MAGAZINE_COVER_SRC}
          width={480}
          height={640}
          alt={MACHOTE_MAGAZINE_COVER_ALT}
          loading="eager"
          decoding="async"
        />
        <p className="modal-eyebrow-warm">{MACHOTE_CAMPAIGN_EYEBROW}</p>
        <h2 id="machote-campaign-title" className="modal-title modal-title--warm">
          {MACHOTE_MEMBERS_PASS_TITLE}
        </h2>
        <p className="modal-body modal-body--warm machote-campaign-lede">
          <strong>Not the magazine for sale.</strong> {MACHOTE_CAMPAIGN_LEDE}{' '}
          <a href={machoteMagazineFollowUrl()} target="_blank" rel="noopener noreferrer">
            {MACHOTE_MAGAZINE_NAME}
          </a>{' '}
          — then <strong>${EGS_MONTHLY_USD.toFixed(2)}/mo</strong> honor pass unlocks the catalog (not the cover).
        </p>
        <ol className="machote-campaign-reasons">
          {MACHOTE_CAMPAIGN_REASONS.map((r, i) => (
            <li key={r.title}>
              <span className="machote-campaign-num">{i + 1}</span>
              <div>
                <strong>{r.title}</strong>
                <p>{r.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <aside className="machote-campaign-beehive">
          <p className="modal-body modal-body--warm" style={{ margin: 0 }}>
            <strong>New · Layer 9.</strong> {MACHOTE_BEEHIVE_RESIDENCY_TITLE} — {MACHOTE_BEEHIVE_CAMPAIGN_BLURB}
          </p>
          <a className="voxel-btn voxel-btn--ghost-warm machote-campaign-beehive__cta" href={MACHOTE_BEEHIVE_RESIDENCY_PATH}>
            {MACHOTE_BEEHIVE_CTA}
          </a>
        </aside>
        <div className="modal-actions machote-campaign-actions">
          <button type="button" className="voxel-btn voxel-btn--swamp-gold" onClick={onGetPass}>
            {MACHOTE_CAMPAIGN_CTA}
          </button>
          <button type="button" className="voxel-btn voxel-btn--ghost-warm" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
