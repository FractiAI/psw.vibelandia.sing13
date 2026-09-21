/**
 * Decide whether playlist advance should ride the hidden handoff <audio>
 * (background / lock-screen play) instead of the foreground element.
 * Mirrors `lib/background-handoff.mjs` for the Vite app bundle.
 */
export function shouldAdvanceOnBackgroundHandoff(opts: {
  allowBackgroundPlay: boolean;
  documentHidden: boolean;
  hasBackgroundElement: boolean;
  handoffAlreadyActive?: boolean;
}): boolean {
  if (!opts.allowBackgroundPlay || !opts.documentHidden || !opts.hasBackgroundElement) {
    return false;
  }
  return true;
}
