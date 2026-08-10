/**
 * 99 Octave Omni-Lattice product tiers (Fair Exchange / honor rails — no Stripe in v1).
 * Chat/Agent Pass $20 · Chart Standard $29 · Chart Deluxe $49 · Free preview.
 */
export const OCTAVE99_TIERS = Object.freeze({
  free: {
    id: 'free',
    label: 'Free',
    priceUsd: 0,
    cadence: 'forever',
    products: ['bridge-preview', 'chart-preview'],
    blurb: 'Preview the 99 Octave engine. Limited chart draft + Bridge intro.',
  },
  agent: {
    id: 'agent',
    label: 'Agent Pass',
    priceUsd: 20,
    cadence: 'month',
    products: ['chat', 'agent', 'bridge-internal'],
    blurb:
      'Full 99 Octave Lattice Chat Agent + IDE options (Cursor) and OpenRouter BYOK. Bridge routes through SING13 internally.',
  },
  chart_standard: {
    id: 'chart_standard',
    label: '99 Octave Chart',
    priceUsd: 29,
    cadence: 'reading',
    products: ['chart-standard'],
    blurb: 'Natal-style intake → full Digits 0–9 / Octaves 01–99 chart with solar–bio–cosmic bands.',
  },
  chart_deluxe: {
    id: 'chart_deluxe',
    label: '99 Octave Chart Deluxe',
    priceUsd: 49,
    cadence: 'reading',
    products: ['chart-deluxe'],
    blurb: 'Everything in $29 plus morphogenesis swarms, share card, and extended horizon narrative.',
  },
});

export const HONOR_PAY_MAILTO =
  'mailto:valetpru@gmail.com?subject=99%20Octave%20Omni-Lattice%20tier&body=Name%3A%0AEmail%3A%0ATier%3A%20(Agent%20%2420%20%2F%20Chart%20%2429%20%2F%20Deluxe%20%2449)%0A';

export function tierById(id) {
  return OCTAVE99_TIERS[id] || OCTAVE99_TIERS.free;
}
