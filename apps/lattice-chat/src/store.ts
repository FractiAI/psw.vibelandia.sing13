import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isRememberedEmailFresh, normalizeEmail } from '@/access';
import type {
  AgentMode,
  ChatMessage,
  ChatThread,
  LatticeModelOption,
  TranscriptItem,
} from '@/types';

const STORAGE_KEY = 'lattice-v1618-edge';

export type SendPhase = 'idle' | 'sending' | 'recovering' | 'stuck';

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyThread(): ChatThread {
  const now = new Date().toISOString();
  return {
    id: uid('thread'),
    title: 'New chat',
    messages: [],
    updatedAt: now,
  };
}

type PendingSend = {
  threadId: string;
  prompt: string;
  startedAt: number;
  agentId?: string;
};

type LatticeState = {
  threads: ChatThread[];
  activeThreadId: string | null;
  userEmail: string;
  emailRememberedAt: string | null;
  /** Cursor API key — edge only (localStorage). Never sent to our durable store. */
  cursorApiKey: string;
  sending: boolean;
  sendPhase: SendPhase;
  statusHint: string | null;
  pending: PendingSend | null;
  error: string | null;
  agentMode: AgentMode;
  modelId: string;
  models: LatticeModelOption[];
  ensureThread: () => string;
  newChat: () => void;
  selectThread: (id: string) => void;
  renameThread: (id: string, title: string) => void;
  deleteThread: (id: string) => void;
  appendMessage: (
    threadId: string,
    message: Omit<ChatMessage, 'id' | 'createdAt'> & { id?: string },
  ) => string;
  setUserEmail: (email: string) => void;
  clearUserEmail: () => void;
  setCursorApiKey: (key: string) => void;
  clearCursorApiKey: () => void;
  setSending: (v: boolean) => void;
  setSendProgress: (phase: SendPhase, hint?: string | null) => void;
  setPending: (pending: PendingSend | null) => void;
  clearPending: () => void;
  setError: (msg: string | null) => void;
  setAgentId: (threadId: string, agentId: string) => void;
  setAgentMode: (mode: AgentMode) => void;
  setModelId: (modelId: string) => void;
  setModels: (models: LatticeModelOption[]) => void;
  hasRememberedEmail: () => boolean;
  hasEdgeCursorKey: () => boolean;
};

export const useLatticeStore = create<LatticeState>()(
  persist(
    (set, get) => ({
      threads: [],
      activeThreadId: null,
      userEmail: '',
      emailRememberedAt: null,
      cursorApiKey: '',
      sending: false,
      sendPhase: 'idle',
      statusHint: null,
      pending: null,
      error: null,
      agentMode: 'agent',
      modelId: 'composer-2.5',
      models: [{ id: 'composer-2.5', displayName: 'Composer 2.5' }],

      ensureThread: () => {
        const { threads, activeThreadId } = get();
        if (activeThreadId && threads.some((t) => t.id === activeThreadId)) {
          return activeThreadId;
        }
        const t = emptyThread();
        set({ threads: [t, ...threads], activeThreadId: t.id });
        return t.id;
      },

      newChat: () => {
        const t = emptyThread();
        set((s) => ({
          threads: [t, ...s.threads],
          activeThreadId: t.id,
          error: null,
          sendPhase: 'idle',
          statusHint: null,
          pending: null,
          sending: false,
        }));
      },

      selectThread: (id) => {
        if (!get().threads.some((t) => t.id === id)) return;
        set({ activeThreadId: id, error: null });
      },

      renameThread: (id, title) => {
        const next = title.trim() || 'Untitled';
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === id ? { ...t, title: next, updatedAt: new Date().toISOString() } : t,
          ),
        }));
      },

      deleteThread: (id) => {
        set((s) => {
          const threads = s.threads.filter((t) => t.id !== id);
          const activeThreadId =
            s.activeThreadId === id ? threads[0]?.id ?? null : s.activeThreadId;
          return { threads, activeThreadId };
        });
      },

      appendMessage: (threadId, message) => {
        const id = message.id ?? uid('msg');
        const createdAt = new Date().toISOString();
        const full: ChatMessage = {
          id,
          role: message.role,
          content: message.content,
          createdAt,
          transcript: message.transcript,
          model: message.model,
          mode: message.mode,
          tokens: message.tokens,
        };
        set((s) => ({
          threads: s.threads.map((t) => {
            if (t.id !== threadId) return t;
            const messages = [...t.messages, full];
            const title =
              t.title === 'New chat' && message.role === 'user'
                ? message.content.trim().slice(0, 48) || t.title
                : t.title;
            return { ...t, messages, title, updatedAt: createdAt };
          }),
        }));
        return id;
      },

      setUserEmail: (email) => {
        const normalized = normalizeEmail(email);
        set({
          userEmail: normalized,
          emailRememberedAt: normalized ? new Date().toISOString() : null,
        });
      },
      clearUserEmail: () => set({ userEmail: '', emailRememberedAt: null, cursorApiKey: '' }),
      setCursorApiKey: (key) => set({ cursorApiKey: String(key || '').trim() }),
      clearCursorApiKey: () => set({ cursorApiKey: '' }),
      setSending: (v) =>
        set(
          v
            ? { sending: true }
            : {
                sending: false,
                sendPhase: 'idle',
                statusHint: null,
              },
        ),
      setSendProgress: (phase, hint = null) =>
        set({
          sendPhase: phase,
          statusHint: hint,
          sending: phase !== 'idle',
        }),
      setPending: (pending) => set({ pending }),
      clearPending: () => set({ pending: null }),
      setError: (msg) => set({ error: msg }),
      setAgentId: (threadId, agentId) => {
        set((s) => ({
          threads: s.threads.map((t) => (t.id === threadId ? { ...t, agentId } : t)),
          pending:
            s.pending && s.pending.threadId === threadId
              ? { ...s.pending, agentId }
              : s.pending,
        }));
      },
      setAgentMode: (mode) => set({ agentMode: mode }),
      setModelId: (modelId) => set({ modelId }),
      setModels: (models) => set({ models }),
      hasRememberedEmail: () => {
        const { userEmail, emailRememberedAt } = get();
        return isRememberedEmailFresh(userEmail, emailRememberedAt);
      },
      hasEdgeCursorKey: () => Boolean(get().cursorApiKey.trim()),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        threads: s.threads,
        activeThreadId: s.activeThreadId,
        userEmail: s.userEmail,
        emailRememberedAt: s.emailRememberedAt,
        cursorApiKey: s.cursorApiKey,
        agentMode: s.agentMode,
        modelId: s.modelId,
        // Survive refresh / tab blur so Check for reply works without re-pasting.
        pending: s.pending,
      }),
    },
  ),
);

export type { TranscriptItem };
