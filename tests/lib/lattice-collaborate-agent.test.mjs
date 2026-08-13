import { beforeEach, describe, expect, it } from 'vitest';
import {
  appendCollaborateAgentEvent,
  listCollaborateAgentEvents,
  resetCollaborateAgentMemoryForTests,
} from '../../lib/lattice-collaborate-agent.mjs';

describe('lattice-collaborate-agent', () => {
  beforeEach(() => {
    resetCollaborateAgentMemoryForTests();
  });

  it('appends user + assistant with sender and transcript', async () => {
    const user = await appendCollaborateAgentEvent({
      id: 'ca_user_1',
      role: 'user',
      fromPeerId: 'peer_valet_pru',
      content: 'plan the release',
      senderName: 'Valet Pru',
      createdAt: '2026-08-13T18:00:00.000Z',
    });
    expect(user.ok).toBe(true);
    expect(user.event.senderName).toBe('Valet Pru');

    const assistant = await appendCollaborateAgentEvent({
      id: 'ca_asst_1',
      role: 'assistant',
      fromPeerId: 'peer_valet_pru',
      content: 'here is a plan',
      transcript: [
        { type: 'thinking', text: 'considering steps' },
        { type: 'assistant', text: 'here is a plan' },
      ],
      model: 'composer-2.5',
      mode: 'agent',
      createdAt: '2026-08-13T18:00:05.000Z',
    });
    expect(assistant.ok).toBe(true);
    expect(assistant.event.transcript).toHaveLength(2);

    const all = await listCollaborateAgentEvents();
    expect(all).toHaveLength(2);
    expect(all[0].role).toBe('user');
    expect(all[1].transcript[0].type).toBe('thinking');
  });

  it('replaces live thought stream per peer and clears on final', async () => {
    await appendCollaborateAgentEvent({
      id: 'live_peer_daniel',
      role: 'live',
      fromPeerId: 'peer_daniel',
      transcript: [{ type: 'thinking', text: 'drafting' }],
      createdAt: '2026-08-13T18:01:00.000Z',
    });
    await appendCollaborateAgentEvent({
      id: 'live_peer_daniel',
      role: 'live',
      fromPeerId: 'peer_daniel',
      transcript: [
        { type: 'thinking', text: 'drafting more' },
        { type: 'tool_call', callId: 't1', name: 'read', status: 'completed' },
      ],
      createdAt: '2026-08-13T18:01:02.000Z',
    });
    let all = await listCollaborateAgentEvents();
    expect(all.filter((e) => e.role === 'live')).toHaveLength(1);
    expect(all.find((e) => e.role === 'live').transcript).toHaveLength(2);

    await appendCollaborateAgentEvent({
      id: 'ca_asst_d1',
      role: 'assistant',
      fromPeerId: 'peer_daniel',
      content: 'done',
      transcript: [{ type: 'assistant', text: 'done' }],
      createdAt: '2026-08-13T18:01:10.000Z',
    });
    all = await listCollaborateAgentEvents();
    expect(all.filter((e) => e.role === 'live')).toHaveLength(0);
    expect(all.some((e) => e.id === 'ca_asst_d1')).toBe(true);
  });

  it('rejects unknown peers', async () => {
    const bad = await appendCollaborateAgentEvent({
      id: 'ca_bad',
      role: 'user',
      fromPeerId: 'peer_nobody',
      content: 'nope',
    });
    expect(bad.ok).toBe(false);
  });
});
