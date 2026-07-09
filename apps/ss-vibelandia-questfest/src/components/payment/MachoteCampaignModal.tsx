import {
  MACHOTE_BOOK_MAIL,
  MACHOTE_CAMPAIGN_CHECKLIST,
  MACHOTE_CAMPAIGN_COVER_ALT,
  MACHOTE_CAMPAIGN_COVER_SRC,
  MACHOTE_CAMPAIGN_EYEBROW,
  MACHOTE_CAMPAIGN_HIRE_CTA,
  MACHOTE_CAMPAIGN_LEDE,
  MACHOTE_CAMPAIGN_QUEST_CTA,
  MACHOTE_CAMPAIGN_TAGLINE,
  MACHOTE_CAMPAIGN_TITLE,
  MACHOTE_CAMPAIGN_UNIVERSE_TEASER,
  MACHOTE_GUEST_PATH,
  MACHOTE_QUESTFEST_UNIVERSE_PATH,
  MACHOTE_ROOM_SERVICE_CAMPAIGN_BLURB,
  MACHOTE_ROOM_SERVICE_REGIONS,
} from '@/lib/machoteMembership';

interface MachoteCampaignModalProps {
  open: boolean;
  onClose: () => void;
  hasMembersAccess?: boolean;
}

export function MachoteCampaignModal({ open, onClose, hasMembersAccess = false }: MachoteCampaignModalProps) {
  if (!open) return null;

  return (
    <div
      className={`modal-root modal-root--warm machote-campaign-root${hasMembersAccess ? ' machote-campaign--member' : ''}`}
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
          src={MACHOTE_CAMPAIGN_COVER_SRC}
          width={480}
          height={640}
          alt={MACHOTE_CAMPAIGN_COVER_ALT}
          loading="eager"
          decoding="async"
        />
        <p className="modal-eyebrow-warm">{MACHOTE_CAMPAIGN_EYEBROW}</p>
        <h2 id="machote-campaign-title" className="modal-title modal-title--warm">
          {MACHOTE_CAMPAIGN_TITLE}
        </h2>
        <p className="machote-campaign-tagline">{MACHOTE_CAMPAIGN_TAGLINE}</p>
        <p className="modal-body modal-body--warm machote-campaign-lede">
          <strong>Need an extra pair of hands?</strong> {MACHOTE_CAMPAIGN_LEDE}
        </p>
        <ul className="machote-campaign-checklist">
          {MACHOTE_CAMPAIGN_CHECKLIST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="machote-campaign-regions">{MACHOTE_ROOM_SERVICE_REGIONS}</p>
        <div className="machote-campaign-dual-nav">
          <a className="machote-campaign-dual-nav__btn machote-campaign-dual-nav__btn--hire" href={MACHOTE_BOOK_MAIL}>
            {MACHOTE_CAMPAIGN_HIRE_CTA}
          </a>
          <a className="machote-campaign-dual-nav__btn machote-campaign-dual-nav__btn--quest" href={MACHOTE_QUESTFEST_UNIVERSE_PATH}>
            {MACHOTE_CAMPAIGN_QUEST_CTA}
          </a>
        </div>
        <aside className="machote-campaign-universe-teaser">
          <p>
            <strong>{MACHOTE_ROOM_SERVICE_CAMPAIGN_BLURB}</strong>
          </p>
          <p>{MACHOTE_CAMPAIGN_UNIVERSE_TEASER}</p>
          <a className="machote-campaign-browse" href={MACHOTE_GUEST_PATH}>
            Browse services →
          </a>
        </aside>
        <div className="modal-actions machote-campaign-actions">
          <button type="button" className="voxel-btn voxel-btn--ghost-warm" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
