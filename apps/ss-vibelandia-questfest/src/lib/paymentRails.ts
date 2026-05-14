export type LiveRail = 'paypal' | 'venmo' | 'cashapp';

export const EGS_MONTHLY_USD = 16.18;
export const EGS_EXPORT_USD = 1.61;

/** Whole-playlist bulk download: 50% off the per-track export price. */
export const PLAYLIST_BULK_EXPORT_DISCOUNT = 0.5;
export const EGS_EXPORT_PLAYLIST_BUNDLE_PER_TRACK_USD = EGS_EXPORT_USD * PLAYLIST_BULK_EXPORT_DISCOUNT;

const env = import.meta.env;

export const PAYMENT_HANDLES: Record<LiveRail, string> = {
  venmo: env.VITE_VENMO_HANDLE || '@GoldenBachdoor',
  paypal: env.VITE_PAYPAL_HANDLE || 'goldenbackdoorhitfactory@gmail.com',
  cashapp: env.VITE_CASHAPP_HANDLE || '$GoldenBachdoor',
};

export const BOOKING_EMAIL = env.VITE_BOOKING_EMAIL || 'valetpru@gmail.com';
export const CATALOG_EMAIL = env.VITE_CATALOG_EMAIL || 'goldenbackdoorhitfactory@gmail.com';

export const RAIL_LABEL: Record<LiveRail, string> = {
  venmo: 'Venmo',
  paypal: 'PayPal',
  cashapp: 'Cash App',
};

export function boardingNote(): string {
  return 'QUESTFEST PASS · Reno Swamp Vibe · $16.18';
}

export function exportNote(trackTitle: string): string {
  return `EXPORT · ${trackTitle} · $1.61`;
}
