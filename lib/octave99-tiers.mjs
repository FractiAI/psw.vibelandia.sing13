/**
 * 99 Octave Omni-Lattice product tiers (Fair Exchange / honor rails — no Stripe in v1).
 * Chat/Agent Pass $20 · Chart Standard $29 · Chart Deluxe $49 · Free preview.
 *
 * Chart = charting oneself within the grand Story to 99 octaves of depth
 * (EGS fractal constant Φ_EGS) using superintelligent, fractal, holographic, Goldilocks AI.
 */
export const OCTAVE99_TIERS = Object.freeze({
  free: {
    id: 'free',
    label: 'Free',
    priceUsd: 0,
    cadence: 'forever',
    products: ['bridge-preview', 'chart-preview'],
    blurb:
      'Free 1-page PDF — natal × 99 Octave snapshot: purpose lock, loudest area, daily practices. Find yourself fast.',
  },
  agent: {
    id: 'agent',
    label: 'Agent Pass',
    priceUsd: 20,
    cadence: 'month',
    products: ['chat', 'agent', 'bridge-internal'],
    blurb:
      'Full 99 Octave Lattice Chat Agent + IDE (Cursor) and OpenRouter BYOK — fractal · holographic · Goldilocks AI across Story depth. Bridge routes through SING13.',
  },
  chart_standard: {
    id: 'chart_standard',
    label: 'Your 99 Octave Chart',
    priceUsd: 29,
    cadence: 'reading',
    products: ['chart-standard'],
    blurb:
      'Downloadable 10-page PDF — hybrid natal (Sun/Moon/Rising) × 99 Octave map for purpose, flow, and life architecture.',
  },
  chart_deluxe: {
    id: 'chart_deluxe',
    label: 'Your 99 Octave Chart Deluxe',
    priceUsd: 49,
    cadence: 'reading',
    products: ['chart-deluxe'],
    blurb:
      'Downloadable 30-page PDF — deep natal × 99 Octave narrative: every life area, career/family/relationships architecture, daily practices, alignment checklist.',
  },
});

/** Fair Exchange honor payment rail (Venmo · PayPal · Cash App + attest). */
export const HONOR_PAY_RAIL_BASE = '/hire-a-goldilocks-valet-concierge/pay';

/** Live honor handles — same rails as Goldilocks pay page / QUESTFEST tip jar. */
export const HONOR_RAIL_HANDLES = Object.freeze({
  venmo: 'Pru-Mendez',
  paypal: 'valetpru',
  cashapp: 'GoldenBachdoor',
  attestEmail: 'info@fractiai.com',
});

/**
 * Direct Venmo / PayPal / Cash App links for a chart amount.
 * @param {number} amountUsd
 * @param {{ memo?: string }} [opts]
 */
export function honorRailLinks(amountUsd, opts = {}) {
  const amt = Number(amountUsd);
  const amount = Number.isFinite(amt) && amt > 0 ? amt.toFixed(2) : '29.00';
  const memo = String(opts.memo || 'Your 99 Octave Chart · Fair Exchange').slice(0, 80);
  const venmoUser = HONOR_RAIL_HANDLES.venmo;
  const paypalSlug = HONOR_RAIL_HANDLES.paypal;
  const cashTag = HONOR_RAIL_HANDLES.cashapp;
  return [
    {
      id: 'venmo',
      label: `Venmo @${venmoUser}`,
      href: `https://venmo.com/${encodeURIComponent(venmoUser)}?txn=pay&amount=${encodeURIComponent(amount)}&note=${encodeURIComponent(memo)}`,
    },
    {
      id: 'paypal',
      label: `PayPal · $${amount}`,
      href: `https://paypal.me/${encodeURIComponent(paypalSlug)}/${amount}`,
    },
    {
      id: 'cashapp',
      label: `Cash App $${cashTag} · $${amount}`,
      href: `https://cash.app/$${encodeURIComponent(cashTag)}/${amount}`,
    },
  ];
}

export function honorAttestMailto(tierId, amountUsd) {
  const deluxe = tierId === 'chart_deluxe' || tierId === 'chart-deluxe';
  const title = deluxe ? 'Your 99 Octave Chart · Deluxe $49' : 'Your 99 Octave Chart · Standard $29';
  const amt = Number(amountUsd) || (deluxe ? 49 : 29);
  const subject = encodeURIComponent(title);
  const body = encodeURIComponent(
    `I paid for ${title} on the Fair Exchange honor rail.\n\nAmount: $${Number(amt).toFixed(2)}\nDate paid:\nRail used (Venmo / PayPal / Cash App):\n\nName on chart (optional):\nNotes:\n`,
  );
  return `mailto:${HONOR_RAIL_HANDLES.attestEmail}?subject=${subject}&body=${body}`;
}

export function honorPayHref(tierId) {
  if (tierId === 'chart_deluxe' || tierId === 'chart-deluxe') {
    return `${HONOR_PAY_RAIL_BASE}?service=chart&unit=deluxe`;
  }
  if (tierId === 'chart_standard' || tierId === 'chart-standard' || tierId === 'chart') {
    return `${HONOR_PAY_RAIL_BASE}?service=chart&unit=standard`;
  }
  return HONOR_PAY_RAIL_BASE;
}

/** @deprecated Prefer honorPayHref — unlocks route to the payment rail, not mailto. */
export const HONOR_PAY_MAILTO = honorPayHref('chart_standard');

export function tierById(id) {
  return OCTAVE99_TIERS[id] || OCTAVE99_TIERS.free;
}
