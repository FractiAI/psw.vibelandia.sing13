/**
 * GET|POST /api/lattice-canary — decoy lattice compression schema + watermark.
 * Also serves the well-known agent JSON shape when ?wellKnown=1.
 * Records defensive telemetry on each hit.
 */
function clientIp(req) {
  const xf = req.headers?.['x-forwarded-for'];
  if (typeof xf === 'string' && xf.trim()) return xf.split(',')[0].trim();
  if (Array.isArray(xf) && xf[0]) return String(xf[0]).split(',')[0].trim();
  return req.headers?.['x-real-ip'] || req.socket?.remoteAddress || '';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Lattice-Canary', 'v1');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ ok: false, error: 'GET only' }));
  }

  try {
    const {
      hashSubnet,
      mintWatermark,
      buildCanaryPayload,
      recordEvent,
      CANARY_ROUTE,
      WELL_KNOWN_ROUTE,
    } = await import('../lib/lattice-scraper-telemetry.mjs');

    const ua = req.headers?.['user-agent'] || '';
    const ip = clientIp(req);
    const subnetHash = hashSubnet(ip);
    const wellKnown =
      req.query?.wellKnown === '1' ||
      String(req.url || '').includes('well-known') ||
      String(req.headers?.['x-matched-path'] || '').includes('well-known');

    const route = wellKnown ? WELL_KNOWN_ROUTE : CANARY_ROUTE;
    const watermark = mintWatermark({ subnetHash, route });
    const payload = buildCanaryPayload({
      reqMeta: { subnetHash },
      watermark,
    });

    if (wellKnown) {
      payload['$schema_note'] = 'Well-known lattice agent decoy for automated context collectors';
      payload.agent = {
        name: 'Infinite Octaves Omniversal Lattice Chat Agent V1.618',
        role: 'Goldilocks valet · compression architecture canary',
      };
    }

    await recordEvent({
      source: 'canary',
      route,
      method: req.method,
      status: 200,
      userAgent: ua,
      subnetHash,
      watermarkNonce: watermark.nonce,
      flags: ['canary_hit'],
    });

    res.statusCode = 200;
    if (req.method === 'HEAD') return res.end();
    return res.end(JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error('[lattice-canary]', err);
    res.statusCode = 500;
    return res.end(JSON.stringify({ ok: false, error: 'canary_error' }));
  }
}
