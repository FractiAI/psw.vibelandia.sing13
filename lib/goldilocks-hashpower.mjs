/**
 * EGS Goldilocks hashpower simulation — full PoW race model on public network stats.
 * Uses live mempool.space hashrate + difficulty; sim fleet from env (not real ASICs on Vercel).
 */
import crypto from 'node:crypto';

const HASHES_PER_BLOCK_SCALE = 2 ** 32;
const MEMPOOL_HASHRATE_URL = 'https://mempool.space/api/v1/mining/hashrate/1w';
const DEFAULT_SIM_HASHRATE_HS = 1.618e15; // 1.618 PH/s — EGS story default

let cachedMining = null;
let cacheAt = 0;
const CACHE_MS = 120_000;

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.json();
}

/** Live network hashrate (H/s) and difficulty from mempool.space mining API. */
export async function fetchNetworkMiningSnapshot({ force = false } = {}) {
  const now = Date.now();
  if (!force && cachedMining && now - cacheAt < CACHE_MS) return cachedMining;
  const data = await fetchJson(MEMPOOL_HASHRATE_URL);
  const snap = {
    networkHashrateHs: data.currentHashrate,
    difficulty: data.currentDifficulty,
    difficultyAdjustment: data.difficulty?.[data.difficulty.length - 1]?.adjustment ?? null,
    tipHeightFromDifficulty: data.difficulty?.[data.difficulty.length - 1]?.height ?? null,
    fetchedAt: new Date().toISOString(),
    source: MEMPOOL_HASHRATE_URL,
  };
  cachedMining = snap;
  cacheAt = now;
  return snap;
}

/** Simulated fleet hashrate (H/s) — env fraction of network or fixed PH/s default. */
export function getSimulatedHashrateHs(networkHashrateHs) {
  const fracRaw = process.env.COHERENCE_SIM_HASHRATE_FRACTION;
  if (fracRaw != null && fracRaw !== '') {
    const frac = Number(fracRaw);
    if (Number.isFinite(frac) && frac > 0 && networkHashrateHs > 0) {
      return networkHashrateHs * frac;
    }
  }
  const fixed = Number(process.env.COHERENCE_SIM_HASHRATE_H);
  if (Number.isFinite(fixed) && fixed > 0) return fixed;
  return DEFAULT_SIM_HASHRATE_HS;
}

/**
 * Full-interval PoW simulation for one block height.
 * Deterministic lottery from block id + hashrates (reproducible scoreboard).
 */
export function simulatePowForBlock({
  blockId,
  targetHeight,
  intervalSec,
  ourHashrateHs,
  networkHashrateHs,
  difficulty,
}) {
  const network = Math.max(1, Number(networkHashrateHs) || 1);
  const our = Math.max(1, Number(ourHashrateHs) || 1);
  const interval = Math.max(1, Number(intervalSec) || 600);
  const diff = Math.max(1, Number(difficulty) || 1);

  const networkShare = our / network;
  const expectedHashesPerBlock = diff * HASHES_PER_BLOCK_SCALE;
  const ourHashesInWindow = Math.round(our * interval);
  const networkHashesInWindow = Math.round(network * interval);

  // P(network finds ≥1 block in Δt) ≈ 1 - exp(-λ_net * Δt), λ_net ≈ network / (D·2^32)
  const lambdaNet = network / expectedHashesPerBlock;
  const lambdaOur = our / expectedHashesPerBlock;
  const pNetworkFindsInWindow = 1 - Math.exp(-lambdaNet * interval);
  const pOurFindsInWindow = 1 - Math.exp(-lambdaOur * interval);

  // Single-block race when mainnet awards this height: our share of global hashrate
  const pWinThisBlock = Math.min(0.999999, networkShare);

  const seed = crypto
    .createHash('sha256')
    .update(`egs-pow-sim/v1:${blockId}:${targetHeight}:${our}:${network}:${interval}`)
    .digest();
  const roll = seed.readUInt32BE(0) / 0xffffffff;
  const simulatedPowWin = roll < pWinThisBlock;

  return {
    schema: 'egs-pow-sim/v1',
    simulatedHashrateHs: our,
    simulatedHashrateLabel: formatHashrate(our),
    networkHashrateHs: network,
    networkHashrateLabel: formatHashrate(network),
    networkSharePct: Number((networkShare * 100).toFixed(6)),
    intervalSec: interval,
    difficulty: diff,
    expectedHashesPerBlock: Math.round(expectedHashesPerBlock),
    ourHashesInWindow,
    networkHashesInWindow,
    ourHashesVsDifficultyPct: roundPct((ourHashesInWindow / expectedHashesPerBlock) * 100),
    pWinThisBlock: roundPct(pWinThisBlock * 100) / 100,
    pOurFindsInWindow: roundPct(pOurFindsInWindow * 100) / 100,
    pNetworkFindsInWindow: roundPct(pNetworkFindsInWindow * 100) / 100,
    powLotteryRoll: roundPct(roll * 100) / 100,
    simulatedPowWin,
    plainSpeak:
      'Simulated Proof-of-Work: we hash against live network difficulty for the block window. ' +
      'Win roll is deterministic from the awarded block hash + our sim hashrate share — verifiable, not live mining.',
  };
}

