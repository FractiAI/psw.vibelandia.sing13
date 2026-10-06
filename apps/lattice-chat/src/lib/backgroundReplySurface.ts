/**
 * Background-tab reply surface — when the tab blurs, browsers throttle timers and
 * Cursor cloud SSE often detaches. A zombie `primaryStreamLive` flag then blocks
 * recover, so the finished reply never appears and Player 1 has to nudge
 * ("Update me on last request" / "response not shown since I was in background mode").
 *
 * Brief blips keep the primary stream. Real leaves abort the zombie and recover.
 * Long cloud runs also get a sending-phase flush poll so we do not wait forever
 * for stuck/recovering that never arrives while timers are throttled.
 *
 * Long-period lock (2026-10): never abort Agent.create before an agentId lands
 * (unless the create grace expires), never clear pending on background abort
 * without an id, and treat thread.agentId as enough to keep the working UI /
 * resume recover after a page discard.
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

/**
 * Do not abort a live primary for background flush until Agent.create has had
 * this long to emit `agentId`. Aborting earlier clears the only handle we have
 * to the cloud run and is why long background leaves lose the reply.
 * Matches IDLE_ABORT_MS in api.ts (create / first-byte grace).
 */
export const BACKGROUND_CREATE_GRACE_MS = 90_000;

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
  /** Cloud agent id on pending or thread — required to safely abort+recover. */
  hasAgentId?: boolean;
}): BackgroundResumeDecision {
  if (!opts.awaitingAssistant) return { action: 'noop' };
  // Awaiting + thread agentId (pending cleared) still needs a recover pass.
  if (
    !opts.sending &&
    opts.sendPhase === 'idle' &&
    !opts.hasPending &&
    !opts.hasAgentId
  ) {
    return { action: 'noop' };
  }

  const away = Math.max(0, opts.awayMs || 0);
  const pendingAge = Math.max(0, opts.pendingAgeMs ?? away);
  const hasAgentId = Boolean(opts.hasAgentId);

  // Long-running cloud turn: do not trust a "live" primary after a real leave
  // or after the pending age crosses the force threshold (hidden timers stall).
  const force =
    away >= BACKGROUND_FORCE_RECOVER_MS || pendingAge >= BACKGROUND_FORCE_RECOVER_MS;

  if (opts.primaryStreamLive) {
    if (!force && away < BACKGROUND_BLIP_MS) return { action: 'keep_primary' };
    // No agentId yet — killing primary drops the create stream with nothing to
    // attach to. Keep primary through create grace; only abort after grace.
    if (!hasAgentId && pendingAge < BACKGROUND_CREATE_GRACE_MS) {
      return { action: 'keep_primary' };
    }
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

  // Without agentId / pending there is nothing to recover yet.
  if (!opts.hasPending && !hasAgentId) return { action: 'noop' };

  return { action: 'recover' };
}

/**
 * Whether Check-for-reply / visibility recover should kill a live primary SSE
 * instead of no-oping (the old bug that hid finished background replies).
 * Pending may have been cleared while the last message is still the user —
 * still abort the zombie so recover can attach to the finished cloud run.
 *
 * Do not abort during Agent.create (no agentId) unless create grace expired.
 */
export function shouldAbortZombiePrimaryForRecover(opts: {
  primaryStreamLive: boolean;
  hasPending: boolean;
  awaitingAssistant: boolean;
  hasAgentId?: boolean;
  pendingAgeMs?: number;
}): boolean {
  if (!opts.primaryStreamLive || !opts.awaitingAssistant) return false;
  if (opts.hasAgentId) return true;
  const age = Math.max(0, opts.pendingAgeMs ?? 0);
  return age >= BACKGROUND_CREATE_GRACE_MS;
}

/**
 * Auto-flush poll should run not only in stuck/recovering, but also while still
 * marked "sending" once the pending turn is old enough — background tabs often
 * never flip phase because the status/watchdog timers are throttled.
 *
 * Also run when we only have a thread agentId (pending wiped) so long leaves
 * still re-attach.
 */
export function shouldPollBackgroundFlush(opts: {
  awaitingAssistant: boolean;
  sending: boolean;
  sendPhase: string;
  hasPending: boolean;
  pendingAgeMs: number;
  documentHidden: boolean;
  hasAgentId?: boolean;
}): boolean {
  if (!opts.awaitingAssistant) return false;
  if (!opts.hasPending && !opts.sending && !opts.hasAgentId) return false;

  if (opts.sendPhase === 'stuck' || opts.sendPhase === 'recovering') return true;

  // Still "sending" but old / hidden — treat as flush candidate.
  if (opts.sendPhase === 'sending' || opts.sending) {
    if (opts.documentHidden) return true;
    if (opts.pendingAgeMs >= BACKGROUND_FORCE_RECOVER_MS) return true;
  }

  // Pending wiped but thread still has agentId + awaiting user turn.
  if (opts.hasAgentId && (opts.documentHidden || opts.pendingAgeMs >= BACKGROUND_FORCE_RECOVER_MS)) {
    return true;
  }

  return false;
}

/**
 * Whether a background flush tick should abort the live primary.
 * Never abort before agentId during create grace — that is the long-period
 * missing-output root cause.
 */
export function shouldAbortPrimaryForBackgroundFlush(opts: {
  primaryStreamLive: boolean;
  hasAgentId: boolean;
  pendingAgeMs: number;
}): boolean {
  if (!opts.primaryStreamLive) return false;
  if (opts.hasAgentId) return true;
  return opts.pendingAgeMs >= BACKGROUND_CREATE_GRACE_MS;
}

/**
 * Focus / pageshow without a prior visibilitychange (embedded webviews, IDE
 * panes) still need a recover when the pending turn is old — or when we still
 * hold a thread agentId after pending was cleared.
 */
export function shouldRecoverOnFocusWithoutHide(opts: {
  awaitingAssistant: boolean;
  hasPending: boolean;
  pendingAgeMs: number;
  hasAgentId?: boolean;
}): boolean {
  if (!opts.awaitingAssistant) return false;
  if (!opts.hasPending && !opts.hasAgentId) return false;
  // With agentId only (no pending age), still recover — long leave + cleared pending.
  if (opts.hasAgentId && !opts.hasPending) return true;
  return opts.pendingAgeMs >= BACKGROUND_FORCE_RECOVER_MS;
}

/**
 * pagehide / freeze kick: abort zombie primary only when we can recover
 * (have agentId) or create grace already expired.
 */
export function shouldKickRecoverOnPageHide(opts: {
  awaitingAssistant: boolean;
  primaryStreamLive: boolean;
  hasAgentId: boolean;
  pendingAgeMs: number;
  hasPending: boolean;
}): boolean {
  if (!opts.awaitingAssistant) return false;
  if (!opts.hasPending && !opts.hasAgentId) return false;
  if (!opts.primaryStreamLive) return opts.hasAgentId || opts.hasPending;
  return shouldAbortPrimaryForBackgroundFlush({
    primaryStreamLive: true,
    hasAgentId: opts.hasAgentId,
    pendingAgeMs: opts.pendingAgeMs,
  });
}

/**
 * Abort during Agent.create used to clear pending and hide the turn. Background
 * aborts must retain pending so Check / visibility can re-attach or re-send.
 */
export function shouldRetainPendingOnAbort(opts: {
  hasAgentId: boolean;
  abortReason: 'user' | 'background' | 'watchdog' | null | undefined;
}): boolean {
  if (opts.hasAgentId) return true;
  return opts.abortReason === 'background' || opts.abortReason === 'watchdog';
}
