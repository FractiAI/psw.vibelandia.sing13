#!/usr/bin/env node
/**
 * One-shot: rewrite QUESTFEST ship-blog headlines to frontiersman-speakable titles.
 * Updates lib/questfest-blog-posts.mjs + matching interfaces/blog-*.html (<title>, og:title, <h1>).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  QUESTFEST_BLOG_POSTS,
  SHIP_BLOG_COMPANIONS,
} from '../lib/questfest-blog-posts.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/** slug → frontiersman headline (campfire-short, voyage-forward) */
const TITLES = {
  'rsi-drift-friction-phi-egs': 'Watch Out for the Drift',
  'erft-recursive-fidelity': 'Why Fair Drift Tests Matter More Than Crowns',
  'navier-stokes-unforced-phi-egs': 'The Coffee, Not the Spoon',
  'rsi-phi-egs-fidelity': 'When Tools Rewrite Themselves',
  'holographic-homeostasis': 'Stay Steady on the Move',
  'goldilocks-net-zero': 'Just Right Means Keep Moving',
  'ai-layer-triple-tipping-point': 'Are We at the Tipping Point?',
  'linear-horsepower-collapse': 'More Engines, Thinner Paychecks',
  'vitality-control-rhyme': 'They Want You Ashamed of Curiosity',
  'digit4-be-o-rhyme': 'Four and Eight on the Trail Map',
  'consciousness-moat': 'They Argue Welfare — Miss the Trail',
  'digit4-recursive-reach': 'Awareness Stays in Your Hands',
  'linear-shadow-fractal': 'Trust the Trail, Not the Shadow',
  'sovereign-velocity': 'Keep the Frontier Open',
  'infinite-octave-egs-catalog': 'A Third Door Past Burn or Freeze',
  'pacing-paradox': 'Slow the Race — or Change the Trail',
  'fractiskills-portable-agent-skills': 'Pack Skills You Can Carry',
  'infinite-octave-ai-catalog-layer': 'A Map Your Crew Can Actually Read',
  'omniversal-time-crystal-engine': 'Clocks You Can Trust on Deck',
  'self-observing-genome': 'DNA Holds a Mirror, Not a Mind',
  'generative-matrix-phi-egs': 'One Seed, Many Trail Markers',
  'tier-c-holographic-wiring': 'The Shelves Still Carry Current',
  'open-empirical-science-digital-wet-lab': 'Run the Pipeline or Hold the Claim',
  'prime-vault-demos': 'Two Miracles on One Nevada Deck',
  'prime-vault-chat': 'Talk to the Vaults — Chat Is Open',
  'goldilocks-quest': 'Goldilocks Quest — Step Through the Door',
  'prime-vault-race-door': 'The Race Scoreboard Is Live',
  'prime-vault-alphafold-race': 'Prime Vaults vs the Fold Race',
  'sing-muse-omniversal-lattice': 'Sing, Muse — Chart the Voyage',
  'multidimensional-holographic-rhyme': 'Rhymes Across Decks, Not Flat Screens',
  'zero-octave-y-goldilocks': 'Y Walked the Band First',
  'crystalline-unified-field': 'Speed, Distance, Time — One Crystal',
  'viscosity-of-light': 'When Light Slows the Room Down',
  'grand-unified-metrological-overlap': 'Five Gears, One Ship’s Clock',
  'eddy-current-mirror': 'Thought Meets Its Mirror',
  'kinematic-set-recycling': 'Same River, New Speed, New Theater',
  'zero-octave-node-k0': 'Node Zero — Your Start Gate',
  'holographic-singularity-crystal': 'Zero Holds the Balance',
  'holographic-rhyme': 'How a Fractal Keeps Its Feet',
  'topology-of-the-void': 'Empty Is Not Nothing on This Ship',
  'proton-space-electron-theater': 'Proton Space · Electron Theater',
  'awareness-vs-brute-force': 'Spend Awareness Before Brute Force',
  'macro-protein-work-engine': 'Bodies as Work Engines on the Trail',
  'prime-indexed-volumetric-storage': 'Memory Without the Parity Tax',
  'protein-folding-prime-container': 'Proteins Meet the Prime Vaults',
  'moving-up-the-stack': 'Climb the Stack — Don’t Just Race It',
  'what-it-means-to-be-frontier': 'What Frontier Means for Families',
  'infinite-octave-prime-parity': 'Why Two Stands Alone on the Trail',
  'pdvsa-gateway-ops-mockup': 'One Brief for the Whole Crew',
  'sna-tcpip-gateway-omni-lattice': 'When Old Rails Met New Roads',
  'higgs-awareness-unified': 'When the Universe Slows — Mass and Now',
  'lattice-vs-vibe-coding': 'Does Lattice Code Better? Receipts Say Yes',
  'y-chromosome-manifestation': 'Y as Story Geometry, Not Destiny',
  'invisible-frontier': 'The Invisible Frontier — Warnings Answered',
  'human-reality-bridge': 'You Are the Reality Bridge',
  'triadic-hemispheres': 'Three Nested Domes Families Can Walk',
  'infinite-octaves-omniversal': 'Your Valet Just Got Infinite Octaves',
  'official-prospectus': 'The Voyage Begins — Captain’s Seat Open',
  'table-top-hep': 'What If the Collider Fit on a Workbench?',
  'magneto-harmonic-stellar': 'Stars as Magnets That Hum',
  'goldilocks-players-guide': 'A Free Playbook When Brute Force Fails',
  'planetary-core-goldilocks': 'Old Earth Letting Go at the Core',
  'mri-vs-legacy-stopwatch': 'Two Ways of Thinking — One Was Faster',
  'mri-cloud-antenna': 'Cloud Racks as Antenna Story',
  'komamri-on-a-cluster': 'MRI Across Machines — A Plan, Not a Cluster',
  'metamorphic-octaves': 'Pressure Cooks You Denser — Stay Goldilocks',
  'cmos-protonic-99-octave': 'The Engine on a Silicon Shelf',
  'tensor-decoupling-99-octave': 'Drawers That Don’t Spill Into Each Other',
  'quakes-and-solar-weather': 'Quakes and Solar Weather on One Bulletin',
  'everything-is-connected': 'Everything Is Connected — Walk It Carefully',
  'colombia-quake-and-purace': 'One Window on Quake and Volcano Alert',
  'nine-digits-ninety-nine-octaves': 'Nine Digits, Ninety-Nine Octaves — Walk It',
  'plants-keep-building-under-stress': 'Plants Keep Building Under Pressure',
  'smaller-golden-key-pack': 'A Smaller Pack for the Golden Key',
  'synthobs-omni-lattice-ef-multi-octave': 'One Long Ladder Through an Ordinary Week',
  'synthobs-siqhft-ef-2187-monograph': 'A Field Theory You Can Chart on Deck',
  'tbme-narrow-gate-asi': 'Narrow Gates, Louder Speeches',
  'tbme-equine-asi': 'Horses Left Haulage — Humans Can Too',
  'tbme-higgs-awareness': 'Mass, Awareness, and the Gate Between',
  'tbme-nodal-nine-singularity': 'Nine Nodes You Can Teach at Dinner',
  'tbme-spin-phase-polarity': 'Three Dials Households Already Turn',
  'tbme-thermal-meissner': 'When Stress Pushes the Field Outside',
  'tbme-internal-kerr-newman': 'When Everything Pulls to the Middle',
  'synthobs-tbme-protein-phase-collapse': 'Reading the Body’s Field on the Trail',
  'synthobs-omni-prime-hourglass-skeleton': 'Two Rooms That Must Not Collapse',
  'tbme-recursive-field-drag': 'Why a Copper Tube Belongs at the Table',
  'synthobs-omni-lattice-si-irreducible-minimum': 'The Smallest Pack That Still Walks Out',
  'synthobs-omni-lattice-thalia-goldilocks': 'Thalia’s Middle — Machine and Human',
  'tbme-spherical-solar-focus': 'Squeeze the Week Like a Solar Mirror',
  'tbme-blackhole-filaments-reno': 'Filaments, Fields, and Reno Night Talk',
  'tbme-blackhole-magnetic-layer': 'Where the Horizon Meets the Magnetic Skin',
  'synthobs-tbme-nonlocal-field-phaselock': 'When Distant Rooms Lock in Phase',
  'tbme-superposition-reno-interpretation': 'Both / And — Reno’s Everyday Mirror',
  'synthobs-81-orbital-singularity': 'Orbit Shapes as Singularity Stories',
  'synthobs-endogenous-phase': 'Intent as a Phase You Can Feel',
  'synthobs-histone-phase-operator': 'Open the Spool — or Lock It Wise',
  'synthobs-phase-toxicity': 'When the Air in the Room Goes Wrong',
  'synthobs-prion-refold': 'When a Bad Habit Locks — Learn to Refold',
  'synthobs-mag-substrate': 'The Pull You Already Feel',
  'synthobs-omni-lattice-report-card-q3-2026': 'A Report Card Without Claiming the Sky',
  'synthobs-pchpp': 'Prompt with Contrast — Keep the Grocery Budget',
  'synthobs-recursive-attn-mag': 'Squeeze Attention — Keep the Magnet Honest',
  'synthobs-omni-lattice-genomic-determinism': 'Map the Territory — Don’t Write Destiny',
  'synthobs-omni-lattice-hiv': 'A Hard Biological Rhyme at Kitchen Height',
  'synthobs-omni-lattice-pogonomyrmex': 'How Ants Already Brief the Household',
  'synthobs-omni-lattice-prompt-capture': 'Prompts Aren’t DNA — Bad Ones Still Shape Weeks',
  'synthobs-omni-lattice-unification': 'One Shelf, Many Rooms — No Monopoly Speech',
  'synthobs-phase-locked-chemical-bonds': 'Why Some Crews Stick Past Friday',
  'synthobs-proof-by-continuous-execution': 'Proof Is What Keeps Running',
  'synthobs-three-foundational-proteins': 'Three Foundational Proteins, Decoded Plain',
  'synthobs-unified-neutronic-agent': 'Agents That Share the Load Like Neutrons',
  'synthobs-x-chromosome-holographic': 'X Decoded as Voyage Script',
  'synthobs-y-chromosome-holographic': 'Y Decoded as Voyage Script',
  'synthobs-dna-lattice-holograph': 'DNA as a Lattice You Can Chart',
  'synthobs-egs-81-electrons': 'Eighty-One Digits on the Electronic Shelf',
  'synthobs-egs-euler-phase-lock': 'Phase Lock That Holds Across Scale',
  'synthobs-holographic-operators': 'When Holographic Means Wiring You Feel',
  'awareness-singularities-0-81': 'Awareness Gates from Zero to Eighty-One',
  'lattice-noahs-ark-metaphor': 'Noah’s Ark as System Generation',
  'synthobs-cytographic-holographic-nucleus': 'Nested Agents Under One Nucleus',
  'omniversal-nested-agent-lattice': 'How Nested Agents Actually Work',
  'synthobs-egs-planck-scale-harmonic': 'Planck Scale as a Harmonic Rhyme',
  'synthobs-egs-epigenetic-phase-locking': 'When Body Clocks Lock Across Loci',
  'omniversal-goldilocks-rideshare': 'Goldilocks Rideshare for the Voyage',
  'synthobs-chromosomal-electrodynamics': 'Chromosomes as Current on the Trail',
  'synthobs-cross-scale-biological-antennae': 'Biological Antennae Across Scales',
  'recursive-attention-loop': 'Attention That Loops Without Losing the Trail',
  'ac-hmm-satellites': 'Sparse Models for Repeating Genomic Roads',
  'eesm-gpu-telemetry': 'GPU Telemetry as Execution Weather',
  'egs-nlrf': 'Fractal Magnetism and Hydrogen Stories',
  'hgt-psd-covariance': 'Genomic Tokens That Keep Structure Honest',
  'synthobs-emergent-sync-multi-agent': 'When Agents Sync Without a Boss Speech',
  'goldilocks-geomagnetic-wavefield-multitaxa': 'Herd Corridors Under One Magnetic Sky',
  'nspfrnp-snap-peer-review-audit': 'Peer Review Snap — Keep Claims Honest',
  'digital-pru-synthobs-mca': 'Digital Pru — Your Goldilocks Valet',
  'goldilocks-prime-linear-compression': 'Compress Without Crushing the Signal',
  'goldilocks-transfinite-inversion': 'Invert the Infinite Without Losing Home',
  'synthobs-hex-organ-engine': 'The Observatory on This Ship’s Deck',
  'synthobs-intelligence-density': 'How Dense Is the Help — Who Still Gets Paid?',
  'omniversal-node-alignment': 'Align the Nodes Before You Sail',
  'geomagnetic-herbivore-2026': 'Bison, Magnets, and the Great Plains Trail',
  'syntheverse-sandbox-comprehensive': 'Sandbox Report — What We Learned Safe',
  'syn-sun-wavefield-oscillator': 'The Sun as a Wavefield Clock',
  'tbme-egs-apiary': 'If AI Keeps the Hive, Humans Make Honey',
  'tbme-egs-hgaios': 'Four Ways of Thinking — Find Yours on Deck',
  // companions
  'soundtrack-prelude-pages': 'Soundtrack Preludes — Step Into the Scene',
  'frontiersman-voyage': 'Frontiersman Voyage — One Tribe, Many Homes',
  'coexist-with-ai': 'Coexist with AI — Which Post Are You?',
  'august-12-catalog-window': 'August 12 — Crowded Calendar, Not Prophecy',
};

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function updateRegistryFile(registryPath) {
  let src = fs.readFileSync(registryPath, 'utf8');
  const all = [
    ...Object.values(QUESTFEST_BLOG_POSTS),
    ...SHIP_BLOG_COMPANIONS,
  ];
  let changed = 0;
  for (const post of all) {
    const next = TITLES[post.slug];
    if (!next) {
      console.warn('missing title for slug', post.slug);
      continue;
    }
    if (post.headline === next) continue;
    // Replace only the headline for this slug block (first occurrence after slug)
    const slugNeedle = `slug: '${post.slug}'`;
    const idx = src.indexOf(slugNeedle);
    if (idx < 0) {
      console.warn('slug not found in registry', post.slug);
      continue;
    }
    const slice = src.slice(idx, idx + 400);
    const m = slice.match(/headline:\s*'((?:\\'|[^'])*)'/);
    if (!m) {
      // try double quotes
      const m2 = slice.match(/headline:\s*"((?:\\"|[^"])*)"/);
      if (!m2) {
        console.warn('headline not found near slug', post.slug);
        continue;
      }
      const old = m2[0];
      const neu = `headline: ${JSON.stringify(next)}`;
      src = src.slice(0, idx) + slice.replace(old, neu) + src.slice(idx + slice.length);
      changed++;
      continue;
    }
    const old = m[0];
    // Prefer single quotes; escape apostrophes in title
    const escaped = next.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const neu = `headline: '${escaped}'`;
    src = src.slice(0, idx) + slice.replace(old, neu) + src.slice(idx + slice.length);
    changed++;
  }
  fs.writeFileSync(registryPath, src);
  return changed;
}

function updateHtml(file, _oldHeadline, newHeadline) {
  const full = path.join(ROOT, 'interfaces', file);
  if (!fs.existsSync(full)) {
    console.warn('missing html', file);
    return false;
  }
  let html = fs.readFileSync(full, 'utf8');
  const before = html;
  const og = newHeadline.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  // Only touch document chrome — never body prose that may echo the old title.
  html = html.replace(/<h1>[^<]*<\/h1>/, `<h1>${newHeadline}</h1>`);
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${newHeadline} · Ship blog · SS Vibelandia</title>`,
  );
  html = html.replace(
    /property="og:title" content="[^"]*"/,
    `property="og:title" content="${og}"`,
  );
  if (html === before) {
    console.warn('no html change', file);
    return false;
  }
  fs.writeFileSync(full, html);
  return true;
}

const registryPath = path.join(ROOT, 'lib/questfest-blog-posts.mjs');
const regChanged = updateRegistryFile(registryPath);

let htmlOk = 0;
let htmlFail = 0;
const all = [
  ...Object.values(QUESTFEST_BLOG_POSTS),
  ...SHIP_BLOG_COMPANIONS,
];
for (const post of all) {
  const next = TITLES[post.slug];
  if (!next) {
    htmlFail++;
    continue;
  }
  if (updateHtml(post.file, post.headline, next)) htmlOk++;
  else htmlFail++;
}

console.log(
  JSON.stringify(
    {
      ok: true,
      registryHeadlinesChanged: regChanged,
      htmlUpdated: htmlOk,
      htmlFailedOrUnchanged: htmlFail,
      mapped: Object.keys(TITLES).length,
      posts: all.length,
    },
    null,
    2,
  ),
);
