/** Guest-facing Lattice Chat error copy helpers (tab blur / stream detach). */

/**
 * Cursor/SDK guest errors after tab blur, including the live copy:
 * "Run stream is no longer available"
 */
const STREAM_DETACHED_RE =
  /run\s*stream\s+is\s+no\s+longer\s+available|stream\s+is\s+no\s+longer\s+available|cannot\s+stream\s+this\s+run|no\s+longer\s+available.*stream|stream.*(unavailable|detached)|cannot\s+wait\s+on\s+a\s+detached|detached\s+running\s+run/i;

/** Guest-facing rewrite for recoverable stream detach / tab-return cases. */
export function softenLatticeGuestError(msg: string): string {
  const raw = (msg || '').trim();
  if (!raw) return raw;
  if (STREAM_DETACHED_RE.test(raw)) {
    return 'Live thought stream paused after leaving this tab — tap Check for reply (no page refresh needed).';
  }
  if (/send interrupted/i.test(raw) && /hard refresh/i.test(raw)) {
    return 'Send interrupted — tap Check for reply before re-pasting the prompt.';
  }
  return raw;
}

/** Soft errors should offer Check for reply, not Hard refresh. */
export function isSoftRecoverableLatticeError(msg: string | null | undefined): boolean {
  if (!msg) return false;
  return (
    STREAM_DETACHED_RE.test(msg) ||
    /live thought stream paused|check for reply|still busy|send interrupted|connection hiccup|attaching to|stream went quiet|tab open|no page refresh needed/i.test(
      msg,
    )
  );
}
