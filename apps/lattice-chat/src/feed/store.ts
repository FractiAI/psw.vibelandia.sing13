import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseIncomingPayload } from '@/feed/ingest';
import { feedItemToAgentContext } from '@/feed/sanitize';
import {
  DEFAULT_EVENT_FILTERS,
  DEFAULT_INTEGRATIONS,
  DEFAULT_REPO_NAME,
  EMPTY_REPO_FILES,
  WORKSPACE_PEERS,
  emptyFeed,
} from '@/feed/seed';
import type {
  CollabLayoutMode,
  CollabMobileTab,
  CollabPeer,
  ContextMenuAction,
  EventFilterKey,
  IntegrationConfig,
  IntegrationId,
  RepoFileNode,
  UnifiedFeedItem,
} from '@/feed/types';

/** v2 drops persisted demo timelines from v1. */
const FEED_KEY = 'lattice-collaborate-feed-v2';

type UnifiedFeedState = {
  items: UnifiedFeedItem[];
  integrations: IntegrationConfig[];
  eventFilters: Record<EventFilterKey, boolean>;
  peers: CollabPeer[];
  repoFiles: RepoFileNode[];
  repoName: string;
  mobileTab: CollabMobileTab;
  layoutMode: CollabLayoutMode;
  isDocked: boolean;
  dockCollapsed: boolean;
  activeContextFile: RepoFileNode | null;
  contextMenu: { x: number; y: number; file: RepoFileNode } | null;
  pendingAgentPrompt: string | null;
  ingestPayload: (raw: unknown) => UnifiedFeedItem | null;
  setIntegrationEnabled: (id: IntegrationId, enabled: boolean) => void;
  setIntegrationAccount: (id: IntegrationId, accountLabel: string) => void;
  setIntegrationConnection: (
    id: IntegrationId,
    patch: {
      connectionStatus?: IntegrationConfig['connectionStatus'];
      connectionMessage?: string;
      connectionHint?: string;
      enabled?: boolean;
      accountLabel?: string;
    },
  ) => void;
  setEventFilter: (key: EventFilterKey, enabled: boolean) => void;
  setMobileTab: (tab: CollabMobileTab) => void;
  setLayoutMode: (mode: CollabLayoutMode) => void;
  setDocked: (v: boolean) => void;
  setDockCollapsed: (v: boolean) => void;
  openRepoFile: (file: RepoFileNode | null) => void;
  openRepoWorkspace: () => void;
  openRepoFromItem: (item: UnifiedFeedItem) => void;
  setContextMenu: (menu: UnifiedFeedState['contextMenu']) => void;
  runContextAction: (action: ContextMenuAction) => void;
  clearPendingAgentPrompt: () => void;
  visibleItems: () => UnifiedFeedItem[];
  clearFeed: () => void;
  resetWorkspace: () => void;
};

function passesFilters(
  item: UnifiedFeedItem,
  integrations: IntegrationConfig[],
  filters: Record<EventFilterKey, boolean>,
): boolean {
  if (item.platform === 'github' || item.platform === 'gitlab') {
    const id = item.platform === 'gitlab' ? 'gitlab' : 'github';
    if (!integrations.find((i) => i.id === id)?.enabled) return false;
    if (item.kind === 'git_event' && item.git) {
      if (item.git.action === 'commit' && !filters.commits) return false;
      if (item.git.action === 'push' && !filters.pushes) return false;
      if ((item.git.action === 'merge' || item.git.action === 'pr') && !filters.merges) return false;
    }
  }
  if (item.platform === 'facebook') {
    if (!integrations.find((i) => i.id === 'facebook')?.enabled) return false;
    if (item.kind === 'social_post' && !filters.social_posts) return false;
  }
  if (item.platform === 'whatsapp') {
    if (!integrations.find((i) => i.id === 'whatsapp')?.enabled) return false;
    if (item.kind === 'messaging' && !filters.messaging) return false;
  }
  if (item.kind === 'artifact' && item.artifact?.kind === 'whitepaper' && !filters.whitepapers) {
    return false;
  }
  return true;
}

function freshWorkspace() {
  return {
    items: emptyFeed(),
    integrations: DEFAULT_INTEGRATIONS.map((i) => ({ ...i })),
    eventFilters: { ...DEFAULT_EVENT_FILTERS } as Record<EventFilterKey, boolean>,
    peers: WORKSPACE_PEERS.map((p) => ({ ...p })),
    repoFiles: [...EMPTY_REPO_FILES],
    repoName: DEFAULT_REPO_NAME,
  };
}

