import { describe, expect, it } from 'vitest';
import { formatDmThreadForAgent } from '../../apps/lattice-chat/src/feed/sessionBridge.ts';

describe('sessionBridge DM → Lattice Chat', () => {
  it('formats a DM thread for Lattice Chat', () => {
    const prompt = formatDmThreadForAgent('Daniel', [
      { actor: 'You', body: 'hello this is a test message', createdAt: '2026-08-12T18:00:00.000Z' },
      { actor: 'Daniel', body: 'got it', createdAt: '2026-08-12T18:01:00.000Z' },
    ]);
    expect(prompt).toContain('Collaborate DM with Daniel');
    expect(prompt).toContain('You: hello this is a test message');
    expect(prompt).toContain('Daniel: got it');
  });
});
