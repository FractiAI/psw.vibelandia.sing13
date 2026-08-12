import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isRememberedEmailFresh, normalizeEmail } from '@/access';
import {
  catalogForProvider,
  LATTICE_MODEL_CATALOG,
  PROVIDER_DEFAULT_MODEL,
} from '@/modelCatalog';
import {
  readActiveProvider,
  saveActiveProvider,
  type LatticeProvider,
} from '@/lib/providerKeys';
import type {
  AgentMode,
  ChatMessage,
  ChatThread,
  LatticeModelOption,
  NestTopology,
  TranscriptItem,
} from '@/types';
import {
  DEFAULT_REPO_ID,
  findRepository,
  LATTICE_REPOSITORIES_FALLBACK,
  type LatticeRepository,
} from '@/repositories';

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
  /** Cumulative provider token balance captured at run start. */
  balanceBefore?: number | null;
};

type LatticePrivilege = 'creator' | 'guest' | 'none' | null;

type LatticeState = {
  threads: ChatThread[];
  activeThreadId: string | null;
  userEmail: string;
  emailRememberedAt: string | null;
  /** Server allowlist privilege — all seats agent on SING13; guests get honor rail. */
  privilege: LatticePrivilege;
  sending: boolean;
  sendPhase: SendPhase;
  statusHint: string | null;
  pending: PendingSend | null;
  /** Live stream-of-thought transcript while a run is in flight. */
  liveTranscript: TranscriptItem[];
  error: string | null;
  agentMode: AgentMode;
  modelId: string;
  models: LatticeModelOption[];
  provider: LatticeProvider;
  nestTopology: NestTopology;
  /** Optional user-defined roster (one agent per line: Name — role). Empty = Goldilocks auto. */
  agentRoster: string;
  /** Active repository workstream (curated FractiAI projects). */
  activeRepoId: string;
  repositories: LatticeRepository[];
  setRepositories: (repos: LatticeRepository[]) => void;
  switchRepositoryWorkstream: (repoId: string) => void;
  ensureThread: () => string;
  /** Create or reuse an empty draft thread; returns active thread id. */
  newChat: () => string;
  selectThread: (id: string) => void;
  renameThread: (id: string, title: string) => void;
  deleteThread: (id: string) => void;
  appendMessage: (
    threadId: string,
    message: Omit<ChatMessage, 'id' | 'createdAt'> & { id?: string },
  ) => string;
  setUserEmail: (email: string) => void;
  setPrivilege: (privilege: LatticePrivilege) => void;
  clearUserEmail: () => void;
  setSending: (v: boolean) => void;
  setSendProgress: (phase: SendPhase, hint?: string | null) => void;
  setPending: (pending: PendingSend | null) => void;
  patchPending: (patch: Partial<PendingSend>) => void;
  clearPending: () => void;
  setLiveTranscript: (items: TranscriptItem[]) => void;
  pushLiveTranscript: (item: TranscriptItem) => void;
  clearLiveTranscript: () => void;
  setError: (msg: string | null) => void;
  setAgentId: (threadId: string, agentId: string | null) => void;
  /** Drop cloud agent ids when the edge key or provider changes. */
  clearCloudAgents: () => void;
  setAgentMode: (mode: AgentMode) => void;
  setModelId: (modelId: string) => void;
  setModels: (models: LatticeModelOption[]) => void;
  setProvider: (provider: LatticeProvider) => void;
  setNestTopology: (nest: NestTopology) => void;
  setAgentRoster: (roster: string) => void;
  hasRememberedEmail: () => boolean;
  /**
   * Clear chat cache / stuck runs and reload fresh assets.
   * Keeps email, remembered access, BYOK keys, and composer prefs.
   */
  hardRefreshEdge: () => void;
};

