/**
 * Mining rail — fixed operational anchor, read-only on the public web.
 * Payout is set in server env (COHERENCE_OPERATIONAL_ANCHOR) or code default — no public change API.
 */
import { redisGetJson, redisSetJson, upstashConfigured } from './upstash.mjs';

export const OPERATIONAL_ANCHOR_DEFAULT = '0x3563388d0e1c2d66a004e5e57717dc6d7e568be3';
export const BROADCAST_HUB = 'https://www.ssvibelandiaquestfest24x365.com';
export const REDIS_KEY = 'qv:mining:rail:v1';

/** @deprecated alias */
export const OPERATIONAL_ANCHOR = OPERATIONAL_ANCHOR_DEFAULT;

export const LIVE_NOW = {
  tier: 'pulse_receipt_rail',
  label: 'Autopilot · display only',
  summary:
    'Fixed operational anchor on every pulse. Public site and APIs are read-only — no payout changes from the web.',
  apis: ['/api/goldilocks-pulse', '/api/mining-rail', '/api/cron-coherence-rail'],
  broadcastHub: BROADCAST_HUB,
  operationalAnchor: OPERATIONAL_ANCHOR_DEFAULT,
  humanInterventionRequired: false,
  readOnly: true,
};

export const SCALE_LATER = [
  { id: 'hash_lease', label: 'Rented hashrate (optional)', note: 'Optional scale.' },
  { id: 'pool_worker', label: 'Pool worker (optional)', note: 'When edge ASICs land.' },
  { id: 'edge_asic', label: 'Puerto Reno edge metal (optional)', note: 'Scales Tier 0.' },
];

function autopilotEnabled() {
  const v = process.env.COHERENCE_AUTOPILOT;
  if (v === '0' || v === 'false') return false;
  return true;
}

export function normalizePayoutAddress(raw) {
  const v = String(raw || '').trim();
  if (!v) return null;
  if (/^0x[a-fA-F0-9]{40}$/.test(v)) return v;
  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(v)) return v;
  return null;
}

/** Canonical payout — env override on Vercel only (operator), never from public POST. */
export function getOperationalAnchor() {
  const fromEnv = normalizePayoutAddress(process.env.COHERENCE_OPERATIONAL_ANCHOR);
  return fromEnv || OPERATIONAL_ANCHOR_DEFAULT;
}

function buildLockedRow() {
  const anchor = getOperationalAnchor();
  const now = new Date().toISOString();
  return {
    payoutAddress: anchor,
    registeredAt: now,
    approvedAt: now,
    source: 'autopilot_locked',
    autopilot: true,
    approved: true,
    locked: true,
    readOnly: true,
    humanInterventionRequired: false,
  };
}

async function saveRail(row) {
  if (upstashConfigured()) {
    await redisSetJson(REDIS_KEY, row);
  }
  globalThis.__qvMiningRail = row;
}

/** Always sync to locked operational anchor (ignores stale Redis payout edits). */
export async function ensureMiningRailAutopilot() {
  if (!autopilotEnabled()) {
    return buildLockedRow();
  }
  const row = buildLockedRow();
  await saveRail(row);
  return row;
}

function formatRailResponse(row) {
  return {
    liveNow: LIVE_NOW,
    scaleLater: SCALE_LATER,
    readOnly: true,
    autopilot: {
      enabled: autopilotEnabled(),
      active: true,
      locked: true,
      humanInterventionRequired: false,
      description: 'Display only — payout is fixed to the operational anchor.',
    },
    payoutRail: {
      address: row.payoutAddress,
      operationalAnchor: getOperationalAnchor(),
      registeredAt: row.registeredAt,
      approvedAt: row.approvedAt,
      locked: true,
      source: row.source,
    },
    fairExchange: {
      model: 'merit_tipping_jar',
      contracts: 'none_required',
      treasuryAnchor: getOperationalAnchor(),
    },
  };
}

export async function getMiningRail() {
  const row = await ensureMiningRailAutopilot();
  return formatRailResponse(row);
}

export async function getPayoutAddressForPulse() {
  return getOperationalAnchor();
}
