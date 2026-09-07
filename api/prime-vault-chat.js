/**
 * Prime Vault Chat · live guest door pipe.
 * Walk-on: any valid email can chat the real Φ agent (demonstration seat).
 * Lattice / Let's Chat creators + grants keep elevated privilege.
 * GET ?email= — seat check.
 * POST { message, octaveTier? } — live closed-form chat reply.
 */
let libs;
let engineMod;

async function loadLibs() {
  if (!libs) libs = await import('../lib/lattice-access.mjs');
  return libs;
}

async function loadEngine() {
  if (!engineMod) engineMod = await import('../lib/prime-vault-chat-engine.mjs');
  return engineMod;
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, x-lattice-email, X-Lattice-Email',
  );
}

function emailFromReq(req, L) {
  const header =
    req.headers?.['x-lattice-email'] ||
    req.headers?.['X-Lattice-Email'] ||
    '';
  const q = typeof req.query?.email === 'string' ? req.query.email : '';
  return L.normalizeEmail(header || q);
}

/** Demonstration walk-on: valid email → live chat even without Lattice grant. */
function resolveSeat(L, email) {
  const access = L.checkLatticeEmailAccess(email);
  if (access.ok) {
    return {
      ok: true,
      privilege: access.privilege,
      email: access.email,
      expiresAt: access.expiresAt,
      reason: access.reason,
      seat: access.privilege === 'creator' ? 'creator' : 'lattice-guest',
    };
  }
  if (email && L.isValidEmailShape(email)) {
    return {
      ok: true,
      privilege: 'walkon',
      email,
      expiresAt: null,
      reason: null,
      seat: 'walkon-demo',
    };
  }
  return {
    ok: false,
    privilege: 'none',
    email: email || '',
    expiresAt: null,
    reason:
      access.reason ||
      'Enter a valid email to chat with the live Prime Vault agent.',
    seat: 'none',
  };
}

function readBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
    }
    let raw = '';
    req.on?.('data', (c) => {
      raw += c;
      if (raw.length > 32_000) raw = raw.slice(0, 32_000);
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

  const L = await loadLibs();
  const email = emailFromReq(req, L);
  const seat = resolveSeat(L, email);

  const url = new URL(req.url || '/', 'http://localhost');
  const seatOnly =
    req.method === 'GET' &&
    url.searchParams.has('email') &&
    !req.headers?.['x-lattice-email'] &&
    !req.headers?.['X-Lattice-Email'];

  if (seatOnly || (req.method === 'GET' && url.searchParams.has('email'))) {
    res.statusCode = seat.ok ? 200 : 401;
    return res.json({
      ok: seat.ok,
      privilege: seat.privilege,
      reason: seat.reason,
      email: seat.email,
      expiresAt: seat.expiresAt,
      seat: seat.seat,
      product: 'prime-vault-chat',
      sameSeatAs: ['lets-chat', 'lattice-chat', 'walkon-demo'],
      miracle: 2,
      live: true,
      companion: 'Miracle 1 = Race results · Miracle 2 = live Prime Vault Chat agent',
    });
  }

  if (req.method === 'GET') {
    if (!seat.ok) {
      res.statusCode = 401;
      return res.json({
        ok: false,
        privilege: 'none',
        reason: seat.reason,
        product: 'prime-vault-chat',
      });
    }
    const E = await loadEngine();
    res.statusCode = 200;
    return res.json({
      ok: true,
      privilege: seat.privilege,
      email: seat.email,
      seat: seat.seat,
      product: 'prime-vault-chat',
      door: '/prime-vault-chat',
      phiEgs: E.PHI_EGS,
      vocabulary: E.DEFAULT_VOCABULARY,
      live: true,
      honesty:
        'Live closed-form Φ prime-vault chat agent — real conversation, $0 training. Not a trained LLM for open-world factual QA. Application companion, not engine pin. Fair Exchange on.',
      fairExchange: true,
      miracle: 2,
    });
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.json({ ok: false, reason: 'GET or POST only' });
  }

  if (!seat.ok) {
    res.statusCode = 401;
    return res.json({
      ok: false,
      privilege: 'none',
      reason: seat.reason,
      product: 'prime-vault-chat',
    });
  }

  const body = await readBody(req);
  const message = String(body.message || body.prompt || '').slice(0, 4000);
  if (!message.trim()) {
    res.statusCode = 400;
    return res.json({ ok: false, reason: 'message required' });
  }

  const E = await loadEngine();
  const octaveTier = body.octaveTier ?? body.octave ?? 7;
  const result = E.queryPrimeVaultChat(message, { octaveTier });

  res.statusCode = 200;
  return res.json({
    ok: true,
    privilege: seat.privilege,
    email: seat.email,
    seat: seat.seat,
    product: 'prime-vault-chat',
    role: 'assistant',
    content: result.reply,
    live: true,
    ...result,
    fairExchange: true,
  });
}
