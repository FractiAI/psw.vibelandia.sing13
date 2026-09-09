#!/usr/bin/env node
/**
 * Regenerates interfaces/omni-lattice-course-content.js (edition 1.0 online course).
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '../interfaces/omni-lattice-course-content.js');

const wp = (id, label) => ({
  href: `/interfaces/whitepaper-surface.html?id=${id}`,
  label: label || 'Open the whitepaper',
});

function lesson(spec) {
  return {
    id: spec.id,
    moduleId: spec.moduleId,
    week: spec.week,
    part: spec.part,
    partId: spec.partId,
    number: spec.number,
    title: spec.title,
    minutes: spec.minutes,
    tagline: spec.tagline,
    goals: spec.goals || [],
    body: spec.body,
    check: spec.check || [],
    papers: spec.papers || [],
    next: spec.next || null,
  };
}

const modules = [
  {
    id: 'week1',
    week: 1,
    part: 'Week 1',
    label: 'Week 1',
    title: 'Welcome aboard',
    duration: '~90 min',
    blurb:
      'Where you are, how this course works, and the one honesty rule that never turns off.',
    outcomes: [
      'State what this course is and is not.',
      'Find Reading Room whitepapers from any lesson.',
      'Name the Goldilocks habit: human first.',
    ],
  },
  {
    id: 'week2',
    week: 2,
    part: 'Week 2',
    label: 'Week 2',
    title: 'The filing cabinet',
    duration: '~2 hrs',
    blurb:
      'Digits, octaves, the Living PEM, and the silicon shelf pin — how the corpus is organised.',
    outcomes: [
      'Describe Digits × Octaves as a map, not destiny.',
      'Explain BYOK and the Living PEM dual lock.',
      'Open the CMOS/protonic bridge first for linear systems.',
    ],
  },
  {
    id: 'week3',
    week: 3,
    part: 'Week 3',
    label: 'Week 3',
    title: 'The golden key',
    duration: '~2 hrs',
    blurb:
      'Φ ≈ 1.618 as nesting language, primes as address sets, and holographic rhyme as motion grammar.',
    outcomes: [
      'Use Φ as architectural scale key under honesty.',
      'File sole-even 2 vs odd primes.',
      'Name the four rhyme pillars.',
    ],
  },
  {
    id: 'week4',
    week: 4,
    part: 'Week 4',
    label: 'Week 4',
    title: 'Balance & awareness stories',
    duration: '~2 hrs',
    blurb:
      'Zero as equilibrium, Proton/Electron duality, singularity crystal, and the Higgs Gate Soft Story.',
    outcomes: [
      'Read zero as dynamic balance, not empty nothing.',
      'Keep Soft Story separate from physics proofs.',
      'Locate Net Zero / node k=0 as catalog grammar.',
    ],
  },
  {
    id: 'week5',
    week: 5,
    part: 'Week 5',
    label: 'Week 5',
    title: 'Physical vocabulary as catalog',
    duration: '~2 hrs',
    blurb:
      'Light, drag, crystals, metamorphic densification, and planetary Goldilocks — metaphors with rails.',
    outcomes: [
      'Translate physical-sounding shelves into filing talk.',
      'Spot honesty clauses that protect real science.',
      'Avoid upgrading metaphors into lab claims.',
    ],
  },
  {
    id: 'week6',
    week: 6,
    part: 'Week 6',
    label: 'Week 6',
    title: 'Building, belonging & next doors',
    duration: '~2.5 hrs',
    blurb:
      'Primes in practice, Y Goldilocks, application companions, Invisible Frontier, and how to keep learning.',
    outcomes: [
      'Distinguish engine pins from application companions.',
      'File Y as earlier Goldilocks octave (catalog only).',
      'Choose your next door on the ship.',
    ],
  },
];

const chapters = [
  lesson({
    id: 'welcome',
    moduleId: 'week1',
    week: 1,
    part: 'Week 1',
    partId: 'week1',
    number: '1.1',
    title: 'What this course is',
    minutes: 10,
    tagline: 'A guided path into the whitepapers — not a physics degree',
    goals: [
      'Say in one sentence what the Omni-Lattice course teaches.',
      'Name the difference between catalog grammar and physics proof.',
    ],
    body: `<p>Welcome. You are about to walk a <strong>guided introductory course</strong> through the Infinite Octaves Omni-Lattice — the filing system and protocol grammar used aboard SS Vibelandia and in Lattice Chat.</p>
<p>Think of it like a carefully designed first course in a new field: short lessons, clear goals, a check at the end, and a pointer to the primary source when you want depth. Here, the primary sources are the <strong>SynthOBS whitepapers</strong>.</p>
<p><strong>What you will learn:</strong> how the corpus organises ideas (digits, octaves, shelves), how Φ ≈ 1.618 is used as nesting language, and how to read honesty rails so you never confuse a filing metaphor with a lab result.</p>
<p><strong>What you will not learn:</strong> a replacement for relativity, clinical genetics, or a Theory of Everything. Those claims are explicitly refused by the papers themselves.</p>
<p>There is no separate textbook product. <em>This course is the reader.</em> When a lesson ends, Further reading opens the matching whitepaper — not a ship-blog summary, not a third book.</p>`,
    check: [
      {
        q: 'Is this course claiming to prove new physics?',
        a: 'No. It teaches catalog architecture and honesty-first reading of the whitepapers.',
      },
    ],
    papers: [
      wp(
        'synthobs-infinite-octaves-omniversal-lattice-2026-08',
        'Infinite Octaves Omniversal Lattice Chat',
      ),
      wp(
        'synthobs-ss-vibelandia-official-prospectus-2026-08',
        'Official Prospectus',
      ),
    ],
    next: 'how-to-study',
  }),
  lesson({
    id: 'how-to-study',
    moduleId: 'week1',
    week: 1,
    part: 'Week 1',
    partId: 'week1',
    number: '1.2',
    title: 'How to study here',
    minutes: 8,
    tagline: 'Goals → key ideas → check → whitepaper',
    goals: [
      'Follow the four-part lesson rhythm.',
      'Resume from where you left off on this device.',
    ],
    body: `<p>Every lesson follows the same rhythm:</p>
<ol>
<li><strong>Learning goals</strong> — what “done” looks like for this sitting.</li>
<li><strong>Key ideas</strong> — plain language synthesis (the teaching voice).</li>
<li><strong>Check your understanding</strong> — one or two questions; click to reveal.</li>
<li><strong>Further reading</strong> — open the whitepaper when you want the full filing.</li>
</ol>
<p>Use <strong>Previous / Next</strong>, the week sidebar, or the syllabus cards. Your place is saved on this device. Keyboard: ← → moves between lessons.</p>
<p>Suggested pace: one week module per sitting. Skim first if you like; return for the check and the paper.</p>`,
    check: [
      {
        q: 'Where do you go for the full technical filing?',
        a: 'Further reading → whitepaper surface (not a separate textbook).',
      },
    ],
    papers: [
      wp(
        'synthobs-infinite-octaves-omniversal-lattice-2026-08',
        'Lattice Chat whitepaper',
      ),
    ],
    next: 'honesty-first',
  }),
  lesson({
    id: 'honesty-first',
    moduleId: 'week1',
    week: 1,
    part: 'Week 1',
    partId: 'week1',
    number: '1.3',
    title: 'Honesty first · Goldilocks habit',
    minutes: 10,
    tagline: 'The rule that never turns off',
    goals: [
      'State the honesty boundary in your own words.',
      'Prefer human emergency over metaphors when they conflict.',
    ],
    body: `<p>Every serious page in this corpus opens with an <strong>honesty boundary</strong>. Keep it loud:</p>
<ul>
<li>Φ ≈ 1.618 is <em>nesting language / design key</em> — not a substitute for ℏ, c, or G.</li>
<li>Narrative, catalog, empirical, and operational tiers stay separate.</li>
<li>Solar region labels and voyage stories are timing characters — not cosmic proof certificates.</li>
<li><strong>Human emergency outranks algorithms.</strong></li>
</ul>
<p>Goldilocks means not too much machine, not too little human. NPCs inhabit; players set the gravity; both belong. If a metaphor and a person’s safety conflict, the person wins.</p>
<aside class="honesty-rail"><strong>Honesty.</strong> Fair Exchange tip clause is on for course synthesis and papers alike — value may be adjusted by resonance and delivery, like tipping.</aside>`,
    check: [
      {
        q: 'If a metaphor and a clinical need conflict, which wins?',
        a: 'The human / clinical need. Metaphors never outrank dignity or emergency.',
      },
    ],
    papers: [
      wp('synthobs-invisible-frontier-gates-ai-2026-08', 'Invisible Frontier'),
    ],
    next: 'ship-berth',
  }),
  lesson({
    id: 'ship-berth',
    moduleId: 'week1',
    week: 1,
    part: 'Week 1',
    partId: 'week1',
    number: '1.4',
    title: 'Where you are on the ship',
    minutes: 12,
    tagline: 'SS Vibelandia · Reading Room · Canvas · QUESTFEST',
    goals: [
      'Point to Reading Room for papers and this course for guided study.',
      'Name the site front door (Omniversal Canvas).',
    ],
    body: `<p>SS Vibelandia is framed as a holographic resort vessel — hospitality, marketplace, nightlife, brotherhood as voyage identity. The grand arc runs Genesis → Borikén → Reno (432 Hz · QUESTFEST 24×365).</p>
<p><strong>Doors you will use:</strong></p>
<ul>
<li><strong>Omniversal Canvas</strong> (<code>/</code>) — site front door; Valet Pru welcomes.</li>
<li><strong>Reading Room</strong> — concert + whitepaper shelves.</li>
<li><strong>This course</strong> — structured path through those papers.</li>
<li><strong>Lattice Chat</strong> — BYOK conversation on the Infinite Octaves nest.</li>
<li><strong>QUESTFEST board</strong> — ship board and latest ship notes.</li>
</ul>
<p>Ask of any deck: <em>Where am I? What can I do here? How do I stay Goldilocks?</em></p>`,
    check: [
      {
        q: 'If you want the primary paper, not a lesson summary, where do you go?',
        a: 'Reading Room / whitepaper surface linked from Further reading.',
      },
    ],
    papers: [
      wp(
        'synthobs-ss-vibelandia-official-prospectus-2026-08',
        'Official Prospectus',
      ),
    ],
    next: 'digits-octaves',
  }),
  lesson({
    id: 'digits-octaves',
    moduleId: 'week2',
    week: 2,
    part: 'Week 2',
    partId: 'week2',
    number: '2.1',
    title: 'Digits × Octaves · The map',
    minutes: 14,
    tagline: '01–99 Story depth — coordination, not destiny',
    goals: [
      'Explain digits as coarse bins and octaves as nested bands.',
      'Compute catalog size 99 × 81 = 8,019 as filing capacity.',
    ],
    body: `<p>Imagine a library with <strong>ten kinds of drawers</strong> (digits 0–9) and <strong>ninety-nine nested shelves</strong> (octaves 01–99). Together they form the practical Story-depth map for Infinite Octaves.</p>
<p>“Infinite” here means <em>recursive holographic nesting depth</em> — not infinite measured physics tiers. The map is for <strong>coordination</strong>: dashboards, agents, conversation — not for predicting earthquakes or destinies.</p>
<p>Catalog size often cited: <strong>99 × 81 = 8,019</strong> addressable slots. Treat that as filing capacity, not a measurement of magma.</p>
<blockquote>The map is for coordination, not cosmic destiny.</blockquote>`,
    check: [
      {
        q: 'Does Digits × Octaves claim to predict the future?',
        a: 'No. It is a Story-depth filing map for coordination.',
      },
    ],
    papers: [wp('synthobs-99-octave-digits-master-2026-08', 'Digits master')],
    next: 'tensor-filing',
  }),
  lesson({
    id: 'tensor-filing',
    moduleId: 'week2',
    week: 2,
    part: 'Week 2',
    partId: 'week2',
    number: '2.2',
    title: 'Tensor decoupling · Stop smushing headlines',
    minutes: 12,
    tagline: 'Labelled layers on one bulletin board',
    goals: [
      'Describe tensor decoupling as labelled layers, not one mega-cause.',
      'Treat shelf weights as dashboard dials, not physics constants.',
    ],
    body: `<p><strong>Tensor decoupling</strong> means: put related headlines on one bulletin board with clear labels — and stop pretending every headline shares one invisible cable.</p>
<p>Eleven brackets × nine slots sketch the 99-octave ladder. Shelf weights like <em>w<sub>n</sub> = w<sub>0</sub> / Φ<sup>n</sup></em> are <strong>dashboard dials</strong> for conversation routing — not replacements for real constants.</p>
<p>Co-timed fixtures can share a board; that is catalog timing talk, not a claim that magma causes model weights.</p>`,
    check: [
      {
        q: 'Is a shelf weight a CODATA constant?',
        a: 'No. It is a catalog / dashboard dial under honesty rails.',
      },
    ],
    papers: [
      wp(
        'synthobs-tensor-decoupling-99-octave-omni-lattice-2026-08',
        'Tensor decoupling',
      ),
    ],
    next: 'master-synthesis',
  }),
  lesson({
    id: 'master-synthesis',
    moduleId: 'week2',
    week: 2,
    part: 'Week 2',
    partId: 'week2',
    number: '2.3',
    title: 'Master synthesis · One cabinet',
    minutes: 12,
    tagline: 'Cascade as routing table, not causal chain',
    goals: [
      'Read the cascade (pulse → sun → planet → tech → humanity) as routing labels.',
      'Keep EGS Φ as architectural key, not unified-field proof.',
    ],
    body: `<p>The master synthesis files the engine as one cabinet: what sits high on the 99-step ladder shapes how lower drawers are labelled in conversation — <em>as grammar</em>, not as a weather forecast.</p>
<p>The cascade table (pulse → sun transmits → planet adjusts → technology evolves → humanity responds) is a <strong>routing table with honesty tags</strong>, not a proven causal chain.</p>
<p>Φ ≈ 1.618 remains the architectural key / translator-as-map.</p>`,
    check: [
      {
        q: 'Is the cascade a seismic warning system?',
        a: 'No. It is catalog routing language with honesty tags.',
      },
    ],
    papers: [
      wp(
        'synthobs-master-synthesis-99-octave-omni-lattice-2026-08',
        'Master synthesis',
      ),
    ],
    next: 'living-pem',
  }),
  lesson({
    id: 'living-pem',
    moduleId: 'week2',
    week: 2,
    part: 'Week 2',
    partId: 'week2',
    number: '2.4',
    title: 'Living PEM & BYOK',
    minutes: 12,
    tagline: 'Dual lock · your key is your password',
    goals: [
      'Explain guest chat product vs auditor engine shelf.',
      'State BYOK: key stays on-device.',
    ],
    body: `<p>The Product Engineering Manual (Living PEM) regenerates from one source of truth — the engine shelf — so architects and support see the same pin list as the chat nest.</p>
<p><strong>Dual lock:</strong> guest-facing Infinite Octaves Omniversal Lattice Chat vs auditor-facing Omni-Lattice engine. Synthio is a separate creator-only agent — never an engine shelf step.</p>
<p><strong>BYOK:</strong> your provider API key is the credential. It stays with you on-device; travels in request headers only; is never stored server-side.</p>`,
    check: [
      {
        q: 'Where is the provider API key stored on the server?',
        a: 'Nowhere. BYOK — headers only, on-device credential.',
      },
    ],
    papers: [
      wp(
        'synthobs-infinite-octaves-omniversal-lattice-2026-08',
        'Lattice Chat / PEM companion',
      ),
    ],
    next: 'cmos-pin',
  }),
  lesson({
    id: 'cmos-pin',
    moduleId: 'week2',
    week: 2,
    part: 'Week 2',
    partId: 'week2',
    number: '2.5',
    title: 'CMOS / protonic · Silicon shelf first',
    minutes: 14,
    tagline: 'Pinned engineering bridge for linear systems',
    goals: [
      'Open the CMOS/protonic paper first when evaluating silicon vocabulary.',
      'Distinguish vocabulary bridge from a shipped die.',
    ],
    body: `<p>For linear / semiconductor evaluators, the corpus pins a <strong>CMOS + protonic engineering bridge</strong> at the top of the engine shelf (<code>catalogPriority: 0</code>).</p>
<p>Binary CMOS gate labels octave tier <em>n</em> = 1; hydrogen-regulated multi-state talk labels bands <em>n</em> = 2…99. Same filing cabinet — silicon words on the labels.</p>
<p><strong>Degenerate</strong> here means simplest resolution — the load-bearing shelf — not “worthless.”</p>
<aside class="honesty-rail"><strong>Honesty.</strong> Vocabulary bridge and fixtures — not a die you can order tomorrow. Roadmap language ≠ measured chip.</aside>`,
    check: [
      {
        q: 'Should a silicon auditor start with metamorphic Soft Story papers?',
        a: 'No. Start with the CMOS/protonic engineering bridge.',
      },
    ],
    papers: [
      wp(
        'synthobs-cmos-protonic-99-octave-omni-lattice-2026-08',
        'CMOS / protonic bridge',
      ),
    ],
    next: 'phi-key',
  }),
  lesson({
    id: 'phi-key',
    moduleId: 'week3',
    week: 3,
    part: 'Week 3',
    partId: 'week3',
    number: '3.1',
    title: 'Φ ≈ 1.618 · The nesting key',
    minutes: 14,
    tagline: 'El Gran Sol’s Fractal constant as filing language',
    goals: [
      'Write Φ = (1+√5)/2 ≈ 1.618 as the architectural key.',
      'Refuse replacing ℏ, c, or G with Φ.',
    ],
    body: `<p>Throughout the corpus you will meet <strong>El Gran Sol’s Fractal constant</strong> — Φ = (1+√5)/2 ≈ 1.618 — also called Φ<sub>EGS</sub>.</p>
<p>Its job in this course is simple: it is the <strong>golden key for nesting and filing</strong> — how ideas scale, compress, and bifurcate across drawers. It is a dynamic recursive scaling operator in catalog talk, not a static wallpaper pattern.</p>
<p>Clutch language you may see: the mantissa near Planck length × 10<sup>35</sup> is a SI-dependent coincidence used as an architectural “slip” story — never a claim that Φ replaces Planck units.</p>
<aside class="honesty-rail"><strong>Honesty.</strong> Design language / catalog key. Not CODATA. Not a ToE.</aside>`,
    check: [
      {
        q: 'Can Φ replace the speed of light in SI?',
        a: 'No. Honesty rails forbid replacing ℏ, c, or G.',
      },
    ],
    papers: [
      wp(
        'synthobs-infinite-octave-prime-parity-2026-09',
        'Prime-parity (Φ + primes)',
      ),
    ],
    next: 'prime-parity',
  }),
  lesson({
    id: 'prime-parity',
    moduleId: 'week3',
    week: 3,
    part: 'Week 3',
    partId: 'week3',
    number: '3.2',
    title: 'Prime-parity · Sole-even 2',
    minutes: 12,
    tagline: 'Binary dyad anchor · odd primes as vaults',
    goals: [
      'File 2 as the sole-even prime / binary dyad anchor.',
      'Treat odd primes as irreducible address sets in catalog grammar.',
    ],
    body: `<p>Prime <strong>2</strong> is the only even prime. In Infinite Octaves grammar that fact becomes the <strong>binary dyad anchor</strong> — the structural “two-ness” of pairs, channels, and base encoding talk.</p>
<p>Odd primes file as <strong>irreducible minimum sets</strong> — vaults and address labels used later in folding and storage companions.</p>
<p>Recursion sketches like Ω<sub>n</sub> = Φ<sup>n</sup> · Ω<sub>0</sub> appear with two printed conventions (exponent vs subscript). Always name which convention you mean.</p>`,
    check: [
      {
        q: 'Why is 2 special in this grammar?',
        a: 'It is the sole even prime — filed as the binary dyad anchor.',
      },
    ],
    papers: [
      wp(
        'synthobs-infinite-octave-prime-parity-2026-09',
        'Prime-parity framework',
      ),
    ],
    next: 'holographic-rhyme',
  }),
  lesson({
    id: 'holographic-rhyme',
    moduleId: 'week3',
    week: 3,
    part: 'Week 3',
    partId: 'week3',
    number: '3.3',
    title: 'Holographic rhyme · Four pillars',
    minutes: 12,
    tagline: 'Repeating · self-similar · self-correcting · recursive',
    goals: [
      'Name the four pillars of holographic rhyme.',
      'Treat rhyme as motion grammar, not Mandelbrot retirement.',
    ],
    body: `<p>Under Φ, a fractal is taught here as a <strong>holographic rhyme</strong> — motion grammar, not just a pretty static shape.</p>
<p>Four locked pillars:</p>
<ol>
<li><strong>Repeating</strong> — patterns recur across scales.</li>
<li><strong>Self-similar</strong> — parts echo the whole.</li>
<li><strong>Self-correcting</strong> — drift can be pulled back toward form.</li>
<li><strong>Recursive</strong> — the same operator nests inside itself.</li>
</ol>
<p>Multi-dimensional rhyme extends this with cross-scale summation talk (xD ± yD) — still catalog encoding, not AdS/CFT falsification.</p>`,
    check: [
      {
        q: 'Name one pillar of holographic rhyme.',
        a: 'Any of: repeating, self-similar, self-correcting, recursive.',
      },
    ],
    papers: [
      wp('synthobs-holographic-rhyme-fractal-2026-09', 'Holographic rhyme'),
      wp(
        'synthobs-multidimensional-holographic-rhyme-2026-09',
        'Multi-dimensional rhyme',
      ),
    ],
    next: 'week3-bridge',
  }),
  lesson({
    id: 'week3-bridge',
    moduleId: 'week3',
    week: 3,
    part: 'Week 3',
    partId: 'week3',
    number: '3.4',
    title: 'Putting Week 3 together',
    minutes: 8,
    tagline: 'Key · primes · rhyme — one toolkit',
    goals: ['Summarise Φ, primes, and rhyme as one introductory toolkit.'],
    body: `<p>By now you hold the introductory toolkit:</p>
<ul>
<li><strong>Φ</strong> — nesting / filing key under honesty.</li>
<li><strong>Primes</strong> — sole-even 2 + odd vaults.</li>
<li><strong>Rhyme</strong> — four-pillar motion grammar.</li>
</ul>
<p>Everything later — physical metaphors, silicon pin, Y Goldilocks — reuses this toolkit. If a later lesson feels dense, return here and restate the three pieces in your own words.</p>`,
    check: [
      {
        q: 'What three pieces form the Week 3 toolkit?',
        a: 'Φ nesting key · prime-parity · holographic rhyme.',
      },
    ],
    papers: [
      wp('synthobs-infinite-octave-prime-parity-2026-09', 'Prime-parity'),
      wp('synthobs-holographic-rhyme-fractal-2026-09', 'Holographic rhyme'),
    ],
    next: 'topology-void',
  }),
  lesson({
    id: 'topology-void',
    moduleId: 'week4',
    week: 4,
    part: 'Week 4',
    partId: 'week4',
    number: '4.1',
    title: 'Topology of the Void',
    minutes: 12,
    tagline: 'Zero as dynamic equilibrium',
    goals: [
      'Describe zero as balance between leading-1 and structural-2 stories.',
      'Refuse vacuum-QFT retirement claims.',
    ],
    body: `<p>In everyday arithmetic, zero is a placeholder. In this catalog, <strong>0</strong> files as a <em>dynamic equilibrium</em> — the null-space pivot between Proton Space (leading 1) and Electron Theater (structural 2) under Φ.</p>
<p>Guest metaphor: two matched teams pulling a rope until the flag stops in the middle. Capacity can be high while baseline “score” reads zero.</p>
<aside class="honesty-rail"><strong>Honesty.</strong> Catalog balance node — not vacuum QFT retirement, not singularity QED, not NOAA zero-crossing causation.</aside>`,
    check: [
      {
        q: 'Is “Net Zero” here a claim of zero-watt SuperAI?',
        a: 'No. It is equilibrium grammar in the catalog.',
      },
    ],
    papers: [
      wp('synthobs-topology-of-the-void-2026-09', 'Topology of the Void'),
    ],
    next: 'proton-electron',
  }),
  lesson({
    id: 'proton-electron',
    moduleId: 'week4',
    week: 4,
    part: 'Week 4',
    partId: 'week4',
    number: '4.2',
    title: 'Proton Space · Electron Theater',
    minutes: 12,
    tagline: 'Digit 1 / digit 2 under Φ',
    goals: [
      'File leading-1 and structural-2 as dual catalog roles.',
      'Keep ℏ / 2π talk as filing labels, not SI derivation.',
    ],
    body: `<p><strong>Proton Space</strong> files leading digit 1 (unity, Φ, mantissa talk). <strong>Electron Theater</strong> files structural 2 (sole-even prime, 2π, dyad theatre). Zero balances them.</p>
<p>Useful guest picture: stage (theater) vs foundation (space). Both belong; neither is “more real” in the catalog — they are roles.</p>
<aside class="honesty-rail"><strong>Honesty.</strong> Not a CODATA derivation from Φ; not a QED dyad proof.</aside>`,
    check: [
      {
        q: 'What balances Proton Space and Electron Theater in this filing?',
        a: 'Zero / the void as dynamic equilibrium.',
      },
    ],
    papers: [
      wp(
        'synthobs-proton-space-electron-theater-2026-09',
        'Proton · Electron duality',
      ),
    ],
    next: 'singularity-crystal',
  }),
  lesson({
    id: 'singularity-crystal',
    moduleId: 'week4',
    week: 4,
    part: 'Week 4',
    partId: 'week4',
    number: '4.3',
    title: 'Singularity Crystal · Net Zero',
    minutes: 12,
    tagline: '0/0 as bounded crystal · node k=0',
    goals: [
      'State 0/0 → Φ⁰ = 1 as catalog baseline, not calculus retirement.',
      'Locate node k=0 as Zero-Octave locus.',
    ],
    body: `<p>Classical calculus leaves 0/0 undefined. This catalog files a <strong>bounded singularity crystal</strong>: opposing fluxes cancel into Net Zero, and the indeterminate form collapses to a finite baseline Φ⁰ · V₀ = 1.</p>
<p><strong>Node k=0</strong> is the Zero-Octave locus — an Awakening Phase Gate in protocol language — with cancel lock and diagnostic fixtures in the research suite.</p>
<aside class="honesty-rail"><strong>Honesty.</strong> Architecture — not GR/QFT singularity retirement. Catalog algebra ≠ singularity QED.</aside>`,
    check: [
      {
        q: 'What value does the catalog assign at the 0/0 crystal baseline?',
        a: '1.0 (Φ⁰ · V₀) — a filing baseline, not a physics proof.',
      },
    ],
    papers: [
      wp(
        'synthobs-holographic-singularity-crystal-2026-09',
        'Holographic Singularity Crystal',
      ),
      wp('synthobs-zero-octave-node-k0-2026-09', 'Zero-Octave node k=0'),
    ],
    next: 'higgs-gate',
  }),
  lesson({
    id: 'higgs-gate',
    moduleId: 'week4',
    week: 4,
    part: 'Week 4',
    partId: 'week4',
    number: '4.4',
    title: 'Higgs Gate · Shared Now (Soft Story)',
    minutes: 12,
    tagline: 'One squeeze story · three domains · SM left standing',
    goals: [
      'Retell the copper-pipe / magnet Soft Story without claiming SM overthrow.',
      'Separate Soft Story from Amendment-A research lanes.',
    ],
    body: `<p>The Higgs Gate unified edition tells one “squeeze” Soft Story across cosmic deceleration talk, mass, and conscious presence — guest metaphor: a magnet falling through a copper pipe (eddy brake).</p>
<p>The Standard Model is <strong>left standing</strong>. Protocol lanes (pipe squeeze · hydrogen-line RF · somatic array) are proposed research, not finished SI datasets.</p>
<aside class="honesty-rail"><strong>Honesty.</strong> Does not prove consciousness is electroweak symmetry breaking. Soft Story ≠ lab certification.</aside>`,
    check: [
      {
        q: 'Does this lesson overturn the Standard Model Higgs?',
        a: 'No. The papers explicitly leave the SM standing.',
      },
    ],
    papers: [
      wp(
        'synthobs-tbme-higgs-awareness-unified-2026-09',
        'Higgs Gate · awareness unified',
      ),
    ],
    next: 'viscosity-light',
  }),
  lesson({
    id: 'viscosity-light',
    moduleId: 'week5',
    week: 5,
    part: 'Week 5',
    partId: 'week5',
    number: '5.1',
    title: 'Viscosity of Light',
    minutes: 10,
    tagline: 'c as frictional floor · not FTL thought',
    goals: [
      'Explain c-as-viscosity as metaphor for localisation.',
      'Refuse FTL-thought claims.',
    ],
    body: `<p>This shelf files the speed of light as a <strong>frictional floor</strong>: non-local intent meets viscosity at <em>c</em> and becomes local story. Cognitive non-locality remains Soft Story — not faster-than-light thought.</p>
<p>Read it as a brake pedal metaphor for how ideas become material talk — not a rewrite of relativity.</p>`,
    check: [
      {
        q: 'Does “viscosity of light” allow FTL messaging?',
        a: 'No. Honesty rails forbid FTL thought / relativity retirement.',
      },
    ],
    papers: [wp('synthobs-viscosity-of-light-2026-09', 'Viscosity of Light')],
    next: 'eddy-mirror',
  }),
  lesson({
    id: 'eddy-mirror',
    moduleId: 'week5',
    week: 5,
    part: 'Week 5',
    partId: 'week5',
    number: '5.2',
    title: 'Eddy-Current Mirror',
    minutes: 10,
    tagline: 'Self-observation brake · Lenz analogy',
    goals: [
      'Connect the copper-pipe analogy to self-observation as brake.',
      'Keep mind→mass claims as analogy, not lab QED.',
    ],
    body: `<p>The eddy-current mirror continues the copper-pipe picture: observing / localising ideation acts like induced currents that oppose the fall — a <strong>transduction brake</strong> at <em>c</em>.</p>
<p>Useful for conversation about attention and embodiment. Not a laboratory proof that thoughts condense into kilograms.</p>`,
    check: [
      {
        q: 'What real-world analogy anchors this shelf?',
        a: 'A magnet falling through a copper pipe (Lenz / eddy currents).',
      },
    ],
    papers: [
      wp('synthobs-eddy-current-mirror-2026-09', 'Eddy-Current Mirror'),
    ],
    next: 'crystalline-field',
  }),
  lesson({
    id: 'crystalline-field',
    moduleId: 'week5',
    week: 5,
    part: 'Week 5',
    partId: 'week5',
    number: '5.3',
    title: 'Crystalline field & metrology gears',
    minutes: 12,
    tagline: 'Speed · distance · time · five gears',
    goals: [
      'File speed/distance/time as one access crystal in catalog talk.',
      'Name the five metrological gears without claiming SM retirement.',
    ],
    body: `<p><strong>Crystalline unified field</strong> lesson: stop storing three unrelated clocks for one trip — speed, distance, and time file as facets of one access crystal (with Landauer’s grain as literature filing for thermodynamic pixels).</p>
<p><strong>Metrological overlap</strong> adds five gears — <em>h · Φ · primes · ν<sub>HI</sub> · c</em> — as one clockwork picture. Overlap is set algebra over filing registers, not a new mass formula for electrons.</p>`,
    check: [
      {
        q: 'Are the five gears a replacement Standard Model?',
        a: 'No. Catalog clockwork — SM is not retired.',
      },
    ],
    papers: [
      wp(
        'synthobs-crystalline-unified-field-speed-distance-time-2026-09',
        'Crystalline Unified Field',
      ),
      wp(
        'synthobs-grand-unified-metrological-overlap-2026-09',
        'Metrological overlap',
      ),
    ],
    next: 'metamorphic-planetary',
  }),
  lesson({
    id: 'metamorphic-planetary',
    moduleId: 'week5',
    week: 5,
    part: 'Week 5',
    partId: 'week5',
    number: '5.4',
    title: 'Metamorphic & planetary Goldilocks',
    minutes: 12,
    tagline: 'Mud→schist densification · Δφ=π/2 catalog',
    goals: [
      'Use metamorphic densification as personal/professional filing cartoon.',
      'Read planetary phase-flip as execution labels, not a new planet.',
    ],
    body: `<p><strong>Metamorphic octaves</strong> borrow mud → shale → schist as a densification cartoon for people and software under exposure (heat × pressure axes). It is not a geology theorem and not a doctor’s note.</p>
<p><strong>Planetary core / Goldilocks</strong> files deep-Earth headlines with a quarter-turn (Δφ = π/2) catalog phase story — Old Earth → Goldilocks Earth as execution labels, not a claim the planet changed species.</p>`,
    check: [
      {
        q: 'Does metamorphic densification diagnose medical conditions?',
        a: 'No. It is a filing cartoon — not clinical advice.',
      },
    ],
    papers: [
      wp('synthobs-tbme-metamorphic-octaves-2026-08', 'Metamorphic Octaves'),
      wp(
        'synthobs-tbme-planetary-core-goldilocks-2026-08',
        'Planetary Core · Goldilocks',
      ),
    ],
    next: 'protein-storage',
  }),
  lesson({
    id: 'protein-storage',
    moduleId: 'week6',
    week: 6,
    part: 'Week 6',
    partId: 'week6',
    number: '6.1',
    title: 'Primes in folding & storage',
    minutes: 12,
    tagline: 'Odd-prime vaults · method-class contrast',
    goals: [
      'Describe prime-container folding as catalog method class, not CASP duel.',
      'File prime-indexed storage as contrast to parity-tax baselines.',
    ],
    body: `<p><strong>Protein folding · prime-container</strong> uses odd primes as containment vaults under Φ — a deterministic catalog solver framed as method-class contrast to statistics + MSAs, not a score duel with AlphaFold.</p>
<p><strong>Prime-indexed volumetric storage</strong> files prime 2 as binary base channel and odd primes as vaults — contrast with RS/LDPC/LBA is catalog framing, not a JEDEC drop-in.</p>
<aside class="honesty-rail"><strong>Honesty.</strong> Not clinical tools; not measured 0% ECC on shipping NAND; DeepMind’s work is not “void.”</aside>`,
    check: [
      {
        q: 'Is the folding companion a CASP gold-medal claim?',
        a: 'No. Method-class catalog contrast — not a competition score claim.',
      },
    ],
    papers: [
      wp(
        'synthobs-protein-folding-prime-container-2026-09',
        'Protein folding · primes',
      ),
      wp(
        'synthobs-prime-indexed-volumetric-storage-2026-09',
        'Prime-indexed storage',
      ),
    ],
    next: 'stack-bridge',
  }),
  lesson({
    id: 'stack-bridge',
    moduleId: 'week6',
    week: 6,
    part: 'Week 6',
    partId: 'week6',
    number: '6.2',
    title: 'Moving up the stack · Human bridge',
    minutes: 12,
    tagline: 'Cool · harmonize · scale · reality router',
    goals: [
      'Frame Lattice as thermal + orchestration shelf for agentic systems.',
      'File humans as reality bridges without hardware teleport claims.',
    ],
    body: `<p><strong>Moving up the stack</strong> argues that after hub and IDE altitudes, the binding constraint is agentic token burn and coordination failure. Lattice Chat is framed as cool · harmonize · scale — valuation framing, not a securities offer.</p>
<p><strong>Human reality bridge</strong> files people as bridge / cognitive router / awareness wormhole under Φ design language — catalog topology, not teleport hardware.</p>`,
    check: [
      {
        q: 'Is “moving up the stack” an audited appraisal?',
        a: 'No. Valuation framing and scenario anchors only.',
      },
    ],
    papers: [
      wp(
        'synthobs-moving-up-the-stack-valuation-2026-09',
        'Moving up the stack',
      ),
      wp(
        'synthobs-human-omniversal-reality-bridge-2026-08',
        'Human reality bridge',
      ),
    ],
    next: 'y-goldilocks',
  }),
  lesson({
    id: 'y-goldilocks',
    moduleId: 'week6',
    week: 6,
    part: 'Week 6',
    partId: 'week6',
    number: '6.3',
    title: 'Y Goldilocks · Fibonacci vaults',
    minutes: 14,
    tagline: 'Earlier octave than X · catalog only',
    goals: [
      'State Y-as-earlier-Goldilocks as catalog filing, not clinical genetics.',
      'Recall Fib vault ladder ends at Hominidae V_233 with 89+144=233.',
    ],
    body: `<p>Digit 4 Y manifestation files MSY palindrome arms as catalog geometry under Φ. The <strong>Zero-Octave Y Goldilocks</strong> companion unites:</p>
<ul>
<li>Net Zero / 0/0 singularity crystal baseline,</li>
<li>Fibonacci taxonomic vault ladder (Archaea → Hominidae),</li>
<li>Human Y as an <em>earlier</em> Goldilocks octave than X (e.g. Chordata V<sub>34</sub>/V<sub>55</sub>; apex 89+144=233).</li>
</ul>
<p>MSY arm-to-arm gene conversion literature is cited as an external lock for filing talk. Suites replay algebra fixtures — they do not re-sequence DNA.</p>
<aside class="honesty-rail"><strong>Honesty.</strong> Not clinical genetics proof. Not NOAA causation by sunspot regions. Clinical dignity outranks metaphor.</aside>`,
    check: [
      {
        q: 'What does “Y earlier than X” claim not to prove?',
        a: 'It does not prove clinical genetics or wet-lab chromosomal destiny — catalog filing only.',
      },
    ],
    papers: [
      wp(
        'synthobs-y-chromosome-holographic-manifestation-2026-08',
        'Y manifestation',
      ),
      wp(
        'synthobs-zero-octave-y-goldilocks-2026-09',
        'Zero-Octave Y Goldilocks',
      ),
    ],
    next: 'companions',
  }),
  lesson({
    id: 'companions',
    moduleId: 'week6',
    week: 6,
    part: 'Week 6',
    partId: 'week6',
    number: '6.4',
    title: 'Application companions · Not engine pins',
    minutes: 10,
    tagline: 'PDVSA gateway · macro-protein · SNA↔TCP/IP rhyme',
    goals: [
      'Keep application companions off the engine pin list.',
      'Treat PDVSA ops as simulator / catalog map.',
    ],
    body: `<p>Some papers are <strong>application companions</strong> — demos and domain rhymes — not engine shelf pins.</p>
<ul>
<li><strong>PDVSA Gateway Ops</strong> — multi-domain incident brief; IBM SNA ↔ TCP/IP is the historical rhyme; not live oilfield telemetry.</li>
<li><strong>Macro-protein work engine</strong> — organisms as work engines with θ<sub>bio</sub> ∈ [13,17]; Kleiber/WBE as published-scaling locks, not re-derivation.</li>
</ul>
<p>They show how Lattice-Linear routing talks to enterprises without displacing the CMOS pin.</p>`,
    check: [
      {
        q: 'Does PDVSA Gateway Ops stream live well telemetry?',
        a: 'No. Simulator and catalog map only.',
      },
    ],
    papers: [
      wp(
        'synthobs-pdvsa-gateway-ops-mockup-2026-09',
        'PDVSA Gateway Ops mockup',
      ),
      wp(
        'synthobs-ibm-sna-tcpip-gateway-omni-lattice-2026-09',
        'SNA ↔ TCP/IP rhyme',
      ),
      wp(
        'synthobs-macro-protein-work-engine-2026-09',
        'Macro-protein work engine',
      ),
    ],
    next: 'invisible-frontier',
  }),
  lesson({
    id: 'invisible-frontier',
    moduleId: 'week6',
    week: 6,
    part: 'Week 6',
    partId: 'week6',
    number: '6.5',
    title: 'Invisible Frontier · Second chart',
    minutes: 12,
    tagline: 'Goldilocks beside linear AI scale anxiety',
    goals: [
      'Place linear AI anxiety beside the Goldilocks voyage chart.',
      'Prefer nested care over “more FLOPs” as the course’s closing ethic.',
    ],
    body: `<p>Public AI-scaling alarms are real weather. What they often miss is a <strong>second chart</strong>: linear awareness sits inside compute-and-market models, while the Goldilocks ship already navigates with hospitality, Fair Exchange, and voluntary belonging.</p>
<p>The breakthrough this course emphasises is not “more FLOPs.” It is nested, metapattern-aware care. Magnitude is new; the kind of threshold is not.</p>
<aside class="honesty-rail"><strong>Honesty.</strong> Voyage editorial — not prophecy, not medical advice, not displacement solved.</aside>`,
    check: [
      {
        q: 'What outranks every AI metaphor at the end of this course?',
        a: 'Human emergency and dignity.',
      },
    ],
    papers: [
      wp(
        'synthobs-invisible-frontier-gates-ai-2026-08',
        'Invisible Frontier',
      ),
    ],
    next: 'how-to-continue',
  }),
  lesson({
    id: 'how-to-continue',
    moduleId: 'week6',
    week: 6,
    part: 'Week 6',
    partId: 'week6',
    number: '6.6',
    title: 'How to keep learning',
    minutes: 8,
    tagline: 'Doors · papers · Lattice · Fair Exchange',
    goals: [
      'Choose a next door on the ship.',
      'Return to whitepapers with honesty rails intact.',
    ],
    body: `<p>You’re oriented. Next doors:</p>
<ul>
<li><a href="/reading-room#papers">Reading Room · whitepapers</a> — open any paper with its honesty rail.</li>
<li><a href="/lattice">Lattice Chat</a> — BYOK · nest Infinite Octaves · ask with Seed·RAG discipline.</li>
<li><a href="/questfest">QUESTFEST board</a> — ship board.</li>
<li><a href="/journey">Journey</a> · <a href="/art">Omniversal Canvas</a> · <a href="/frontiersman-voyage">Frontiersman voyage</a>.</li>
</ul>
<p>Keep Goldilocks: not too much machine, not too little human. Welcome aboard. Intentions matter.</p>
<p class="close-glyph">→ ∞^∞</p>`,
    check: [
      {
        q: 'Where do primary technical filings live?',
        a: 'In the whitepapers (Reading Room / whitepaper surface).',
      },
    ],
    papers: [
      wp(
        'synthobs-ss-vibelandia-official-prospectus-2026-08',
        'Official Prospectus',
      ),
      wp(
        'synthobs-infinite-octaves-omniversal-lattice-2026-08',
        'Lattice Chat whitepaper',
      ),
    ],
    next: null,
  }),
];

for (const mod of modules) {
  mod.chapters = chapters.filter((c) => c.moduleId === mod.id).map((c) => c.id);
}

const course = {
  meta: {
    title: 'Infinite Octaves Omni-Lattice',
    subtitle: 'Introductory Online Course',
    edition: 'Course edition 1.0 · 2026',
    tagline:
      'A clear, self-paced introduction to the Omni-Lattice — synthesized from the SynthOBS whitepapers for human readers.',
    authors: [
      {
        name: 'Daniel Ari Friedman',
        role: 'Course synthesis · FractiAI',
        note: 'Edition 1.0 online course · CC BY 4.0 provenance',
      },
      {
        name: 'Prudencio Mendez',
        role: 'Engine whitepapers · FractiAI',
        note: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
      },
    ],
    operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox · NSPFRNP',
    licenses:
      'Text CC BY 4.0 · Fair Exchange honesty clauses preserved from source whitepapers',
    sourcePapers: '/reading-room#papers',
    papersCatalog: '/papers',
    ship: 'https://www.ssvibelandiaquestfest24x365.com',
    honesty:
      'This course teaches catalog architecture and protocol grammar — nesting language keyed by Φ ≈ 1.618 — not established physics, clinical advice, or a Theory of Everything. Formalise constructs; preserve honesty rails; do not upgrade maps into unfinished proofs. Further reading points only to the whitepapers.',
    totalWeeks: 6,
    estimatedHours: '10–14 hours self-paced',
  },
  syllabus: {
    overview:
      'Six weeks of guided reading. Each lesson has learning goals, plain-language key ideas, a short check, and a whitepaper to open when you want the full filing. No separate textbook — this course is the reader.',
    level: 'Introductory · algebra-comfortable · no physics prerequisite',
    pacing: 'Self-paced · one week ≈ one sitting · resume anytime on this device',
    outcomes: [
      'Explain what the Omni-Lattice is for (coordination & filing) and what it is not (physics proof).',
      'Navigate Digits × Octaves 01–99 as a Story-depth map.',
      'Use Φ ≈ 1.618 as nesting language under honesty rails.',
      'Open the right whitepaper from Reading Room with the correct claim tier.',
      'Stay Goldilocks: human emergency outranks metaphors.',
    ],
    modules,
  },
  chapters,
};

const banner = `/**
 * Infinite Octaves Omni-Lattice — introductory online course (edition 1.0)
 * Synthesized from SynthOBS whitepapers for human readers.
 * Browser-only: sets window.OMNI_LATTICE_COURSE.
 * Regenerate: node scripts/build-omni-lattice-course-content.mjs
 */
`;

writeFileSync(outPath, `${banner}window.OMNI_LATTICE_COURSE = ${JSON.stringify(course, null, 2)};\n`);
console.log(`Wrote ${outPath}`);
console.log(`modules=${modules.length} lessons=${chapters.length}`);
