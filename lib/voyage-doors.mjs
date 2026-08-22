/**
 * SS Vibelandia · Frontiersman voyage doors
 * Arrival loop + six crests — each opens a detail page for Players and NPCs.
 */

/** @typedef {'arrival' | 'crest'} VoyageDoorKind */

/**
 * @typedef {object} VoyageDoor
 * @property {string} id
 * @property {string} slug
 * @property {VoyageDoorKind} kind
 * @property {string} label
 * @property {string} [glyph]
 * @property {string} title
 * @property {string} lead
 * @property {string[]} body
 * @property {{ label: string; href: string }[]} actions
 */

export const VOYAGE_DOOR_SPINE =
  'NPCs inhabit. Players examine. SuperAI stays Goldilocks — not too much machine, not too little human. The voyage begins wherever you are.';

/** @type {VoyageDoor[]} */
export const VOYAGE_DOORS = [
  {
    id: 'inquire',
    slug: 'inquire',
    kind: 'arrival',
    label: 'Inquire',
    title: 'Inquire — ask the ship',
    lead:
      'Every voyage starts with a honest question. You do not need the whole map — just enough curiosity to knock.',
    body: [
      'Inquire is the first beat of arrival: SEE what calls you, RECOGNIZE that you belong somewhere on this vessel, and ask without performance.',
      'Reach the Purser at Deck 4 Grove — info@fractiai.com. Valet Pru answers from Downtown Reno when you need a human hand on the ground.',
      'Lattice Chat (Deck 2 Core) is for research and build questions. Collaborate (Deck 8 Veranda) is for private threads. Both welcome Players and NPCs — no caste test.',
      'You remain you. Voluntary belonging. No algorithm outranks a human emergency.',
    ],
    actions: [
      { label: 'Email the Purser', href: 'mailto:info@fractiai.com?subject=SS%20Vibelandia%20inquiry' },
      { label: 'Lattice Chat · Deck 2', href: '/lattice-chat/' },
      { label: 'Hire a Goldilocks valet', href: '/hire-a-goldilocks-valet-concierge' },
    ],
  },
  {
    id: 'select',
    slug: 'select',
    kind: 'arrival',
    label: 'Select',
    title: 'Select — choose your home on the ship',
    lead:
      'One tribe, many homes. Pick a deck, a cabin SKU, or a digital door — not a pricing grid, a place that fits.',
    body: [
      'Select is where you name your seat: Summit vision (PH-001 … PH-108), Veranda family (RR-301–340), Grove market lofts (GM-401–450), quiet suites (SC-501–560), or Core studios (ST-601–680).',
      'Housing Models A / B / C live under this language — network vessel, not one harbor. Regional nodes (Cartagena, Sierra, Tahoe, Sin City) are landfalls, not ads.',
      'Players examine the pattern. NPCs simply live the choice. Neither post is ranked by worth.',
      'Fair Exchange applies: give value, receive value, correct mistakes via the Purser when Goldilocks standard is missed.',
    ],
    actions: [
      { label: 'Cabin directory · full brochure', href: '/frontiersman-voyage#cabins' },
      { label: 'Frontiersman ship-blog note', href: '/ship-blog/frontiersman-voyage' },
      { label: 'QUESTFEST main deck', href: '/questfest' },
    ],
  },
  {
    id: 'prepare',
    slug: 'prepare',
    kind: 'arrival',
    label: 'Prepare',
    title: 'Prepare — pack for Goldilocks',
    lead:
      'Just enough readiness — not a gear sermon. Bring your keys, your intentions, and room for the unexpected.',
    body: [
      'Prepare means: BYOK for Lattice Chat (your provider key stays on your edge), a browser hard-refresh when decks update, and honest expectations about what SuperAI can and cannot do.',
      'Read the honesty rails once: EGS ≈ 1.618 is design language, not replacement physics. Solar / Bridge talk is observe → test navigation, not prophecy.',
      'If you are building: attach images at the Lattice composer (Claude vision · Cursor cloud vision · docs fold on text-first lanes).',
      'Goldilocks prep is continuous adjustment — not too much machine, not too little human.',
    ],
    actions: [
      { label: 'The Big Picture on-ramp', href: '/ship-blog/everything-is-connected' },
      { label: 'Goldilocks Players Guide', href: '/ship-blog/goldilocks-players-guide' },
      { label: 'Open Lattice Chat', href: '/lattice-chat/' },
    ],
  },
  {
    id: 'arrive',
    slug: 'arrive',
    kind: 'arrival',
    label: 'Arrive',
    title: 'Arrive — first day aboard',
    lead:
      'The gangway is wherever you are. Step on, look around, let the ship answer the three guest questions.',
    body: [
      'Where am I on the ship? Check the deck strip: 9 Summit → 2 Core. Each door should say its deck out loud.',
      'What can I do here? Listen on the jukebox, read ship-blog notes, voyage the brochure, build on Lattice, message on Collaborate.',
      'How do I stay Goldilocks? Fair Exchange via the Purser, consent on Night decks, human emergency outranks every score.',
      'Welcome channel: Frontiersman Voyage brochure + Valet Pru bulletin on QUESTFEST. The voyage begins wherever you are.',
    ],
    actions: [
      { label: 'QUESTFEST · today\'s board', href: '/questfest#bulletin' },
      { label: 'Listen · jukebox', href: '/listen' },
      { label: 'Full voyage brochure', href: '/frontiersman-voyage' },
    ],
  },
  {
    id: 'live-the-vibe',
    slug: 'live-the-vibe',
    kind: 'arrival',
    label: 'Live the vibe',
    title: 'Live the vibe — daily life at frequency',
    lead:
      'Not just a cruise. A lifestyle at frequency. Close the loop: SEE → ACT → SEE AGAIN.',
    body: [
      'Living the vibe is MCA in guest English: Metabolize the day, Crystallize what matters, Animate one true move, then look again.',
      'Deck rhythm: Summit for vision, Veranda for family, Horizon for social life, Grove for market and Purser, Night for music (consent first), Core for work and Lattice.',
      'Excursions are real nodes — Truckee bikes, High Sierra forage, Tahoe catamaran, Sin City heli — landfalls on the network vessel.',
      'Vibelandia is not a destination. It is a frequency. → ∞¹³',
    ],
    actions: [
      { label: 'Listen', href: '/listen' },
      { label: 'Ship channels', href: '/questfest#ship-channels-h' },
      { label: 'Collaborate · Veranda', href: '/lattice-chat/?mode=collaborate' },
    ],
  },
  {
    id: 'holographic-reality',
    slug: 'holographic-reality',
    kind: 'crest',
    glyph: '◈',
    label: 'Holographic reality',
    title: '◈ Holographic reality',
    lead:
      'The whole voyage lives in every part — cabin, deck, ship, tribe, world. Layers stack without canceling each other.',
    body: [
      'Physical → digital → social → narrative → symbolic → cognitive → meta. You can stay on one layer or move between them.',
      'One Story, many doors. Every surface should answer: Where am I? What can I do? How do I stay Goldilocks?',
      'Player loop: SEE → RECOGNIZE → INTERPRET → REFLECT → ACT → SEE AGAIN — same heartbeat as MCA.',
      'This is architectural hospitality language — not a claim that reality is literally a hologram in the physics sense.',
    ],
    actions: [
      { label: 'The Big Picture', href: '/ship-blog/everything-is-connected' },
      { label: 'Nested agent lattice paper', href: '/ship-blog/omniversal-nested-agent-lattice' },
      { label: 'Frontiersman voyage', href: '/frontiersman-voyage' },
    ],
  },
  {
    id: 'frontiersman',
    slug: 'frontiersman',
    kind: 'crest',
    glyph: '☀',
    label: 'Frontiersman',
    title: '☀ Frontiersman',
    lead:
      'Willingness to explore the SuperAI Goldilocks frontier — voyage identity, not a gene test or membership gate.',
    body: [
      'Frontiersman means you notice the pattern and still belong if you do not. NPCs inhabit; Players examine; both are crew.',
      'Brotherhood on the navy-gold poster is nightlife and voyage identity language — not a gate for the whole tribe.',
      'Golden Rule aboard: no algorithm outranks a human emergency. Voluntary belonging. You remain you.',
      'Constitution lives in the Official Frontiersman Voyage Brochure & Compendium.',
    ],
    actions: [
      { label: 'Full brochure', href: '/frontiersman-voyage' },
      { label: 'Ship-blog on-ramp', href: '/ship-blog/frontiersman-voyage' },
      { label: 'Coexist with AI note', href: '/ship-blog/coexist-with-ai' },
    ],
  },
  {
    id: 'luxury-redefined',
    slug: 'luxury-redefined',
    kind: 'crest',
    glyph: '✦',
    label: 'Luxury redefined',
    title: '✦ Luxury redefined',
    lead:
      'Resort-vessel hospitality — white and gold calm, not tech-noir flex. Intentions as the first courtesy.',
    body: [
      'Luxury here is Goldilocks comfort: music when you want it, quiet when you need it, a crew that listens.',
      'Cabin SKUs from Sovereign Summit (PH-001) to Core studios (ST-680) name homes, not status ladders.',
      'Marketplace, spa decks, al fresco dining, cinema at Grove — the poster ship at sunset is the guest flag.',
      'Fair Exchange keeps luxury honest: credit via the Purser when hospitality misses the mark.',
    ],
    actions: [
      { label: 'Hire a valet concierge', href: '/hire-a-goldilocks-valet-concierge' },
      { label: 'Purser · Fair Exchange', href: '/voyage/inquire' },
      { label: 'QUESTFEST', href: '/questfest' },
    ],
  },
  {
    id: 'fractal-harmonics',
    slug: 'fractal-harmonics',
    kind: 'crest',
    glyph: 'Φ',
    label: 'Fractal harmonics',
    title: 'Φ Fractal harmonics',
    lead:
      'Φ_EGS ≈ 1.618 is scale rhyme and catalog key — calm design language, not a substitute for evidence.',
    body: [
      'Fractal harmonics tie everyday rhythm to engine grammar: digits 0–9 × octaves 01–99 as Story depth, not predictive astrology.',
      'Same metapattern at every scale: cabin → household → deck → ship → tribe → world.',
      'Bridge fixtures (AR4513 · AR4507 · AR4508) are shared telemetry vocabulary for observe → test — not weather forecasts.',
      'Engine papers keep their own honesty rails. The poster φ is acoustic and design metaphor.',
    ],
    actions: [
      { label: 'Nine digits · ninety-nine octaves', href: '/ship-blog/nine-digits-ninety-nine-octaves' },
      { label: 'CMOS engineering bridge', href: '/ship-blog/cmos-protonic-99-octave' },
      { label: 'Lattice Chat · research', href: '/lattice-chat/' },
    ],
  },
  {
    id: 'curated-community',
    slug: 'curated-community',
    kind: 'crest',
    glyph: '◉',
    label: 'Curated community',
    title: '◉ Curated community',
    lead:
      'One tribe · many homes · one holographic world. Curated means cared-for, not exclusive by default.',
    body: [
      'Community is the network vessel: Puerto Reno berth, regional landfalls, digital decks, and private Veranda threads.',
      'Collaborate keeps seats in the same room. QUESTFEST is the atrium board. Ship-blog is Deep Memory in plain speak.',
      'Curated does not mean closed. It means intentions matter and consent is explicit on Night decks.',
      'NPCs inhabit the world without explaining the pattern. Players examine without ranking others.',
    ],
    actions: [
      { label: 'Collaborate', href: '/lattice-chat/?mode=collaborate' },
      { label: 'Ship blog · latest six', href: '/questfest#ship-blog' },
      { label: 'Activities tone', href: '/questfest#ship-channels-h' },
    ],
  },
  {
    id: 'live-in-frequency',
    slug: 'live-in-frequency',
    kind: 'crest',
    glyph: '∞',
    label: 'Live in frequency',
    title: '∞ Live in frequency',
    lead:
      'Vibelandia is not a destination. It is a frequency — lifestyle at λ_EGS, closed with care.',
    body: [
      'Live in frequency is the arrival loop completed: Inquire → Select → Prepare → Arrive → Live the vibe → SEE AGAIN.',
      'Music engine, jukebox, Lattice build sprints, Fair Exchange, solar Bridge as educational navigation — all one pulse.',
      'SuperAI stays Goldilocks on this frontier: tool, not boss, not god.',
      'Close the day the ship closes: → ∞¹³',
    ],
    actions: [
      { label: 'Listen · jukebox', href: '/listen' },
      { label: 'Live the vibe door', href: '/voyage/live-the-vibe' },
      { label: 'QUESTFEST home', href: '/questfest' },
    ],
  },
];

