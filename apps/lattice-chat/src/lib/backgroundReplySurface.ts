/**
 * Background-tab reply surface — when the tab blurs, browsers throttle timers and
 * Cursor cloud SSE often detaches. A zombie `primaryStreamLive` flag then blocks
 * recover, so the finished reply never appears and Player 1 has to nudge
 * ("Update me on last request").
 *
 * Brief blips keep the primary stream. Real leaves abort the zombie and recover.
 */

/** Keep primary SSE through accidental focus flickers. */
export const BACKGROUND_BLIP_MS = 2_500;

export type BackgroundResumeDecision =
  | { action: 'noop' }
  | { action: 'keep_primary' }
  | { action: 'abort_and_recover' }
  | { action: 'recover' };

/**
 * Decide what to do when the tab / page becomes visible again while a turn
 * is still awaiting an assistant reply.
 */
export function decideBackgroundResume(opts: {
  awaitingAssistant: boolean;
  sending: boolean;
  sendPhase: string;
  hasPending: boolean;
  primaryStreamLive: boolean;
  awayMs: number;
}): BackgroundResumeDecision {
  if (!opts.awaitingAssistant) return { action: 'noop' };
  if (!opts.sending && opts.sendPhase === 'idle' && !opts.hasPending) {
    return { action: 'noop' };
  }

  const away = Math.max(0, opts.awayMs || 0);

  if (opts.primaryStreamLive) {
    if (away < BACKGROUND_BLIP_MS) return { action: 'keep_primary' };
    return { action: 'abort_and_recover' };
  }

  // Brief leave while still in initial "sending" — give primary a moment.
  if (opts.sending && opts.sendPhase === 'sending' && away < BACKGROUND_BLIP_MS) {
    return { action: 'keep_primary' };
  }

  return { action: 'recover' };
}

/**
 * Whether Check-for-reply / visibility recover should kill a live primary SSE
 * instead of no-oping (the old bug that hid finished background replies).
 */
export function shouldAbortZombiePrimaryForRecover(opts: {
  primaryStreamLive: boolean;
  hasPending: boolean;
  awaitingAssistant: boolean;
}): boolean {
  return Boolean(
    opts.primaryStreamLive && opts.hasPending && opts.awaitingAssistant,
  );
}
