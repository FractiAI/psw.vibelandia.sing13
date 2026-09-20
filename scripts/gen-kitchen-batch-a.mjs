#!/usr/bin/env node
/**
 * Generate kitchen-table ship-blog bodies for the remaining corpus batch.
 * Soft Story 0; no "not a claim" / empty-workshop; ≥900 words; everyday anchors.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const DIR = '/tmp/kitchen-bodies';
mkdirSync(DIR, { recursive: true });

const KICKER = 'Ship blog · Voyage editorial · Life on the street';

/** Avoid: Soft Story, not a claim, does not claim, empty workshop/room, quieter bench */
function article({ lead, sections, pier, pier2 }) {
  const parts = [];
  parts.push(`    <p class="lead">${lead}</p>`);
  for (const s of sections) {
    parts.push(`\n    <h2>${s.h2}</h2>`);
    for (const p of s.ps) parts.push(`    <p>${p}</p>`);
  }
  parts.push(`\n    <h2>Closing pier</h2>`);
  parts.push(`    <p>${pier}</p>`);
  parts.push(`    <p>${pier2}</p>`);
  return parts.join('\n') + '\n';
}

const commonPier2 =
  'If you want the filing cabinet, open the whitepaper after this human article. If you want the floor under your feet, walk the ship: Journey, Canvas, Jukebox, Library, Creator Studio. Tip under Fair Exchange if the framing cleared a real kitchen-table argument. Ignore it if you only needed a FLOPs table — those live elsewhere. Nevada’s holographic AI valley will keep printing hospitality before prophecy. That order is how SuperAI stays Goldilocks on a ship that still believes neighbors belong in the Intelligence Age without being sold certainty from a headline alone.';

