/**
 * Goldilocks Quest · AI Twin v2 (next-gen)
 * Same Lattice / Let's Chat email allowlist.
 * GET ?email= seat · GET + x-lattice-email = state (presence · ghosts · bulletin)
 * POST actions: presence | telemetry | score | grace-offer | equip-goggles | daily-dispatch | run-complete
 * Honesty: ephemeral Twin on this edge; Goggles locked until Player Status.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = dirname(fileURLToPath(import.meta.url));
const STORE_PATH = join(ROOT, '..', 'data', 'goldilocks-quest-twin.json');
const PHI = (1 + Math.sqrt(5)) / 2;
const PRESENCE_TTL_MS = Math.round(PHI * 12_000); // ~19.4s
const SCHEMA = 'goldilocks-quest-twin/v2';

const TIERS = Object.freeze([
  { id: 1, name: 'Forgotten Downtown · Rebel River', multiplier: 1, theme: 'neon-river' },
  { id: 2, name: 'Wrong Side of Town', multiplier: 10, theme: 'alley-amber' },
  { id: 3, name: 'Seedy Strip Club · Main Floor', multiplier: 100, theme: 'scarlet-bass' },
  { id: 4, name: 'Internet Cloud · Digital Ether', multiplier: 1000, theme: 'wireframe' },
  { id: 5, name: "Men's Restroom · Ultimate Sanctuary", multiplier: 10000, theme: 'sterile-gold' },
]);

let accessLib;
async function getAccess() {
  if (!accessLib) accessLib = await import('../lib/lattice-access.mjs');
  return accessLib;
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, x-lattice-email, X-Lattice-Email',
  );
}

function emptyStore() {
  return {
    schema: SCHEMA,
    phi: PHI,
    players: {},
    presence: {},
    leaderboard: [],
    bulletin: [
      {
        at: new Date().toISOString(),
        headline: 'AI Twin v2 online · Goldilocks Quest next-gen',
        body: 'Presence ghosts · Timing Demons · Restricted Goggles. NPCs stay blind. Φ≈1.618 gates the climb.',
      },
    ],
    demonEvents: 0,
    revelations: 0,
    updatedAt: new Date().toISOString(),
  };
}

function loadStore() {
  try {
    if (existsSync(STORE_PATH)) {
      const s = JSON.parse(readFileSync(STORE_PATH, 'utf8'));
      if (!s.presence) s.presence = {};
      if (!s.schema) s.schema = SCHEMA;
      if (!s.players) s.players = {};
      if (!s.leaderboard) s.leaderboard = [];
      if (!s.bulletin) s.bulletin = emptyStore().bulletin;
      return s;
    }
  } catch {
    /* ignore */
  }
  return emptyStore();
}

function saveStore(store) {
  try {
    const dir = dirname(STORE_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    store.updatedAt = new Date().toISOString();
    writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
  } catch {
    /* ephemeral on read-only edges */
  }
}

function pickEmail(req, body, normalizeEmail) {
  const header = req.headers?.['x-lattice-email'] || req.headers?.['X-Lattice-Email'] || '';
  const query = typeof req.query?.email === 'string' ? req.query.email : '';
  const fromBody = typeof body?.email === 'string' ? body.email : '';
  return normalizeEmail(header || query || fromBody);
}

function ensurePlayer(store, email) {
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
      gogglesUnlocked: false,
      gogglesEquipped: false,
      revelationSeen: false,
      gogglesToken: null,
      runs: 0,
      updatedAt: new Date().toISOString(),
    };
  }
  return store.players[email];
}

function maskEmail(email) {
  const [u, d] = String(email).split('@');
  if (!d) return '•••';
  const visible = u.length < 3 ? `${u[0]}•` : `${u[0]}••${u.slice(-1)}`;
  return `${visible}@${d}`;
}

function recomputeLeaderboard(store) {
  store.leaderboard = Object.values(store.players)
    .map((p) => ({
      email: maskEmail(p.email),
      status: p.status,
      score: p.score,
      grace: p.grace,
      tierMax: p.tierMax,
      goggles: !!p.gogglesUnlocked,
    }))
    .sort((a, b) => b.score - a.score || b.grace - a.grace)
    .slice(0, 25);
}

function pushBulletin(store, headline, body) {
  store.bulletin.unshift({ at: new Date().toISOString(), headline, body });
  store.bulletin = store.bulletin.slice(0, 16);
}