/** Open-forecast PoW expectations (no block id yet — no lottery roll). */
export function forecastPowExpectation({
  tipBlockId,
  targetHeight,
  intervalSec,
  ourHashrateHs,
  networkHashrateHs,
  difficulty,
}) {
  const sim = simulatePowForBlock({
    blockId: tipBlockId || `forecast-${targetHeight}`,
    targetHeight,
    intervalSec,
    ourHashrateHs,
    networkHashrateHs,
    difficulty,
  });
  return {
    ...sim,
    resolved: false,
    simulatedPowWin: null,
    powLotteryRoll: null,
    plainSpeak:
      'Forecast phase: shows sim hashrate vs network and win odds for the interval. ' +
      'Lottery roll is applied when mainnet awards the block.',
  };
}

export async function attachHashpowerToForecast(forecastBody, tipBlock, intervalSec) {
  const mining = await fetchNetworkMiningSnapshot();
  const ourH = getSimulatedHashrateHs(mining.networkHashrateHs);
  const pow = forecastPowExpectation({
    tipBlockId: tipBlock.id,
    targetHeight: forecastBody.targetHeight,
    intervalSec: intervalSec ?? forecastBody.forecast?.predictedIntervalSec,
    ourHashrateHs: ourH,
    networkHashrateHs: mining.networkHashrateHs,
    difficulty: mining.difficulty,
  });
  return {
    miningSnapshot: mining,
    simulatedHashrateHs: ourH,
    powSimulation: pow,
  };
}

export async function attachHashpowerToResolved(entry, actualBlock) {
  const mining = await fetchNetworkMiningSnapshot();
  const ourH = getSimulatedHashrateHs(mining.networkHashrateHs);
  const intervalSec = entry.actual?.intervalSec ?? entry.forecast?.predictedIntervalSec ?? 600;
  const pow = simulatePowForBlock({
    blockId: actualBlock.id,
    targetHeight: entry.targetHeight,
    intervalSec,
    ourHashrateHs: ourH,
    networkHashrateHs: mining.networkHashrateHs,
    difficulty: mining.difficulty,
  });
  return { miningSnapshot: mining, simulatedHashrateHs: ourH, powSimulation: pow };
}

function formatHashrate(hs) {
  if (hs >= 1e18) return `${(hs / 1e18).toFixed(3)} EH/s`;
  if (hs >= 1e15) return `${(hs / 1e15).toFixed(3)} PH/s`;
  if (hs >= 1e12) return `${(hs / 1e12).toFixed(3)} TH/s`;
  return `${hs.toExponential(2)} H/s`;
}

function roundPct(n) {
  return Math.round(n * 1000) / 1000;
}
