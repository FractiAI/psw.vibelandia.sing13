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

/** PayPal.me slug; optional — otherwise derived from PayPal handle email local-part. */
function paypalMeSlug(): string {
  const slug = env.VITE_PAYPAL_PAYPALME?.trim();
  if (slug) return slug.replace(/^\/+|\/+$/g, '');
  const h = PAYMENT_HANDLES.paypal.trim();
  if (h.includes('@')) {
    const local = h.split('@')[0].replace(/[^a-zA-Z0-9-]/g, '');
    if (local) return local;
  }
  return h.replace(/[^a-zA-Z0-9-]/g, '') || 'recipient';
}

export interface RailCheckoutLinks {
  /** Primary — opens app or web checkout where supported */
  href: string;
  /** Secondary link when `href` is a custom scheme (e.g. Venmo app) */
  webFallbackHref?: string;
}

/**
 * URLs to send the listener into Venmo / PayPal / Cash App with amount + memo when the platform allows it.
 */
export function railCheckoutLinks(rail: LiveRail, amountUsd: number, memo: string): RailCheckoutLinks {
  const amt = amountUsd.toFixed(2);
  const note = encodeURIComponent(memo.trim());

  switch (rail) {
    case 'venmo': {
      const user = PAYMENT_HANDLES.venmo.replace(/^@/, '').trim();
      const app = `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(user)}&amount=${amt}&note=${note}`;
      const web = `https://venmo.com/${encodeURIComponent(user)}`;
      return { href: app, webFallbackHref: web };
    }
    case 'cashapp': {
      const tag = PAYMENT_HANDLES.cashapp.replace(/^\$/, '').trim();
      return {
        href: `https://cash.app/$${encodeURIComponent(tag)}/${amt}`,
      };
    }
    case 'paypal': {
      const slug = paypalMeSlug();
      return {
        href: `https://paypal.me/${encodeURIComponent(slug)}/${amt}`,
      };
    }
  }
}
