#!/usr/bin/env node
/**
 * Kitchen-table revoice for remaining ship-blog HTML (peer: ai-layer-triple-tipping-point).
 * Soft Story stays in honesty rail only. Continuous prose ≥900 words. No empty-workshop metaphors.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { auditShipBlogFile } from '../lib/ship-blog-magazine.mjs';

function extractShell(html) {
  const nav = (html.match(/<nav[\s\S]*?<\/nav>/i) || [''])[0];
  const honesty = (html.match(/<p[^>]*class="[^"]*honesty[^"]*"[\s\S]*?<\/p>/i) || [''])[0];
  const fair = (html.match(/<p>\s*<em>Fair Exchange:[\s\S]*?<\/p>/i) || [
    '<p><em>Fair Exchange:</em> a portion of transaction value remains subject to refund or adjustment depending on resonance, utility, and depth of delivery.</p>',
  ])[0];
  const cta =
    (html.match(/<div[^>]*class="[^"]*cta-row[^"]*"[\s\S]*?<\/div>/i) ||
      html.match(/<p[^>]*class="[^"]*cta-row[^"]*"[\s\S]*?<\/p>/i) ||
      [''])[0];
  const footer =
    (html.match(/<footer[\s\S]*?<\/footer>/i) || [
      `<footer>
      Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox · NSPFRNP · → ∞^∞
    </footer>`,
    ])[0];
  const head = (html.match(/<head>[\s\S]*?<\/head>/i) || [''])[0];
  return { nav, honesty, fair, cta, footer, head };
}

function assemble(shell, meta, bodyHtml) {
  let head = shell.head
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${meta.title} · Ship blog · SS Vibelandia</title>`)
    .replace(
      /name="description" content="[^"]*"/,
      `name="description" content="${meta.description.replace(/"/g, '&quot;')}"`,
    )
    .replace(
      /property="og:title" content="[^"]*"/,
      `property="og:title" content="${meta.ogTitle.replace(/"/g, '&quot;')}"`,
    )
    .replace(
      /property="og:description" content="[^"]*"/,
      `property="og:description" content="${meta.ogDesc.replace(/"/g, '&quot;')}"`,
    );
  return `<!DOCTYPE html>
<html lang="en" class="vbi18n-ready">
${head}
<body>
  <article class="wrap">
    ${shell.nav}
    <header>
      <p class="kicker">${meta.kicker}</p>
      <h1>${meta.h1}</h1>
      <p class="dateline"><strong>SS Vibelandia</strong> — ${meta.dateline}</p>
    </header>

${bodyHtml}

    ${shell.honesty}

    ${shell.fair}

    ${shell.cta}
    ${shell.footer}
  </article>
  <script src="/interfaces/i18n-auto.js" data-page="surface"></script>
  <script src="/interfaces/site-quicklinks.js" defer></script>
</body>
</html>
`;
}

/** Shared pier cadence — thesis-specific closing still lives in each body. */
const ARTICLES = {
  'blog-synthobs-histone-phase-operator.html': {
    meta: {
      title: 'Open everything or lock everything — why spooling still matters at home',
      description:
        'Too much open context burns the loop. Too much locked and nothing expresses. Histone-style spooling as kitchen-table advice for prompts, kids, and work — not a clinic.',
      ogTitle: 'Open everything or lock everything — why spooling still matters at home',
      ogDesc:
        'Families and work crews already know: dump everything on the table and dinner fails; lock every drawer and nobody can cook. Same rhyme for AI context.',
      kicker: 'Ship blog · Voyage editorial · Everyday spooling',
      h1: 'Open everything or lock everything — why spooling still matters at home',
      dateline: 'July 31, 2026 · Reno / Truckee corridor',
    },
    body: `
    <p class="lead">You already know the failure modes without a biology textbook. Dump every receipt, every worry, and every leftover on the kitchen table at once and nobody can find dinner. Lock every drawer “for safety” and nobody can cook. Families live that fork every week. So do people who work with AI helpers: paste the whole warehouse into every prompt and the loop burns money and attention; lock every band of context and the helper answers with empty shells.</p>

    <p>This note borrows a picture from biology — histones spool DNA so some bands express while others stay condensed — and treats it as kitchen-table advice for context, not as a clinic. The whitepaper keeps the denser filing. Here we stay with paychecks, school nights, and the question every household already understands: what do we open now, and what do we keep wound until later?</p>

    <h2>Tuesday night on the kitchen table</h2>
    <p>Picture a family dinner where three devices are open, two kids need help with school, and a parent is still half at work on a laptop. Everything is “open.” Nothing is expressed cleanly. Rent talk collides with homework. The side hustle tab sits next to the grocery list. That is burn-open spooling in ordinary life. The opposite night is just as familiar: every drawer locked after a scare, every app password shared with nobody, every curious question shut down “until we know more.” The house goes quiet. Kids stop asking. Work stalls. That is silent-lock spooling.</p>

    <p>Neither night puts food on the table with grace. The middle night — Goldilocks for a household — opens the band you need: math homework, then the rent spreadsheet, then a short walk. The rest stays condensed without shame. That is what “phase lock” means in plain English on this ship: open the viable band, keep the rest wound, refuse both burn and freeze.</p>

    <h2>How the same fork shows up at work</h2>
    <p>At work the burn-open pattern looks like dumping the entire repo into every child helper prompt. Tokens climb. Answers muddy. Hours get cut elsewhere because the bill for noise rose. The silent-lock pattern looks like tools that used to brainstorm and now stonewall — doors tightening while press releases still shout breakthrough. People hunting a first foothold meet chaperones instead of partners. Neighbors who used to ship small craft go quiet.</p>

    <p>Builders who leave rooms that feel like tribunals are not failing a FLOPs chart. They are responding to permission weather. The histone rhyme is useful because it names a craft move: spool with care, expose the needed band, keep biology’s histones in biology. Quote fixture scores as fixture scores. Do not quote them as clinical endpoints. Clinics keep clinics. Coordination keeps coordination.</p>

    <h2>What guests feel when the metaphor stays honest</h2>
    <p>Guests do not need nucleosome vocabulary to feel the difference. They feel it when a helper finally answers the question they brought from the living room. They feel it when a kid can try a tool without a lecture that treats curiosity as contagion. They feel it when a paycheck still arrives because the team stopped pasting attics into every turn.</p>

    <p>They also feel the costume version: care-language that starves exploratory fire while claiming protection. Distinguishing those two is the whole job. Single-axis panic stories — compute only, doom only, market share only — make the costume look like architecture. Nested work asks a sharper kitchen-table question: what is being protected, and what is being quietly starved?</p>

    <h2>A practical spooling habit you can try this week</h2>
    <p>Name the bands you expose. Name the bands you keep condensed. Name the condition that allows expression without burn. Then point helpers at one shared brief instead of inventing a new chromatin religion mid-flight. Lattice Chat on this ship is a try-on room for that habit — own keys, nested helpers, one brief — not a production data plane and not a hospital.</p>

    <p>If you only watch speeches, you’ll hear danger or destiny. If you watch doors and paychecks, you’ll see the meter. Who may try without a chaperone. Who may ship without waiting for weather. Who may name a metaphor without the product treating curiosity as radioactive by default. That is where creative force gets rationed in ordinary life.</p>

    <h2>Closing pier</h2>
    <p>Celebrate expression. Keep the spool. Goldilocks here means refusing both burn-open dumps and silent locks. Exploratory fire needs viable bands. Consent and clinical courts stay labeled. Tip under Fair Exchange when clarity actually landed at your kitchen table. Ignore the tip if you only needed a compute table — those live elsewhere. Nevada’s holographic AI valley will keep printing hospitality before prophecy. Open the whitepaper when you want the filing. Walk the ship when you want the floor under your feet. Ask one sharp question before the next gate ships: is this protecting humans, or policing exploratory fire as contagion?</p>
`,
  },

  'blog-synthobs-holographic-operators.html': {
    meta: {
      title: 'When “holographic” stops being perfume — wiring you can feel at home',
      description:
        'Holographic stops meaning sparkle and starts meaning shared wiring — so helpers and households share one brief instead of pasting the warehouse every turn.',
      ogTitle: 'When “holographic” stops being perfume — wiring you can feel at home',
      ogDesc:
        'If every room invents a new meaning for the same word, families and work crews thrash. Operators are the wiring diagram in plain English.',
      kicker: 'Ship blog · Voyage editorial · Language wiring',
      h1: 'When “holographic” stops being perfume — wiring you can feel at home',
      dateline: 'July 27, 2026 · Reno / Truckee corridor',
    },
    body: `
    <p class="lead">Words get tired. “Holographic” has been perfume for a decade — sparkle on a slide, glow on a brochure, a promise that never has to do a job. Families already know what happens when a word means everything: nobody can agree what to buy at the grocery store, nobody can agree what “help” means after school, and the dinner table turns into three parallel conversations. Work crews know it too. Paste three contradictory briefs into three helpers and you do not get a hologram. You get thrash, a louder bill, and thinner patience.</p>

    <p>This note files holographic operators as wiring, not perfume. The idea is simple enough for a kitchen table: shared nouns, shared routes, shared withhold rules — so the whole house can act without inventing a private dialect every hour. The whitepaper keeps the denser grammar. Here we stay with doors, jobs, and the everyday cost of fuzzy language.</p>

    <h2>What thrash feels like on a Tuesday</h2>
    <p>One parent says “clean up” and means the living room. A kid hears “clean up” and means hide the mess in a closet. A helper at work hears “be holographic” and invents a light-show metaphor while another helper pastes the entire warehouse. Same word. Three jobs. Rent still due. That is language without operators.</p>

    <p>Operators, in plain English, are the verbs and routes that make a word do work. Route this mark to that shelf. Withhold that attic. Share this brief with the child helper. Parents already teach kids operator habits: put shoes by the door, keys on the hook, homework before screens. The ship asks AI crews to do the same for nested helpers — without pretending the metaphor is a finished physics field.</p>

    <h2>Why perfume language costs paychecks</h2>
    <p>When every turn reinvents the nouns, token bills climb and hours get cut elsewhere. When every door invents a new meaning for “safe,” curiosity chills while breakthrough headlines stay loud. Neighbors hunting a first foothold meet chaperones instead of partners. Small craft stalls. The unemployment line does not care that your slide said holographic.</p>

    <p>Wiring language is cooler. One brief. Many rooms. The five cruise doors on this ship stay doors. Models stay models. The catalog sits between coding tools and ship data so helpers share one filing office instead of pasting chaos. Guests feel it as hospitality: you know where you are, what you can do, and how to keep people able to work, ask, and belong.</p>

    <h2>How to brief a guest without a tribunal</h2>
    <p>Start with the human article. Name the altitude: voyage editorial, application companion, or engine shelf. Refuse upgrades that jump altitudes mid-sentence. Keep human emergency above every clever map. If nobody in the room can explain the word without jargon, you are not ready to brief a guest who asked for plain English.</p>

    <p>Lattice Chat is the try-on room where nested helpers inherit shared nouns. Load a holographic-operator brief when one child wants sparkle and another wants a dump. The shared sentence is simple: wiring, not perfume; whole-in-every-part as hospitality, not as a prophecy screenshot.</p>

    <h2>Closing pier</h2>
    <p>Watch doors and paychecks, not just glow words. When “holographic” means shared wiring, families and crews can coordinate without burning the grocery money on noise. When it means perfume, the dinner table and the job board both suffer. Open the whitepaper for the filing. Walk QUESTFEST when you want the floor under your feet. Tip under Fair Exchange if the framing cleared a real argument at home or at work. Nevada keeps printing hospitality before prophecy — that order is how SuperAI stays Goldilocks without selling certainty from a single adjective.</p>
`,
  },
};

