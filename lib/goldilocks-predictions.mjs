/**
 * Goldilocks prediction ledger — public forecasts for the *next* Bitcoin block,
 * reconciled against mainnet when the block is awarded. Uses only public mempool.space data.
 */
import crypto from 'node:crypto';
import { redisGetJson, redisSetJson, upstashConfigured } from './upstash.mjs';
import { EGS_PHI, PULSE_CADENCE_SEC, signPayload } from './goldilocks-pulse.mjs';

export const REDIS_KEY = 'qv:goldilocks:predictions:v1';
export const MAX_RESOLVED = 120;
export const SCHEMA = 'goldilocks-prediction/v1';

const memState = globalThis.__qvGoldilocksPredictions || (globalThis.__qvGoldilocksPredictions = {
  open: null,
  resolved: [],
});

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.json();
}

export async function fetchRecentBlocks(limit = 10) {
  const blocks = await fetchJson(`https://mempool.space/api/blocks/${limit}`);
  if (!Array.isArray(blocks) || blocks.length < 2) throw new Error('insufficient blocks');
  return blocks;
}

export async function fetchMempoolSnapshot() {
  try {
    return await fetchJson('https://mempool.space/api/mempool');
  } catch {
    return null;
  }
}

function median(nums) {
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function blockFeesSats(block) {
  return block.extras?.totalFees ?? block.extras?.feeTotal ?? 0;
}

function subsidySatsAtHeight(height) {
  const halvings = Math.floor(height / 210000);
  return Math.floor((50 * 1e8) / 2 ** halvings);
}

/** Format sats for JSON + UI (8 dp BTC). */
export function formatWonAmount(sats) {
  const n = Math.max(0, Math.floor(Number(sats) || 0));
  const btc = (n / 1e8).toFixed(8);
  return {
    sats: n,
    btc,
    label: `${btc} BTC (${n.toLocaleString('en-US')} sats)`,
  };
}

/** Successful = EGS φ interval band hit (cadence forecast, not fee oracle). */
export function isPredictionSuccessful(score) {
  return score?.intervalInPhiBand === true;
}

function buildWouldHaveWon(totalRewardSats, successful) {
  if (!successful || totalRewardSats <= 0) return null;
  const amt = formatWonAmount(totalRewardSats);
  return {
    ...amt,
    plainSpeak:
      'Hypothetical solo block reward (subsidy + fees) if our φ-lock interval had been the winning miner — not paid to us; scoreboard only.',
  };
}

/** Deterministic EGS cadence model from public chain + mempool (not mining hashrate). */
export function computeNextBlockPrediction(tipBlock, recentBlocks, mempool) {
  const tipHeight = tipBlock.height;
  const targetHeight = tipHeight + 1;

  const intervals = [];
  const fees = [];
  for (let i = 0; i < recentBlocks.length - 1; i++) {
    const newer = recentBlocks[i];
    const older = recentBlocks[i + 1];
    intervals.push(Math.max(1, newer.timestamp - older.timestamp));
    fees.push(blockFeesSats(newer));
  }

  const medianIntervalSec = Math.round(median(intervals));
  const meanFees = fees.length ? Math.round(fees.reduce((a, b) => a + b, 0) / fees.length) : 0;
  const mempoolFee = mempool?.total_fee ?? mempool?.totalFee ?? 0;
  const mempoolVsize = mempool?.vsize ?? 0;

  const egsIntervalSec = Math.round(medianIntervalSec / EGS_PHI + medianIntervalSec / (EGS_PHI * EGS_PHI));
  const predictedIntervalSec = Math.max(60, Math.min(3600, egsIntervalSec || medianIntervalSec || PULSE_CADENCE_SEC));
  const bandLowSec = Math.round(predictedIntervalSec / EGS_PHI);
  const bandHighSec = Math.round(predictedIntervalSec * EGS_PHI);

  const predictedTimestamp = tipBlock.timestamp + predictedIntervalSec;
  const predictedFeesSats = Math.max(
    0,
    Math.round(mempoolFee > 0 ? mempoolFee * 0.85 + meanFees * 0.15 : meanFees),
  );

  const predictedSubsidySats = subsidySatsAtHeight(targetHeight);

  const issuedAt = new Date().toISOString();
  const predictionId = `pred-${targetHeight}-${Date.parse(issuedAt)}`;

  const body = {
    schema: SCHEMA,
    predictionId,
    status: 'open',
    issuedAt,
    basedOnTip: {
      height: tipHeight,
      hash: tipBlock.id,
      timestamp: tipBlock.timestamp,
    },
    targetHeight,
    algorithm: {
      name: 'egs-goldilocks-cadence/v1',
      phi: EGS_PHI,
      inputs: ['mempool.space blocks', 'mempool.space /api/mempool'],
      medianIntervalSec,
      egsIntervalSec,
    },
    forecast: {
      predictedIntervalSec,
      intervalBandSec: { low: bandLowSec, high: bandHighSec },
      predictedBlockTimestamp: predictedTimestamp,
      predictedFeesSats,
      predictedSubsidySats,
      predictedTotalRewardSats: predictedSubsidySats + predictedFeesSats,
      wouldHaveWonIfSuccessful: formatWonAmount(predictedSubsidySats + predictedFeesSats),
      mempoolVsizeAtForecast: mempoolVsize,
    },
    plainSpeak:
      'Forecast for the next mainnet block from public data only — not a bet, not mining, not financial advice.',
  };

  const signingSecret = process.env.GOLDILOCKS_PULSE_SECRET || process.env.CATALOG_UPLOAD_SECRET;
  body.signature = signPayload(body, signingSecret);

  return body;
}

export function reconcilePrediction(openPrediction, actualBlock) {
  if (!openPrediction || openPrediction.status !== 'open') return null;
  if (actualBlock.height !== openPrediction.targetHeight) return null;

  const actualTs = actualBlock.timestamp;
  const actualFees = blockFeesSats(actualBlock);
  const actualIntervalSec = actualTs - openPrediction.basedOnTip.timestamp;
  const f = openPrediction.forecast;

  const intervalErrorSec = actualIntervalSec - f.predictedIntervalSec;
  const timestampErrorSec = actualTs - f.predictedBlockTimestamp;
  const feeErrorSats = actualFees - f.predictedFeesSats;
  const feeErrorPct =
    actualFees > 0 ? Math.round((Math.abs(feeErrorSats) / actualFees) * 1000) / 10 : null;
  const intervalInBand =
    actualIntervalSec >= f.intervalBandSec.low && actualIntervalSec <= f.intervalBandSec.high;

  const actualSubsidySats = subsidySatsAtHeight(actualBlock.height);
  const actualTotalRewardSats = actualSubsidySats + actualFees;
  const predictionSuccessful = intervalInBand;

  const resolvedAt = new Date().toISOString();
  const entry = {
    ...openPrediction,
    status: 'resolved',
    resolvedAt,
    actual: {
      height: actualBlock.height,
      hash: actualBlock.id,
      blockTimestamp: actualTs,
      intervalSec: actualIntervalSec,
      feesSats: actualFees,
      subsidySats: actualSubsidySats,
      totalRewardSats: actualTotalRewardSats,
      txCount: actualBlock.tx_count ?? null,
    },
    score: {
      intervalErrorSec,
      timestampErrorSec,
      feeErrorSats,
      feeErrorPct,
      intervalInPhiBand: intervalInBand,
      subsidyExact: actualSubsidySats === f.predictedSubsidySats,
      predictionSuccessful,
    },
    wouldHaveWon: buildWouldHaveWon(actualTotalRewardSats, predictionSuccessful),
  };

  const signingSecret = process.env.GOLDILOCKS_PULSE_SECRET || process.env.CATALOG_UPLOAD_SECRET;
  entry.resolutionSignature = signPayload(
    {
      predictionId: entry.predictionId,
      actual: entry.actual,
      score: entry.score,
      wouldHaveWon: entry.wouldHaveWon,
      resolvedAt,
    },
    signingSecret,
  );

  return entry;
}

async function loadState() {
  if (upstashConfigured()) {
    const row = await redisGetJson(REDIS_KEY);
    if (row) return row;
  }
  return { open: memState.open, resolved: memState.resolved.slice() };
}

async function saveState(state) {
  if (upstashConfigured()) {
    await redisSetJson(REDIS_KEY, state);
  }
  memState.open = state.open;
  memState.resolved = state.resolved.slice(0, MAX_RESOLVED);
}

function summaryStats(resolved) {
  const n = resolved.length;
  if (!n) return { resolvedCount: 0 };
  const inBand = resolved.filter((r) => r.score?.intervalInPhiBand).length;
  const successful = resolved.filter((r) => r.score?.predictionSuccessful);
  const totalWouldHaveWonSats = successful.reduce((s, r) => s + (r.wouldHaveWon?.sats ?? 0), 0);
  const avgIntervalErr =
    Math.round(
      (resolved.reduce((s, r) => s + Math.abs(r.score?.intervalErrorSec ?? 0), 0) / n) * 10,
    ) / 10;
  return {
    resolvedCount: n,
    successfulCount: successful.length,
    intervalInPhiBandPct: Math.round((inBand / n) * 1000) / 10,
    avgAbsIntervalErrorSec: avgIntervalErr,
    totalWouldHaveWon:
      successful.length > 0 ? formatWonAmount(totalWouldHaveWonSats) : null,
  };
}

/**
 * After a new tip block: resolve open prediction (if height matches), open forecast for next block.
 */
export async function runPredictionCycle(tipBlock) {
  const recent = await fetchRecentBlocks(10);
  const mempool = await fetchMempoolSnapshot();
  const state = await loadState();
  let resolvedEntry = null;
  let resolved = state.resolved.slice();

  if (state.open && tipBlock.height >= state.open.targetHeight) {
    const actual =
      tipBlock.height === state.open.targetHeight
        ? tipBlock
        : recent.find((b) => b.height === state.open.targetHeight);
    if (actual) {
      resolvedEntry = reconcilePrediction(state.open, actual);
      if (resolvedEntry) {
        resolved = [
          resolvedEntry,
          ...resolved.filter((r) => r.predictionId !== resolvedEntry.predictionId),
        ].slice(0, MAX_RESOLVED);
      }
    }
  }

  let open = state.open;
  const needNewOpen =
    !open || open.targetHeight <= tipBlock.height || open.basedOnTip.height !== tipBlock.height;
  if (needNewOpen) {
    open = computeNextBlockPrediction(tipBlock, recent, mempool);
  }

  const next = { open, resolved };
  await saveState(next);
  return {
    reconciled: !!resolvedEntry,
    resolvedEntry,
    open: next.open,
    resolved: next.resolved,
    stats: summaryStats(next.resolved),
  };
}

export async function getPredictionLedger() {
  const state = await loadState();
  return {
    schema: SCHEMA,
    cadenceNote: 'One open forecast per tip block; resolved when mainnet awards target height.',
    open: state.open,
    resolved: state.resolved,
    stats: summaryStats(state.resolved),
  };
}

/**
 * Retro-score recent mainnet blocks (synthetic forecasts from prior block + EGS model).
 * Marks entries backfill: true — honest scoreboard bootstrap, not live forecasts we published in time.
 */
export async function backfillPredictionLedger({ count = 24 } = {}) {
  const n = Math.max(2, Math.min(count, MAX_RESOLVED));
  const blocks = await fetchRecentBlocks(n);
  const ascending = [...blocks].sort((a, b) => a.height - b.height);
  const state = await loadState();
  const seen = new Set(state.resolved.map((r) => r.targetHeight));
  let resolved = state.resolved.slice();
  let added = 0;

  for (let i = 1; i < ascending.length; i++) {
    const prev = ascending[i - 1];
    const actual = ascending[i];
    if (seen.has(actual.height)) continue;

    const windowNewestFirst = ascending.slice(Math.max(0, i - 9), i + 1).reverse();
    const syntheticOpen = computeNextBlockPrediction(prev, windowNewestFirst, null);
    syntheticOpen.backfill = true;
    syntheticOpen.issuedAt = new Date(prev.timestamp * 1000 + 1000).toISOString();

    const entry = reconcilePrediction(syntheticOpen, actual);
    if (!entry) continue;
    entry.backfill = true;
    resolved = [entry, ...resolved.filter((r) => r.targetHeight !== actual.height)];
    seen.add(actual.height);
    added += 1;
  }

  const tip = blocks[0];
  const recent = await fetchRecentBlocks(10);
  const mempool = await fetchMempoolSnapshot();
  const open = computeNextBlockPrediction(tip, recent, mempool);

  await saveState({ open, resolved: resolved.slice(0, MAX_RESOLVED) });
  return {
    backfilled: added,
    open,
    resolved: resolved.slice(0, MAX_RESOLVED),
    stats: summaryStats(resolved),
  };
}

/** Run once when ledger is empty so the public scoreboard has history immediately. */
export async function backfillIfEmpty({ count = 24 } = {}) {
  const state = await loadState();
  if (state.resolved.length > 0) {
    return { skipped: true, reason: 'resolved_not_empty', stats: summaryStats(state.resolved) };
  }
  return { skipped: false, ...(await backfillPredictionLedger({ count })) };
}
