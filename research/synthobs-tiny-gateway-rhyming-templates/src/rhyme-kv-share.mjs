/**
 * Organizational rhyme-KV share accounting.
 *
 * Matching attention cells across nested-story organization are stored once;
 * non-matching cells stay private per session. The matching-cell fraction must
 * come from a tensor meter (fixture or live lab) — not a JSON byte fraction.
 *
 * Serving may claim the residency saving only when spliced-cache resume is
 * logit-equivalent (`claimableShare`). Blind reuse of another prompt's full
 * cache is a contrast case, not this path.
 */

/** Published distilgpt2 rhymeSharing.matchingCellFraction (slot_every=8). */
export const MEASURED_DISTILGPT2_MATCHING_CELL_FRACTION = 0.14583333333333334;
export const MEASURED_DISTILGPT2_CLAIMABLE_SHARE = false;
export const MEASURED_DISTILGPT2_SOURCE =
  'tiny-footprint-workstation llm lab · distilgpt2 rhymeSharing.matchingCellFraction (slot_every=8)';

/**
 * @param {number} fullKvBytesOneSession
 * @param {number} matchingCellFraction
 * @param {number} sessions
 */
export function rhymeKvResidencyBytes(fullKvBytesOneSession, matchingCellFraction, sessions) {
  if (!(sessions >= 1)) throw new Error('sessions must be >= 1');
  const fraction = Math.min(1, Math.max(0, Number(matchingCellFraction) || 0));
  const shared = fraction * fullKvBytesOneSession;
  const privateBytes = (1 - fraction) * fullKvBytesOneSession;
  const naive = sessions * fullKvBytesOneSession;
  const rhymeKv = shared + sessions * privateBytes;
  return {
    sessions,
    fullKvBytesOneSession,
    matchingCellFraction: fraction,
    sharedSpineBytes: Math.round(shared),
    privateBytesPerSession: Math.round(privateBytes),
    naiveBytes: naive,
    rhymeKvBytes: Math.round(rhymeKv),
    reductionVersusNaive: naive === 0 ? 0 : 1 - rhymeKv / naive,
    reductionVersusPrefixWhenNoExactHits: naive === 0 ? 0 : 1 - rhymeKv / naive,
  };
}

/**
 * Contrast: JSON organizational fraction applied as if it were KV (hypothesis only).
 * @param {number} fullKvBytesOneSession
 * @param {number} jsonSharedOrgFraction
 * @param {number} sessions
 */
export function jsonHypothesisKvResidency(fullKvBytesOneSession, jsonSharedOrgFraction, sessions) {
  return {
    ...rhymeKvResidencyBytes(fullKvBytesOneSession, jsonSharedOrgFraction, sessions),
    shareSource: 'JSON template/delta byte fraction — KV residency hypothesis, not a tensor meter',
    claimableShare: false,
  };
}

/**
 * Measured-cells arm for the research suite (deterministic fixture).
 */
/** Llama-2-7B-shaped one-session KV bytes on the H100 sim profile (org+suffix). */
export const H100_PROFILE_ONE_SESSION_KV_BYTES = (2048 + 128) * 524288;

export function measuredRhymeKvShareReport({
  fullKvBytesOneSession = H100_PROFILE_ONE_SESSION_KV_BYTES,
  sessions = 16,
  matchingCellFraction = MEASURED_DISTILGPT2_MATCHING_CELL_FRACTION,
  claimableShare = MEASURED_DISTILGPT2_CLAIMABLE_SHARE,
} = {}) {
  const residency = rhymeKvResidencyBytes(fullKvBytesOneSession, matchingCellFraction, sessions);
  return {
    id: 'T_rhyme_kv_share',
    path: 'organizational_rhyme_kv_splice',
    matchingCellFraction,
    claimableShare,
    shareSource: MEASURED_DISTILGPT2_SOURCE,
    residency,
    vsPrefixWhenWordingDiffers: {
      prefixShares: false,
      rhymeKvReductionVersusPrefix: residency.reductionVersusPrefixWhenNoExactHits,
    },
    honesty:
      'Rhyme-KV shares matching attention cells across nested-story organization. ' +
      'Residency uses measured matchingCellFraction. claimableShare requires spliced-cache ' +
      'logit equivalence on the tensor lab; JSON fractions are not KV compression factors.',
  };
}
