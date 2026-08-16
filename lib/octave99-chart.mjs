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

/**
 * Plain-speak life areas for Digits 0–9.
 * Catalog domain names stay on bands for technical readers; guests get these.
 */
export const DIGIT_STORY_LABELS = Object.freeze([
  {
    digit: 0,
    label: 'Rest & reset',
    plain: 'your ability to pause, clear the slate, and start again without panic',
    doThis: 'Protect one small reset each day — phone down, one breath, one clean restart.',
  },
  {
    digit: 1,
    label: 'First steps',
    plain: 'how you begin things and choose a direction when options feel noisy',
    doThis: 'Pick one next step you can finish today. Say yes or no once, then move.',
  },
  {
    digit: 2,
    label: 'Relationships',
    plain: 'how you pair with people — listening, mirroring, give-and-take',
    doThis: 'Send one honest check-in to someone who matters. Keep it two-way.',
  },
  {
    digit: 3,
    label: 'Making & craft',
    plain: 'building, writing, cooking, designing — turning ideas into something real',
    doThis: 'Ship one small made thing this week, even if it is imperfect.',
  },
  {
    digit: 4,
    label: 'Body & pace',
    plain: 'sleep, food, movement, and the speed of your days',
    doThis: 'Choose one pace rule: earlier bedtime, a walk, or a real meal without screens.',
  },
  {
    digit: 5,
    label: 'Thinking & learning',
    plain: 'attention, curiosity, and how your mind connects ideas',
    doThis: 'Spend 20 focused minutes on one question. Write three lines about what you learned.',
  },
  {
    digit: 6,
    label: 'Help & teamwork',
    plain: 'who helps you, who you help, and how work gets shared',
    doThis: 'Ask for one concrete favor — or offer one — and set a clear time.',
  },
  {
    digit: 7,
    label: 'Boundaries',
    plain: 'what you let in, what you keep out, and where you recover',
    doThis: 'Name one no this week. Soft is fine; clear is required.',
  },
  {
    digit: 8,
    label: 'Energy & stamina',
    plain: 'your longer burn — grit, consistency, and what keeps you going',
    doThis: 'Guard the habit that fuels you. Cut one leak that drains you.',
  },
  {
    digit: 9,
    label: 'Big picture & finishing',
    plain: 'closing loops, seeing the whole story, and knowing when enough is enough',
    doThis: 'Finish or formally pause one open loop. Write what “done” looks like.',
  },
]);

/** Plain guide — shown with every written chart. */
export const WHEEL_READING_GUIDE = Object.freeze([
  'The picture is a map of ten life areas (numbered 0–9). Longer slices are louder for you right now.',
  'Gold slices are your “home keys” — areas that tend to orient you when life gets loud.',
  'Read the written chart first. Use the picture as a quick visual reminder.',
  'Loud areas = where to aim attention. Quiet areas = rest, or capacity you have not used yet.',
  'This is a Story map for reflection — not medical, legal, or fortune-telling advice.',
]);

function storyForDigit(digit) {
  return DIGIT_STORY_LABELS[digit] || DIGIT_STORY_LABELS[0];
}

function rankedBands(chart) {
  return [...chart.bands].sort((a, b) => b.intensity - a.intensity);
}

function strengthWord(intensity) {
  if (intensity >= 80) return 'very strong';
  if (intensity >= 65) return 'strong';
  if (intensity >= 50) return 'steady';
  if (intensity >= 40) return 'soft';
  return 'quiet';
}

function homeKeysLine(chart) {
  const sig = chart.signature;
  const a = storyForDigit(sig.risingDigit).label;
  const b = storyForDigit(sig.sunDigit).label;
  const c = storyForDigit(sig.moonDigit).label;
  return `Your home keys (gold on the picture): ${a}, ${b}, and ${c}. Return to these when the week frays.`;
}

/**
 * Build the guest written chart (plain speak) for free / $29 / $49.
 * @param {ReturnType<typeof buildOctave99Chart>} chart
 * @param {{ tier?: string, focus?: string, season?: string, question?: string, lens?: string }} [opts]
 */