export const useLatticeStore = create<LatticeState>()(
  persist(
    (set, get) => ({
      threads: [],
      activeThreadId: null,
      userEmail: '',
      emailRememberedAt: null,
      privilege: null,
      sending: false,
      sendPhase: 'idle',
      statusHint: null,
      pending: null,
      liveTranscript: [],
      error: null,
      agentMode: 'agent',
      modelId: 'composer-2.5',
      models: LATTICE_MODEL_CATALOG,
      provider: readActiveProvider(),
      nestTopology: 'octave99',
      agentRoster: '',
      activeRepoId: DEFAULT_REPO_ID,
      repositories: LATTICE_REPOSITORIES_FALLBACK,

      setRepositories: (repositories) => set({ repositories }),

      switchRepositoryWorkstream: (repoId) => {
        const list = get().repositories.length
          ? get().repositories
          : LATTICE_REPOSITORIES_FALLBACK;
        const repo = findRepository(repoId, list) || findRepository(repoId);
        if (!repo) return;
        const t = emptyThread();
        t.title = `Workstream · ${repo.label}`;
        set((s) => ({
          activeRepoId: repo.id,
          threads: [t, ...s.threads.filter((x) => x.messages.length > 0)],
          activeThreadId: t.id,
          error: null,
          sendPhase: 'idle',
          statusHint: null,
          pending: null,
          liveTranscript: [],
          sending: false,
          nestTopology: (repo.tags || []).includes('99-octave') ? 'octave99' : s.nestTopology,
        }));
      },

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
        const { threads, activeThreadId } = get();
        const active = threads.find((t) => t.id === activeThreadId);
        // Cursor-like: reuse an empty draft instead of stacking blanks.
        if (active && active.messages.length === 0) {
          set({
            error: null,
            sendPhase: 'idle',
            statusHint: null,
            pending: null,
            liveTranscript: [],
            sending: false,
          });
          return active.id;
        }
        const empty = threads.find((t) => t.messages.length === 0);
        if (empty) {
          set({
            activeThreadId: empty.id,
            error: null,
            sendPhase: 'idle',
            statusHint: null,
            pending: null,
            liveTranscript: [],
            sending: false,
          });
          return empty.id;
        }
        const t = emptyThread();
        set((s) => ({
          threads: [t, ...s.threads],
          activeThreadId: t.id,
          error: null,
          sendPhase: 'idle',
          statusHint: null,
          pending: null,
          liveTranscript: [],
          sending: false,
        }));
        return t.id;
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
      setPrivilege: (privilege) => set({ privilege }),
      clearUserEmail: () => set({ userEmail: '', emailRememberedAt: null, privilege: null }),
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
      patchPending: (patch) =>
        set((s) => (s.pending ? { pending: { ...s.pending, ...patch } } : {})),
      clearPending: () => set({ pending: null, liveTranscript: [] }),
      setLiveTranscript: (items) => set({ liveTranscript: items }),
      pushLiveTranscript: (item) =>
        set((s) => {
          const items = [...s.liveTranscript];
          if (item.type === 'assistant' && items.length) {
            const last = items[items.length - 1];
            if (last.type === 'assistant') {
              items[items.length - 1] = {
                ...last,
                text: `${last.text || ''}${item.text || ''}`,
              };
              return { liveTranscript: items };
            }
          }
          if (item.type === 'thinking' && items.length) {
            const last = items[items.length - 1];
            if (last.type === 'thinking' && item.durationMs == null) {
              items[items.length - 1] = {
                ...last,
                text: `${last.text || ''}${item.text || ''}`,
              };
              return { liveTranscript: items };
            }
          }
          if (item.type === 'tool_call' && item.callId) {
            const idx = items.findIndex(
              (x) => x.type === 'tool_call' && x.callId === item.callId,
            );
            if (idx >= 0) {
              items[idx] = { ...items[idx], ...item };
              return { liveTranscript: items };
            }
          }
          items.push(item);
          return { liveTranscript: items };
        }),
      clearLiveTranscript: () => set({ liveTranscript: [] }),
      setError: (msg) => set({ error: msg }),
      setAgentId: (threadId, agentId) => {
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === threadId
              ? { ...t, agentId: agentId || undefined }
              : t,
          ),
          pending:
            s.pending && s.pending.threadId === threadId
              ? { ...s.pending, agentId: agentId || undefined }
              : s.pending,
        }));
      },
      clearCloudAgents: () =>
        set((s) => ({
          threads: s.threads.map((t) => ({ ...t, agentId: undefined })),
          pending: s.pending ? { ...s.pending, agentId: undefined } : null,
          liveTranscript: [],
          sending: false,
          sendPhase: 'idle' as const,
          statusHint: null,
        })),
      setAgentMode: (mode) => set({ agentMode: mode }),
      setModelId: (modelId) => set({ modelId }),
      setModels: (models) => set({ models }),
      setNestTopology: (nestTopology) => set({ nestTopology }),
      setAgentRoster: (agentRoster) => set({ agentRoster }),
      setProvider: (provider) => {
        saveActiveProvider(provider);
        const models = catalogForProvider(provider);
        const defaultId = PROVIDER_DEFAULT_MODEL[provider];
        set((s) => ({
          provider,
          models,
          modelId: models.some((m) => m.id === s.modelId) ? s.modelId : defaultId,
          threads: s.threads.map((t) => ({ ...t, agentId: undefined })),
          pending: s.pending ? { ...s.pending, agentId: undefined } : null,
        }));
      },
      hasRememberedEmail: () => {
        const { userEmail, emailRememberedAt } = get();
        return isRememberedEmailFresh(userEmail, emailRememberedAt);
      },

      hardRefreshEdge: () => {
        // Wipe conversation + stuck cloud agent ids / pending runs only.
        set({
          threads: [],
          activeThreadId: null,
          pending: null,
          liveTranscript: [],
          sending: false,
          sendPhase: 'idle',
          statusHint: null,
          error: null,
        });
        try {
          sessionStorage.removeItem('lattice_composer_advanced_open');
        } catch {
          /* ignore */
        }
        // Persist middleware writes on set; brief delay then cache-bust reload.
        // BYOK keys live in separate localStorage keys — never touched here.
        window.setTimeout(() => {
          try {
            const url = new URL(window.location.href);
            url.searchParams.set('_r', String(Date.now()));
            window.location.replace(url.toString());
          } catch {
            window.location.reload();
          }
        }, 60);
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        threads: s.threads,
        activeThreadId: s.activeThreadId,
        userEmail: s.userEmail,
        emailRememberedAt: s.emailRememberedAt,
        agentMode: s.agentMode,
        modelId: s.modelId,
        provider: s.provider,
        nestTopology: s.nestTopology,
        agentRoster: s.agentRoster,
        activeRepoId: s.activeRepoId,
        pending: s.pending,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const provider = state.provider || readActiveProvider();
        saveActiveProvider(provider);
        const models = catalogForProvider(provider);
        const modelId = models.some((m) => m.id === state.modelId)
          ? state.modelId
          : PROVIDER_DEFAULT_MODEL[provider];
        const activeRepoId = state.activeRepoId || DEFAULT_REPO_ID;
        useLatticeStore.setState({
          provider,
          models,
          modelId,
          activeRepoId,
          repositories: state.repositories?.length
            ? state.repositories
            : LATTICE_REPOSITORIES_FALLBACK,
        });
      },
    },
  ),
);

export type { TranscriptItem };
