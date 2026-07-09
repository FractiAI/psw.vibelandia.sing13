import {
  MACHOTE_CAMPAIGN_COVER_ALT,
  MACHOTE_CAMPAIGN_COVER_SRC,
  MACHOTE_CAMPAIGN_EYEBROW,
  MACHOTE_CAMPAIGN_JOIN_CTA,
  MACHOTE_CAMPAIGN_LEDE,
  MACHOTE_CAMPAIGN_REASONS,
  MACHOTE_CAMPAIGN_TITLE,
  MACHOTE_ROOM_SERVICE_CAMPAIGN_BLURB,
  MACHOTE_ROOM_SERVICE_CTA,
  MACHOTE_ROOM_SERVICE_PATH,
  MACHOTE_ROOM_SERVICE_REGIONS,
  machoteMagazineFollowUrl,
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
        <p className="modal-body modal-body--warm machote-campaign-lede">
          {MACHOTE_CAMPAIGN_LEDE}
        </p>
        <ol className="machote-campaign-reasons">
          {MACHOTE_CAMPAIGN_REASONS.map((r, i) => (
            <li key={r.title}>
              <span className="machote-campaign-num">{i + 1}</span>
              <div>
                <strong>{r.title}</strong>
                <p>
                  {r.body}
                  {r.footerLinkLabel ? (
                    <>
                      {' '}
                      <a href={machoteMagazineFollowUrl()} target="_blank" rel="noopener noreferrer">
                        {r.footerLinkLabel}
                      </a>
                      .
                    </>
                  ) : null}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <aside className="machote-campaign-roomservice">
          <p className="modal-body modal-body--warm" style={{ margin: 0 }}>
            {MACHOTE_ROOM_SERVICE_CAMPAIGN_BLURB} Explore the full service walkthrough.
          </p>
          <p className="modal-body modal-body--warm machote-campaign-roomservice-regions" style={{ margin: '0.5rem 0 0' }}>
            {MACHOTE_ROOM_SERVICE_REGIONS}
          </p>
          <a className="voxel-btn voxel-btn--swamp-gold machote-campaign-roomservice__cta" href={MACHOTE_ROOM_SERVICE_PATH}>
            {MACHOTE_ROOM_SERVICE_CTA}
          </a>
        </aside>
        <div className="modal-actions machote-campaign-actions">
          <a className="voxel-btn voxel-btn--swamp-gold" href={MACHOTE_ROOM_SERVICE_PATH}>
            {MACHOTE_ROOM_SERVICE_CTA}
          </a>
          <a
            className="voxel-btn voxel-btn--swamp-gold"
            href={machoteMagazineFollowUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            {MACHOTE_CAMPAIGN_JOIN_CTA}
          </a>
          <button type="button" className="voxel-btn voxel-btn--ghost-warm" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