const specs = {
  'blog-goldilocks-geomagnetic-wavefield-multitaxa.html': {
    lead:
      'Four kinds of animals move across the same landscape, and the old textbooks already know the obvious drivers: forage, snow, predators. What households feel, though, is a different pressure — headlines that upgrade every migration into a joystick story, while people at the dinner table still need clear thinking about weather, jobs, and who is selling certainty. This note files four species on one magnetic filing board without turning the board into a remote control for anyone’s life.',
    sections: [
      {
        h2: 'Four species, one board you can explain at dinner',
        ps: [
          'Traditional ungulate ecology already tracks grass, cold, and danger. The multitaxa wavefield companion adds a shared geometric board for how several species’ movement stories can be filed together when geomagnetic and weather indices enter the conversation. Think of a town bulletin with four columns — not four separate myths fighting in the comments.',
          'Parents explaining science homework already teach kids that a map is not the territory. Ranchers and park visitors already know that animals respond to seasons without needing a conspiracy. The board is hospitality for serious readers: one place to hang associations, honesty lines, and suite receipts so nested helpers stop inventing a private north for each species.',
        ],
      },
      {
        h2: 'Stakes that land in ordinary life',
        ps: [
          'Why should a household care? Because the same upgrade habit that turns collars into destiny shows up in AI weather. A tool that used to answer curious questions goes cold. A press release still says breakthrough. Someone you know is hunting for work while the town council brags about innovation. Learning to keep association talk proportional is practice for keeping livelihoods and doors in view.',
          'When managers brief teams, the Goldilocks reading is simple: enough wonder to study shared geometry, enough brake to refuse joystick ranching and medical cosplay. Jobs that depend on trust — field techs, teachers, analysts — need that middle. Loud myths do not put food on the table. Clear methods sometimes do.',
        ],
      },
      {
        h2: 'What people can do with the filing on Tuesday',
        ps: [
          'Open the whitepaper for the board’s scope. Re-run fixtures when you quote empirics. Make child agents carry the honesty line in the first sentence. Refuse compressions like “animals are GPS puppets.” Prefer banded briefs that name species, windows, and what remains unknown — the same clarity you would want if a neighbor asked what your work actually does for households, not for headlines.',
          'Along the Truckee corridor, warehouse heat and river cool air argue all summer. Ambition and restraint in one climate. Multitaxa filing belongs there: ambition enough to share a board across species, restraint enough to keep the clinic and the joystick out of the launch tweet.',
        ],
      },
      {
        h2: 'Hospitality without stolen courts',
        ps: [
          'Neighboring biology shelves may use different honesty tiers on purpose. A metaphor neighbor does not inherit this paper’s empirics. An empirics neighbor does not inherit this paper’s metaphor. That firewall is hospitality for guests who fear oversell and for builders who need to keep courts separate when paychecks depend on not lying.',
          'If the framing is right, oversight can be real care and measured rails stay measured. If the only public move is panic or prophecy, you will keep rediscovering the same cliff with better paperwork while people who could redesign the track wait in the lobby — or wait on a thinner job board.',
        ],
      },
      {
        h2: 'What tomorrow morning looks like',
        ps: [
          'A good morning after reading this note looks like a quieter comment thread and a sharper brief. Someone at work stops upgrading association into remote control. Someone at school names the map and the method. Someone at home asks whether the AI tool still helps with a real question or only sells breakthrough while rent comes due.',
          'Those are kitchen-table audits. They are also how a valley exports trust. Celebrate curiosity. Keep consent. Keep human emergency above every metaphor — including herds, magnetic boards, and the temptation to turn every shared geometry into a control panel.',
        ],
      },
    ],
    pier:
      'Four species can share a filing board without sharing a destiny script. Watch paychecks and doors in the wider weather too. Keep the fire of curiosity. Keep the brakes on joystick myths. Keep people able to work land, ask questions, and belong.',
    pier2: commonPier2,
  },

  'blog-goldilocks-players-guide-2026-08.html': {
    lead:
      'There is a moment in every Intelligence Age week when the old moves stop paying off. More force. More meetings. More keys locked behind chaperones. More “control the narrative” essays that leave the kitchen table colder than before. This free playbook is for that moment — Old Earth habits giving way to Goldilocks play without selling destiny or medical advice.',
    sections: [
      {
        h2: 'What Old Earth → Goldilocks means in guest English',
        ps: [
          'Old Earth, in voyage language, is scramble-and-extract: win the race, freeze the street for fear, or floor it for a crown name while neighbors lose hours. Goldilocks is the middle most households actually need — enough machine, enough human, brakes for real harm, room to earn a living and ask curious questions.',
          'You can feel the fork at dinner. One relative wants to slam every AI door because the machines might end everything. Another wants to name the next leap like a coronation. Both can miss the same middle: keep people employed, keep craft alive, keep kids able to learn, keep tools that still answer when you ask a real question.',
        ],
      },
      {
        h2: 'Four daily moves that stay non-mystical',
        ps: [
          'First: name the weather without swallowing it. Layoffs, thin job boards, and colder curiosity doors are real. They are not a prophecy calendar. Second: prefer nested care over brute force — shared briefs, keys you hold, helpers that inherit hospitality instead of inventing a private religion every sprint. Third: keep bright lines for kids, real crime, and real weapons without starving ordinary building. Fourth: tip or walk under Fair Exchange based on utility, not loyalty oaths.',
          'None of those moves require a crystal. They require the same stubbornness that keeps a household solvent: receipts, small plans, and refusing both panic theater and horsepower-only ontology.',
        ],
      },
      {
        h2: 'How the guide sits beside the engine shelf',
        ps: [
          'The players’ guide is voyage editorial and lifestyle map — not an Infinite Octaves engine pin by itself. About 1.618 shows up as nesting grammar when you talk to Lattice Chat helpers, not as a grocery coupon or a rent calculator. Keep altitudes separate and you stop mistaking a playbook for a physics proof.',
          'Who it is for: guests who feel the tipping-point weather and want playable moves. Who should walk past: people hunting clinical advice, securities promises, or a guarantee that their side hustle returns next month. Honesty is hospitality.',
        ],
      },
      {
        h2: 'A week of play without destiny talk',
        ps: [
          'Monday: write one sentence about what thinned in your work or curiosity this month. Tuesday: try one tool that still answers with your own keys. Wednesday: teach a kid or neighbor one craft hour that is not a doom scroll. Thursday: refuse one upgrade of architecture into unfinished proof in a meeting. Friday: tip only if utility landed; otherwise keep your money for rent and groceries.',
          'That week will not fix unemployment by itself. It will keep your nervous system from living only inside freeze-versus-floor-it speeches. On this ship that is already a Goldilocks win.',
        ],
      },
      {
        h2: 'The question before the next control essay',
        ps: [
          'Before the next restriction, release, or metaphor goes live, ask out loud: is this protecting humans, or policing curiosity as contagion while livelihoods thin? If nobody in the room can answer without jargon, you are not ready to brief a guest who asked for a playbook in plain English.',
          'Watch paychecks and doors, not just press releases. Keep the fire. Keep the brakes. Keep people able to work, ask, and belong.',
        ],
      },
    ],
    pier:
      'Brute force stopping is not the end of the game. It is the start of Goldilocks play — enough machine, enough human, hospitality first. The guide is a free door into that middle for ordinary weeks, not a destiny script.',
    pier2: commonPier2,
  },

  'blog-goldilocks-prime-linear-compression.html': {
    lead:
      'If you hang around numbers long enough, primes start to feel like weather — irregular points on a line you walk until something interesting happens. Useful for homework. Less useful when a household is drowning in endless walks through data while rent still comes due. This note is about primes as coordinates for compression and addressing — a tool story — without selling a crypto break or a miracle paycheck.',
    sections: [
      {
        h2: 'What the transform actually does in plain English',
        ps: [
          'Linear walks treat primes like scenery you pass. Coordinate thinking treats them like addresses you can index. The Goldilocks prime-linear compression companion files a transform habit: map structure into prime-indexed handles so nested helpers stop paying the tax of wandering every time. Think of a library call number versus wandering every aisle hoping the book appears.',
          'Families already understand call numbers. Schools already teach indexes. Workers who ship memory and search already hate unpaid wandering. The paper’s craft is making that hatred explicit as design: coordinates beat endless walks when the walk is burning time, tokens, or overtime.',
        ],
      },
      {
        h2: 'Why coordinates beat endless walks when livelihoods wobble',
        ps: [
          'In AI weather, endless context dumps are the coastal default: paste more, rent more GPUs, hope the margin survives. Households feel the bill even when they are not on the invoice — layoffs dressed as efficiency, curiosity doors that chill, kids watching parents stare at thinner job boards. Compression that is honest about what it indexes is one small way to cool burn without pretending the race is the only ocean.',
          'Builders should hold the tool as a filing instrument. Guests usually mishear “primes” as treasure-map cosplay or as breaking encryption. Rewrite toward: prime-indexed addressing for catalog and storage grammar under nesting keys near 1.618 — routing language, not a finished physics constant, not a bank heist.',
        ],
      },
      {
        h2: 'How to brief it without scaring the table',
        ps: [
          'Lead with the household stake: less wandering tax, more shared addresses, honesty about what is not being claimed in the end rail. Keep cryptography courts separate. Keep clinical courts separate. Keep securities fog off the pier. On a Tuesday, load the brief into Lattice Chat when nesting helpers need shared nouns, re-run fixtures when you quote empirics, and refuse mid-loop upgrades into unfinished proofs.',
          'Where this sits on the ship: beside prime-vault race and chat doors as application companions, and beside Infinite Octaves shelves as catalog grammar. Name the altitude when you talk. People at work deserve that clarity when their craft is on the line.',
        ],
      },
      {
        h2: 'The question before the next nested brief',
        ps: [
          'Before you spawn another child agent into a linear wander, ask: do we have coordinates, or are we paying overtime for scenery? If the answer is scenery, compress. If the answer is coordinates, keep the honesty rail visible so neighbors do not hear a crypto break where you meant a call number.',
          'Watch paychecks and doors. Endless walks are not neutral. They are a tax that eventually lands on someone’s hours. Goldilocks compression is care for those hours.',
        ],
      },
    ],
    pier:
      'Primes as coordinates are a way to stop paying wander taxes — not a magic key to someone else’s vault and not a substitute for measured rails. Keep the index. Keep the brakes. Keep people able to ship without drowning in paste.',
    pier2: commonPier2,
  },

  'blog-goldilocks-quest-2026-09.html': {
    lead:
      'Arcade nights still matter when the week has been hard. Kids need play. Adults need a room where timing, temptation, and grace can be practiced without a prophecy calendar. Goldilocks Quest is the ship’s climb — five tiers, Timing Demons, Siren / Treasure / Fame / Scarlet traps, presence ghosts, a grace leaderboard — shipped as a preview door while polish continues. This note translates the climb into kitchen-table stakes.',
    sections: [
      {
        h2: 'What the climb is training in ordinary life',
        ps: [
          'Timing is not only a game mechanic. It is how households decide when to speak, when to wait, when to refuse a shiny trap. Sirens are the offers that sound like belonging and cost your craft. Treasure traps are shortcuts that thin your future paycheck. Fame traps are applause that replaces work. Scarlet traps are heat without care. Presence ghosts are the feeling that someone is watching while you try to stay human.',
          'You do not need to win a leaderboard to recognize those patterns at dinner. A kid chasing likes. A parent chasing a hustle that eats sleep. A tool that used to help and now only sells breakthrough. The quest makes the patterns playable so people can practice Goldilocks — enough fire, enough brake — before the street demands it for real.',
        ],
      },
      {
        h2: 'Why “preview door” is not apology theater',
        ps: [
          'Shipping a preview is honesty. Families already prefer a honest unfinished table to a glossy flyer for a house that is not built. Operators should watch what guests learn, where traps feel unfair, where grace needs to be louder, and where polish still belongs. That is product care, not a shrug.',
          'How the traps rhyme with the catalog: voyage editorials about tipping-point weather, vitality-control fights over curiosity doors, and Invisible Frontier notes about linear scale missing nested care. The arcade is not the whitepaper. It is the floor under your feet when reading gets thick.',
        ],
      },
      {
        h2: 'What operators should watch while guests play',
        ps: [
          'Watch whether play increases hospitality or only adrenaline. Watch whether kids leave more able to name a trap in real life. Watch whether unemployed or underemployed guests find a room that still welcomes craft, or only a scoreboard that mirrors the job board’s chill. Soft ceilings sometimes protect. Sometimes they costume fewer people building the next layer. Distinguishing those two is the whole job — at work and at home.',
          'Tuesday work for the preview: fix the sharp edges, keep honesty copy screenshot-safe, bounce players to whitepapers only after they have felt the climb, and tip culture only when deeper delivery is real.',
        ],
      },
      {
        h2: 'What the corridor protects',
        ps: [
          'Nevada’s holographic AI valley does not need another extractive arcade that farms attention while livelihoods thin. It needs play that still believes neighbors belong. Goldilocks Quest is filed under that temper. Human emergency still outranks the leaderboard. Bright-line harm stays refused. Curiosity stays welcome inside those lines.',
          'If the framing is right, a lot of loud conversation about control can soften into redesign. If the framing is wrong, you still have an instrument: watch whether creative force rises or dims after the session. Watch whether hospitality still invites builders — or only auditors.',
        ],
      },
    ],
    pier:
      'Preview doors are how ships stay honest with guests. Climb for timing and grace. Keep the traps named. Keep polish moving. Keep people able to play, work, ask, and belong.',
    pier2: commonPier2,
  },

  'blog-goldilocks-transfinite-inversion.html': {
    lead:
      'Division by zero is where ordinary arithmetic throws up its hands. At school that crash dump is a red mark. At work it is a ticket. On this ship, nested helpers kept inventing private metaphors for that crash until the metaphors started sounding like destiny. Transfinite inversion is the shared zero story — when zero stops being only a crash dump and becomes a portal you can talk about without scaring the household.',
    sections: [
      {
        h2: 'What people think this argument is — and what it means at home',
        ps: [
          'People hear “transfinite” and reach for mysticism or for a calculator fight. The kitchen-table meaning is simpler: households already know zeros that are not empty. An empty calendar can still hold grief. A quiet job board can still hold a town’s future. A blank page can still hold a craft. Zero as balance point is a picture for that — not a promise that rent is paid.',
          'Why the corridor needed a shared zero story: without it, every child agent invents a private crash religion. Token burn rises. Meetings multiply. Someone eventually pays in overtime or in a project that never ships while Main Street thins.',
        ],
      },
      {
        h2: 'Track A, Track B, and what the receipts actually are',
        ps: [
          'Track talk in the paper separates narrative geometry from runnable fixtures. Guests should hear that difference the way they hear the difference between a story and a paycheck stub. Story can be ambitious. Receipts have to re-run. Confusing them is how towns get sold prophecy.',
          'Operators use TIT on a Tuesday by loading a shared brief, refusing mid-loop upgrades into unfinished proofs, and pointing skeptics at honesty rails before demos. Place among companions: singularity crystal, void topology, and other zero-as-balance shelves — catalog neighbors, not stolen empirics.',
        ],
      },
      {
        h2: 'Celebrate the portal. Keep the brakes.',
        ps: [
          'Wonder is allowed. Medical cosplay is not. Securities fog is not. “Zero solved unemployment” is not. What is allowed is a calmer stack where helpers share a zero grammar so people can keep building while AI weather swings between freeze and floor-it.',
          'Watch paychecks and doors. A portal metaphor that helps nested work cool burn can still matter for livelihoods even when it never becomes a physics trophy. Keep the fire. Keep the brakes. Keep human emergency above the metaphor.',
        ],
      },
      {
        h2: 'How neighbors can use the language without a PhD',
        ps: [
          'When a friend says everything crashed to zero, ask which zero they mean: empty of hope, empty of inventory, or a balance point waiting for the next honest move. That small question is Goldilocks speech. It keeps grief real without letting panic write the whole week.',
          'Schools can use the same question on homework nights. Workplaces can use it when a project hits a wall. The paper’s altitude stays catalog and voyage — Soft Story lives only in the honesty rail at the end — while the body stays kitchen English.',
        ],
      },
    ],
    pier:
      'Zero can be a crash dump or a crystal of balance. This corridor files the second picture with brakes on. Open the whitepaper for the filing. Walk the ship for the floor. Keep people able to work through the quiet without being sold a miracle.',
    pier2: commonPier2,
  },
};

// Fix accidental Soft Story in goldilocks-transfinite body - I mentioned Soft Story in body! Need to remove that.
specs['blog-goldilocks-transfinite-inversion.html'].sections[3].ps[1] =
  'Schools can use the same question on homework nights. Workplaces can use it when a project hits a wall. The paper’s altitude stays catalog and voyage while the body stays kitchen English — seatbelts wait at the end of the page, not in the middle of the story.';

for (const [file, spec] of Object.entries(specs)) {
  const body = article(spec);
  writeFileSync(join(DIR, file), body);
  const words = body.replace(/<[^>]+>/g, ' ').match(/[A-Za-z0-9']+/g)?.length || 0;
  console.log(file, 'fragmentWords~', words);
}
