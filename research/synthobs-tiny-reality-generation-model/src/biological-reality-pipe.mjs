/**
 * Biological Reality Stream Pipe — Soft Story architecture layer for TRGM.
 *
 * Canonical rate: **10 bits per second**.
 * This pipe is the rate-limited biological reality stream that feeds the
 * three-symbol (wave / node / fq) cyclic input into the polygon-spin clock
 * and Infinite Octave rhyme tree on folded DNA.
 *
 * Honesty: architectural Soft Story bandwidth analogy for a narrow biological
 * / conscious channel — not a measured neural bitrate, not wet-lab proof,
 * not gene→physics causation.
 */
import {
  BIO_REALITY_PIPE_BIT_RATE_BPS,
  BIO_REALITY_PIPE_KIND,
  BIO_REALITY_PIPE_ROLE,
} from './constants.mjs';

/** Default stream length matches 9-gon × 3 cycles (triadic lab defaults). */
export const BIO_PIPE_DEFAULT_STREAM_LENGTH = 27;

/** Shannon bits per ternary symbol (Σ={0,1,2}). */
export function bitsPerTernarySymbol() {
  return Math.log2(3);
}

/** Symbols per second at the canonical bio-pipe bit rate. */
export function symbolsPerSecond(bitRateBps = BIO_REALITY_PIPE_BIT_RATE_BPS) {
  return bitRateBps / bitsPerTernarySymbol();
}

/**
 * Build the biological reality stream pipe descriptor.
 * Duration and information budget follow from stream length × alphabet bits / rate.
 */
export function buildBiologicalRealityPipe({
  bitRateBps = BIO_REALITY_PIPE_BIT_RATE_BPS,
  streamLength = BIO_PIPE_DEFAULT_STREAM_LENGTH,
} = {}) {
  const alphabetBits = bitsPerTernarySymbol();
  const symPerSec = bitRateBps / alphabetBits;
  const durationSec = streamLength / symPerSec;
  const informationBits = streamLength * alphabetBits;
  const effectiveBitRateBps = informationBits / durationSec;

  return {
    schema: 'trgm-biological-reality-pipe/v1',
    kind: BIO_REALITY_PIPE_KIND,
    role: BIO_REALITY_PIPE_ROLE,
    bitRateBps,
    alphabet: Object.freeze([0, 1, 2]),
    alphabetBits,
    symbolsPerSecond: symPerSec,
    streamLength,
    durationSec,
    informationBits,
    effectiveBitRateBps,
    channelMap: Object.freeze({ 0: 'wave', 1: 'node', 2: 'fq' }),
    honesty:
      'Architectural Soft Story bandwidth (10 bit/s biological reality stream) — not measured neural bitrate, not wet-lab genetics, not gene→physics.',
  };
}

/**
 * Schedule a ternary stream onto the bio pipe — each tick gets a wall-clock
 * time and cumulative bit budget under the 10 bit/s rate.
 */
export function scheduleStreamOnBioPipe(streamSymbols, pipe) {
  const dt = 1 / pipe.symbolsPerSecond;
  return streamSymbols.map((symbol, t) => ({
    t,
    symbol,
    channel: pipe.channelMap[symbol],
    timeSec: t * dt,
    cumulativeBits: (t + 1) * pipe.alphabetBits,
    instantaneousBitRateBps: pipe.bitRateBps,
  }));
}

/**
 * Attach the bio pipe to a TRGM stack (full architecture path).
 */
export function attachBioPipeToStack(stack, { bitRateBps = BIO_REALITY_PIPE_BIT_RATE_BPS } = {}) {
  const pipe = buildBiologicalRealityPipe({
    bitRateBps,
    streamLength: stack.stream.stream.length,
  });
  const schedule = scheduleStreamOnBioPipe(stack.stream.stream, pipe);
  return {
    ...stack,
    bioPipe: pipe,
    bioSchedule: schedule,
  };
}

/** Rate lock: effective rate matches canonical 10 bit/s within epsilon. */
export function bioPipeRateLocked(pipe, { epsilon = 1e-9 } = {}) {
  return (
    pipe != null &&
    pipe.kind === BIO_REALITY_PIPE_KIND &&
    pipe.bitRateBps === BIO_REALITY_PIPE_BIT_RATE_BPS &&
    Math.abs(pipe.effectiveBitRateBps - BIO_REALITY_PIPE_BIT_RATE_BPS) < epsilon &&
    pipe.streamLength > 0 &&
    pipe.durationSec > 0
  );
}
