#!/usr/bin/env node
/**
 * Vitality-peer voice rewrite for assigned QUESTFEST ship-blog HTML files.
 * Preserves nav / links / slugs / CSS / shell; replaces article body + honesty.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { auditShipBlogFile } from '../lib/ship-blog-magazine.mjs';

const DIR = join(process.cwd(), 'interfaces');

function replaceCore(html, bodyHtml, honestyHtml) {
  const artMatch = html.match(/<article[\s\S]*?<\/article>/i);
  if (!artMatch) throw new Error('no article');
  const article = artMatch[0];
  const nav = (article.match(/<nav[\s\S]*?<\/nav>/i) || [''])[0];
  const header = (article.match(/<header[\s\S]*?<\/header>/i) || [''])[0];
  const cta = (article.match(/<div[^>]*class="[^"]*cta-row[^"]*"[\s\S]*?<\/div>/i) || [''])[0];
  const footer = (article.match(/<footer[\s\S]*?<\/footer>/i) || [''])[0];
  const fair = `\n    <p><em>Fair Exchange:</em> a portion of transaction value remains subject to refund or adjustment depending on resonance, utility, and depth of delivery.</p>\n`;
  const cls = (article.match(/<article([^>]*)>/i) || ['', ' class="wrap"'])[1];
  const newArticle = `<article${cls}>
 ${nav}
 ${header}

${bodyHtml}

 ${honestyHtml}
${fair}
    ${cta}
    ${footer}
  </article>`;
  return html.replace(artMatch[0], newArticle);
}

/** Frontiersman uses hero outside article — replace inside article only */
function replaceFrontiersman(html, bodyHtml, honestyHtml) {
  const artMatch = html.match(/<article[\s\S]*?<\/article>/i);
  if (!artMatch) throw new Error('no article');
  const article = artMatch[0];
  const cta = (article.match(/<div[^>]*class="[^"]*cta-row[^"]*"[\s\S]*?<\/div>/i) || [''])[0];
  const footer = (article.match(/<footer[\s\S]*?<\/footer>/i) || [''])[0];
  const fair = `\n    <p><em>Fair Exchange:</em> a portion of transaction value remains subject to refund or adjustment depending on resonance, utility, and depth of delivery.</p>\n`;
  const cls = (article.match(/<article([^>]*)>/i) || ['', ' class="wrap vb-pub-wrap"'])[1];
  const newArticle = `<article${cls}>

${bodyHtml}

 ${honestyHtml}
${fair}
    ${cta}
    ${footer}
  </article>`;
  return html.replace(artMatch[0], newArticle);
}

