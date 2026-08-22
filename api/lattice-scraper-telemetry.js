/**
 * GET  /api/lattice-scraper-telemetry — status pack for the report page
 * POST /api/lattice-scraper-telemetry — edge log drain ingest (secret header)
 *        or manual event record { route, userAgent, ... }
 */
function readBody(req) {
  if (typeof req.body === 'object' && req.body) return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

function clientIp(req) {
  const xf = req.headers?.['x-forwarded-for'];
  if (typeof xf === 'string' && xf.trim()) return xf.split(',')[0].trim();
  if (Array.isArray(xf) && xf[0]) return String(xf[0]).split(',')[0].trim();
  return req.headers?.['x-real-ip'] || '';
}

function drainAuthOk(req) {
  const expected = String(process.env.LATTICE_SCRAPER_DRAIN_SECRET || '').trim();
  if (!expected) return false;
  const got =
    req.headers?.['x-lattice-drain-secret'] ||
    req.headers?.['x-drain-secret'] ||
    req.query?.secret ||
    '';
  return String(got) === expected;
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Lattice-Drain-Secret, X-Drain-Secret');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  try {
    const mod = await import('../lib/lattice-scraper-telemetry.mjs');

    if (req.method === 'GET') {
      const pack = await mod.buildStatusPack();
      res.statusCode = 200;
      return res.end(JSON.stringify(pack));
    }

    if (req.method === 'POST') {
      const body = readBody(req);
      const isDrain =
        Array.isArray(body) ||
        Array.isArray(body?.logs) ||
        Array.isArray(body?.entries) ||
        body?.source === 'edge_drain' ||
        req.headers?.['x-vercel-log-drain'] != null ||
        req.query?.drain === '1';

      if (isDrain) {
        const result = await mod.ingestDrain(body, { authOk: drainAuthOk(req) });
        res.statusCode = result.ok ? 200 : 401;
        return res.end(JSON.stringify(result));
      }

      // Manual / probe event
      const { event, backend } = await mod.recordEvent({
        source: body.source || 'manual',
        route: body.route || body.path || '/api/lattice-scraper-telemetry',
        method: body.method || 'POST',
        status: body.status ?? 200,
        userAgent: body.userAgent || req.headers?.['user-agent'] || '',
        ip: body.ip || clientIp(req),
        flags: body.flags || ['manual'],
        note: body.note,
        watermarkNonce: body.watermarkNonce,
      });
      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, event, backend }));
    }

    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.statusCode = 405;
    return res.end(JSON.stringify({ ok: false, error: 'method not allowed' }));
  } catch (err) {
    console.error('[lattice-scraper-telemetry]', err);
    res.statusCode = 500;
    return res.end(JSON.stringify({ ok: false, error: 'server' }));
  }
}