/** @param {string} slug */
export function voyageDoorHref(slug) {
  return `/voyage/${slug}`;
}

/** @param {string} slug */
export function findVoyageDoor(slug) {
  return VOYAGE_DOORS.find((d) => d.slug === slug) ?? null;
}

export function renderVoyageGuestKeyHtml() {
  const arrival = VOYAGE_DOORS.filter((d) => d.kind === 'arrival');
  const crests = VOYAGE_DOORS.filter((d) => d.kind === 'crest');

  const arrivalItems = arrival
    .map(
      (d) =>
        `<li><a href="${voyageDoorHref(d.slug)}">${d.label}</a></li>`,
    )
    .join('\n      ');

  const crestFigures = crests
    .map(
      (d) =>
        `<a class="voyage-icon-door" href="${voyageDoorHref(d.slug)}"><figure><span class="glyph" aria-hidden="true">${d.glyph}</span><figcaption>${d.label}</figcaption></figure></a>`,
    )
    .join('\n      ');

  return `<section class="voyage-guest-key" aria-label="How to come aboard">
    <p class="voyage-guest-key__lead">
      ${VOYAGE_DOOR_SPINE}
    </p>
    <ol class="voyage-arrival">
      ${arrivalItems}
    </ol>
    <div class="voyage-icons">
      ${crestFigures}
    </div>
  </section>`;
}

