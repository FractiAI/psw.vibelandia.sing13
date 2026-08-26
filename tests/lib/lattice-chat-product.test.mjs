import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function read(rel) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');
}

describe('Lattice Chat · Infinite Octaves product label', () => {
  it('shows Infinite Octaves as the default nest, not 99 Octave', () => {
    const composer = read('apps/lattice-chat/src/components/ComposerOptions.tsx');
    expect(composer).toContain("label: 'Infinite Octaves'");
    expect(composer).not.toContain("label: '99 Octave'");

    const repos = read('apps/lattice-chat/src/repositories.ts');
    expect(repos).toContain('Infinite Octaves home nest');
    expect(repos).not.toContain('99 Octave home nest');

    const api = read('api/lattice-chat.js');
    expect(api).toContain('Infinite Octaves Omniversal Lattice');
    expect(api).not.toContain('SING13 99 Octave Omni-Lattice Bridge');
  });
});

describe('Lattice Chat · Player 1 New Chat / past sessions', () => {
  it('API treats espressolico as a creator alias and uses write-on for Player 1', () => {
    const api = read('api/lattice-chat.js');
    expect(api).toContain('espressolico@gmail.com');
    expect(api).toContain('withSeatWriteDirective');
    expect(api).toContain('CREATOR_SING13_SHIP_DIRECTIVE');
    expect(api).toContain('loadLatticeAccessLib');
    expect(api).toMatch(/listCreatorEmails/);
  });

  it('keeps Past chats selectable after New chat', () => {
    const app = read('apps/lattice-chat/src/App.tsx');
    expect(app).not.toMatch(/onNewChat=\{\(\) => \{\s*newChat\(\);\s*closeRail\(\);/);

    const rail = read('apps/lattice-chat/src/components/HistoryRail.tsx');
    expect(rail).toContain('listSelectableChats');
    expect(rail).toContain('rail-section--chats');
    const pastIdx = rail.indexOf('Past chats');
    const repoIdx = rail.indexOf('<RepoWorkstreamList');
    expect(pastIdx).toBeGreaterThan(0);
    expect(repoIdx).toBeGreaterThan(pastIdx);

    const pane = read('apps/lattice-chat/src/components/ChatPane.tsx');
    expect(pane).toContain('header-thread-pick');
    expect(pane).toContain('Select a past chat');

    const store = read('apps/lattice-chat/src/store.ts');
    expect(store).toContain('slimThreadsForPersist');
    expect(store).toContain('privilege: s.privilege');

    const auth = read('apps/lattice-chat/src/components/AuthPanel.tsx');
    expect(auth).toContain('Player 1 · creator');
    expect(auth).toContain('signed-in-seat');
  });
});
