import { beforeEach, describe, expect, it } from 'vitest';
import { prunePersistedEdgeBlob } from '../../apps/lattice-chat/src/lib/edgeStorage.ts';
import {
  clearComposerDraft,
  readComposerDraft,
  writeComposerDraft,
} from '../../apps/lattice-chat/src/lib/composerDraft.ts';
import {
  MAX_PERSISTED_MESSAGE_CHARS,
  MAX_PERSISTED_THREADS,
  slimThreadsForPersist,
} from '../../apps/lattice-chat/src/threadHistory.ts';

function installMemorySessionStorage() {
  const map = new Map();
  globalThis.sessionStorage = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(String(k), String(v));
    },
    removeItem: (k) => {
      map.delete(String(k));
    },
    clear: () => map.clear(),
    key: () => null,
    get length() {
      return map.size;
    },
  };
}

describe('Lattice Chat edge stability', () => {
  beforeEach(() => {
    installMemorySessionStorage();
  });

  it('prunes oldest threads from a bloated persist blob', () => {
    const blob = JSON.stringify({
      state: {
        threads: [
          { id: 'a', updatedAt: '2026-01-01T00:00:00.000Z', messages: [] },
          { id: 'b', updatedAt: '2026-06-01T00:00:00.000Z', messages: [] },
          { id: 'c', updatedAt: '2026-09-01T00:00:00.000Z', messages: [] },
        ],
        userEmail: 'player1@example.com',
      },
      version: 0,
    });
    const pruned = prunePersistedEdgeBlob(blob, 2);
    expect(pruned).toBeTruthy();
    const parsed = JSON.parse(pruned);
    expect(parsed.state.threads).toHaveLength(2);
    expect(parsed.state.threads.map((t) => t.id)).toEqual(['c', 'b']);
    expect(parsed.state.userEmail).toBe('player1@example.com');
  });

  it('slims threads with tighter message caps', () => {
    expect(MAX_PERSISTED_THREADS).toBeLessThanOrEqual(24);
    expect(MAX_PERSISTED_MESSAGE_CHARS).toBeLessThanOrEqual(24_000);
    const fat = 'x'.repeat(MAX_PERSISTED_MESSAGE_CHARS + 500);
    const out = slimThreadsForPersist([
      {
        id: 't1',
        title: 'fat',
        updatedAt: new Date().toISOString(),
        messages: [{ id: 'm1', role: 'assistant', content: fat, createdAt: new Date().toISOString() }],
      },
    ]);
    expect(out[0].messages[0].content.length).toBeLessThanOrEqual(MAX_PERSISTED_MESSAGE_CHARS + 2);
  });

  it('round-trips composer draft in sessionStorage', () => {
    clearComposerDraft('thread_demo');
    expect(readComposerDraft('thread_demo')).toBe('');
    writeComposerDraft('thread_demo', 'hello valet');
    expect(readComposerDraft('thread_demo')).toBe('hello valet');
    clearComposerDraft('thread_demo');
    expect(readComposerDraft('thread_demo')).toBe('');
  });
});
