/**
 * Prime Vault Chat · guest door pipe.
 * Same Lattice / Let's Chat email allowlist (x-lattice-email · ?email=).
 * GET ?email= — seat check only.
 * POST { message, octaveTier? } — closed-form Φ prime-vault chat reply.
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
  const access = L.checkLatticeEmailAccess(email);

  const url = new URL(req.url || '/', 'http://localhost');
  const seatOnly =
    req.method === 'GET' &&
    url.searchParams.has('email') &&
    !req.headers?.['x-lattice-email'] &&
    !req.headers?.['X-Lattice-Email'];

  if (seatOnly || (req.method === 'GET' && url.searchParams.has('email') && !access.ok)) {
    res.statusCode = access.ok ? 200 : 401;
    return res.json({
      ok: access.ok,
      privilege: access.privilege,
      reason: access.reason,
      email: access.email,
      expiresAt: access.expiresAt,
      product: 'prime-vault-chat',
      sameSeatAs: ['lets-chat', 'lattice-chat', 'prime-vault-race'],
      miracle: 2,
      companion: 'Miracle 1 = Prime-Vault Race · Miracle 2 = Prime Vault Chat',
    });
  }

  if (req.method === 'GET') {
    if (!access.ok) {
      res.statusCode = 401;
      return res.json({
        ok: false,
        privilege: 'none',
        reason:
          access.reason ||
          "Enter the email the Purser seated for Lattice / Let's Chat.",
        product: 'prime-vault-chat',
      });
    }
    const E = await loadEngine();
    res.statusCode = 200;
    return res.json({
      ok: true,
      privilege: access.privilege,
      email: access.email,
      product: 'prime-vault-chat',
      door: '/prime-vault-chat',
      phiEgs: E.PHI_EGS,
      vocabulary: E.DEFAULT_VOCABULARY,
      honesty:
        'Closed-form Φ prime-vault chat — $0 training, edge-ready. Not a trained LLM for open-world factual QA. Application companion, not engine pin. Fair Exchange on.',
      fairExchange: true,
      miracle: 2,
    });
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.json({ ok: false, reason: 'GET or POST only' });
  }

  if (!access.ok) {
    res.statusCode = 401;
    return res.json({
      ok: false,
      privilege: 'none',
      reason:
        access.reason ||
        "Enter the email the Purser seated for Lattice / Let's Chat.",
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
    privilege: access.privilege,
    email: access.email,
    product: 'prime-vault-chat',
    role: 'assistant',
    content: result.reply,
    ...result,
    fairExchange: true,
  });
}
