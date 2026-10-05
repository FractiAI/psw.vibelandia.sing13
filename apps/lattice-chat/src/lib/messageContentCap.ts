/**
 * Cap live chat message bodies so mega pastes / long agent dumps cannot
 * freeze or white-screen the tab during render or persist.
 */

/** Soft ceiling for in-memory thread messages (persist uses a tighter slim). */
export const MAX_LIVE_MESSAGE_CHARS = 100_000;

/** Initial markdown parse budget — remark-gfm on 100k+ freezes / crashes the tab. */
export const MAX_MARKDOWN_RENDER_CHARS = 32_000;

export function capMessageContent(
  text: string,
  maxChars = MAX_LIVE_MESSAGE_CHARS,
): string {
  const raw = String(text ?? '');
  if (raw.length <= maxChars) return raw;
  return `${raw.slice(0, maxChars)}\n…`;
}

export function markdownRenderSlice(
  text: string,
  maxChars = MAX_MARKDOWN_RENDER_CHARS,
): { visible: string; truncated: boolean; totalChars: number } {
  const raw = String(text ?? '');
  if (raw.length <= maxChars) {
    return { visible: raw, truncated: false, totalChars: raw.length };
  }
  return {
    visible: `${raw.slice(0, maxChars)}\n…`,
    truncated: true,
    totalChars: raw.length,
  };
}
