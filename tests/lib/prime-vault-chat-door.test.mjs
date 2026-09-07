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
