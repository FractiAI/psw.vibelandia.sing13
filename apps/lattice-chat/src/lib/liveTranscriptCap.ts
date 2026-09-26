import type { TranscriptItem } from '@/types';

/** Bound live thought stream so huge SSE dumps cannot OOM / white-screen the tab. */
export const MAX_LIVE_TRANSCRIPT_ITEMS = 80;
export const MAX_LIVE_ASSISTANT_CHARS = 80_000;

export function capLiveTranscriptItems(
  items: TranscriptItem[],
  maxItems = MAX_LIVE_TRANSCRIPT_ITEMS,
  maxAssistantChars = MAX_LIVE_ASSISTANT_CHARS,
): TranscriptItem[] {
  if (!Array.isArray(items) || !items.length) return items || [];
  let next = items;
  const last = next[next.length - 1];
  if (
    last &&
    last.type === 'assistant' &&
    typeof last.text === 'string' &&
    last.text.length > maxAssistantChars
  ) {
    next = [
      ...next.slice(0, -1),
      { ...last, text: `${last.text.slice(0, maxAssistantChars)}\n…` },
    ];
  }
  if (next.length > maxItems) {
    next = next.slice(-maxItems);
  }
  return next;
}

/** Merge one live transcript item the same way the store does, then cap. */
export function mergeLiveTranscriptItem(
  items: TranscriptItem[],
  item: TranscriptItem,
): TranscriptItem[] {
  const next = [...items];
  if (item.type === 'assistant' && next.length) {
    const last = next[next.length - 1];
    if (last.type === 'assistant') {
      next[next.length - 1] = {
        ...last,
        text: `${last.text || ''}${item.text || ''}`,
      };
      return capLiveTranscriptItems(next);
    }
  }
  if (item.type === 'thinking' && next.length) {
    const last = next[next.length - 1];
    if (last.type === 'thinking' && item.durationMs == null) {
      next[next.length - 1] = {
        ...last,
        text: `${last.text || ''}${item.text || ''}`,
      };
      return capLiveTranscriptItems(next);
    }
  }
  if (item.type === 'tool_call' && item.callId) {
    const idx = next.findIndex((x) => x.type === 'tool_call' && x.callId === item.callId);
    if (idx >= 0) {
      next[idx] = { ...next[idx], ...item };
      return capLiveTranscriptItems(next);
    }
  }
  next.push(item);
  return capLiveTranscriptItems(next);
}
