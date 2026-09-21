/**
 * Decide whether playlist advance should ride the hidden handoff <audio>
 * (background / lock-screen play) instead of the foreground element.
 */
export function shouldAdvanceOnBackgroundHandoff(opts) {
  if (!opts?.allowBackgroundPlay || !opts?.documentHidden || !opts?.hasBackgroundElement) {
    return false;
  }
  return true;
}
