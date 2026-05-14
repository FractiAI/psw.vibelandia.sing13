import {
  BOOKING_EMAIL,
  CATALOG_EMAIL,
  EGS_EXPORT_USD,
  EGS_MONTHLY_USD,
} from '@/lib/paymentRails';

interface CatalogPanelProps {
  onExport: () => void;
  onBoard: () => void;
  isPassenger: boolean;
}

export function CatalogPanel({ onExport, onBoard, isPassenger }: CatalogPanelProps) {
  return (
    <section className="voxel-panel catalog-panel">
      <h3 className="catalog-title">Reno Swamp · Caliente Catalog</h3>
      <p className="catalog-lede">
        <strong>500+</strong> calibration tracks — swamp beats, holographic wrong-side-of-town
        bearings — cleared for advertising, sync, and project use when you ride Passenger.
      </p>
      <ul className="catalog-list">
        <li>
          Monthly pass <strong>${EGS_MONTHLY_USD.toFixed(2)}</strong> — Venmo, PayPal, or Cash App
          (manual, old school, counterintuitive on purpose).
        </li>
        <li>
          Per-track download / export <strong>${EGS_EXPORT_USD.toFixed(2)}</strong> — same rails,
          email proof.
        </li>
        <li>Residents · vendors · cast · crew — contact for tier ladders beyond Passenger.</li>
      </ul>
      <div className="catalog-actions">
        {!isPassenger && (
          <button type="button" className="voxel-btn voxel-btn--orange" onClick={onBoard}>
            Board · ${EGS_MONTHLY_USD.toFixed(2)}/mo
          </button>
        )}
        <button type="button" className="voxel-btn voxel-btn--cyan" onClick={onExport}>
          Export track · ${EGS_EXPORT_USD.toFixed(2)}
        </button>
        <a className="voxel-btn" href={`mailto:${BOOKING_EMAIL}?subject=QUESTFEST%20Booking`}>
          Bookings
        </a>
        <a
          className="voxel-btn voxel-btn--ghost"
          href={`mailto:${CATALOG_EMAIL}?subject=Catalog%20%2F%20Licensing%20(500%2B)`}
        >
          Catalog / licensing
        </a>
      </div>
      <p className="catalog-fine">
        No Stripe. No cage. You pay, you paste the receipt, we issue the pass. That is the vibe.
      </p>
    </section>
  );
}
