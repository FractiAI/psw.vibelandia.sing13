import type { ChatThread } from '@/types';

/** Keep edge cache lean — bloated history + doodle wall share origin quota and can crash the tab. */
export const MAX_PERSISTED_THREADS = 24;
export const MAX_PERSISTED_MESSAGE_CHARS = 24_000;

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
  maxChars = MAX_PERSISTED_MESSAGE_CHARS,
): ChatThread[] {
  const sorted = [...threads].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  return sorted.slice(0, max).map((t) => ({
    ...t,
    messages: (t.messages || []).map((m) => {
      const { transcript: _transcript, ...rest } = m;
      const content = String(rest.content || '');
      // Cap edge cache size — huge assistant dumps can blow quota and white-screen rehydrate.
      return {
        ...rest,
        content: content.length > maxChars ? `${content.slice(0, maxChars)}\n…` : content,
      };
    }),
  }));
}
