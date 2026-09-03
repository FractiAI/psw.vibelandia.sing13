/**
 * Sync shared Collaborate Lattice Chat session (inputs, outputs, thought streams).
 * Center pipe: GET/POST /api/lattice-collaborate-feed?agent=1
 */
import { useLatticeStore } from '@/store';
import {
  peerNameForId,
  resolveClientCollabPeerId,
} from '@/feed/seatIdentity';
import { COLLAB_SHARED_AGENT_THREAD_ID } from '@/feed/collabSharedThread';
import { agentSeatMessageToDmEnvelope } from '@/feed/sessionBridge';
import { useUnifiedFeed } from '@/feed/store';
import type { AgentMode, ChatMessage, TranscriptItem } from '@/types';

export { COLLAB_SHARED_AGENT_THREAD_ID } from '@/feed/collabSharedThread';

export type SharedAgentEvent = {
  id?: string;
  kind?: string;
  role?: string;
  fromPeerId?: string;
  content?: string;
  text?: string;
  body?: string;
  transcript?: TranscriptItem[];
  model?: string;
  mode?: string;
  senderName?: string;
  createdAt?: string;
};

type AgentResponse = {
  ok?: boolean;
  myPeerId?: string;
  events?: SharedAgentEvent[];
};

let lastLivePostAt = 0;
let livePostTimer: ReturnType<typeof setTimeout> | null = null;

export function isSharedCollabAgentThread(threadId: string | null | undefined): boolean {
  return threadId === COLLAB_SHARED_AGENT_THREAD_ID;
}

export function newClientAgentEventId(prefix = 'ca'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** POST one agent-session event to the shared Collaborate pipe. */
export async function postCollaborateAgentEvent(opts: {
  id: string;
  role: 'user' | 'assistant' | 'live';
  content?: string;
  transcript?: TranscriptItem[];
  model?: string;
  mode?: string;
  senderName?: string;
  createdAt?: string;
}): Promise<{ ok: boolean; duplicate?: boolean }> {
  const email = useLatticeStore.getState().userEmail.trim();
  if (!email) return { ok: false };
  try {
    const res = await fetch('/api/lattice-collaborate-feed?agent=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-lattice-email': email,
      },
      body: JSON.stringify({
        id: opts.id,
        role: opts.role,
        content: opts.content ?? '',
        transcript: opts.transcript,
        model: opts.model,
        mode: opts.mode,
        senderName: opts.senderName,
        createdAt: opts.createdAt || new Date().toISOString(),
      }),
    });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as { ok?: boolean; duplicate?: boolean };
    return { ok: Boolean(data.ok), duplicate: Boolean(data.duplicate) };
  } catch {
    return { ok: false };
  }
}

function eventToMessage(ev: SharedAgentEvent): ChatMessage | null {
  const id = typeof ev.id === 'string' ? ev.id : '';
  const role = ev.role === 'user' || ev.role === 'assistant' ? ev.role : null;
  if (!id || !role) return null;
  const fromPeerId = typeof ev.fromPeerId === 'string' ? ev.fromPeerId : '';
  const content = String(ev.content ?? ev.text ?? ev.body ?? '').trim();
  const transcript = Array.isArray(ev.transcript) ? ev.transcript : undefined;
  if (!content && !(transcript && transcript.length)) return null;
  return {
    id,
    role,
    content: content || '(thought stream)',
    createdAt:
      typeof ev.createdAt === 'string' && ev.createdAt
        ? ev.createdAt
        : new Date().toISOString(),
    transcript,
    model: typeof ev.model === 'string' ? ev.model : undefined,
    mode: typeof ev.mode === 'string' ? (ev.mode as AgentMode) : undefined,
    senderPeerId: fromPeerId || undefined,
    senderName:
      (typeof ev.senderName === 'string' && ev.senderName.trim()) ||
      (fromPeerId ? peerNameForId(fromPeerId) : undefined),
  };
}

