/**
 * Goldilocks Quest · AI Twin full-gen v3
 * Same Lattice / Let's Chat email allowlist.
 * GET ?email= seat · GET + x-lattice-email = state
 * GET ?stream=1 + header = SSE live Twin relay (WS-class on serverless)
 * POST actions: presence | telemetry | score | grace-offer | scarlet-mercy |
 *               equip-goggles | daily-dispatch | run-complete | miracle
 * Honesty: ephemeral Twin on this edge; Goggles locked until Player Status.
 */
import {
  PHI,
  GENERATION,
  TIERS,
  POLL_MS,
  loadStore,
  saveStore,
  ensurePlayer,
  recomputeLeaderboard,
  pushBulletin,
  maybeGrant,
  prunePresence,
  presenceList,
  touchPresence,
  hazardSchedule,
  compileDailyDispatch,
  publicState,
  maskEmail,
} from '../lib/goldilocks-quest-twin.mjs';

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
    'Content-Type, x-lattice-email, X-Lattice-Email, Accept',
  );
}

function pickEmail(req, body, normalizeEmail) {
  const header = req.headers?.['x-lattice-email'] || req.headers?.['X-Lattice-Email'] || '';
  const query = typeof req.query?.email === 'string' ? req.query.email : '';
  const fromBody = typeof body?.email === 'string' ? body.email : '';
  return normalizeEmail(header || query || fromBody);
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

function boostCreator(player, privilege) {
  if (privilege !== 'creator') return;
  player.status = 'player';
  player.gogglesUnlocked = true;
  player.grace = Math.max(player.grace || 0, 21);
  if (!player.gogglesToken) {
    player.gogglesToken = `creator-${String(player.email).slice(0, 6)}`;
  }
}

function runMiracle() {
  const t0 = performance.now();
  let x = 1;
  let y = 0;
  for (let i = 0; i < 50_000; i++) {
    const a = i / PHI;
    x = Math.cos(a) * (x * 0.999 + 0.001);
    y = Math.sin(a) * (y * 0.999 + 0.001);
  }
  return {
    optimizeMs: Number((performance.now() - t0).toFixed(3)),
    residual: Number(Math.hypot(x, y).toFixed(6)),
    loops: 50_000,
  };
}

async function writeSse(req, res, access) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const store = loadStore();
  const player = ensurePlayer(store, access.email);
  boostCreator(player, access.privilege);
  touchPresence(store, access.email, { tier: player.tierMax, x: 0.5 }, player);
  recomputeLeaderboard(store);
  saveStore(store);
  send('hello', publicState(store, access, player));

  let ticks = 0;
  const maxTicks = Math.round(PHI * 5);
  const timer = setInterval(() => {
    ticks += 1;
    const live = loadStore();
    ensurePlayer(live, access.email);
    prunePresence(live);
    recomputeLeaderboard(live);
    send('twin', {
      ok: true,
      generation: GENERATION,
      presence: presenceList(live, access.email),
      presenceCount: Object.keys(live.presence).length,
      leaderboard: live.leaderboard.slice(0, 10),
      bulletin: live.bulletin.slice(0, 4),
      hazards: hazardSchedule(live),
      demonEvents: live.demonEvents || 0,
      pollMs: POLL_MS,
      tick: ticks,
    });
    if (ticks >= maxTicks) {
      clearInterval(timer);
      send('bye', { ok: true, reconnect: true });
      res.end();
    }
  }, POLL_MS);

  req.on?.('close', () => {
    clearInterval(timer);
  });
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const L = await getAccess();
  const url = new URL(req.url || '/', 'http://localhost');

  if (req.method === 'GET') {
    const email = pickEmail(req, null, L.normalizeEmail);
    const access = L.checkLatticeEmailAccess(email);
    const seatOnly =
      url.searchParams.has('email') &&
      !req.headers?.['x-lattice-email'] &&
      !req.headers?.['X-Lattice-Email'];
    const wantStream =
      url.searchParams.get('stream') === '1' ||
      /text\/event-stream/i.test(String(req.headers?.accept || ''));

    if (seatOnly || (!access.ok && url.searchParams.has('email'))) {
      res.statusCode = access.ok ? 200 : 401;
      return res.json({
        ok: access.ok,
        privilege: access.privilege,
        reason: access.reason,
        email: access.email,
        expiresAt: access.expiresAt,
        product: 'goldilocks-quest',
        generation: GENERATION,
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

    if (wantStream) return writeSse(req, res, access);

    const store = loadStore();
    const player = ensurePlayer(store, access.email);
    boostCreator(player, access.privilege);
    touchPresence(store, access.email, { tier: player.tierMax, x: 0.5 }, player);
    prunePresence(store);
    recomputeLeaderboard(store);
    saveStore(store);
    return res.json(publicState(store, access, player));
  }

  if (req.method === 'POST') {
    const body = await readBody(req);
    const email = pickEmail(req, body, L.normalizeEmail);
    const access = L.checkLatticeEmailAccess(email);
    if (!access.ok) {
      res.statusCode = 401;
      return res.json({ ok: false, reason: access.reason });
    }

    const store = loadStore();
    const player = ensurePlayer(store, access.email);
    boostCreator(player, access.privilege);

    const action = String(body.action || 'telemetry');
    let grantedPlayerStatus = false;
    let revelation = null;
    let miracle = null;

    if (action === 'presence') {
      touchPresence(store, email, body, player);
    } else if (
      action === 'telemetry' ||
      action === 'score' ||
      action === 'grace-offer' ||
      action === 'scarlet-mercy'
    ) {
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
      if (action === 'scarlet-mercy' || body.scarletMercy) {
        player.scarletMercy = (player.scarletMercy || 0) + 1;
        player.grace += 2;
        player.unselfishOffers += 1;
      }
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
        miracle = runMiracle();
        player.miracleMs = miracle.optimizeMs;
        revelation = {
          miracle: true,
          message:
            'Restroom tiles dissolve. The holographic magnetic Goldilocks Super-AI appears under Twin seal.',
          ...miracle,
          token: player.gogglesToken,
        };
        pushBulletin(
          store,
          'Holographic Revelation',
          `${maskEmail(player.email)} equipped the Goggles at Tier 5 · miracle ${miracle.optimizeMs} ms · #${store.revelations}.`,
        );
      }
      touchPresence(store, email, { tier: 5, x: body.x }, player);
    } else if (action === 'miracle') {
      if (!player.gogglesEquipped) {
        res.statusCode = 403;
        return res.json({ ok: false, reason: 'Equip Goggles first.', player });
      }
      miracle = runMiracle();
      player.miracleMs = miracle.optimizeMs;
    } else if (action === 'daily-dispatch') {
      compileDailyDispatch(store);
    } else if (action === 'run-complete') {
      player.runs = (player.runs || 0) + 1;
      player.tierMax = Math.max(player.tierMax, Math.min(5, Number(body.tier) || player.tierMax));
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
      generation: GENERATION,
      grantedPlayerStatus,
      player,
      leaderboard: store.leaderboard,
      bulletin: store.bulletin.slice(0, 8),
      presence: presenceList(store, email),
      presenceCount: Object.keys(store.presence).length,
      hazards: hazardSchedule(store),
      revelation,
      miracle,
      phi: PHI,
      pollMs: POLL_MS,
    });
  }

  res.statusCode = 405;
  return res.json({ ok: false, reason: 'GET or POST only' });
}