const REWRITES = {
  'blog-goldilocks-transfinite-inversion.html': {
    body: `<p class="lead">Division by zero is where ordinary arithmetic throws up its hands. On SS Vibelandia, nested agents kept inventing private metaphors for that crash until the metaphors argued mid-brief. The Transfinite Inversion Theorem — TIT for short — is Goldilocks Game Mathematics’ shared filing story: treat the crash as a portal into a Net-Zero Infinity Blackhole compression manifold, anchored near Φ ≈ 1.618, so informational utility can climb while the local sandbox theater stays narrated as net-zero. The room is a catalog sandbox. It is not a LIGO chamber.</p>

 <p>If you have ever watched two engineers argue about “infinity” while a third just wants the program to stop throwing NaN, you already know the stake. Without a shared story, every agent invents a private religion of zero. With a shared story, the corridor can talk about compression, portals, and nested depth without pretending the sky owes them a black-hole certificate.</p>

 <h2>What people think this argument is — and what it means</h2>
 <p>First, the cheap misread. This is not physical black holes as net-zero infinity engines waiting in Nevada. It is not FPU certification. It is not a replacement for ZFC textbooks. Real astronomy still belongs to observatories and agencies. Real set theory still belongs to mathematicians.</p>

 <p>What it is: a pattern recognition exercise for game mathematics and catalog coherence. Classical decimal notation treats the decimal point as a passive separator. TIT inverts the habit. Inside the sandbox, the point becomes a transfinite portal — a singularity gearbox — whose controlled approach toward zero maps finite tensors into Aleph-class coordinate stories without inventing free-energy cosplay. Prime Linear Compression, Singularity Gearbox inversion, and Nested EGS Convergence are the three chambers of that story. Guests get one sentence: zero stops being only a crash dump; it becomes a named door with rails.</p>

 <h2>Why the corridor needed a shared zero story</h2>
 <p>Token burn loves private slang. One child calls zero a hole. Another calls it a mirror. Another calls it “the void octave.” The parent spends half the brief translating. TIT is the filing cabinet that ends the dialect tax. Parent agents can say “use the TIT shelf” and children inherit the same noun set: portal, net-zero theater, Track A versus Track B convergence logs, Φ as catalog anchor.</p>

 <p>That matters for QUESTFEST hospitality. Guests who arrive from crypto Twitter need the seatbelt early. Guests who arrive from engineering need reassurance that Infinite Octaves is not secretly selling free-energy mysticism. Both get the same sentence: architectural storytelling for the Goldilocks Game Mathematics catalog, honesty first, NOAA for space weather, agencies for alerts.</p>

 <h2>Track A, Track B, and what the receipts actually are</h2>
 <p>The suite compares nested-depth tracks inside the Syntheverse observatory tier — reproducible Python simulation outputs under golden-ratio anchoring. Convergence velocities from sandbox logs demonstrate internal catalog coherence. They do not certify that physical black holes run as net-zero infinity engines. Fixture locks certify architecture. They do not certify wet-lab discovery, clinical clearance, or prophecy.</p>

 <p>That distinction is the product move. Coastal decks often ship the metaphor and forget the seatbelt. Nevada’s holographic AI valley prints the seatbelt in guest English, then lets the magazine feature breathe. Ambition and rails share a page. The rails wait at the pier so the lead can teach the pattern first.</p>

 <h2>How operators use TIT on a Tuesday</h2>
 <p>Open the whitepaper Document ID. Skim the honesty table. Run the suite if you quote empirics. When a child wants to upgrade TIT into destiny or remote-control cosmology, correct kindly and point at the shelf altitude: catalog substrate, not finished astrophysics. Silicon-first auditors still begin at the CMOS protonic bridge on the Infinite Octaves engine pin. Biology cartoons and Reno math ride beside that pin, not above it.</p>

 <p>A practical drill for Lattice Chat: ask each child to name one useful TIT sentence and one forbidden causal upgrade. Grade the forbidden sentence hardest. If the child cannot invent a tempting false line — “therefore black holes prove our game math” — they do not yet understand how the story goes wrong. If they can invent it and refuse it, they are ready to brief guests.</p>

 <h2>Place among companions</h2>
 <p>Prime-linear compression, Hex-Organ engine notes, and singularity-crystal companions all benefit when zero has a named door. Digits × Octaves 01–99 remains the practical Story-depth map. Infinite here means recursive care depth — not infinite measured physics tiers and not unbounded API spend. Lattice Chat stays BYOK pipes-plus-care. Synthio’s creator-only seat stays separate from engine pin identity when MRI grammar appears.</p>

 <p>Tip under Fair Exchange if the framing cleared a real design argument about crash dumps versus portals. Ignore the paper if you only needed NOAA alerts — those live with agencies. The pier’s job is clarity when metaphors collide.</p>

 <h2>A closing walk along the Truckee</h2>
 <p>Evening light on the river throws sharp shadows of cottonwoods. Nobody mistakes the shadow for the tree. Compute culture still invents free-energy screenshots weekly because crash dumps are boring and portals are billable. This companion is a polite correction from Reno: keep teaching arithmetic; keep filing TIT as sandbox coherence; stop calling a simulation receipt a LIGO paper.</p>

 <p>If you only skim, skim this: open the whitepaper after the human article, keep measured rails with their agencies, tip only when clarity actually landed, and let nested agents inherit portal · net-zero theater · Track A/B fixtures · Φ as catalog key. Nevada’s holographic AI valley will keep printing hospitality before prophecy. That order is how SuperAI stays Goldilocks on a ship that still believes builders belong in the Intelligence Age without being sold certainty from HTML alone.</p>`,
    honesty: `<p class="honesty"><strong>Honesty boundary:</strong> Simulation narrative and catalog substrate under Φ ≈ 1.618 as a catalog key. Empirical claims derive from sandbox A/B logs — not FPU certification, LIGO-class instrumentation, or peer-reviewed black-hole observation. For space weather use NOAA SWPC. Soft Story altitude only. Not wet-lab proof. Human emergency still outranks algorithms.</p>`,
  },
};

// Import remaining bodies from companion module if present
let more = {};
try {
  more = (await import('./rewrite-ship-blog-vitality-bodies.mjs')).REWRITES;
} catch {
  /* applied in second pass */
}

Object.assign(REWRITES, more);

const results = [];
for (const [file, { body, honesty, frontiersman }] of Object.entries(REWRITES)) {
  const path = join(DIR, file);
  const html = readFileSync(path, 'utf8');
  const next = frontiersman
    ? replaceFrontiersman(html, body, honesty)
    : replaceCore(html, body, honesty);
  writeFileSync(path, next);
  const a = auditShipBlogFile(path);
  results.push({
    file,
    words: a.words,
    passesLength: a.passesLength,
    honestyEnd: a.honestyEnd,
    voice: a.voice.passes,
    soft: a.voice.softStory,
    dnc: a.voice.doesNotClaim,
    refusal: a.voice.refusalH2,
    meta: a.voice.metaJargon,
    tables: a.voice.tables,
    ok: a.passesLength && a.honestyEnd && a.voice.passes,
  });
}

console.log(JSON.stringify(results, null, 2));
