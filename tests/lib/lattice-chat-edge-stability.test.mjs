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
  MAX_PERSISTED_MESSAGES_PER_THREAD,
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

  it('caps messages per thread on persist slim', () => {
    expect(MAX_PERSISTED_MESSAGES_PER_THREAD).toBeLessThanOrEqual(48);
    const messages = Array.from({ length: MAX_PERSISTED_MESSAGES_PER_THREAD + 20 }, (_, i) => ({
      id: `m${i}`,
      role: i % 2 ? 'assistant' : 'user',
      content: `msg ${i}`,
      createdAt: new Date(Date.now() + i).toISOString(),
    }));
    const out = slimThreadsForPersist([
      {
        id: 'long',
        title: 'long chat',
        updatedAt: new Date().toISOString(),
        messages,
      },
    ]);
    expect(out[0].messages.length).toBeLessThanOrEqual(MAX_PERSISTED_MESSAGES_PER_THREAD);
  });

  it('fits bloated blobs on getItem read path', async () => {
    const { latticeEdgeStateStorage } = await import(
      '../../apps/lattice-chat/src/lib/edgeStorage.ts'
    );
    const fatMsg = 'x'.repeat(40_000);
    const threads = Array.from({ length: 20 }, (_, i) => ({
      id: `t${i}`,
      updatedAt: `2026-09-${String((i % 28) + 1).padStart(2, '0')}T00:00:00.000Z`,
      messages: [{ id: `m${i}`, role: 'assistant', content: fatMsg }],
    }));
    const blob = JSON.stringify({ state: { threads }, version: 0 });
    expect(blob.length).toBeGreaterThan(LATTICE_EDGE_BLOB_BUDGET_CHARS);
    const store = new Map([['edge', blob]]);
    globalThis.localStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => {
        store.set(String(k), String(v));
      },
      removeItem: (k) => {
        store.delete(k);
      },
    };
    const got = latticeEdgeStateStorage.getItem('edge');
    expect(got).toBeTruthy();
    expect(got.length).toBeLessThanOrEqual(LATTICE_EDGE_BLOB_BUDGET_CHARS);
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

  it('caps mega message bodies and markdown render slices', async () => {
    const {
      MAX_LIVE_MESSAGE_CHARS,
      MAX_MARKDOWN_RENDER_CHARS,
      capMessageContent,
      markdownRenderSlice,
    } = await import('../../apps/lattice-chat/src/lib/messageContentCap.ts');
    const mega = 'z'.repeat(MAX_LIVE_MESSAGE_CHARS + 2_000);
    const capped = capMessageContent(mega);
    expect(capped.length).toBeLessThanOrEqual(MAX_LIVE_MESSAGE_CHARS + 2);
    const slice = markdownRenderSlice(mega);
    expect(slice.truncated).toBe(true);
    expect(slice.visible.length).toBeLessThanOrEqual(MAX_MARKDOWN_RENDER_CHARS + 2);
    expect(slice.totalChars).toBe(mega.length);
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

describe('Lattice Chat background reply surface', () => {
  it('keeps primary SSE through brief focus blips', async () => {
    const {
      decideBackgroundResume,
      BACKGROUND_BLIP_MS,
    } = await import('../../apps/lattice-chat/src/lib/backgroundReplySurface.ts');
    expect(
      decideBackgroundResume({
        awaitingAssistant: true,
        sending: true,
        sendPhase: 'sending',
        hasPending: true,
        primaryStreamLive: true,
        awayMs: BACKGROUND_BLIP_MS - 100,
        hasAgentId: true,
      }).action,
    ).toBe('keep_primary');
  });

  it('aborts zombie primary after a real background leave when agentId exists', async () => {
    const { decideBackgroundResume } = await import(
      '../../apps/lattice-chat/src/lib/backgroundReplySurface.ts'
    );
    expect(
      decideBackgroundResume({
        awaitingAssistant: true,
        sending: true,
        sendPhase: 'sending',
        hasPending: true,
        primaryStreamLive: true,
        awayMs: 12_000,
        hasAgentId: true,
      }).action,
    ).toBe('abort_and_recover');
  });

  it('keeps primary during Agent.create (no agentId) even after a long leave', async () => {
    const {
      decideBackgroundResume,
      BACKGROUND_CREATE_GRACE_MS,
    } = await import('../../apps/lattice-chat/src/lib/backgroundReplySurface.ts');
    expect(
      decideBackgroundResume({
        awaitingAssistant: true,
        sending: true,
        sendPhase: 'sending',
        hasPending: true,
        primaryStreamLive: true,
        awayMs: 30_000,
        pendingAgeMs: BACKGROUND_CREATE_GRACE_MS - 1_000,
        hasAgentId: false,
      }).action,
    ).toBe('keep_primary');
  });

  it('aborts create-grace zombies once create grace expires', async () => {
    const {
      decideBackgroundResume,
      BACKGROUND_CREATE_GRACE_MS,
    } = await import('../../apps/lattice-chat/src/lib/backgroundReplySurface.ts');
    expect(
      decideBackgroundResume({
        awaitingAssistant: true,
        sending: true,
        sendPhase: 'sending',
        hasPending: true,
        primaryStreamLive: true,
        awayMs: 30_000,
        pendingAgeMs: BACKGROUND_CREATE_GRACE_MS + 500,
        hasAgentId: false,
      }).action,
    ).toBe('abort_and_recover');
  });

  it('recovers when primary is already dead but turn is still awaiting', async () => {
    const { decideBackgroundResume } = await import(
      '../../apps/lattice-chat/src/lib/backgroundReplySurface.ts'
    );
    expect(
      decideBackgroundResume({
        awaitingAssistant: true,
        sending: false,
        sendPhase: 'stuck',
        hasPending: true,
        primaryStreamLive: false,
        awayMs: 30_000,
        hasAgentId: true,
      }).action,
    ).toBe('recover');
  });

  it('force-aborts long-lived sending zombies by pending age when agentId exists', async () => {
    const {
      decideBackgroundResume,
      BACKGROUND_FORCE_RECOVER_MS,
    } = await import('../../apps/lattice-chat/src/lib/backgroundReplySurface.ts');
    expect(
      decideBackgroundResume({
        awaitingAssistant: true,
        sending: true,
        sendPhase: 'sending',
        hasPending: true,
        primaryStreamLive: true,
        awayMs: 0,
        pendingAgeMs: BACKGROUND_FORCE_RECOVER_MS + 500,
        hasAgentId: true,
      }).action,
    ).toBe('abort_and_recover');
  });

  it('polls flush while still sending once pending is old or tab is hidden', async () => {
    const {
      shouldPollBackgroundFlush,
      BACKGROUND_FORCE_RECOVER_MS,
    } = await import('../../apps/lattice-chat/src/lib/backgroundReplySurface.ts');
    expect(
      shouldPollBackgroundFlush({
        awaitingAssistant: true,
        sending: true,
        sendPhase: 'sending',
        hasPending: true,
        pendingAgeMs: 1000,
        documentHidden: false,
      }),
    ).toBe(false);
    expect(
      shouldPollBackgroundFlush({
        awaitingAssistant: true,
        sending: true,
        sendPhase: 'sending',
        hasPending: true,
        pendingAgeMs: BACKGROUND_FORCE_RECOVER_MS + 100,
        documentHidden: false,
      }),
    ).toBe(true);
    expect(
      shouldPollBackgroundFlush({
        awaitingAssistant: true,
        sending: true,
        sendPhase: 'sending',
        hasPending: true,
        pendingAgeMs: 500,
        documentHidden: true,
      }),
    ).toBe(true);
    expect(
      shouldPollBackgroundFlush({
        awaitingAssistant: true,
        sending: true,
        sendPhase: 'stuck',
        hasPending: true,
        pendingAgeMs: 0,
        documentHidden: false,
      }),
    ).toBe(true);
    expect(
      shouldPollBackgroundFlush({
        awaitingAssistant: true,
        sending: false,
        sendPhase: 'idle',
        hasPending: false,
        pendingAgeMs: 0,
        documentHidden: true,
        hasAgentId: true,
      }),
    ).toBe(true);
  });

  it('does not abort primary for flush before agentId within create grace', async () => {
    const {
      shouldAbortPrimaryForBackgroundFlush,
      BACKGROUND_CREATE_GRACE_MS,
    } = await import('../../apps/lattice-chat/src/lib/backgroundReplySurface.ts');
    expect(
      shouldAbortPrimaryForBackgroundFlush({
        primaryStreamLive: true,
        hasAgentId: false,
        pendingAgeMs: 8_000,
      }),
    ).toBe(false);
    expect(
      shouldAbortPrimaryForBackgroundFlush({
        primaryStreamLive: true,
        hasAgentId: true,
        pendingAgeMs: 8_000,
      }),
    ).toBe(true);
    expect(
      shouldAbortPrimaryForBackgroundFlush({
        primaryStreamLive: true,
        hasAgentId: false,
        pendingAgeMs: BACKGROUND_CREATE_GRACE_MS + 1,
      }),
    ).toBe(true);
  });

  it('recovers on focus without a prior hide when pending is old or agentId remains', async () => {
    const {
      shouldRecoverOnFocusWithoutHide,
      BACKGROUND_FORCE_RECOVER_MS,
    } = await import('../../apps/lattice-chat/src/lib/backgroundReplySurface.ts');
    expect(
      shouldRecoverOnFocusWithoutHide({
        awaitingAssistant: true,
        hasPending: true,
        pendingAgeMs: BACKGROUND_FORCE_RECOVER_MS - 100,
      }),
    ).toBe(false);
    expect(
      shouldRecoverOnFocusWithoutHide({
        awaitingAssistant: true,
        hasPending: true,
        pendingAgeMs: BACKGROUND_FORCE_RECOVER_MS + 100,
      }),
    ).toBe(true);
    expect(
      shouldRecoverOnFocusWithoutHide({
        awaitingAssistant: true,
        hasPending: false,
        pendingAgeMs: 0,
        hasAgentId: true,
      }),
    ).toBe(true);
  });

  it('kicks pagehide recover when agentId exists', async () => {
    const { shouldKickRecoverOnPageHide } = await import(
      '../../apps/lattice-chat/src/lib/backgroundReplySurface.ts'
    );
    expect(
      shouldKickRecoverOnPageHide({
        awaitingAssistant: true,
        primaryStreamLive: true,
        hasAgentId: true,
        pendingAgeMs: 10_000,
        hasPending: true,
      }),
    ).toBe(true);
    expect(
      shouldKickRecoverOnPageHide({
        awaitingAssistant: true,
        primaryStreamLive: true,
        hasAgentId: false,
        pendingAgeMs: 10_000,
        hasPending: true,
      }),
    ).toBe(false);
  });

  it('retains pending on background abort without agentId', async () => {
    const { shouldRetainPendingOnAbort } = await import(
      '../../apps/lattice-chat/src/lib/backgroundReplySurface.ts'
    );
    expect(
      shouldRetainPendingOnAbort({ hasAgentId: false, abortReason: 'background' }),
    ).toBe(true);
    expect(
      shouldRetainPendingOnAbort({ hasAgentId: false, abortReason: 'watchdog' }),
    ).toBe(true);
    expect(
      shouldRetainPendingOnAbort({ hasAgentId: false, abortReason: 'user' }),
    ).toBe(false);
    expect(
      shouldRetainPendingOnAbort({ hasAgentId: true, abortReason: 'user' }),
    ).toBe(true);
  });

  it('flags zombie primary for Check-for-reply even without pending when agentId exists', async () => {
    const { shouldAbortZombiePrimaryForRecover } = await import(
      '../../apps/lattice-chat/src/lib/backgroundReplySurface.ts'
    );
    expect(
      shouldAbortZombiePrimaryForRecover({
        primaryStreamLive: true,
        hasPending: true,
        awaitingAssistant: true,
        hasAgentId: true,
      }),
    ).toBe(true);
    expect(
      shouldAbortZombiePrimaryForRecover({
        primaryStreamLive: true,
        hasPending: false,
        awaitingAssistant: true,
        hasAgentId: true,
      }),
    ).toBe(true);
    expect(
      shouldAbortZombiePrimaryForRecover({
        primaryStreamLive: true,
        hasPending: true,
        awaitingAssistant: true,
        hasAgentId: false,
        pendingAgeMs: 5_000,
      }),
    ).toBe(false);
    expect(
      shouldAbortZombiePrimaryForRecover({
        primaryStreamLive: true,
        hasPending: false,
        awaitingAssistant: false,
      }),
    ).toBe(false);
  });
});
