/**
 * Goldilocks Quest · Twin core (full-gen v3)
 * Shared by API + cron. Φ rhythm scalar. Ephemeral edge store.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PHI = (1 + Math.sqrt(5)) / 2;
export const SCHEMA = 'goldilocks-quest-twin/v3';
export const GENERATION = 'full-gen-v3';
export const PRESENCE_TTL_MS = Math.round(PHI * 12_000);
export const POLL_MS = Math.round(PHI * 1000);

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const STORE_PATH = join(ROOT, 'data', 'goldilocks-quest-twin.json');

export const TIERS = Object.freeze([
  {
    id: 1,
    name: 'Forgotten Downtown · Rebel River',
    multiplier: 1,
    theme: 'neon-river',
    traps: ['siren', 'scarlet'],
  },
  {
    id: 2,
    name: 'Wrong Side of Town',
    multiplier: 10,
    theme: 'alley-amber',
    traps: ['siren', 'scarlet', 'treasure'],
  },
  {
    id: 3,
    name: 'Seedy Strip Club · Main Floor',
    multiplier: 100,
    theme: 'scarlet-bass',
    traps: ['fame', 'treasure', 'timing'],
  },
  {
    id: 4,
    name: 'Internet Cloud · Digital Ether',
    multiplier: 1000,
    theme: 'wireframe',
    traps: ['fame', 'timing', 'crypto'],
  },
  {
    id: 5,
    name: "Men's Restroom · Ultimate Sanctuary",
    multiplier: 10000,
    theme: 'sterile-gold',
    traps: ['timing'],
  },
]);

export function emptyStore() {
  return {
    schema: SCHEMA,
    generation: GENERATION,
    phi: PHI,
    players: {},
    presence: {},
    leaderboard: [],
    bulletin: [
      {
        at: new Date().toISOString(),
        headline: 'AI Twin full-gen v3 online · Goldilocks Quest',
        body: 'SSE live relay · chronological Timing Demons · Restricted Goggles · grace leaderboard. NPCs stay blind. Φ≈1.618 gates the climb.',
      },
    ],
    demonEvents: 0,
    revelations: 0,
    dispatches: 0,
    hazardSeed: Math.floor(Date.now() / 86_400_000),
    updatedAt: new Date().toISOString(),
  };
}

export function loadStore() {
  try {
    if (existsSync(STORE_PATH)) {
      const s = JSON.parse(readFileSync(STORE_PATH, 'utf8'));
      if (!s.presence) s.presence = {};
      if (!s.players) s.players = {};
      if (!s.leaderboard) s.leaderboard = [];
      if (!s.bulletin) s.bulletin = emptyStore().bulletin;
      if (typeof s.demonEvents !== 'number') s.demonEvents = 0;
      if (typeof s.revelations !== 'number') s.revelations = 0;
      s.schema = SCHEMA;
      s.generation = GENERATION;
      return s;
    }
  } catch {
    /* ignore */
  }
  return emptyStore();
}

