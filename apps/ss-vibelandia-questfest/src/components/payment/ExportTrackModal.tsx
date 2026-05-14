import {
  BOOKING_EMAIL,
  CATALOG_EMAIL,
  EGS_EXPORT_USD,
  PAYMENT_HANDLES,
  RAIL_LABEL,
  exportNote,
  type LiveRail,
} from '@/lib/paymentRails';
import type { TrackDef } from '@/lib/demoTracks';

interface ExportTrackModalProps {
  open: boolean;
  track: TrackDef | undefined;
  onClose: () => void;
}

export function ExportTrackModal({ open, track, onClose }: ExportTrackModalProps) {
  if (!open || !track) return null;

  const title = track.title;
  const subject = encodeURIComponent(`EXPORT ${track.id} · ${title}`);
  const body = encodeURIComponent(
    `Track: ${title} (${track.id})\nEGS export: $${EGS_EXPORT_USD.toFixed(2)}\nPaste txn id / @handle proof below:\n\n`,
  );

  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="voxel-panel modal-card modal-card--wide">
        <h2 className="modal-title">Export / download · ${EGS_EXPORT_USD.toFixed(2)}</h2>
        <p className="modal-body">
          Old school Fair Exchange for a single bearing export. Send{' '}
          <strong>${EGS_EXPORT_USD.toFixed(2)}</strong> on Venmo, PayPal, or Cash App — note:{' '}
          <code>{exportNote(title)}</code>. Then email proof; we ship the file.
        </p>
        <div className="rail-grid">
          {(Object.keys(PAYMENT_HANDLES) as LiveRail[]).map((rail) => (
            <div key={rail} className="rail-instruction">
              <span className="rail-instruction-label">{RAIL_LABEL[rail]}</span>
              <code>{PAYMENT_HANDLES[rail]}</code>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <a
            className="voxel-btn voxel-btn--orange"
            href={`mailto:${CATALOG_EMAIL}?subject=${subject}&body=${body}`}
          >
            Email proof · {CATALOG_EMAIL}
          </a>
          <a className="voxel-btn" href={`mailto:${BOOKING_EMAIL}?subject=${subject}`}>
            Or bookings desk
          </a>
          <button type="button" className="voxel-btn voxel-btn--ghost" onClick={onClose}>
            Back to deck
          </button>
        </div>
        <p className="modal-fine">
          Passenger pass includes stream access to the full catalog; export is per-file licensing.
        </p>
      </div>
    </div>
  );
}