/** Pull shared agent session into the Collaborate shared thread. */
export async function syncCollaborateAgent(): Promise<{ ingested: number; total: number }> {
  const store = useLatticeStore.getState();
  const email = store.userEmail.trim();
  const myPeerId = resolveClientCollabPeerId(email);
  if (!email || !myPeerId) return { ingested: 0, total: 0 };

  store.ensureSharedCollabThread();

  try {
    const res = await fetch('/api/lattice-collaborate-feed?agent=1', {
      headers: {
        Accept: 'application/json',
        'x-lattice-email': email,
      },
    });
    if (!res.ok) return { ingested: 0, total: 0 };
    const data = (await res.json()) as AgentResponse;
    const events = Array.isArray(data.events) ? data.events : [];
    let ingested = 0;
    let remoteLive: {
      fromPeerId: string;
      senderName: string;
      transcript: TranscriptItem[];
    } | null = null;

    for (const raw of events) {
      if (raw.role === 'live') {
        const fromPeerId = typeof raw.fromPeerId === 'string' ? raw.fromPeerId : '';
        if (!fromPeerId || fromPeerId === myPeerId) continue;
        const transcript = Array.isArray(raw.transcript) ? raw.transcript : [];
        if (!transcript.length) continue;
        remoteLive = {
          fromPeerId,
          senderName:
            (typeof raw.senderName === 'string' && raw.senderName.trim()) ||
            peerNameForId(fromPeerId),
          transcript,
        };
        continue;
      }
      const msg = eventToMessage(raw);
      if (!msg) continue;
      const before = useLatticeStore
        .getState()
        .threads.find((t) => t.id === COLLAB_SHARED_AGENT_THREAD_ID)
        ?.messages.find((m) => m.id === msg.id);
      useLatticeStore.getState().upsertMessage(COLLAB_SHARED_AGENT_THREAD_ID, msg);
      if (!before) {
        ingested += 1;
        // Seat messages also land in Collaborate DM unread until that peer thread is opened.
        if (
          msg.role === 'user' &&
          msg.senderPeerId &&
          msg.senderPeerId !== myPeerId &&
          String(msg.content || '').trim()
        ) {
          useUnifiedFeed.getState().ingestPayload(
            agentSeatMessageToDmEnvelope({
              id: msg.id,
              content: msg.content,
              createdAt: msg.createdAt,
              senderPeerId: msg.senderPeerId,
              senderName: msg.senderName,
            }),
          );
        }
      }
    }

    const s = useLatticeStore.getState();
    if (remoteLive) {
      s.setRemoteCollabLive(remoteLive);
    } else if (s.remoteCollabLive) {
      s.clearRemoteCollabLive();
    }

    return { ingested, total: events.length };
  } catch {
    return { ingested: 0, total: 0 };
  }
}

/** Publish local thought stream to seats (throttled). */
export function maybePublishCollabLive(): void {
  const store = useLatticeStore.getState();
  if (!isSharedCollabAgentThread(store.activeThreadId)) return;
  if (!store.sending && store.sendPhase === 'idle') return;
  const email = store.userEmail.trim();
  const myPeerId = resolveClientCollabPeerId(email);
  if (!myPeerId) return;

  const flush = () => {
    livePostTimer = null;
    const s = useLatticeStore.getState();
    if (!isSharedCollabAgentThread(s.activeThreadId)) return;
    if (!s.liveTranscript.length) return;
    lastLivePostAt = Date.now();
    void postCollaborateAgentEvent({
      id: `live_${myPeerId}`,
      role: 'live',
      content: '',
      transcript: s.liveTranscript,
      senderName: peerNameForId(myPeerId),
      model: s.modelId,
      mode: s.agentMode,
    });
  };

  const elapsed = Date.now() - lastLivePostAt;
  if (elapsed >= 1200) {
    flush();
    return;
  }
  if (livePostTimer) return;
  livePostTimer = setTimeout(flush, Math.max(200, 1200 - elapsed));
}

/** Publish a finished user or assistant message to the shared pipe. */
export function publishCollabAgentMessage(message: ChatMessage): void {
  const store = useLatticeStore.getState();
  const email = store.userEmail.trim();
  const myPeerId = resolveClientCollabPeerId(email);
  if (!myPeerId) return;
  if (message.role !== 'user' && message.role !== 'assistant') return;

  void postCollaborateAgentEvent({
    id: message.id,
    role: message.role,
    content: message.content,
    transcript: message.transcript,
    model: message.model,
    mode: message.mode,
    senderName: message.senderName || peerNameForId(myPeerId),
    createdAt: message.createdAt,
  });
}