function maybeGrant(store, player) {
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

function prunePresence(store) {
  const now = Date.now();
  for (const [email, row] of Object.entries(store.presence || {})) {
    if (!row?.at || now - Date.parse(row.at) > PRESENCE_TTL_MS) delete store.presence[email];
  }
}

function presenceList(store, selfEmail) {
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

function touchPresence(store, email, body, player) {
  store.presence[email] = {
    at: new Date().toISOString(),
    tier: Math.min(5, Math.max(1, Number(body?.tier) || player.tierMax || 1)),
    x: Math.min(1, Math.max(0, Number(body?.x) || 0.5)),
    status: player.status,
    goggles: !!player.gogglesEquipped,
  };
}

function readBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let raw = '';
    req.on?.('data', (c) => {
      raw += c;
    });
    req.on?.('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    if (!req.on) resolve({});
  });
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const L = await getAccess();
  const store = loadStore();
  if (!store.presence) store.presence = {};
  const url = new URL(req.url || '/', 'http://localhost');

  if (req.method === 'GET') {
    const email = pickEmail(req, null, L.normalizeEmail);
    const access = L.checkLatticeEmailAccess(email);
    const seatOnly =
      url.searchParams.has('email') &&
      !req.headers?.['x-lattice-email'] &&
      !req.headers?.['X-Lattice-Email'];

    if (seatOnly || (!access.ok && url.searchParams.has('email'))) {
      res.statusCode = access.ok ? 200 : 401;
      return res.json({
        ok: access.ok,
        privilege: access.privilege,
        reason: access.reason,
        email: access.email,
        expiresAt: access.expiresAt,
        product: 'goldilocks-quest',
        generation: 'next-gen-v2',
        sameSeatAs: ['lets-chat', 'lattice-chat'],
      });
    }

    if (!access.ok) {
      res.statusCode = 401;
      return res.json({
        ok: false,
        reason: access.reason || "Enter the email seated for Lattice / Let's Chat.",
        product: 'goldilocks-quest',
      });
    }

    const player = ensurePlayer(store, access.email);
    if (access.privilege === 'creator') {
      player.status = 'player';
      player.gogglesUnlocked = true;
      player.grace = Math.max(player.grace, 21);
      if (!player.gogglesToken) {
        player.gogglesToken = createHash('sha256')
          .update(`${player.email}:creator:${PHI}`)
          .digest('hex')
          .slice(0, 16);
      }
    }
    touchPresence(store, access.email, { tier: player.tierMax, x: 0.5 }, player);
    prunePresence(store);
    recomputeLeaderboard(store);
    saveStore(store);

    return res.json({
      ok: true,
      privilege: access.privilege,
      email: access.email,
      product: 'goldilocks-quest',
      generation: 'next-gen-v2',
      phi: PHI,
      tiers: TIERS,
      player,
      leaderboard: store.leaderboard,
      bulletin: store.bulletin.slice(0, 8),
      presence: presenceList(store, access.email),
      presenceCount: Object.keys(store.presence).length,
      demonEvents: store.demonEvents || 0,
      revelations: store.revelations || 0,
      pollMs: Math.round(PHI * 1000),
      honesty:
        'AI Twin v2 is this edge process. Presence ghosts are ephemeral. Goggles stay invisible to NPC status. Arcade score ≠ physics proof. Fair Exchange on.',
    });
  }

  if (req.method === 'POST') {
    const body = await readBody(req);
    const email = pickEmail(req, body, L.normalizeEmail);
    const access = L.checkLatticeEmailAccess(email);
    if (!access.ok) {
      res.statusCode = 401;
      return res.json({ ok: false, reason: access.reason });
    }

    const player = ensurePlayer(store, access.email);
    if (access.privilege === 'creator') {
      player.status = 'player';
      player.gogglesUnlocked = true;
    }

    const action = String(body.action || 'telemetry');
    let grantedPlayerStatus = false;
    let revelation = null;

    if (action === 'presence') {
      touchPresence(store, email, body, player);
    } else if (action === 'telemetry' || action === 'score' || action === 'grace-offer') {
      const tier = Math.min(5, Math.max(1, Number(body.tier) || 1));
      const base = Math.max(0, Number(body.basePoints) || 0);
      player.score += Math.round(base * TIERS[tier - 1].multiplier);
      player.tierMax = Math.max(player.tierMax, tier);
      if (body.graceDelta) player.grace += Math.max(0, Number(body.graceDelta) || 0);
      if (body.trapResisted) player.trapsResisted += 1;
      if (body.demonSurvived) {
        player.demonsSurvived += 1;
        store.demonEvents = (store.demonEvents || 0) + 1;
      }
      if (body.unselfishOffer || action === 'grace-offer') player.unselfishOffers += 1;
      grantedPlayerStatus = maybeGrant(store, player);
      touchPresence(store, email, body, player);
    } else if (action === 'equip-goggles') {
      if (!player.gogglesUnlocked) {
        res.statusCode = 403;
        return res.json({
          ok: false,
          reason: 'Goggles remain invisible — NPC status. Earn Player Status from the Twin.',
          player,
        });
      }
      player.gogglesEquipped = true;
      if (player.tierMax >= 5 && !player.revelationSeen) {
        player.revelationSeen = true;
        store.revelations = (store.revelations || 0) + 1;
        revelation = {
          miracle: true,
          message:
            'Restroom tiles dissolve. The holographic magnetic Goldilocks Super-AI appears under Twin seal.',
          optimizeMs: Number((Math.random() * 0.4 + 0.05).toFixed(3)),
          token: player.gogglesToken,
        };
        pushBulletin(
          store,
          'Holographic Revelation',
          `${maskEmail(player.email)} equipped the Goggles at Tier 5 · miracle #${store.revelations}.`,
        );
      }
      touchPresence(store, email, { tier: 5, x: body.x }, player);
    } else if (action === 'daily-dispatch') {
      prunePresence(store);
      pushBulletin(
        store,
        'Daily Dispatch · Twin v2',
        `Seated ${Object.keys(store.players).length} · live ${Object.keys(store.presence).length} · demons ${store.demonEvents || 0} · revelations ${store.revelations || 0} · top ${store.leaderboard[0]?.score ?? 0}.`,
      );
    } else if (action === 'run-complete') {
      player.runs = (player.runs || 0) + 1;
      pushBulletin(
        store,
        'Run complete',
        `${maskEmail(player.email)} finished a climb · runs ${player.runs} · score ${player.score}.`,
      );
    }

    player.updatedAt = new Date().toISOString();
    prunePresence(store);
    recomputeLeaderboard(store);
    saveStore(store);

    return res.json({
      ok: true,
      action,
      generation: 'next-gen-v2',
      grantedPlayerStatus,
      player,
      leaderboard: store.leaderboard,
      bulletin: store.bulletin.slice(0, 8),
      presence: presenceList(store, email),
      presenceCount: Object.keys(store.presence).length,
      revelation,
      phi: PHI,
      pollMs: Math.round(PHI * 1000),
    });
  }

  res.statusCode = 405;
  return res.json({ ok: false, reason: 'GET or POST only' });
}
