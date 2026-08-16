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
      'Free summary — your wheel, signature digits, top Story bands, how to read the wheel, and why $29 / $49 are useful.',
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
      'Overall chart — full Digits 0–9 with intensity, peak octaves, and plain Story labels. No deep narrative pass.',
  },
  chart_deluxe: {
    id: 'chart_deluxe',
    label: 'Your 99 Octave Chart Deluxe',
    priceUsd: 49,
    cadence: 'reading',
    products: ['chart-deluxe'],
    blurb:
      'Narrative deluxe — digit→narrative mapping, pinning questions, morphogenesis swarms, and weekly how-to-use beats.',
  },
});

/** Fair Exchange honor payment rail (Venmo · PayPal · Cash App + attest). */
export const HONOR_PAY_RAIL_BASE = '/hire-a-goldilocks-valet-concierge/pay';

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
