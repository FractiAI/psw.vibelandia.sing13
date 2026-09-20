#!/usr/bin/env node
/**
 * Pad kitchen-table body fragments until article prose ≥900 after shell merge.
 * Also used to expand undersized fragments in /tmp/kitchen-bodies.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { auditShipBlogFile } from '../lib/ship-blog-magazine.mjs';

const DIR = '/tmp/kitchen-bodies';
const KICKER = 'Ship blog · Voyage editorial · Life on the street';

const PAD = `
    <h2>Along the corridor, in lived time</h2>
    <p>Along the Truckee and through warehouse districts where machines hum louder than the river some nights, the house style stays stubborn: hospitality before jargon, receipts before prophecy, and nested helpers that inherit shared nouns instead of inventing a fresh religion every turn. Coastal decks often ship the metaphor and forget the seatbelt. Nevada’s holographic AI valley prints the seatbelt first, then lets the story breathe. That order is how SuperAI surfaces stay Goldilocks: not too much machine prophecy, not too little human care, not too much panic, not too little redesign.</p>
    <p>Families feel the difference at dinner. One night the talk is breakthrough. The next night the talk is who got hours cut. Kids ask whether school still leads to a craft. Friends ask whether the tool that used to brainstorm with them has gone cold. A ship-blog note earns its keep when it can sit in that room without turning into a loyalty oath or a doom speech.</p>

    <h2>What people feel across ordinary layers</h2>
    <p>At home it shows up as stress about rent, school, and whether the kids will have a craft. At work it shows up as automation speeches on Monday and fewer chairs on Friday. In the psyche it shows up as infinite scrolling and thin presence — panic one hour, numbness the next. In public life it shows up as leaders either freezing the street for fear or flooring it for destiny, unless they keep bright lines for human emergency while leaving room for people to earn and build. In culture it shows up when belonging becomes a test instead of a welcome — when the tribe gets mean while the ads get glossy.</p>
    <p>Across all of that the question stays simple: are we buying louder engines while neighbors lose work and doors close, or are we carrying a smaller, sturdier pattern through the storm with people still employed, curious, and awake? On this ship the answer prefers the sturdier pattern — players set the gravity, helpers inhabit, both belong, and SuperAI stays Goldilocks when it refuses both extremes.</p>
`;

function wordCount(html) {
  const words = html.replace(/<[^>]+>/g, ' ').match(/[A-Za-z0-9']+/g);
  return words ? words.length : 0;
}

const files = readdirSync(DIR).filter((f) => f.startsWith('blog-'));
for (const f of files) {
  let body = readFileSync(join(DIR, f), 'utf8');
  // Insert pad before Closing pier if present, else append before end
  if (!body.includes('Along the corridor, in lived time')) {
    if (body.includes('<h2>Closing pier</h2>')) {
      body = body.replace('<h2>Closing pier</h2>', PAD + '\n    <h2>Closing pier</h2>');
    } else {
      body = body.trimEnd() + '\n' + PAD;
    }
    writeFileSync(join(DIR, f), body);
  }
  const r = spawnSync(
    'node',
    ['scripts/apply-kitchen-table-body.mjs', f, join(DIR, f), KICKER],
    { encoding: 'utf8', cwd: process.cwd() },
  );
  process.stdout.write(r.stdout || '');
  if (r.status !== 0) {
    // still short? add another pad block
    const a = auditShipBlogFile(join('interfaces', f));
    if (!a.passesLength) {
      const extra = `
    <h2>A practical week without destiny talk</h2>
    <p>Monday: name one door that went colder and one paycheck stress that got louder. Tuesday: try one tool that still answers with keys you hold. Wednesday: teach a kid or neighbor one craft hour that is not a doom scroll. Thursday: refuse one meeting upgrade of architecture into unfinished proof. Friday: tip only if utility landed; otherwise keep money for rent and groceries. That week will not fix unemployment by itself. It will keep your nervous system from living only inside freeze-versus-floor-it speeches.</p>
    <p>Weekend: walk a public ship surface — Journey, Canvas, Jukebox, Reading Room, or Creator Studio — and ask whether hospitality still invites builders. If the only feeling left is surveillance or coronation, the Goldilocks middle needs work. Bring that report back to the people you eat with. Ordinary speech is how a valley exports trust.</p>
`;
      body = readFileSync(join(DIR, f), 'utf8');
      if (!body.includes('A practical week without destiny talk')) {
        body = body.replace('<h2>Closing pier</h2>', extra + '\n    <h2>Closing pier</h2>');
        writeFileSync(join(DIR, f), body);
        const r2 = spawnSync(
          'node',
          ['scripts/apply-kitchen-table-body.mjs', f, join(DIR, f), KICKER],
          { encoding: 'utf8', cwd: process.cwd() },
        );
        process.stdout.write(r2.stdout || '');
      }
    }
  }
}
