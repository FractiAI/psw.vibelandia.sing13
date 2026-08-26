import type { ChatThread } from '@/types';

export const MAX_PERSISTED_THREADS = 40;

/** Past chats a signed-in seat can pick — keep the active draft visible too. */
export function listSelectableChats(
  threads: ChatThread[],
  activeThreadId: string | null,
): ChatThread[] {
  return [...threads]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .filter((t) => (t.messages || []).length > 0 || t.id === activeThreadId);
}

/** Drop live transcripts so localStorage quota cannot wipe chat history. */
export function slimThreadsForPersist(
  threads: ChatThread[],
  max = MAX_PERSISTED_THREADS,
): ChatThread[] {
  const sorted = [...threads].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  return sorted.slice(0, max).map((t) => ({
    ...t,
    messages: (t.messages || []).map((m) => {
      const { transcript: _transcript, ...rest } = m;
      return rest;
    }),
  }));
}