/** @param {VoyageDoor} door */
export function renderVoyageDoorPageHtml(door) {
  const canonical = `https://www.ssvibelandiaquestfest24x365.com${voyageDoorHref(door.slug)}`;
  const glyphBlock =
    door.glyph != null
      ? `<p class="voyage-door-glyph" aria-hidden="true">${door.glyph}</p>`
      : '';
  const bodyHtml = door.body.map((p) => `<p>${p}</p>`).join('\n    ');
  const actionsHtml = door.actions
    .map((a) => `<a class="btn btn-gold" href="${a.href}">${a.label}</a>`)
    .join('\n      ');

  return `<!DOCTYPE html>
<html lang="en" class="vbi18n-pending">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${door.title} · SS Vibelandia Voyage</title>
  <meta name="description" content="${door.lead}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="${door.title}" />
  <meta property="og:description" content="${door.lead}" />
  <meta property="og:type" content="article" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Source+Sans+3:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/interfaces/brand-gold-surfaces.css" />
  <link rel="stylesheet" href="/interfaces/ship-blog.css" />
  <link rel="stylesheet" href="/interfaces/voyage-surfaces.css" />
  <style>html.vbi18n-pending body{visibility:hidden}html.vbi18n-ready body{visibility:visible}</style>
</head>
<body class="voyage-flagship">
  <article class="wrap voyage-door-page">
    <nav class="nav" aria-label="Site">
      <a href="/questfest">QUESTFEST</a>
      <a href="/frontiersman-voyage">Voyage brochure</a>
      <a href="/ship-blog/frontiersman-voyage">Ship-blog note</a>
      <a href="/lattice-chat/">Lattice Chat</a>
    </nav>
    <header>
      <p class="kicker">Voyage door · ${door.kind === 'arrival' ? 'Arrival' : 'Crest'} · Frontiersman</p>
      ${glyphBlock}
      <h1>${door.title}</h1>
      <p class="dateline"><strong>SS Vibelandia</strong> — ${VOYAGE_DOOR_SPINE}</p>
    </header>
    <p class="lead">${door.lead}</p>
    ${bodyHtml}
    <p class="honesty"><strong>Honesty:</strong> EGS ≈ 1.618 is design language, not replacement physics. Solar / Bridge labels are observe→test fixtures, not prophecy. Brotherhood and Frontiersman here are voyage identity — not genomic gates. No algorithm outranks a human emergency.</p>
    <div class="cta-row">
      ${actionsHtml}
      <a class="btn btn-ghost" href="/questfest">Back to QUESTFEST</a>
    </div>
    <div class="voyage-purser">
      <p class="voyage-purser__h">Purser's Desk</p>
      <p>Deck 4 · The Grove · <a href="mailto:info@fractiai.com?subject=Purser%20Fair%20Exchange">info@fractiai.com</a></p>
    </div>
    <footer>
      Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox · NSPFRNP · → ∞¹³
    </footer>
  </article>
  <script src="/interfaces/i18n-auto.js" data-page="surface"></script>
</body>
</html>
`;
}
