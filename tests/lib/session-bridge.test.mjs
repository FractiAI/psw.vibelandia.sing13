import { describe, expect, it } from 'vitest';
import {
  formatDmThreadForAgent,
  agentSeatMessageToDmEnvelope,
} from '../../apps/lattice-chat/src/feed/sessionBridge.ts';

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

  it('mirrors a shared-agent seat message into a Collaborate DM envelope', () => {
    const env = agentSeatMessageToDmEnvelope({
      id: 'ca_1',
      content: 'hello from Daniel',
      createdAt: '2026-09-03T12:00:00.000Z',
      senderPeerId: 'peer_daniel',
      senderName: 'Daniel',
    });
    expect(env.id).toBe('agent_mirror_ca_1');
    expect(env.threadPeerId).toBe('peer_daniel');
    expect(env.actor).toBe('Daniel');
    expect(env.body).toBe('hello from Daniel');
  });
});
