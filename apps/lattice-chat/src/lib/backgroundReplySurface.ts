/**
 * Background-tab reply surface — when the tab blurs, browsers throttle timers and
 * Cursor cloud SSE often detaches. A zombie `primaryStreamLive` flag then blocks
 * recover, so the finished reply never appears and Player 1 has to nudge
 * ("Update me on last request" / "response not shown since I was in background mode").
 *
 * Brief blips keep the primary stream. Real leaves abort the zombie and recover.
 * Long cloud runs also get a sending-phase flush poll so we do not wait forever
 * for stuck/recovering that never arrives while timers are throttled.
 */

/** Keep primary SSE through accidental focus flickers. */
export const BACKGROUND_BLIP_MS = 2_500;

/**
 * After this away / pending age, force abort+recover even if phase is still
 * "sending" with a supposedly-live primary (zombie SSE under background throttle).
 */
export const BACKGROUND_FORCE_RECOVER_MS = 8_000;

/** How often to poll flush while a turn is awaiting (visible or hidden). */
export const BACKGROUND_FLUSH_POLL_MS = 12_000;

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
  pendingAgeMs?: number;
}): BackgroundResumeDecision {
  if (!opts.awaitingAssistant) return { action: 'noop' };
  if (!opts.sending && opts.sendPhase === 'idle' && !opts.hasPending) {
    return { action: 'noop' };
  }

  const away = Math.max(0, opts.awayMs || 0);
  const pendingAge = Math.max(0, opts.pendingAgeMs ?? away);

  // Long-running cloud turn: do not trust a "live" primary after a real leave
  // or after the pending age crosses the force threshold (hidden timers stall).
  const force =
    away >= BACKGROUND_FORCE_RECOVER_MS || pendingAge >= BACKGROUND_FORCE_RECOVER_MS;

  if (opts.primaryStreamLive) {
    if (!force && away < BACKGROUND_BLIP_MS) return { action: 'keep_primary' };
    return { action: 'abort_and_recover' };
  }

  // Brief leave while still in initial "sending" — give primary a moment.
  if (
    !force &&
    opts.sending &&
    opts.sendPhase === 'sending' &&
    away < BACKGROUND_BLIP_MS
  ) {
    return { action: 'keep_primary' };
  }

  return { action: 'recover' };
}

/**
 * Whether Check-for-reply / visibility recover should kill a live primary SSE
 * instead of no-oping (the old bug that hid finished background replies).
 * Pending may have been cleared while the last message is still the user —
 * still abort the zombie so recover can attach to the finished cloud run.
 */
export function shouldAbortZombiePrimaryForRecover(opts: {
  primaryStreamLive: boolean;
  hasPending: boolean;
  awaitingAssistant: boolean;
}): boolean {
  return Boolean(opts.primaryStreamLive && opts.awaitingAssistant);
}

/**
 * Auto-flush poll should run not only in stuck/recovering, but also while still
 * marked "sending" once the pending turn is old enough — background tabs often
 * never flip phase because the status/watchdog timers are throttled.
 */
export function shouldPollBackgroundFlush(opts: {
  awaitingAssistant: boolean;
  sending: boolean;
  sendPhase: string;
  hasPending: boolean;
  pendingAgeMs: number;
  documentHidden: boolean;
}): boolean {
  if (!opts.awaitingAssistant) return false;
  if (!opts.hasPending && !opts.sending) return false;

  if (opts.sendPhase === 'stuck' || opts.sendPhase === 'recovering') return true;

  // Still "sending" but old / hidden — treat as flush candidate.
  if (opts.sendPhase === 'sending' || opts.sending) {
    if (opts.documentHidden) return true;
    if (opts.pendingAgeMs >= BACKGROUND_FORCE_RECOVER_MS) return true;
  }

  return false;
}

/**
 * Focus / pageshow without a prior visibilitychange (embedded webviews, IDE
 * panes) still need a recover when the pending turn is old.
 */
export function shouldRecoverOnFocusWithoutHide(opts: {
  awaitingAssistant: boolean;
  hasPending: boolean;
  pendingAgeMs: number;
}): boolean {
  return Boolean(
    opts.awaitingAssistant &&
      opts.hasPending &&
      opts.pendingAgeMs >= BACKGROUND_FORCE_RECOVER_MS,
  );
}