export const useUnifiedFeed = create<UnifiedFeedState>()(
  persist(
    (set, get) => ({
      ...freshWorkspace(),
      mobileTab: 'home',
      layoutMode: 'feed',
      isDocked: true,
      dockCollapsed: false,
      activeContextFile: null,
      contextMenu: null,
      pendingAgentPrompt: null,

      ingestPayload(raw) {
        const item = parseIncomingPayload(raw);
        if (!item) return null;
        const existing = get().items;
        if (existing.some((i) => i.id === item.id)) return item;
        if (
          item.kind === 'artifact' &&
          item.artifact?.url &&
          existing.some((i) => i.artifact?.url === item.artifact?.url)
        ) {
          return item;
        }
        set((s) => ({ items: [...s.items, item].slice(-200) }));
        return item;
      },

      setIntegrationEnabled(id, enabled) {
        set((s) => ({
          integrations: s.integrations.map((i) =>
            i.id === id
              ? {
                  ...i,
                  enabled,
                  connectionStatus: enabled ? i.connectionStatus : 'idle',
                  connectionMessage: enabled ? i.connectionMessage : undefined,
                  connectionHint: enabled ? i.connectionHint : undefined,
                }
              : i,
          ),
        }));
      },

      setIntegrationAccount(id, accountLabel) {
        set((s) => ({
          integrations: s.integrations.map((i) =>
            i.id === id
              ? {
                  ...i,
                  accountLabel,
                  connectionStatus: 'idle',
                  connectionMessage: undefined,
                  connectionHint: undefined,
                  enabled: false,
                  label:
                    i.id === 'facebook'
                      ? 'Facebook'
                      : i.id === 'whatsapp'
                        ? 'WhatsApp'
                        : i.id === 'github'
                          ? 'GitHub'
                          : 'GitLab',
                }
              : i,
          ),
        }));
      },

      setIntegrationConnection(id, patch) {
        set((s) => ({
          integrations: s.integrations.map((i) => {
            if (i.id !== id) return i;
            const accountLabel =
              patch.accountLabel !== undefined ? patch.accountLabel : i.accountLabel;
            const baseName =
              i.id === 'facebook'
                ? 'Facebook'
                : i.id === 'whatsapp'
                  ? 'WhatsApp'
                  : i.id === 'github'
                    ? 'GitHub'
                    : 'GitLab';
            return {
              ...i,
              ...patch,
              accountLabel,
              label: accountLabel.trim() ? `${baseName} (${accountLabel.trim()})` : baseName,
            };
          }),
        }));
      },

      setEventFilter(key, enabled) {
        set((s) => ({ eventFilters: { ...s.eventFilters, [key]: enabled } }));
      },

      setMobileTab(tab) {
        set({
          mobileTab: tab,
          layoutMode: tab === 'settings' ? 'settings' : 'feed',
          ...(tab !== 'settings' ? { activeContextFile: null } : {}),
        });
      },

      setLayoutMode(mode) {
        set({ layoutMode: mode });
      },

      setDocked(v) {
        set({ isDocked: v });
      },

      setDockCollapsed(v) {
        set({ dockCollapsed: v });
      },

      openRepoFile(file) {
        set({
          activeContextFile: file,
          layoutMode: file ? 'repo' : 'feed',
          isDocked: true,
          dockCollapsed: false,
          contextMenu: null,
        });
      },

      openRepoWorkspace() {
        set({
          layoutMode: 'repo',
          isDocked: true,
          dockCollapsed: false,
          contextMenu: null,
        });
      },

      openRepoFromItem(item) {
        const files = get().repoFiles;
        if (!files.length) {
          get().openRepoWorkspace();
          return;
        }
        if (item.artifact?.path) {
          const match = files.find(
            (f) => f.path === item.artifact?.path || f.name === item.artifact?.title,
          );
          get().openRepoFile(match || files[0]);
          return;
        }
        get().openRepoFile(files[0]);
      },

      setContextMenu(menu) {
        set({ contextMenu: menu });
      },

      runContextAction(action) {
        const menu = get().contextMenu;
        const file = menu?.file || get().activeContextFile;
        set({ contextMenu: null });
        if (!file) return;
        if (action === 'open') {
          get().openRepoFile(file);
          return;
        }
        if (action === 'share') {
          const msg: UnifiedFeedItem = {
            id: `share_${Date.now().toString(36)}`,
            kind: 'chat',
            platform: 'lattice',
            createdAt: new Date().toISOString(),
            actor: 'You',
            sourceLabel: 'Lattice',
            body: `Shared to chat: \`${file.path}\``,
            presenceHue: 'gold',
          };
          set((s) => ({ items: [...s.items, msg], layoutMode: 'repo', isDocked: true }));
          return;
        }
        if (action === 'convert' || action === 'ask_agent') {
          const repo = get().repoName;
          const prompt =
            action === 'convert'
              ? `Convert this workspace context into a task/commit:\nRepo: ${repo}\nFile: ${file.path}\nPropose a focused commit message and checklist.`
              : `Ask agent about \`${file.path}\` in ${repo} — summarize intent and next steps.`;
          set({ pendingAgentPrompt: prompt });
        }
      },

      clearPendingAgentPrompt() {
        set({ pendingAgentPrompt: null });
      },

      visibleItems() {
        const { items, integrations, eventFilters } = get();
        return items
          .filter((i) => passesFilters(i, integrations, eventFilters))
          .slice()
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      },

      clearFeed() {
        set({ items: emptyFeed() });
      },

      resetWorkspace() {
        set({
          ...freshWorkspace(),
          activeContextFile: null,
          contextMenu: null,
          pendingAgentPrompt: null,
          layoutMode: 'feed',
          mobileTab: 'home',
        });
      },
    }),
    {
      name: FEED_KEY,
      partialize: (s) => ({
        items: s.items,
        integrations: s.integrations,
        eventFilters: s.eventFilters,
        repoName: s.repoName,
        isDocked: s.isDocked,
      }),
    },
  ),
);

export { feedItemToAgentContext };
