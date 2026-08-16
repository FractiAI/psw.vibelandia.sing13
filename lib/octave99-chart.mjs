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

/** Guest-facing Story labels for Digits 0–9 (catalog domains stay on bands). */
export const DIGIT_STORY_LABELS = Object.freeze([
  { digit: 0, label: 'Quiet foundation', use: 'Reset, still points, starting from zero without rush.' },
  { digit: 1, label: 'Spark & polarity', use: 'First moves, yes/no forks, choosing a charge.' },
  { digit: 2, label: 'Bonds & pairing', use: 'Partnerships, mirrors, two-way rhythm.' },
  { digit: 3, label: 'Craft triangulation', use: 'Making, composing, locking three points into form.' },
  { digit: 4, label: 'Body container', use: 'Pace, health-of-life container, when to switch modes.' },
  { digit: 5, label: 'Mind network', use: 'Attention, learning loops, where your mind wants to roam.' },
  { digit: 6, label: 'Agents & crew', use: 'Who helps, who you help, collaboration hex.' },
  { digit: 7, label: 'Shields & boundaries', use: 'What to keep out, what to protect, recovery space.' },
  { digit: 8, label: 'Core fire', use: 'Stamina, long burn, the engine under the week.' },
  { digit: 9, label: 'Whole & enclosure', use: 'Closing loops, legacy frames, the big picture lid.' },
]);

export const WHEEL_READING_GUIDE = Object.freeze([
  'Ten slices = Digits 0–9 — each is one Story band.',
  'Longer slice = louder band for you right now.',
  'Gold slices = signature digits (↑ rising · ☉ sun · ☾ moon).',
  'Center Φ is the depth key — not a prediction engine.',
  'Use loud bands as attention cues; quiet bands as rest or underused capacity.',
]);

function storyForDigit(digit) {
  return DIGIT_STORY_LABELS[digit] || DIGIT_STORY_LABELS[0];
}

function rankedBands(chart) {
  return [...chart.bands].sort((a, b) => b.intensity - a.intensity);
}

/**
 * Build tiered reading copy for free / standard / deluxe.
 * @param {ReturnType<typeof buildOctave99Chart>} chart
 * @param {{ tier?: string, focus?: string, season?: string, question?: string, lens?: string }} [opts]
 */
