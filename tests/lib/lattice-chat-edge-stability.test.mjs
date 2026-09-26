import { beforeEach, describe, expect, it } from 'vitest';
import {
  fitPersistedEdgeBlob,
  LATTICE_EDGE_BLOB_BUDGET_CHARS,
  prunePersistedEdgeBlob,
} from '../../apps/lattice-chat/src/lib/edgeStorage.ts';
import {
  clearComposerDraft,
  readComposerDraft,
  writeComposerDraft,
} from '../../apps/lattice-chat/src/lib/composerDraft.ts';
import {
  MAX_LIVE_ASSISTANT_CHARS,
  MAX_LIVE_TRANSCRIPT_ITEMS,
  capLiveTranscriptItems,
  mergeLiveTranscriptItem,
} from '../../apps/lattice-chat/src/lib/liveTranscriptCap.ts';
import {
  MAX_PERSISTED_MESSAGE_CHARS,
  MAX_PERSISTED_THREADS,
  slimThreadsForPersist,
} from '../../apps/lattice-chat/src/threadHistory.ts';
import {
  latticeResponseAlreadyStreaming,
  safeLatticeErrorResponse,
} from '../../lib/lattice-sse-safe.mjs';

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

  it('fits persist blobs under the edge budget', () => {
    const fatMsg = 'x'.repeat(40_000);
    const threads = Array.from({ length: 20 }, (_, i) => ({
      id: `t${i}`,
      updatedAt: `2026-09-${String((i % 28) + 1).padStart(2, '0')}T00:00:00.000Z`,
      messages: [{ id: `m${i}`, role: 'assistant', content: fatMsg }],
    }));
    const blob = JSON.stringify({ state: { threads }, version: 0 });
    expect(blob.length).toBeGreaterThan(LATTICE_EDGE_BLOB_BUDGET_CHARS);
    const fitted = fitPersistedEdgeBlob(blob);
    expect(fitted).toBeTruthy();
    expect(fitted.length).toBeLessThanOrEqual(LATTICE_EDGE_BLOB_BUDGET_CHARS);
    expect(JSON.parse(fitted).state.threads.length).toBeLessThan(20);
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

  it('caps live transcript assistant growth', () => {
    const fat = { type: 'assistant', text: 'y'.repeat(MAX_LIVE_ASSISTANT_CHARS + 500) };
    const capped = capLiveTranscriptItems([fat]);
    expect(capped[0].text.length).toBeLessThanOrEqual(MAX_LIVE_ASSISTANT_CHARS + 2);
    let items = [];
    for (let i = 0; i < MAX_LIVE_TRANSCRIPT_ITEMS + 10; i++) {
      items = mergeLiveTranscriptItem(items, { type: 'status', status: 'live', message: `n${i}` });
    }
    expect(items.length).toBeLessThanOrEqual(MAX_LIVE_TRANSCRIPT_ITEMS);
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

describe('Lattice Chat SSE-safe outer errors', () => {
  it('detects an open event-stream pipe', () => {
    const res = {
      headersSent: true,
      writableEnded: false,
      getHeader: () => 'text/event-stream; charset=utf-8',
    };
    expect(latticeResponseAlreadyStreaming(res)).toBe(true);
    expect(latticeResponseAlreadyStreaming({ headersSent: false, writableEnded: false })).toBe(false);
  });

  it('writes SSE error instead of JSON when stream already started', () => {
    const writes = [];
    let ended = false;
    const res = {
      headersSent: true,
      writableEnded: false,
      getHeader: () => 'text/event-stream',
      end: () => {
        ended = true;
      },
    };
    const out = safeLatticeErrorResponse(
      res,
      500,
      { error: 'boom', code: 'outer_error' },
      {
        sseWrite: (_r, event, data) => {
          writes.push({ event, data });
        },
      },
    );
    expect(out.mode).toBe('sse');
    expect(writes).toHaveLength(1);
    expect(writes[0].event).toBe('error');
    expect(writes[0].data.code).toBe('outer_error');
    expect(ended).toBe(true);
  });

  it('falls back to JSON when headers are not sent', () => {
    const calls = [];
    const res = { headersSent: false, writableEnded: false };
    const out = safeLatticeErrorResponse(
      res,
      500,
      { error: 'boom', code: 'outer_error' },
      {
        jsonWrite: (r, status, body) => {
          calls.push({ r, status, body });
        },
      },
    );
    expect(out.mode).toBe('json');
    expect(calls).toHaveLength(1);
    expect(calls[0].status).toBe(500);
  });
});
