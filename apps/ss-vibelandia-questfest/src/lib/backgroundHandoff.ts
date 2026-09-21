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

/**
 * Start a second-element handoff only when the primary stream is already
 * stalled after hide. If primary is still audible, leave it alone (desktop).
 */
export function shouldStartBackgroundHandoff(opts: {
  allowBackgroundPlay: boolean;
  documentHidden: boolean;
  hasBackgroundElement: boolean;
  primaryStillAudible: boolean;
  handoffAlreadyAudible?: boolean;
}): boolean {
  if (!opts.allowBackgroundPlay || !opts.documentHidden || !opts.hasBackgroundElement) {
    return false;
  }
  if (opts.primaryStillAudible) return false;
  if (opts.handoffAlreadyAudible) return false;
  return true;
}