export function buildChartReading(chart, opts = {}) {
  const tier = opts.tier || 'free';
  const ranked = rankedBands(chart);
  const top = ranked.slice(0, 3);
  const quiet = ranked.slice(-2).reverse();
  const sig = chart.signature;
  const name = chart.intake.name;

  const summary = {
    headline: `${name} · Story summary`,
    signatureLine: `Signature digits ↑${sig.risingDigit} · ☉${sig.sunDigit} · ☾${sig.moonDigit} (gold on the wheel).`,
    loudest: top.map((b) => ({
      digit: b.digit,
      label: storyForDigit(b.digit).label,
      peakOctave: b.peakOctave,
      intensity: b.intensity,
      domain: b.domain,
      use: storyForDigit(b.digit).use,
    })),
    quieter: quiet.map((b) => ({
      digit: b.digit,
      label: storyForDigit(b.digit).label,
      intensity: b.intensity,
    })),
    howToUse: [
      `Start with Digit ${top[0].digit} (${storyForDigit(top[0].digit).label}) — your loudest band this chart.`,
      'Treat gold slices as “home keys”: return to them when the week frays.',
      'Quiet bands are not failures — they are rest lanes or unused capacity.',
      'Re-run the chart when a season changes; the wheel is a map, not a verdict.',
    ],
  };

  const overview = chart.bands.map((b) => {
    const story = storyForDigit(b.digit);
    return {
      digit: b.digit,
      label: story.label,
      octaves: b.octaves,
      peakOctave: b.peakOctave,
      intensity: b.intensity,
      emphasis: b.emphasis,
      domain: b.domain,
      line: `Digit ${b.digit} · ${story.label} · peak O${b.peakOctave} · ${b.intensity}% — ${story.use}`,
    };
  });

  const focus = String(opts.focus || '').trim();
  const season = String(opts.season || '').trim();
  const question = String(opts.question || '').trim();
  const lens = String(opts.lens || '').trim();

  const narratives = chart.bands.map((b) => {
    const story = storyForDigit(b.digit);
    const role = b.emphasis ? 'signature' : b.intensity >= 70 ? 'loud' : b.intensity <= 45 ? 'quiet' : 'steady';
    let beat =
      role === 'signature'
        ? `This is one of your gold keys. Lean on ${story.label.toLowerCase()} when you need orientation.`
        : role === 'loud'
          ? `This band is running hot — ${story.use}`
          : role === 'quiet'
            ? `This band is soft — protect it as recovery, or invite it gently when you need balance.`
            : `Steady presence — keep ${story.label.toLowerCase()} in the mix without forcing it.`;
    if (focus) beat += ` Toward “${focus}”: notice how Digit ${b.digit} shows up in that arena.`;
    if (lens) beat += ` Through a ${lens} lens, ask what Digit ${b.digit} wants this week.`;
    return {
      digit: b.digit,
      label: story.label,
      octaves: b.octaves,
      peakOctave: b.peakOctave,
      intensity: b.intensity,
      emphasis: b.emphasis,
      domain: b.domain,
      horizon: b.horizon,
      role,
      narrative: `Digit ${b.digit} (${story.label}, octaves ${b.octaves[0]}–${b.octaves[1]}, peak ${b.peakOctave}). Catalog shelf: ${b.domain}. ${beat}`,
    };
  });

  const deluxeBridge = {
    season: season || null,
    question: question || null,
    focus: focus || null,
    lens: lens || null,
    morphogenesis: chart.morphogenesis,
    morphoPlain:
      `Morphogenesis swarms — Silicon (craft) ${chart.morphogenesis.silicon} · Carbon (body) ${chart.morphogenesis.carbon} · Hydrogen (spark) ${chart.morphogenesis.hydrogen} · Theater (stage) ${chart.morphogenesis.theater}. ` +
      'Use Silicon when making, Carbon when pacing the body, Hydrogen for first sparks, Theater when the story needs an audience.',
    whyUseful: [
      'Detailed digit→narrative mapping turns the wheel into a weekly checklist, not just a picture.',
      'Your extra answers pin the map to a real season and question so the loud bands become next steps.',
      'Morphogenesis swarms show which “material” of the Story (craft / body / spark / stage) is active.',
    ],
  };

  const upsell = {
    standard: {
      price: 29,
      href: '/hire-a-goldilocks-valet-concierge/pay?service=chart&unit=standard',
      title: 'Standard · $29 — overall chart',
      why: 'See all ten Digits with intensity, peak octaves, and plain Story labels — the full wheel overview without the deep narrative pass.',
      useful: 'Best when you want the complete map to orient decisions, seasons, and signature keys.',
    },
    deluxe: {
      price: 49,
      href: '/hire-a-goldilocks-valet-concierge/pay?service=chart&unit=deluxe',
      title: 'Deluxe · $49 — narrative mapping',
      why: 'Digit-by-digit narrative, morphogenesis swarms, and a few pinning questions so the chart answers what you are actually holding.',
      useful: 'Best when you want language you can act on — weekly beats, focus arena, and how to use each band.',
    },
  };

  return {
    tier,
    guide: WHEEL_READING_GUIDE,
    summary,
    overview,
    narratives,
    deluxeBridge,
    upsell,
  };
}

export function chartSvg(chart, { deluxe = false, example = false, tier = null } = {}) {
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
  const resolvedTier = tier || (deluxe ? 'chart_deluxe' : example ? 'example' : 'chart_standard');
  const title = example
    ? 'Example · Your 99 Octave Chart wheel'
    : resolvedTier === 'free'
      ? 'Your 99 Octave Chart · Free summary'
      : resolvedTier === 'chart_deluxe' || deluxe
        ? 'Your 99 Octave Chart · Deluxe'
        : 'Your 99 Octave Chart · Overall';
  const sub = `${chart.intake.name} · Digits ↑${chart.signature.risingDigit} ☉${chart.signature.sunDigit} ☾${chart.signature.moonDigit}`;
  const loudest = [...chart.bands].sort((a, b) => b.intensity - a.intensity)[0];
  const footer = example
    ? `Example only · Digit ${loudest.digit} loudest @ octave ${loudest.peakOctave} · gold = signature · Φ = depth key`
    : 'Catalog metaphor · Fair Exchange · ∞¹³';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 460" role="img" aria-label="${title}">
  <rect width="400" height="460" fill="#0a0806"/>
  <text x="200" y="28" text-anchor="middle" fill="#d4af37" font-size="16" font-family="Georgia, serif">${title}</text>
  <text x="200" y="48" text-anchor="middle" fill="#a8a29e" font-size="11" font-family="system-ui,sans-serif">${sub}</text>
  <g transform="translate(0 20)">${wedges}
  <circle cx="${cx}" cy="${cy}" r="${rInner - 8}" fill="#14100c" stroke="#d4af37" stroke-width="1.5"/>
  <text x="${cx}" y="${cy - 6}" text-anchor="middle" fill="#fef3c7" font-size="13" font-family="Georgia, serif">Φ</text>
  <text x="${cx}" y="${cy + 12}" text-anchor="middle" fill="#a8a29e" font-size="9">${PHI_EGS.toFixed(4)}</text>
  </g>
  <text x="200" y="448" text-anchor="middle" fill="#78716c" font-size="9">${footer}</text>
</svg>`;
}
