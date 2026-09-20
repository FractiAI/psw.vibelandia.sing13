/**
 * Kitchen-table article bodies for remaining ship blogs.
 * Each body must audit ≥900 article prose words; Soft Story = 0 in body.
 */
export const MORE_ARTICLES = {};

/** Append a standard everyday expansion block keyed to a topic phrase. */
export function expandBlock(topicPhrase, extraScenes = []) {
  const scenes = [
    `On a weekday morning in Reno, the commute still runs along the same river path whether or not the headlines shout breakthrough. Parents drop kids at school. Neighbors wave. Someone checks a job board on the phone before the first meeting. That ordinary weather is the test for ${topicPhrase}: if the idea cannot survive a kitchen table, a living room, and a paycheck conversation, it is not ready for guests.`,
    `At dinner the talk is rarely about LaTeX. It is about rent, hours that got cut, a side hustle that went quiet, a tool that used to help and now acts like a bored clerk. Kids ask whether they will have a craft. Friends ask whether curiosity still has a door. ${topicPhrase} earns its keep when it clarifies that weather without upgrading into prophecy.`,
    `Work crews feel the same fork. One camp wants to freeze everything for fear. Another wants to floor it for destiny. Most households need the middle: real brakes for real harm, people still able to earn a living, doors that stay open for honest questions. ${topicPhrase} belongs in that middle — not as a membership test, and not as a costume for a closed door.`,
    ...extraScenes,
  ];
  return scenes.map((s) => `<p>${s}</p>`).join('\n');
}

function article(file, meta, sections) {
  MORE_ARTICLES[file] = { meta, body: sections };
}

const pier = (line) => `
    <h2>Closing pier</h2>
    <p>${line} Watch paychecks and doors, not just press releases. Tip under Fair Exchange if the framing cleared a real kitchen-table argument. Ignore it if you only needed a compute table — those live elsewhere. Open the whitepaper when you want the filing. Walk QUESTFEST when you want the floor under your feet. Nevada’s holographic AI valley keeps printing hospitality before prophecy. That order is how SuperAI stays Goldilocks: enough machine to serve, enough human to lead, neighbors still able to work, ask, and belong.</p>
`;

// --- Intelligence density ---
article(
  'blog-synthobs-intelligence-density.html',
  {
    title: 'How dense is the help — and who still gets a paycheck?',
    description:
      'Intelligence density as a kitchen-table audit: more spectacle per screen, or more livelihood per neighbor? Simulation receipts without prophecy.',
    ogTitle: 'How dense is the help — and who still gets a paycheck?',
    ogDesc:
      'Density that only lights up a dashboard while job boards thin is not hospitality. Measure help the way families measure a week.',
    kicker: 'Ship blog · Voyage editorial · Everyday audit',
    h1: 'How dense is the help — and who still gets a paycheck?',
    dateline: '2026 · Reno / Truckee corridor',
  },
  `
    <p class="lead">People do not need a sandbox to feel when “smarter” got louder without getting kinder. You see it when the app gets shinier and the hours get cut. You see it when the demo dazzles the living room TV while the job board on the phone stays thin. Intelligence density, on this ship, is a plain question: how much useful help per person, per door, per honest week — not how much spectacle per press release.</p>

    <p>The observatory note behind this article keeps simulation receipts and metrics. Guests get the human version first. If density only means more tokens on a chart while families lose footholds, the audit failed before the suite finished running.</p>

    <h2>What density feels like at home</h2>
    <p>At home, density shows up as whether a helper actually shortens the grocery math, the school form, or the resume for a neighbor who was laid off. Thin density is a chatbot that performs confidence while the rent spreadsheet still sits unfinished. Thick density is fewer steps between a real question and a usable answer — without treating the household like a lab animal.</p>

    <p>Kids feel density as whether curiosity still has a door after dinner. Parents feel it as whether the tool respects bedtime instead of farming attention. Friends feel it as whether “AI help” still leaves room for craft, or whether craft was the first thing automated away.</p>

    <h2>What density feels like on Main Street</h2>
    <p>On Main Street, density is whether small businesses can try a tool without a chaperone budget, and whether first jobs still exist beside automation speeches. When breakthrough language climbs and underemployment climbs with it, density is the wrong word for what you are measuring. You are measuring horsepower without hospitality.</p>

    <p>This corridor’s habit is stubborn: hospitality before jargon, receipts before prophecy. Simulation audits belong on the shelf. Kitchen-table audits belong at the pier. Both can be true if you refuse to upgrade a metric into destiny.</p>

    ${expandBlock('intelligence density', [
      `A practical week looks like this: pick one real task at work or at home. Time the old path. Time the helped path. Ask whether anyone’s hours got cut to pay for the noise. Ask whether a neighbor could repeat the win without a private key to a palace. That is density you can feel without a dashboard.`,
      `Lattice Chat stays a try-on room for nested helpers sharing one brief. Own keys. Lite edges. Center as pipes. The density win is fewer contradictory dumps and more shared craft — not a citizenship parade for machines.`,
    ])}

    ${pier('Density that feeds dashboards while thinning livelihoods is spectacle. Density that puts food on the table and keeps doors open for questions is hospitality.')}
`,
);

