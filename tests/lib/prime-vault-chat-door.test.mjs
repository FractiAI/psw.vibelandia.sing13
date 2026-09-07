import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { checkLatticeEmailAccess, DEFAULT_CREATOR_EMAILS } from '../../lib/lattice-access.mjs';
import { queryPrimeVaultChat, PHI_EGS } from '../../lib/prime-vault-chat-engine.mjs';
import { PLAYER_MORE_DOORS } from '../../lib/player-spine.mjs';
import { findJourney } from '../../lib/voyage-journeys.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Prime Vault Chat · guest door rollout', () => {
  it('ships door HTML, client, CSS, API, and engine', () => {
    expect(existsSync(join(ROOT, 'interfaces/prime-vault-chat.html'))).toBe(true);
    expect(existsSync(join(ROOT, 'interfaces/prime-vault-chat-client.js'))).toBe(true);
    expect(existsSync(join(ROOT, 'interfaces/prime-vault-chat.css'))).toBe(true);
    expect(existsSync(join(ROOT, 'interfaces/special-projects/prime-vault-chat.html'))).toBe(true);
    expect(existsSync(join(ROOT, 'api/prime-vault-chat.js'))).toBe(true);
    expect(existsSync(join(ROOT, 'lib/prime-vault-chat-engine.mjs'))).toBe(true);
    const html = read('interfaces/prime-vault-chat.html');
    expect(html).toContain('prime-vault-chat-client.js');
    expect(html).toContain('pvc-thread');
  });

  it('resolves closed-form LLM-sim with $0 training and multi-turn phase', () => {
    const r = queryPrimeVaultChat('What is El Gran Sol fractal constant?', {
      octaveTier: 7,
    });
    expect(Math.abs(PHI_EGS - (1 + Math.sqrt(5)) / 2) < 1e-15).toBe(true);
    expect(r.trainingCostUsd).toBe(0);
    expect(r.live).toBe(true);
    expect(r.llmSim).toBe(true);
    expect(r.knowledgeCells).toBeGreaterThanOrEqual(18);
    expect(r.corpusEncode).toBe(true);
    expect(r.corpusCells).toBeGreaterThanOrEqual(40);
    expect(r.languageProcessor).toBe(true);
    expect(r.stages?.articulate?.composed).toBe(true);
    expect(r.proteinLibraryDocs).toBeGreaterThanOrEqual(12);
    expect(r.abilities?.listen?.ok).toBe(true);
    expect(r.abilities?.understand?.tier).toBe('catalog');
    expect(r.abilities?.decide?.ok).toBe(true);
    expect(r.abilities?.respond?.ok).toBe(true);
    expect(r.abilities?.communicate?.ok).toBe(true);
    expect(r.reply).toMatch(/Fractal constant|El Gran Sol|Φ|Prime Vault|1\.618/);
    expect(r.reply).not.toMatch(/^Omniversal Lattice Response to query/);
    expect(r.reply).not.toMatch(/lattice locks first on/);
    expect(r.reply).not.toMatch(/Activated vaults:/);
    expect(r.nodes.length).toBeGreaterThan(0);
    expect(r.latencyMs).toBeLessThan(50);
    const about = queryPrimeVaultChat('Tell me about you.');
    expect(about.reply).toMatch(/Prime Vault Chat/);
    expect(about.reply).not.toMatch(/lattice locks first/);
    expect(about.kinds).toContain('about');
    expect(about.speechAct).toBe('introduce');

    const history = [
      { role: 'user', content: 'What is Phi?' },
      { role: 'assistant', content: 'Phi keys the vaults at about 1.618.' },
    ];
    const follow = queryPrimeVaultChat('say more about that', { history });
    expect(follow.historyTurns).toBe(2);
    expect(follow.threadPhase).toBeGreaterThan(0);
    expect(follow.reply).not.toMatch(/Activated vaults:/);

    const ood = queryPrimeVaultChat('diagnose my fever prescription please');
    expect(ood.speechAct).toBe('refuse');

    const voyage = queryPrimeVaultChat('Tell me about the Official Prospectus and Borikén');
    expect(voyage.speechAct).toBe('corpus');
    expect(voyage.composed).toBe(true);
    expect(voyage.contacts.length).toBeGreaterThan(0);
    expect(voyage.reply).toMatch(/prospectus|Borikén|genesis|voyage|catalog|Φ|El Gran Sol|fold/i);
    expect(existsSync(join(ROOT, 'data/prime-vault-corpus-v0.json'))).toBe(true);
    expect(existsSync(join(ROOT, 'lib/prime-vault-corpus-encode.mjs'))).toBe(true);

    // Topic connection — not stale brochure dumps
    const phi = queryPrimeVaultChat('What is Phi?');
    expect(phi.speechAct).toBe('teach');
    expect(phi.topicConnected).toBe(true);
    expect(phi.nodes[0].concept).toMatch(/Fractal constant|El Gran Sol/);
    expect(phi.reply).toMatch(/Φ|1\.618|fractal|golden|vault/i);
    expect(phi.reply).not.toMatch(/You asked about What is Phi — here is the folded voyage filing/);
    expect(phi.reply).not.toMatch(/linear awareness is missing/i);

    const france = queryPrimeVaultChat('capital of France');
    expect(france.speechAct).toBe('refuse');
    expect(france.reply).not.toMatch(/El Gran Sol is how we name/);

    const bread = queryPrimeVaultChat('sourdough bread recipe');
    expect(bread.speechAct).toBe('refuse');
    expect(bread.reply).not.toMatch(/Honesty boundary|Grand Arc of the Voyage/);

    // Expanded general conversation / comprehension
    const how = queryPrimeVaultChat('How does this work?');
    expect(how.speechAct).toBe('howworks');
    expect(how.reply).toMatch(/listen|retrieve|fold|catalog/i);
    expect(how.reply).not.toMatch(/Macro-protein work is an application companion/i);

    const thanks = queryPrimeVaultChat('thanks that helped');
    expect(thanks.speechAct).toBe('thanks');
    expect(thanks.reply).toMatch(/Glad|still with you|landed/i);

    const ship = queryPrimeVaultChat('what is SS Vibelandia?');
    expect(ship.speechAct).toBe('teach');
    expect(ship.nodes[0].concept).toMatch(/SS Vibelandia|Voyage framing/);
    expect(ship.reply).toMatch(/Vibelandia|voyage|Prospectus|Borikén|Reno/i);

    const stay = queryPrimeVaultChat('how do I stay Goldilocks?');
    expect(stay.speechAct).toBe('teach');
    expect(stay.nodes[0].concept).toMatch(/Stay Goldilocks|SS Vibelandia/);
    expect(stay.reply).toMatch(/Goldilocks|machine|human|band/i);
    expect(stay.reply).not.toMatch(/Geodynamo Telemetry|Honesty boundary read first/i);

    const doors = queryPrimeVaultChat('what doors are on the ship?');
    expect(doors.reply).toMatch(/Journey|Jukebox|Library|Canvas|Creator Studio/i);

    const purser = queryPrimeVaultChat('who is the Purser?');
    expect(purser.reply).toMatch(/Purser|Fair Exchange|Grove/i);

    const reno = queryPrimeVaultChat('what about Reno?');
    expect(reno.speechAct).toBe('corpus');
    expect(reno.reply).toMatch(/Reno|desert|Captain|prospectus|voyage/i);

    const confused = queryPrimeVaultChat('I am confused about vaults');
    expect(confused.speechAct).toBe('teach');
    expect(confused.reply).toMatch(/prime|vault|container/i);

    const more = queryPrimeVaultChat('tell me more', {
      history: [
        { role: 'user', content: 'What is Phi?' },
        { role: 'assistant', content: 'Phi keys the vaults at about 1.618.' },
      ],
    });
    expect(more.kinds).toContain('followup');
    expect(more.reply).toMatch(/Φ|1\.618|fractal|golden|vault|Phi/i);

    // Language connection — rapport, not brochure dump (Player 1 screenshot)
    const understandMe = queryPrimeVaultChat('Do you understand me ?');
    expect(understandMe.speechAct).toBe('connect');
    expect(understandMe.kinds).toContain('connect');
    expect(understandMe.reply).toMatch(/hear you|with you|listening/i);
    expect(understandMe.reply).not.toMatch(/Here is how I work|Miracle 1|Race scoreboard|residue contacts/i);
    expect(understandMe.reply).not.toMatch(/Folding an answer around/i);
    expect(understandMe.stages?.retrieve?.qTokens || []).not.toContain('vault');
    expect(understandMe.stages?.retrieve?.qTokens || []).not.toContain('retrieve');

    const notConnecting = queryPrimeVaultChat('These responses show we are not connecting through language');
    expect(notConnecting.speechAct).toBe('connect');
    expect(notConnecting.reply).toMatch(/hear you|with you|caught|plain speech|frame/i);
    expect(notConnecting.reply).not.toMatch(/Here is how I work|Miracle 1|ColabFold/i);

    const pear = queryPrimeVaultChat(
      'Investigate the rhyme of being offered your favorite fruit, a prickly pear but you would need to eat it with the spines, do you eat it or pass',
    );
    expect(pear.speechAct).toBe('invite');
    expect(pear.reply).toMatch(/prickly|pear|spines/i);
    expect(pear.reply).not.toMatch(/Here is how I work|Miracle 1|El Gran Sol is how we name/i);
    expect(pear.reply).not.toMatch(/Race scoreboard|ColabFold/i);
  });

  it('API accepts history for multi-turn LLM-sim', () => {
    const api = read('api/prime-vault-chat.js');
    expect(api).toContain('history');
    expect(api).toContain('llmSim');
    const client = read('interfaces/prime-vault-chat-client.js');
    expect(client).toContain('history');
    expect(client).toMatch(/knowledge cell bank|LLM/);
  });

  it('reuses Lattice seats and allows walk-on demo email', () => {
    const creator = DEFAULT_CREATOR_EMAILS[0];
    const access = checkLatticeEmailAccess(creator);
    expect(access.ok).toBe(true);
    const api = read('api/prime-vault-chat.js');
    expect(api).toContain('checkLatticeEmailAccess');
    expect(api).toContain('prime-vault-chat');
    expect(api).toContain('walkon');
    expect(api).toContain('isValidEmailShape');
  });

  it('wires vercel routes, quicklink, player door, journey, and blogs', () => {
    const vercel = read('vercel.json');
    expect(vercel).toContain('"source": "/prime-vault-chat"');
    expect(vercel).toContain('"source": "/pvc"');
    expect(vercel).toContain('"source": "/special-projects/prime-vault-chat"');
    expect(vercel).toContain('"source": "/ship-blog/prime-vault-chat"');
    expect(vercel).toContain('api/prime-vault-chat.js');

    const ql = read('interfaces/site-quicklinks.js');
    expect(ql).toContain('href="/demonstrations#chat"');
    expect(ql).toContain('id="ql-prime-vault-chat-link"');

    expect(PLAYER_MORE_DOORS.some((d) => d.href === '/demonstrations#chat')).toBe(true);
    expect(findJourney('prime-vault-chat')?.cta?.href).toBe('/demonstrations#chat');

    expect(existsSync(join(ROOT, 'interfaces/blog-prime-vault-chat-2026-09.html'))).toBe(true);
    expect(read('lib/questfest-blog-posts.mjs')).toContain('prime-vault-chat');
    expect(read('data/bulletin-board-posts.json')).toContain('/prime-vault-chat');
  });
});

describe('Prime-Vault Race · Unmodeled Nova tier', () => {
  it('includes tier 4 never-modeled FastA and door copy', () => {
    expect(
      existsSync(
        join(
          ROOT,
          'research/synthobs-prime-vault-alphafold-race/fixtures/fasta/tier4_unmodeled_nova.fasta',
        ),
      ),
    ).toBe(true);
    const client = read('interfaces/prime-vault-race-client.js');
    expect(client).toContain('unmodeled_nova');
    expect(client).toContain('Unmodeled Nova');
    const results = JSON.parse(
      read('research/synthobs-prime-vault-alphafold-race/data/race_results.json'),
    );
    expect(results.tiers.unmodeled_nova.primeVault.residues).toBe(112);
    expect(results.tiers.unmodeled_nova.colabfold.live).toBe(false);
  });
});