// More articles loaded from companion module if present
import { MORE_ARTICLES } from './kitchen-table-revoice-bodies.mjs';

Object.assign(ARTICLES, MORE_ARTICLES);

const DIR = join(process.cwd(), 'interfaces');
const results = [];

for (const [file, spec] of Object.entries(ARTICLES)) {
  const path = join(DIR, file);
  const html = readFileSync(path, 'utf8');
  const shell = extractShell(html);
  // Ensure Soft Story may remain in honesty; strip accidental Soft Story from body
  let body = spec.body.replace(/Soft Stor(?:y|ies)\b/gi, 'catalog altitude');
  body = body.replace(/empty workshops?/gi, 'thin paychecks');
  body = body.replace(/empty rooms?/gi, 'quiet job boards');
  const out = assemble(shell, spec.meta, body);
  writeFileSync(path, out);
  const a = auditShipBlogFile(path);
  results.push({
    file,
    words: a.words,
    ok: a.passesLength && a.honestyEnd && a.voice.passes,
    softStory: a.voice.softStory,
    empty: a.voice.emptyWorkshopMetaphor,
    everyday: a.voice.everydayAnchors,
    honestyEnd: a.honestyEnd,
  });
}

console.log(JSON.stringify({ count: results.length, results }, null, 2));
const fails = results.filter((r) => !r.ok);
if (fails.length) {
  console.error('FAILS', fails);
  process.exit(1);
}