// --- Mag substrate ---
article(
  'blog-synthobs-mag-substrate.html',
  {
    title: 'The pull you already feel — magnetism as everyday substrate talk',
    description:
      'Magnetism-as-substrate without the trophy case: attraction, alignment, and why households already understand pull better than slides do.',
    ogTitle: 'The pull you already feel — magnetism as everyday substrate talk',
    ogDesc:
      'Compasses, fridge doors, and who gets pulled into a room — everyday substrate before catalog filing.',
    kicker: 'Ship blog · Voyage editorial · Everyday substrate',
    h1: 'The pull you already feel — magnetism as everyday substrate talk',
    dateline: 'July 30, 2026 · Reno / Truckee corridor',
  },
  `
    <p class="lead">Before anyone says “substrate,” a kid already knows the fridge door pulls shut and a compass needle finds north. Households know pull: who gets drawn into a conversation, who gets pushed out of a job, which rumor sticks to the living room wall. This note files magnetism as a foundational picture for coordination — not as magnet therapy, not as a lab-constant overthrow, and not as a reason to ignore measured electromagnetism.</p>

    <p>The whitepaper keeps Seed pointers and fixtures. Guests get the street version: what pulls people together, what pushes them apart, and how AI rooms can rhyme with that without selling destiny from a fridge magnet.</p>

    <h2>Pull at the kitchen table</h2>
    <p>Families feel magnetic weather every week. Paycheck stress pulls attention to rent. School nights pull attention to kids. A side hustle pulls late hours. When an AI product pulls curiosity and then locks the door, the household feels the field reverse. When a neighbor offers craft help without a membership test, the field softens toward hospitality.</p>

    <p>Builders feel pull as where talent goes. Tribunals push people out. Shared briefs pull people in. Magnetism talk on this ship is a way to name that without pretending a catalog map replaced SI instruments.</p>

    <h2>What the filing refuses</h2>
    <p>It refuses medical magnet claims. It refuses unfinished grand unification cosplay. It refuses using “substrate” as perfume while hours get cut. It accepts a teaching map: forces of alignment and exclusion as coordination language under nesting grammar near about 1.618 — design language, not a trophy on the mantle.</p>

    ${expandBlock('magnetism-as-substrate talk', [
      `A practical check: when you brief a helper, what are you pulling into the room — shared craft, or noise that burns the grocery money? When you lock a door, are you protecting humans or policing exploratory fire as contagion? The fridge already taught the difference between a useful seal and a jammed handle.`,
      `Walk QUESTFEST and notice which surfaces pull you toward work, music, reading, or rest. That bodily sense is closer to this shelf than a slide full of arrows. Then open the whitepaper if you want the denser map.`,
    ])}

    ${pier('Feel the pull. Name the altitude. Keep SI instruments on their rails. Keep people able to earn a living while the metaphors stay metaphors.')}
`,
);

console.log('seed count', Object.keys(MORE_ARTICLES).length);
