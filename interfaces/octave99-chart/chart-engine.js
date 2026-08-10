/**
 * Deterministic 99 Octave chart engine (architectural / catalog — not predictive astrology).
 * Maps birth/place/time intake → digit bands 0–9 and octave 01–99.
 */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DIGIT_DOMAINS = Object.freeze([
  { digit: 0, octaves: [1, 9], domain: 'Zero-Point Vacuum & Phase Lock', horizon: 'Boötes / KBC voids' },
  { digit: 1, octaves: [10, 19], domain: 'Sub-Atomic Pinion & Polarization', horizon: 'Local Group' },
  { digit: 2, octaves: [20, 29], domain: 'Binary Coupling & Charge Symmetry', horizon: 'Virgo Cluster' },
  { digit: 3, octaves: [30, 39], domain: 'Molecular Triangulation', horizon: 'Laniakea / Great Attractor' },
  { digit: 4, octaves: [40, 49], domain: '4D Container · Biological Switch', horizon: 'SMACS 0723' },
  { digit: 5, octaves: [50, 59], domain: '5D Cognitive Network', horizon: 'Hercules–Corona Borealis Wall' },
  { digit: 6, octaves: [60, 69], domain: 'Agentic Hexa-Lattice Consensus', horizon: 'High-z quasars / AGN' },
  { digit: 7, octaves: [70, 79], domain: 'Magnetospheric Shielding', horizon: 'Reionization galaxies' },
  { digit: 8, octaves: [80, 89], domain: 'Stellar Octal Core Dynamics', horizon: 'Dark Ages / HI horizon' },
  { digit: 9, octaves: [90, 99], domain: 'Nonary Filaments & Enclosure', horizon: 'CMB (z≈1100)' },
]);

function hashString(s) {
  let h = 2166136261;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {{ name: string, birthDate: string, birthTime?: string, birthPlace?: string, lat?: number, lon?: number }} intake
 */
export function buildOctave99Chart(intake) {
  const name = String(intake.name || 'Traveler').trim() || 'Traveler';
  const birthDate = String(intake.birthDate || '').trim();
  const birthTime = String(intake.birthTime || '12:00').trim();
  const birthPlace = String(intake.birthPlace || 'Unknown').trim();
  const seed = hashString(`${name}|${birthDate}|${birthTime}|${birthPlace}|${intake.lat}|${intake.lon}`);
  const rnd = mulberry32(seed);

  const date = birthDate ? new Date(`${birthDate}T${birthTime}`) : new Date();
  const dayOfYear = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(date.getFullYear(), 0, 0)) /
      86400000,
  );
  const hour = date.getHours() + date.getMinutes() / 60;

  /** Rising-like digit: hour + longitude pinch */
  const lon = typeof intake.lon === 'number' ? intake.lon : (rnd() - 0.5) * 360;
  const lat = typeof intake.lat === 'number' ? intake.lat : (rnd() - 0.5) * 140;
  const risingDigit = Math.floor((((hour / 24) * 10 + ((lon + 180) / 360) * 10) / 2) % 10);
  const sunDigit = Math.floor((((dayOfYear % 365) / 365) * 10 + rnd() * 0.2) % 10);
  const moonDigit = Math.floor((risingDigit * PHI_EGS + sunDigit) % 10);

  const bands = DIGIT_DOMAINS.map((d) => {
    const intensity = Math.round(35 + rnd() * 55 + (d.digit === risingDigit ? 18 : 0) + (d.digit === sunDigit ? 12 : 0));
    const peakOctave =
      d.octaves[0] + Math.floor(rnd() * (d.octaves[1] - d.octaves[0] + 1));
    return {
      ...d,
      intensity: Math.min(100, intensity),
      peakOctave,
      emphasis: d.digit === risingDigit || d.digit === sunDigit || d.digit === moonDigit,
    };
  });

  const morphogenesis = {
    silicon: bands[3].intensity,
    carbon: bands[4].intensity,
    hydrogen: bands[1].intensity,
    theater: Math.round((bands[5].intensity + bands[9].intensity) / 2),
  };

  return {
    schema: 'octave99-chart/v1',
    honesty:
      'Architectural 99 Octave Omni-Lattice chart — catalog metaphor mapped from intake. Not predictive astrology, medical advice, or empirical ephemeris.',
    phiEgs: PHI_EGS,
    intake: { name, birthDate, birthTime, birthPlace, lat, lon },
    signature: {
      risingDigit,
      sunDigit,
      moonDigit,
      seed: seed.toString(16),
    },
    bands,
    morphogenesis,
    generatedAt: new Date().toISOString(),
  };
}

export function chartSvg(chart, { deluxe = false } = {}) {
  const cx = 200;
  const cy = 200;
  const rOuter = 170;
  const rInner = 70;
  const wedges = chart.bands
    .map((b, i) => {
      const a0 = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const a1 = ((i + 1) / 10) * Math.PI * 2 - Math.PI / 2;
      const r = rInner + ((rOuter - rInner) * b.intensity) / 100;
      const x0 = cx + Math.cos(a0) * r;
      const y0 = cy + Math.sin(a0) * r;
      const x1 = cx + Math.cos(a1) * r;
      const y1 = cy + Math.sin(a1) * r;
      const large = 0;
      const fill = b.emphasis ? '#d4af37' : `rgba(245,230,200,${0.25 + b.intensity / 200})`;
      const mid = (a0 + a1) / 2;
      const lx = cx + Math.cos(mid) * (rOuter + 14);
      const ly = cy + Math.sin(mid) * (rOuter + 14);
      return `<path d="M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z" fill="${fill}" stroke="#0a0806" stroke-width="1"/><text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" fill="#f5e6c8" font-size="11" font-family="Georgia, serif">${b.digit}</text>`;
    })
    .join('');
  const title = deluxe ? '99 Octave Chart · Deluxe' : '99 Octave Chart';
  const sub = `${chart.intake.name} · Digits ↑${chart.signature.risingDigit} ☉${chart.signature.sunDigit} ☾${chart.signature.moonDigit}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 460" role="img" aria-label="${title}">
  <rect width="400" height="460" fill="#0a0806"/>
  <text x="200" y="28" text-anchor="middle" fill="#d4af37" font-size="16" font-family="Georgia, serif">${title}</text>
  <text x="200" y="48" text-anchor="middle" fill="#a8a29e" font-size="11" font-family="system-ui,sans-serif">${sub}</text>
  <g transform="translate(0 20)">${wedges}
  <circle cx="${cx}" cy="${cy}" r="${rInner - 8}" fill="#14100c" stroke="#d4af37" stroke-width="1.5"/>
  <text x="${cx}" y="${cy - 6}" text-anchor="middle" fill="#fef3c7" font-size="13" font-family="Georgia, serif">Φ</text>
  <text x="${cx}" y="${cy + 12}" text-anchor="middle" fill="#a8a29e" font-size="9">${PHI_EGS.toFixed(4)}</text>
  </g>
  <text x="200" y="448" text-anchor="middle" fill="#78716c" font-size="9">Catalog metaphor · Fair Exchange · ∞¹³</text>
</svg>`;
}
