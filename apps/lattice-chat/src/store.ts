import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  isRememberedEmailFresh,
  normalizeEmail,
} from '@/access';
import type { ChatMessage, ChatThread, LatticeAgentSlot, LatticeExecution } from '@/types';

const STORAGE_KEY = 'lattice-v1618-edge';

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

type LatticeState = {
  threads: ChatThread[];
  activeThreadId: string | null;
  /** Remembered email on this device (no passwords). */
  userEmail: string;
  emailRememberedAt: string | null;
  sending: boolean;
  error: string | null;
  liveAgents: LatticeAgentSlot[];
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
  setSending: (v: boolean) => void;
  setError: (msg: string | null) => void;
  setLiveAgents: (agents: LatticeAgentSlot[]) => void;
  setAgentId: (threadId: string, agentId: string) => void;
  hasRememberedEmail: () => boolean;
};

export const useLatticeStore = create<LatticeState>()(
  persist(
    (set, get) => ({
      threads: [],
      activeThreadId: null,
      userEmail: '',
      emailRememberedAt: null,
      sending: false,
      error: null,
      liveAgents: [],

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
          execution: message.execution,
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
      clearUserEmail: () => set({ userEmail: '', emailRememberedAt: null }),
      setSending: (v) => set({ sending: v, ...(v ? {} : { liveAgents: [] }) }),
      setError: (msg) => set({ error: msg }),
      setLiveAgents: (agents) => set({ liveAgents: agents }),
      setAgentId: (threadId, agentId) => {
        set((s) => ({
          threads: s.threads.map((t) => (t.id === threadId ? { ...t, agentId } : t)),
        }));
      },
      hasRememberedEmail: () => {
        const { userEmail, emailRememberedAt } = get();
        return isRememberedEmailFresh(userEmail, emailRememberedAt);
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        threads: s.threads,
        activeThreadId: s.activeThreadId,
        userEmail: s.userEmail,
        emailRememberedAt: s.emailRememberedAt,
      }),
    },
  ),
);

export type { LatticeExecution };