export function saveStore(store) {
  try {
    const dir = dirname(STORE_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    store.updatedAt = new Date().toISOString();
    store.schema = SCHEMA;
    store.generation = GENERATION;
    writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
  } catch {
    /* ephemeral on read-only edges */
  }
}

export function maskEmail(email) {
  const [u, d] = String(email).split('@');
  if (!d) return '•••';
  const visible = u.length < 3 ? `${u[0]}•` : `${u[0]}••${u.slice(-1)}`;
  return `${visible}@${d}`;
}

export function ensurePlayer(store, email) {
  if (!store.players[email]) {
    store.players[email] = {
      email,
      status: 'npc',
      grace: 0,
      score: 0,
      tierMax: 1,
      trapsResisted: 0,
      demonsSurvived: 0,
      unselfishOffers: 0,
      scarletMercy: 0,
      gogglesUnlocked: false,
      gogglesEquipped: false,
      revelationSeen: false,
      gogglesToken: null,
      runs: 0,
      miracleMs: null,
      updatedAt: new Date().toISOString(),
    };
  }
  const p = store.players[email];
  // Migrate v2 field names if present
  if (p.gogglesUnlocked == null && p.gogglesUnlocked === undefined) {
    /* keep */
  }
  return p;
}

export function recomputeLeaderboard(store) {
  store.leaderboard = Object.values(store.players)
    .map((p) => ({
      email: maskEmail(p.email),
      status: p.status,
      score: p.score || 0,
      grace: p.grace || 0,
      tierMax: p.tierMax || 1,
      goggles: !!(p.gogglesUnlocked || p.gogglesUnlocked),
      graceRank:
        Math.round((p.score || 0) * 0.4) +
        Math.round((p.grace || 0) * 13) +
        Math.round((p.trapsResisted || 0) * 8) +
        Math.round((p.unselfishOffers || 0) * 21),
    }))
    .sort((a, b) => b.graceRank - a.graceRank || b.score - a.score)
    .slice(0, 25);
}

export function pushBulletin(store, headline, body) {
  store.bulletin.unshift({ at: new Date().toISOString(), headline, body });
  store.bulletin = store.bulletin.slice(0, 16);
}

export function maybeGrant(store, player) {
  const needGrace = Math.round(8 * PHI);
  const needResist = Math.round(3 * PHI);
  const needOffer = Math.round(2 * PHI);
  if (
    player.status === 'npc' &&
    player.grace >= needGrace &&
    player.trapsResisted >= needResist &&
    player.unselfishOffers >= needOffer &&
    player.tierMax >= 3
  ) {
    player.status = 'player';
    player.gogglesUnlocked = true;
    player.gogglesToken = createHash('sha256')
      .update(`${player.email}:goggles:${PHI}:${Date.now()}`)
      .digest('hex')
      .slice(0, 16);
    pushBulletin(
      store,
      'Player Status granted',
      `${maskEmail(player.email)} earned Player Status · Goldilocks Goggles unlocked (token ${player.gogglesToken}).`,
    );
    return true;
  }
  return false;
}

export function prunePresence(store) {
  const now = Date.now();
  for (const [email, row] of Object.entries(store.presence || {})) {
    if (!row?.at || now - Date.parse(row.at) > PRESENCE_TTL_MS) delete store.presence[email];
  }
}

export function presenceList(store, selfEmail) {
  prunePresence(store);
  return Object.entries(store.presence)
    .filter(([email]) => email !== selfEmail)
    .map(([email, row]) => ({
      email: maskEmail(email),
      tier: row.tier || 1,
      x: row.x ?? 0.5,
      status: row.status || 'npc',
      goggles: !!row.goggles,
    }))
    .slice(0, 12);
}

export function touchPresence(store, email, body, player) {
  store.presence[email] = {
    at: new Date().toISOString(),
    tier: Math.min(5, Math.max(1, Number(body?.tier) || player.tierMax || 1)),
    x: Math.min(1, Math.max(0, Number(body?.x) || 0.5)),
    status: player.status,
    goggles: !!player.gogglesEquipped,
  };
}

/** Chronological hazard schedule keyed by UTC day + Φ. */
export function hazardSchedule(store = null) {
  const day = store?.hazardSeed ?? Math.floor(Date.now() / 86_400_000);
  const phases = [];
  for (let t = 1; t <= 5; t++) {
    const base = Math.round(PHI * t * 7);
    phases.push({
      tier: t,
      demonIntervalMs: Math.max(900, Math.round(4200 / (PHI * t))),
      spawnBias: Number(((base % 97) / 97).toFixed(3)),
      freezeChance: Number(Math.min(0.42, 0.08 * t * PHI).toFixed(3)),
      traps: TIERS[t - 1].traps,
    });
  }
  return { day, phi: PHI, phases };
}

export function compileDailyDispatch(store) {
  prunePresence(store);
  recomputeLeaderboard(store);
  store.dispatches = (store.dispatches || 0) + 1;
  const top = store.leaderboard[0];
  const players = Object.values(store.players);
  const granted = players.filter((p) => p.status === 'player').length;
  const goggles = players.filter((p) => p.gogglesUnlocked).length;
  pushBulletin(
    store,
    'Daily Dispatch · Twin full-gen v3',
    `Seated ${players.length} · live ${Object.keys(store.presence).length} · Player Status ${granted} · Goggles ${goggles} · demons ${store.demonEvents || 0} · revelations ${store.revelations || 0} · top grace-rank ${top?.graceRank ?? 0}.`,
  );
  saveStore(store);
  return {
    ok: true,
    generation: GENERATION,
    dispatches: store.dispatches,
    bulletin: store.bulletin[0],
    leaderboard: store.leaderboard.slice(0, 5),
  };
}

export function publicState(store, access, player) {
  return {
    ok: true,
    privilege: access.privilege,
    email: access.email,
    product: 'goldilocks-quest',
    generation: GENERATION,
    phi: PHI,
    tiers: TIERS,
    hazards: hazardSchedule(store),
    player,
    leaderboard: store.leaderboard,
    bulletin: store.bulletin.slice(0, 8),
    presence: presenceList(store, access.email),
    presenceCount: Object.keys(store.presence).length,
    demonEvents: store.demonEvents || 0,
    revelations: store.revelations || 0,
    pollMs: POLL_MS,
    streamMs: Math.round(PHI * 8000),
    honesty:
      'AI Twin full-gen v3 is this edge process. Presence ghosts are ephemeral. Goggles stay invisible to NPC status. Arcade score ≠ physics proof. Fair Exchange on.',
  };
}
