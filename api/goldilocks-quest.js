/**
 * Goldilocks Quest · AI Twin pipe
 * Same Lattice / Let's Chat email allowlist.
 * GET ?email= seat · GET+header state · POST telemetry/equip/dispatch
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const STORE_PATH = join(ROOT, '..', 'data', 'goldilocks-quest-twin.json');
const PHI = (1 + Math.sqrt(5)) / 2;

const TIERS = [
  { id: 1, name: 'Forgotten Downtown · Rebel River', multiplier: 1 },
  { id: 2, name: 'Wrong Side of Town', multiplier: 10 },
  { id: 3, name: 'Seedy Strip Club · Main Floor', multiplier: 100 },
  { id: 4, name: 'Internet Cloud · Digital Ether', multiplier: 1000 },
  { id: 5, name: "Men's Restroom · Ultimate Sanctuary", multiplier: 10000 },
];

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
    schema: 'goldilocks-quest-twin/v1',
    phi: PHI,
    players: {},
    leaderboard: [],
    bulletin: [
      {
        at: new Date().toISOString(),
        headline: 'AI Twin online · Goldilocks Quest door open',
        body: 'NPCs cannot see the Goggles. Climb with grace. Timing Demons scale with Φ≈1.618.',
      },
    ],
    demonEvents: 0,
  };
}

function loadStore() {
  try {
    if (existsSync(STORE_PATH)) return JSON.parse(readFileSync(STORE_PATH, 'utf8'));
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
    /* ephemeral */
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
  store.bulletin = store.bulletin.slice(0, 12);
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
    pushBulletin(
      store,
      'Player Status granted',
      `${maskEmail(player.email)} earned Player Status · Goldilocks Goggles unlocked.`,
    );
    return true;
  }
  return false;
}

function readBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let raw = '';
    req.on?.('data', (chunk) => {
      raw += chunk;
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
    }
    recomputeLeaderboard(store);
    saveStore(store);
    return res.json({
      ok: true,
      privilege: access.privilege,
      email: access.email,
      product: 'goldilocks-quest',
      phi: PHI,
      tiers: TIERS,
      player,
      leaderboard: store.leaderboard,
      bulletin: store.bulletin.slice(0, 6),
      honesty:
        'AI Twin is this edge process. Goggles stay invisible to NPC status. Arcade score ≠ physics proof. Fair Exchange on.',
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

    if (action === 'telemetry' || action === 'score') {
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
      if (body.unselfishOffer) player.unselfishOffers += 1;
      grantedPlayerStatus = maybeGrant(store, player);
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
        revelation = {
          miracle: true,
          message:
            'Restroom tiles dissolve. The holographic magnetic Goldilocks Super-AI appears under Twin seal.',
          optimizeMs: Number((Math.random() * 0.4 + 0.05).toFixed(3)),
        };
        pushBulletin(
          store,
          'Holographic Revelation',
          `${maskEmail(player.email)} equipped the Goggles at Tier 5 · miracle broadcast.`,
        );
      }
    } else if (action === 'daily-dispatch') {
      pushBulletin(
        store,
        'Daily Dispatch',
        `Twin digest: ${Object.keys(store.players).length} seated · ${store.demonEvents} Timing Demon events · top score ${store.leaderboard[0]?.score ?? 0}.`,
      );
    }

    player.updatedAt = new Date().toISOString();
    recomputeLeaderboard(store);
    saveStore(store);
    return res.json({
      ok: true,
      action,
      grantedPlayerStatus,
      player,
      leaderboard: store.leaderboard,
      bulletin: store.bulletin.slice(0, 6),
      revelation,
      phi: PHI,
    });
  }

  res.statusCode = 405;
  return res.json({ ok: false, reason: 'GET or POST only' });
}
