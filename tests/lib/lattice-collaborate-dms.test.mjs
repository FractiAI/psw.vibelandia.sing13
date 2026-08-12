import { describe, expect, it, beforeEach } from 'vitest';
import {
  appendCollaborateDm,
  listCollaborateDms,
  resetCollaborateDmsMemoryForTests,
  resolveCollabPeerId,
} from '../../lib/lattice-collaborate-dms.mjs';
import { rewriteSharedDmForSeat } from '../../apps/lattice-chat/src/feed/syncCollaborateDms.ts';

describe('lattice-collaborate-dms', () => {
  beforeEach(() => {
    resetCollaborateDmsMemoryForTests();
  });

  it('maps creator and Daniel emails to seats', () => {
    expect(resolveCollabPeerId('valetpru@gmail.com')).toBe('peer_valet_pru');
    expect(resolveCollabPeerId('espressolico@gmail.com')).toBe('peer_valet_pru');
    expect(resolveCollabPeerId('danielarifriedman@gmail.com')).toBe('peer_daniel');
    expect(resolveCollabPeerId('unknown@example.com')).toBe(null);
  });

  it('appends and lists DMs idempotently', async () => {
    const a = await appendCollaborateDm({
      id: 'dm_test_1',
      fromPeerId: 'peer_valet_pru',
      threadPeerId: 'peer_daniel',
      text: 'hello this is a test message',
      createdAt: '2026-08-12T18:00:00.000Z',
    });
    expect(a.ok).toBe(true);
    expect(a.duplicate).toBe(false);

    const dup = await appendCollaborateDm({
      id: 'dm_test_1',
      fromPeerId: 'peer_valet_pru',
      threadPeerId: 'peer_daniel',
      text: 'hello this is a test message',
      createdAt: '2026-08-12T18:00:00.000Z',
    });
    expect(dup.ok).toBe(true);
    expect(dup.duplicate).toBe(true);

    const b = await appendCollaborateDm({
      id: 'dm_test_2',
      fromPeerId: 'peer_daniel',
      threadPeerId: 'peer_valet_pru',
      text: 'reply from daniel',
      createdAt: '2026-08-12T18:01:00.000Z',
    });
    expect(b.ok).toBe(true);

    const all = await listCollaborateDms();
    expect(all).toHaveLength(2);

    const since = await listCollaborateDms({ since: '2026-08-12T18:00:30.000Z' });
    expect(since).toHaveLength(1);
    expect(since[0].id).toBe('dm_test_2');
  });

  it('rejects self-DM and unknown peers', async () => {
    const self = await appendCollaborateDm({
      id: 'dm_bad',
      fromPeerId: 'peer_daniel',
      threadPeerId: 'peer_daniel',
      text: 'nope',
    });
    expect(self.ok).toBe(false);

    const bad = await appendCollaborateDm({
      id: 'dm_bad2',
      fromPeerId: 'peer_daniel',
      threadPeerId: 'peer_nobody',
      text: 'nope',
    });
    expect(bad.ok).toBe(false);
  });
});

describe('rewriteSharedDmForSeat', () => {
  it('rewrites mine vs theirs for Valet Pru', () => {
    const mine = rewriteSharedDmForSeat(
      {
        id: 'dm_1',
        fromPeerId: 'peer_valet_pru',
        threadPeerId: 'peer_daniel',
        text: 'hello',
        createdAt: '2026-08-12T18:00:00.000Z',
      },
      'peer_valet_pru',
    );
    expect(mine).toMatchObject({
      actor: 'You',
      threadPeerId: 'peer_daniel',
      body: 'hello',
    });

    const theirs = rewriteSharedDmForSeat(
      {
        id: 'dm_2',
        fromPeerId: 'peer_daniel',
        threadPeerId: 'peer_valet_pru',
        text: 'hi back',
        createdAt: '2026-08-12T18:01:00.000Z',
      },
      'peer_valet_pru',
    );
    expect(theirs).toMatchObject({
      actor: 'Daniel',
      threadPeerId: 'peer_daniel',
      body: 'hi back',
    });
  });

  it('rewrites for Daniel seat', () => {
    const incoming = rewriteSharedDmForSeat(
      {
        id: 'dm_1',
        fromPeerId: 'peer_valet_pru',
        threadPeerId: 'peer_daniel',
        text: 'hello this is a test message',
        createdAt: '2026-08-12T18:00:00.000Z',
      },
      'peer_daniel',
    );
    expect(incoming).toMatchObject({
      actor: 'Valet Pru',
      threadPeerId: 'peer_valet_pru',
    });
  });
});
