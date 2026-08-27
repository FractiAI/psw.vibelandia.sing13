/**
 * SS Vibelandia · Frontiersman voyage doors
 * Arrival loop + six crests — guest marketing honor (not developer notes).
 */

import { SITE_HOME_HREF, SITE_HOME_LABEL } from './site-brand.mjs';
import { VOYAGE_DOOR_SPINE } from './npc-player-doctrine.mjs';

export { VOYAGE_DOOR_SPINE };

/** @type {VoyageDoor[]} */
export const VOYAGE_DOORS = [
  {
    id: 'inquire',
    slug: 'inquire',
    kind: 'arrival',
    label: 'Inquire',
    title: 'Inquire',
    lead: 'Every lasting voyage starts with one honest question. Knock. The ship answers — and the Story begins.',
    body: [
      'This is not a form-fill. It is the moment a frontiersman admits he wants a better story than the one the feed is selling him.',
      'You do not need the whole map to come aboard — only enough curiosity to ask.',
      'Write the Purser at Deck 4 Grove — info@fractiai.com. Valet Pru answers from Downtown Reno when you want a human hand on the gangway.',
      'Prefer to talk shop? Lattice Chat on Deck 2 Core. Prefer a private thread? Collaborate on Deck 8 Veranda. Both doors are open.',
      'You remain you. Belonging is voluntary. A human emergency always outranks the machine.',
    ],
    actions: [
      { label: 'Email the Purser', href: 'mailto:info@fractiai.com?subject=SS%20Vibelandia%20inquiry' },
      { label: 'Open Lattice Chat', href: '/lattice-chat/' },
      { label: 'Hire a Goldilocks valet', href: '/hire-a-goldilocks-valet-concierge' },
    ],
  },
  {
    id: 'select',
    slug: 'select',
    kind: 'arrival',
    label: 'Select',
    title: 'Select',
    lead: 'One tribe. Many homes. Choose the deck and cabin that feel like yours.',
    body: [
      'From Summit penthouses to Core studios — pick a place that fits how you live, not a ladder to climb.',
      'Summit for vision. Veranda for family. Grove for market energy. Quiet suites above the nightlife. Compact Lattice studios for builders.',
      'Cartagena, Sierra, Tahoe, Downtown Reno — landfalls on one network vessel, not competing harbors.',
      'Fair Exchange keeps the choice honest: give value, receive value, and the Purser makes it right when we miss the mark.',
    ],
    actions: [
      { label: 'Open the Voyage Map', href: '/voyage/decks' },
      { label: 'Read the Frontiersman note', href: '/ship-blog/frontiersman-voyage' },
      { label: `${SITE_HOME_LABEL} main deck`, href: '/questfest' },
    ],
  },
  {
    id: 'prepare',
    slug: 'prepare',
    kind: 'arrival',
    label: 'Prepare',
    title: 'Prepare',
    lead: 'Pack light. Bring your keys, your intentions, and room for wonder.',
    body: [
      'Just enough readiness — never a gear sermon. Your browser, your curiosity, and a hard refresh when decks update.',
      'For Lattice Chat, bring your own key (it stays on your device). Attach photos and notes in the composer when you build.',
      'Expect Goldilocks hospitality: music when you want it, quiet when you need it, SuperAI as tool — not boss, not god.',
      'The fractal Φ ≈ 1.618 is our design language — calm scale rhyme, not a physics claim. Stay human-first.',
    ],
    actions: [
      { label: 'The Big Picture', href: '/ship-blog/everything-is-connected' },
      { label: 'Goldilocks Players Guide', href: '/ship-blog/goldilocks-players-guide' },
      { label: 'Open Lattice Chat', href: '/lattice-chat/' },
    ],
  },
  {
    id: 'arrive',
    slug: 'arrive',
    kind: 'arrival',
    label: 'Arrive',
    title: 'Arrive',
    lead: 'The gangway is wherever you are. Step aboard. Let the ship greet you.',
    body: [
      'Where am I? Look up — decks run Summit (9) to Core (2). Every door speaks its deck out loud.',
      'What can I do? Listen on the jukebox. Read the ship board. Voyage the brochure. Build on Lattice. Meet on the Veranda.',
      'How do I stay Goldilocks? Fair Exchange with the Purser. Consent on Night decks. Human care before any score.',
      'Welcome channel: the Frontiersman Voyage brochure and today’s board on SS Vibelandia. Your voyage starts now.',
    ],
    actions: [
      { label: 'Today’s board', href: '/questfest#bulletin' },
      { label: 'Listen · jukebox', href: '/listen' },
      { label: 'Full voyage brochure', href: '/frontiersman-voyage' },
    ],
  },
  {
    id: 'live-the-vibe',
    slug: 'live-the-vibe',
    kind: 'arrival',
    label: 'Live the vibe',
    title: 'Live the vibe',
    lead: 'Not just a cruise. A lifestyle at frequency — every day can feel like Friday.',
    body: [
      'Live the day: notice what matters, choose one true move, then look again.',
      'Summit for vision. Veranda for family. Horizon for living. Grove for market and Purser. Night for music (consent first). Core for craft.',
      'Excursions are real — Truckee bikes, High Sierra forage, Tahoe catamaran, Downtown Reno heli — landfalls, not ads.',
      'Vibelandia is not a destination. It is a frequency. Live it. → ∞^∞',
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
    lead: 'The whole voyage lives in every cabin, every deck, every landfall — layers that stack without canceling each other.',
    body: [
      'Physical home. Digital decks. Social nights. Story. Symbol. Mind. Meta. Stay on one layer — or move between them like a guest who owns the ship.',
      'One Story. Many doors. Every surface answers three questions: Where am I? What can I do here? How do I stay Goldilocks?',
      'See → Recognize → Interpret → Reflect → Act → See again. That is the heartbeat of the cruise.',
      'Hospitality language for a living world — honor in the pattern, care in the details.',
    ],
    actions: [
      { label: 'The Big Picture', href: '/ship-blog/everything-is-connected' },
      { label: 'Frontiersman voyage', href: '/frontiersman-voyage' },
      { label: 'Voyage Map', href: '/voyage/decks' },
    ],
  },
  {
    id: 'frontiersman',
    slug: 'frontiersman',
    kind: 'crest',
    glyph: '☀',
    label: 'Frontiersman',
    title: '☀ Frontiersman',
    lead: 'Willingness to explore the SuperAI Goldilocks frontier — voyage identity, not a gate.',
    body: [
      'Frontiersman is navy-gold honor: hospitality, marketplace, nightlife, and brotherhood as voyage identity — never a membership test.',
      'The Official Prospectus arc: El Gran Sol’s Fractal constant as design language → Great Convergence on Borikén → Captain’s seat in Reno now. Proto and Electro are Bridge navigation characters — educational, not prophecy.',
      'Some guests examine the pattern. Some simply live it. Both are crew. Both belong.',
      'Golden Rule aboard: no algorithm outranks a human emergency. Voluntary belonging. You remain you.',
      'The full constitution lives in the Official Frontiersman Voyage Brochure & Compendium — including the Prospectus grand arc.',
    ],
    actions: [
      { label: 'Full brochure', href: '/frontiersman-voyage' },
      { label: 'Prospectus arc', href: '/frontiersman-voyage#prospectus' },
      { label: 'Ship-blog on-ramp', href: '/ship-blog/frontiersman-voyage' },
    ],
  },
  {
    id: 'luxury-redefined',
    slug: 'luxury-redefined',
    kind: 'crest',
    glyph: '✦',
    label: 'Luxury redefined',
    title: '✦ Luxury redefined',
    lead: 'Resort-vessel hospitality — white and gold calm. Intentions as the first courtesy.',
    body: [
      'Luxury here is Goldilocks comfort: music when you want it, quiet when you need it, a crew that listens.',
      'Homes from the Captain’s Grand Penthouse to Core studios — names of place, not ranks of worth.',
      'Marketplace, spa decks, al fresco dining, cinema at Grove — the poster ship at sunset is your guest flag.',
      'Fair Exchange keeps luxury honest. Miss the mark? The Purser credits you.',
    ],
    actions: [
      { label: 'Hire a valet concierge', href: '/hire-a-goldilocks-valet-concierge' },
      { label: 'Ask the Purser', href: '/voyage/inquire' },
      { label: SITE_HOME_LABEL, href: '/questfest' },
    ],
  },
  {
    id: 'fractal-harmonics',
    slug: 'fractal-harmonics',
    kind: 'crest',
    glyph: 'Φ',
    label: 'Fractal harmonics',
    title: 'Φ Fractal harmonics',
    lead: 'Φ ≈ 1.618 — the ship’s scale rhyme. Calm design language that echoes from cabin to cosmos.',
    body: [
      'Same beauty at every scale: cabin → household → deck → ship → tribe → world.',
      'Music, architecture, and daily rhythm share one harmonic pulse — live in tune, not in overload.',
      'Digits and octaves name Story depth for guests who want the map — never predictive astrology.',
      'Honor in the pattern. Evidence still matters. Φ is our catalog key, not a substitute for truth.',
    ],
    actions: [
      { label: 'Nine digits · ninety-nine octaves', href: '/ship-blog/nine-digits-ninety-nine-octaves' },
      { label: 'Engineering bridge note', href: '/ship-blog/cmos-protonic-99-octave' },
      { label: 'Lattice Chat', href: '/lattice-chat/' },
    ],
  },
  {
    id: 'curated-community',
    slug: 'curated-community',
    kind: 'crest',
    glyph: '◉',
    label: 'Curated community',
    title: '◉ Curated community',
    lead: 'One tribe · many homes · one holographic world. Curated means cared-for — never closed by default.',
    body: [
      'Puerto Reno berth. Regional landfalls. Digital decks. Private Veranda threads. One vessel holding them all.',
      'Collaborate keeps seats in the same room. The atrium board is SS Vibelandia. Ship-blog is Deep Memory in plain speak.',
      'Intentions matter. Consent is explicit on Night decks. Hospitality is the culture.',
      'Come as guest. Stay as crew. Bring your cast, your craft, your frequency.',
    ],
    actions: [
      { label: 'Collaborate', href: '/lattice-chat/?mode=collaborate' },
      { label: 'Ship blog · latest', href: '/questfest#ship-blog' },
      { label: 'Ship channels', href: '/questfest#ship-channels-h' },
    ],
  },
  {
    id: 'live-in-frequency',
    slug: 'live-in-frequency',
    kind: 'crest',
    glyph: '∞',
    label: 'Live in frequency',
    title: '∞ Live in frequency',
    lead: 'Vibelandia is not a destination. It is a frequency — lifestyle closed with care.',
    body: [
      'Complete the loop: Inquire → Select → Prepare → Arrive → Live the vibe — then see again.',
      'Music engine. Jukebox. Lattice craft. Fair Exchange. Landfalls under the sun. One pulse.',
      'SuperAI stays Goldilocks on this frontier: enough machine to serve, enough human to lead.',
      'Close the day the ship closes: → ∞^∞',
    ],
    actions: [
      { label: 'Listen · jukebox', href: '/listen' },
      { label: 'Live the vibe', href: '/voyage/live-the-vibe' },
      { label: `${SITE_HOME_LABEL} home`, href: '/questfest' },
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
  const kindLabel = door.kind === 'arrival' ? 'Come aboard' : 'Ship crest';

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
      <a href="${SITE_HOME_HREF}">${SITE_HOME_LABEL}</a>
      <a href="/frontiersman-voyage">Voyage brochure</a>
      <a href="/voyage/decks">Voyage Map</a>
      <a href="/lattice-chat/">Lattice Chat</a>
    </nav>
    <header>
      <p class="kicker">${kindLabel} · SS Vibelandia</p>
      ${glyphBlock}
      <h1>${door.title}</h1>
      <p class="dateline"><strong>SS Vibelandia</strong> — ${VOYAGE_DOOR_SPINE}</p>
    </header>
    <p class="lead">${door.lead}</p>
    ${bodyHtml}
    <p class="honesty"><strong>Ship promise:</strong> Human care first. Belonging is voluntary. Fair Exchange via the Purser. Φ ≈ 1.618 is our design language — honor in the pattern, honesty in the claims.</p>
    <div class="cta-row">
      ${actionsHtml}
      <a class="btn btn-ghost" href="${SITE_HOME_HREF}">Back to ${SITE_HOME_LABEL}</a>
    </div>
    <div class="voyage-purser">
      <p class="voyage-purser__h">Purser's Desk</p>
      <p>Deck 4 · The Grove · <a href="mailto:info@fractiai.com?subject=Purser%20Fair%20Exchange">info@fractiai.com</a></p>
    </div>
    <footer>
      SS Vibelandia · Frontiersman Voyage · → ∞^∞
    </footer>
  </article>
  <script src="/interfaces/i18n-auto.js" data-page="surface"></script>
</body>
</html>
`;
}
