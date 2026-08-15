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
      'Preview Bridge + one draft 99 Octave Chart — chart yourself in the grand Story (Φ_EGS depth map).',
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
    label: '99 Octave Chart',
    priceUsd: 29,
    cadence: 'reading',
    products: ['chart-standard'],
    blurb:
      'Chart yourself within the grand Story to 99 octaves of depth (Φ_EGS) using fractal · holographic · Goldilocks AI — Digits 0–9 × Octaves 01–99 Story map.',
  },
  chart_deluxe: {
    id: 'chart_deluxe',
    label: '99 Octave Chart Deluxe',
    priceUsd: 49,
    cadence: 'reading',
    products: ['chart-deluxe'],
    blurb:
      'Deeper Story reading: everything in $29 plus morphogenesis swarms, share card, and extended horizon narrative.',
  },
});

export const HONOR_PAY_MAILTO =
  'mailto:info@fractiai.com?subject=99%20Octave%20Omni-Lattice%20tier&body=Name%3A%0AEmail%3A%0ATier%3A%20(Agent%20%2420%20%2F%20Chart%20%2429%20%2F%20Deluxe%20%2449)%0A';

export function tierById(id) {
  return OCTAVE99_TIERS[id] || OCTAVE99_TIERS.free;
}