export function buildChartReading(chart, opts = {}) {
  const tier = opts.tier || 'free';
  const ranked = rankedBands(chart);
  const top = ranked.slice(0, 3);
  const quiet = ranked.slice(-2).reverse();
  const name = chart.intake.name;
  const focus = String(opts.focus || '').trim();
  const season = String(opts.season || '').trim();
  const question = String(opts.question || '').trim();
  const lens = String(opts.lens || '').trim();

  const topStories = top.map((b) => storyForDigit(b.digit));
  const quietStories = quiet.map((b) => storyForDigit(b.digit));

  const letterFree = [
    `${name}, here is your free written chart summary.`,
    `Right now your loudest life areas are ${topStories.map((s) => s.label.toLowerCase()).join(', ')}. In plain terms: ${topStories[0].plain}; then ${topStories[1].plain}; then ${topStories[2].plain}.`,
    homeKeysLine(chart),
    `Your quieter areas are ${quietStories.map((s) => s.label.toLowerCase()).join(' and ')}. Quiet does not mean failure — it often means rest, or strength you have not asked to work yet.`,
    `How to use this today: start with ${topStories[0].label.toLowerCase()}. ${topStories[0].doThis} If you want the full map of all ten areas, unlock the $29 overall chart. If you want a personal narrative that answers a real question in your life, unlock the $49 deluxe chart.`,
  ].join('\n\n');

  const letterStandard = [
    `${name}, here is your overall written chart — all ten life areas in plain language.`,
    `This reading gives you the full map: what is loud, what is quiet, and one practical move for each area. It does not go as deep as the deluxe narrative (no pinning questions, no week-by-week story pass).`,
    homeKeysLine(chart),
    `Lead with ${topStories[0].label.toLowerCase()} (${strengthWord(top[0].intensity)}). Support it with ${topStories[1].label.toLowerCase()} and ${topStories[2].label.toLowerCase()}. Let ${quietStories.map((s) => s.label.toLowerCase()).join(' and ')} stay soft unless you choose to invite them on purpose.`,
  ].join('\n\n');

  const lensPhrase = lens
    ? ({
        work: 'work and vocation',
        relationships: 'relationships',
        creative: 'creative craft',
        body: 'body and pace',
        spiritual: 'meaning and spirit',
      }[lens] || lens)
    : '';

  const letterDeluxeParts = [
    `${name}, here is your deluxe written chart — a plain-language narrative for every life area, pinned to what you actually told us.`,
  ];
  if (season) letterDeluxeParts.push(`Season you named: “${season}.” Read the loud areas as the weather of that season, not as a permanent verdict.`);
  if (focus) letterDeluxeParts.push(`Focus you named: “${focus}.” Each section below asks how that focus shows up there.`);
  if (lensPhrase) letterDeluxeParts.push(`Lens: ${lensPhrase}. We tilt the advice toward that part of life.`);
  if (question) {
    letterDeluxeParts.push(
      `Your question: “${question}” Short answer: protect and feed ${topStories[0].label.toLowerCase()} first — ${topStories[0].doThis} Then use ${topStories[1].label.toLowerCase()} as support, and keep a clear boundary around whatever drains ${storyForDigit(chart.signature.moonDigit).label.toLowerCase()}.`,
    );
  } else {
    letterDeluxeParts.push(
      `No single question was pinned — so the default compass is: lead with ${topStories[0].label.toLowerCase()}, support with ${topStories[1].label.toLowerCase()}, and rest in ${quietStories[0].label.toLowerCase()} when you overheat.`,
    );
  }
  letterDeluxeParts.push(homeKeysLine(chart));
  const letterDeluxe = letterDeluxeParts.join('\n\n');

  const highlights = chart.bands.map((b) => {
    const story = storyForDigit(b.digit);
    const role = b.emphasis ? 'home key' : strengthWord(b.intensity);
    const shortBody = `${story.label} looks ${role} for you right now (${b.intensity} on the map). This area is about ${story.plain}.`;
    let longBody = shortBody;
    longBody += ` Practical move: ${story.doThis}`;
    if (focus) {
      longBody += ` With your focus on “${focus},” ask: where does ${story.label.toLowerCase()} help — or get in the way — this week?`;
    }
    if (lensPhrase) {
      longBody += ` Through ${lensPhrase}, one honest check is enough: what would “good enough” look like in ${story.label.toLowerCase()} by Friday?`;
    }
    if (question && (b.emphasis || b.digit === top[0].digit)) {
      longBody += ` Tied to your question (“${question}”): this area is one of your primary levers — do not skip it.`;
    }
    return {
      digit: b.digit,
      title: story.label,
      strength: role,
      intensity: b.intensity,
      peakOctave: b.peakOctave,
      emphasis: b.emphasis,
      body: tier === 'chart_deluxe' ? longBody : shortBody,
      doThis: story.doThis,
      // legacy fields
      label: story.label,
      octaves: b.octaves,
      domain: b.domain,
      line: `${story.label} · ${story.doThis}`,
      narrative: longBody,
      role: b.emphasis ? 'signature' : b.intensity >= 70 ? 'loud' : b.intensity <= 45 ? 'quiet' : 'steady',
      horizon: b.horizon,
    };
  });

  const freeHighlights = top.map((b, i) => {
    const story = storyForDigit(b.digit);
    return {
      digit: b.digit,
      title: story.label,
      strength: strengthWord(b.intensity),
      intensity: b.intensity,
      body: `This is one of your top three areas. It is about ${story.plain}. Strength on your map: ${strengthWord(b.intensity)}.`,
      doThis: story.doThis,
    };
  });

  const weeklyMoves =
    tier === 'free'
      ? [
          topStories[0].doThis,
          `Notice ${quietStories[0].label.toLowerCase()} without forcing it.`,
          'Re-read this summary tomorrow morning before you open your phone.',
        ]
      : tier === 'chart_standard'
        ? [
            topStories[0].doThis,
            topStories[1].doThis,
            `Keep ${quietStories[0].label.toLowerCase()} on the soft list unless you choose it on purpose.`,
            'Glance at the picture once; spend your time on the written map.',
          ]
        : [
            topStories[0].doThis,
            topStories[1].doThis,
            topStories[2].doThis,
            `Schedule one recovery block for ${quietStories[0].label.toLowerCase()}.`,
            question
              ? `Write a three-line answer to “${question}” after you take the top move.`
              : 'Write three lines Friday: what got louder, what got quieter, what you will keep.',
          ];

  const m = chart.morphogenesis;
  const materials = {
    craft: m.silicon,
    body: m.carbon,
    spark: m.hydrogen,
    stage: m.theater,
    plain:
      `Four “materials” of your week — Making/craft ${m.silicon}, Body/pace ${m.carbon}, Spark/beginnings ${m.hydrogen}, Stage/being seen ${m.theater}. ` +
      `Lead with whichever number is highest when you plan the week: high craft → make something; high body → protect pace; high spark → start; high stage → share or perform.`,
  };

  const writtenTitle =
    tier === 'free'
      ? `${name} · Free written chart`
      : tier === 'chart_deluxe'
        ? `${name} · Deluxe written chart`
        : `${name} · Overall written chart ($29)`;

  const letter =
    tier === 'free' ? letterFree : tier === 'chart_deluxe' ? letterDeluxe : letterStandard;

  // Legacy-compatible summary / overview / narratives for older callers
  const summary = {
    headline: writtenTitle,
    signatureLine: homeKeysLine(chart),
    letter,
    loudest: top.map((b) => ({
      digit: b.digit,
      label: storyForDigit(b.digit).label,
      peakOctave: b.peakOctave,
      intensity: b.intensity,
      domain: b.domain,
      use: storyForDigit(b.digit).doThis,
    })),
    quieter: quiet.map((b) => ({
      digit: b.digit,
      label: storyForDigit(b.digit).label,
      intensity: b.intensity,
    })),
    howToUse: weeklyMoves,
  };

  const overview = highlights.map((h) => ({
    digit: h.digit,
    label: h.title,
    octaves: chart.bands[h.digit].octaves,
    peakOctave: h.peakOctave,
    intensity: h.intensity,
    emphasis: h.emphasis,
    domain: h.domain,
    line: `${h.title} · ${h.doThis}`,
  }));

  const narratives = highlights.map((h) => ({
    digit: h.digit,
    label: h.title,
    octaves: chart.bands[h.digit].octaves,
    peakOctave: h.peakOctave,
    intensity: h.intensity,
    emphasis: h.emphasis,
    domain: h.domain,
    horizon: h.horizon,
    role: h.role,
    narrative: h.narrative,
  }));

  const deluxeBridge = {
    season: season || null,
    question: question || null,
    focus: focus || null,
    lens: lens || null,
    morphogenesis: chart.morphogenesis,
    morphoPlain: materials.plain,
    whyUseful: [
      'You get a real written narrative for every life area — not just a picture.',
      'Your answers (focus, season, question) pin the advice to this week of your life.',
      'The materials line tells you whether to make, rest the body, start, or share.',
    ],
    materials,
  };

  const upsell = {
    standard: {
      price: 29,
      href: '/hire-a-goldilocks-valet-concierge/pay?service=chart&unit=standard',
      title: 'Overall written chart · $29',
      why: 'Get all ten life areas in plain language — what is loud, what is quiet, and one practical move for each — plus your home keys and a simple week plan.',
      useful: 'Worth it when free feels true but incomplete: you want the full map before a decision, a season change, or a hard week.',
    },
    deluxe: {
      price: 49,
      href: '/hire-a-goldilocks-valet-concierge/pay?service=chart&unit=deluxe',
      title: 'Deluxe written narrative · $49',
      why: 'Everything in $29, plus a longer narrative per area, pinning questions (focus, season, lens, your question), a direct answer block, and the four “materials” of your week.',
      useful: 'Worth it when you need language you can act on — a real question answered, not only a map.',
    },
  };

  return {
    tier,
    writtenTitle,
    plainGuide: WHEEL_READING_GUIDE,
    guide: WHEEL_READING_GUIDE,
    letter,
    highlights: tier === 'free' ? freeHighlights : highlights,
    weeklyMoves,
    materials: tier === 'chart_deluxe' ? materials : null,
    answerBlock:
      tier === 'chart_deluxe' && question
        ? `Your question — “${question}” — points first to ${topStories[0].label}. Do this: ${topStories[0].doThis} Then support with ${topStories[1].label}: ${topStories[1].doThis}`
        : null,
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
    ? 'Example picture · ten life areas'
    : resolvedTier === 'free'
      ? 'Your picture · free summary'
      : resolvedTier === 'chart_deluxe' || deluxe
        ? 'Your picture · deluxe'
        : 'Your picture · overall chart';
  const sub = `${chart.intake.name} · home keys ${chart.signature.risingDigit} · ${chart.signature.sunDigit} · ${chart.signature.moonDigit}`;
  const loudest = [...chart.bands].sort((a, b) => b.intensity - a.intensity)[0];
  const loudLabel = storyForDigit(loudest.digit).label;
  const footer = example
    ? `Example only · loudest area: ${loudLabel} · gold = home keys · read the written chart first`
    : 'Read the written chart first · picture is a quick map · Fair Exchange';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 460" role="img" aria-label="${title}">
  <rect width="400" height="460" fill="#0a0806"/>
  <text x="200" y="28" text-anchor="middle" fill="#d4af37" font-size="16" font-family="Georgia, serif">${title}</text>
  <text x="200" y="48" text-anchor="middle" fill="#a8a29e" font-size="11" font-family="system-ui,sans-serif">${sub}</text>
  <g transform="translate(0 20)">${wedges}
  <circle cx="${cx}" cy="${cy}" r="${rInner - 8}" fill="#14100c" stroke="#d4af37" stroke-width="1.5"/>
  <text x="${cx}" y="${cy - 6}" text-anchor="middle" fill="#fef3c7" font-size="13" font-family="Georgia, serif">map</text>
  <text x="${cx}" y="${cy + 12}" text-anchor="middle" fill="#a8a29e" font-size="9">read text first</text>
  </g>
  <text x="200" y="448" text-anchor="middle" fill="#78716c" font-size="9">${footer}</text>
</svg>`;
}
