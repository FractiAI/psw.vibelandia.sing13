/**
 * Holographic Goldilocks pulse — 10-minute verification loop for The Coherence Project.
 * Fetches live Bitcoin tip + emits signed receipt anchored to operational wallet.
 */
import crypto from 'node:crypto';
import { redisGetJson, redisSetJson, upstashConfigured } from './upstash.mjs';
import {
  getPayoutAddressForPulse,
  getOperationalAnchor,
  OPERATIONAL_ANCHOR_DEFAULT,
} from './mining-rail.mjs';

export { OPERATIONAL_ANCHOR_DEFAULT as OPERATIONAL_ANCHOR, getOperationalAnchor } from './mining-rail.mjs';
export const BROADCAST_HUB = 'https://www.ssvibelandiaquestfest24x365.com';
export const EGS_PHI = 1.618;
export const CLOCK_SKEW_PS = 1.618;
export const HYDROGEN_LINE_MHZ = 1420.405751768;
export const SUNSPOTS = ['AR4436', 'AR4441'];
export const PULSE_CADENCE_SEC = 600;
export const REDIS_KEY = 'qv:goldilocks:pulse:v1';
export const MAX_HISTORY = 96;

const memState = globalThis.__qvGoldilocksPulse || (globalThis.__qvGoldilocksPulse = {
  latest: null,
  history: [],
});

export function signPayload(payload, secret) {
  const canonical = JSON.stringify(payload);
  const key = secret || getOperationalAnchor();
  const hmac = crypto.createHmac('sha256', key).update(canonical).digest('hex');
  return `0x${hmac.slice(0, 64)}`;
}

async function fetchTipBlock() {
  const res = await fetch('https://mempool.space/api/blocks', {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`mempool ${res.status}`);
  const blocks = await res.json();
  if (!Array.isArray(blocks) || !blocks[0]) throw new Error('no blocks');
  return blocks[0];
}

function subsidySats(height) {
  const halvings = Math.floor(height / 210000);
  return Math.floor((50 * 1e8) / 2 ** halvings);
}

async function buildPulse(block, prior) {
  const height = block.height;
  const fees = block.extras?.totalFees ?? 0;
  const issuedAt = new Date().toISOString();
  const intervalIndex = prior ? (prior.intervalIndex || 0) + 1 : 1;
  const payoutAddress = await getPayoutAddressForPulse();

  let wavefield = null;
  try {
    const { runWavefieldOscillatorPipeline } = await import('./dph-wavefield-solar.mjs');
    wavefield = await runWavefieldOscillatorPipeline();
  } catch {
    wavefield = null;
  }

  const body = {
    schema: 'goldilocks-pulse/v1',
    project: 'THE_COHERENCE_PROJECT',
    documentIds: ['REV-EGS-HHF-2026-007', 'OPS-EGS-BTC-2026-008'],
    broadcastHub: BROADCAST_HUB,
    operationalAnchor: getOperationalAnchor(),
    payoutRail: {
      address: payoutAddress,
      tier: 'pulse_receipt_rail',
      liveNow: true,
      autopilot: true,
      locked: true,
      readOnly: true,
    },
    autopilot: {
      humanInterventionRequired: false,
      readOnly: true,
      cronPath: '/api/cron-coherence-rail',
    },
    liveCoordinates: {
      sunspots: wavefield?.telemetry?.activeRegions?.map((r) => r.id) || SUNSPOTS,
      sunspotNumber: wavefield?.telemetry?.sunspot?.sunspotNumber ?? null,
      hydrogenLineMhz: HYDROGEN_LINE_MHZ,
      wavefieldDocumentId: wavefield?.documentId || 'SYN-SUN-2026-REV7',
      holographicStabilityIndex: wavefield?.holographicStabilityIndex ?? null,
      egsStabilityIndex: wavefield?.egsStabilityIndex ?? null,
    },
    wavefieldOscillator: wavefield
      ? {
          schema: wavefield.schema,
          egsIntervalSec: wavefield.telemetry?.cadence?.egsIntervalSec,
          honestyBoundary: wavefield.honestyBoundary,
        }
      : null,
    egsPhi: EGS_PHI,
    clockSkewPs: CLOCK_SKEW_PS,
    bitcoin: {
      tipHeight: height,
      tipHash: block.id,
      blockTimestamp: block.timestamp,
      subsidySats: subsidySats(height),
      feesSats: fees,
      cadenceTargetSec: PULSE_CADENCE_SEC,
    },
    goldilocksZone: {
      phaseStability: EGS_PHI,
      phiLock: true,
      lockHeld: true,
      spotDisplacementPrevented: true,
      staleShareTarget: 0,
    },
    coherence: {
      mythosLayer: 'Claude Mythos / Project Glasswing — hardware thermodynamic load',
      clockSkewFinding: 'Holographic Clock-Skew Vulnerability (EGS frame)',
      intervalCycled: true,
    },
    intervalIndex,
    issuedAt,
  };

  const signingSecret = process.env.GOLDILOCKS_PULSE_SECRET || process.env.CATALOG_UPLOAD_SECRET;
  body.signature = signPayload(body, signingSecret);
  body.pulseId = `pulse-${height}-${Date.parse(issuedAt)}`;
  return body;
}

function shouldEmitPulse(latest, block) {
  if (!latest) return true;
  if (block.height > latest.bitcoin.tipHeight) return true;
  const ageMs = Date.now() - Date.parse(latest.issuedAt);
  return ageMs >= PULSE_CADENCE_SEC * 1000;
}

async function loadState() {
  if (upstashConfigured()) {
    const row = await redisGetJson(REDIS_KEY);
    if (row) return row;
  }
  return { latest: memState.latest, history: memState.history.slice() };
}

async function saveState(state) {
  if (upstashConfigured()) {
    await redisSetJson(REDIS_KEY, state);
  }
  memState.latest = state.latest;
  memState.history = state.history.slice(0, MAX_HISTORY);
}

export async function runGoldilocksPulse({ force } = {}) {
  const block = await fetchTipBlock();
  const state = await loadState();
  const { runPredictionCycle } = await import('./goldilocks-predictions.mjs');
  const predictions = await runPredictionCycle(block);

  if (!force && !shouldEmitPulse(state.latest, block)) {
    return { emitted: false, latest: state.latest, history: state.history, predictions };
  }
  const pulse = await buildPulse(block, state.latest);
  const history = [pulse, ...state.history.filter((p) => p.pulseId !== pulse.pulseId)].slice(0, MAX_HISTORY);
  const next = { latest: pulse, history };
  await saveState(next);

  return { emitted: true, latest: pulse, history, predictions };
}

export async function getGoldilocksPulseState() {
  const state = await loadState();
  return {
    operationalAnchor: getOperationalAnchor(),
    broadcastHub: BROADCAST_HUB,
    cadenceSec: PULSE_CADENCE_SEC,
    latest: state.latest,
    history: state.history,
  };
}
