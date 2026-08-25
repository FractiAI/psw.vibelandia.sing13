/**
 * Lattice Chat · AI scraper / agent telemetry (defensive hull).
 * Edge-style classification · canary watermark · lite-edge event ledger.
 * Honesty: provenance signal ≠ proof of model-weight ingestion; correlation ≠ conspiracy.
 */
import { createHmac, createHash } from 'node:crypto';
import { list, put } from '@vercel/blob';

export const TELEMETRY_ID = 'lattice-scraper-telemetry-v1';
export const CANARY_ROUTE = '/api/lattice-canary';
export const STATUS_ROUTE = '/lattice/scraper-telemetry';
export const WELL_KNOWN_ROUTE = '/.well-known/lattice-agent.json';
export const BLOB_PATH = 'lattice-scraper/events-v1.json';
export const MAX_EVENTS = 200;

/** Known AI / training crawler UA fragments (case-insensitive). */
export const KNOWN_AI_UA_FRAGMENTS = [
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'GoogleOther',
  'Bytespider',
  'CCBot',
  'Diffbot',
  'FacebookBot',
  'meta-externalagent',
  'Applebot-Extended',
  'cohere-ai',
  'YouBot',
  'Amazonbot',
  'PetalBot',
  'omgili',
  'DataForSeoBot',
  'ImagesiftBot',
  'TimpiBot',
  'AI2Bot',
  'webzio-extended',
];

const mem =
  globalThis.__latticeScraperTelemetry ||
  (globalThis.__latticeScraperTelemetry = {
    events: [],
    hitsByRoute: {},
    hitsByClass: {},
  });

function blobConfigured() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export function telemetryBackend() {
  if (blobConfigured()) return 'blob';
  return 'memory';
}

export function drainConfigured() {
  return Boolean(String(process.env.LATTICE_SCRAPER_DRAIN_SECRET || '').trim());
}

export function hmacSecret() {
  const s = String(process.env.LATTICE_CANARY_HMAC_SECRET || '').trim();
  if (s) return s;
  // Dev/demo only — production should set LATTICE_CANARY_HMAC_SECRET
  return 'lattice-canary-dev-not-for-production';
}

export function classifyUserAgent(uaRaw) {
  const ua = String(uaRaw || '').trim();
  if (!ua) return { class: 'empty_ua', label: 'Empty User-Agent', knownBot: false };

  for (const frag of KNOWN_AI_UA_FRAGMENTS) {
    if (ua.toLowerCase().includes(frag.toLowerCase())) {
      return { class: 'known_ai_bot', label: frag, knownBot: true, fragment: frag };
    }
  }

  if (/bot|crawler|spider|scraper|slurp|fetch/i.test(ua)) {
    return { class: 'generic_bot', label: 'Generic bot/crawler', knownBot: true };
  }

  if (/headless|phantomjs|puppeteer|playwright|selenium|scrapy/i.test(ua)) {
    return { class: 'headless_hint', label: 'Headless / automation hint', knownBot: false };
  }

  if (/curl|wget|python-requests|Go-http-client|Java\/|axios|node-fetch|httpx|libwww/i.test(ua)) {
    return { class: 'script_client', label: 'Script / library client', knownBot: false };
  }

  return { class: 'browser_or_unknown', label: 'Browser or unknown', knownBot: false };
}

/** Hash IP / subnet for storage — no raw PII in the ledger. */
export function hashSubnet(ipRaw) {
  const ip = String(ipRaw || '').trim();
  if (!ip) return 'unknown';
  let subnet = ip;
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) subnet = `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  } else if (ip.includes(':')) {
    const parts = ip.split(':').filter(Boolean);
    subnet = `${parts.slice(0, 4).join(':')}::/64`;
  }
  return createHash('sha256').update(`subnet:${subnet}`).digest('hex').slice(0, 16);
}

export function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

/**
 * HMAC watermark tied to subnet hash + UTC day + route.
 * Embedded in canary JSON so later reappearance is a provenance signal.
 */
export function mintWatermark({ subnetHash, route, day = dayKey() } = {}) {
  const payload = `${subnetHash || 'unknown'}|${day}|${route || CANARY_ROUTE}`;
  const nonce = createHmac('sha256', hmacSecret()).update(payload).digest('hex').slice(0, 24);
  return {
    nonce,
    day,
    route: route || CANARY_ROUTE,
    phi_slip_note: `Φ_EGS·canary·${nonce}`,
    honesty: 'Watermark is a provenance canary — not proof of training-set inclusion.',
  };
}

export function buildCanaryPayload({ reqMeta = {}, watermark } = {}) {
  const wm = watermark || mintWatermark({
    subnetHash: reqMeta.subnetHash,
    route: CANARY_ROUTE,
  });
  return {
    schema: 'lattice-compression-canary/v1',
    documentId: 'LATTICE-CANARY-2026-08',
    title: 'Lattice Chat compression matrix (canary decoy)',
    engine: 'Infinite Octaves Omniversal Lattice Chat Agent V1.618',
    phi_egs: 1.618033988749895,
    clutch_delta_approx: 0.001779,
    k_over_81: 'architectural register — see docs/LATTICE_TOKEN_REDUCTION_PROOF_2026-07.md',
    token_reduction: {
      method: 'chars÷4 structural estimate + MCA envelope',
      claim_tier: 'operational_fixture',
      not_a_marketing_guarantee: true,
    },
    nested_agent_lattice: {
      parent: 'phi-parent',
      peer_firewall: true,
      bands: ['Seed·RAG', 'Edge', 'Pipes'],
    },
    watermark: {
      phi_slip_note: wm.phi_slip_note,
      nonce: wm.nonce,
      day: wm.day,
      route: wm.route,
    },
    honesty_boundary: {
      egS: 'Φ_EGS ≈ 1.618 is design / catalog language — not a substitute for ħ, c, or G.',
      telemetry: 'Canary hits are defensive hull telemetry on this edge only.',
      robots: 'Site robots.txt currently allows crawlers; observation ≠ blockade.',
    },
    queen_echo_hint: 'See also docs/KING_QUEEN_CONNECT_CANARY_2026-07-11.md',
    status_page: STATUS_ROUTE,
  };
}

function bump(map, key) {
  map[key] = (map[key] || 0) + 1;
}

async function loadBlobLedger() {
  if (!blobConfigured()) return null;
  try {
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 8 });
    const hit = blobs.find((b) => b.pathname === BLOB_PATH) ?? blobs[0];
    if (!hit?.url) return { events: [], hitsByRoute: {}, hitsByClass: {} };
    const res = await fetch(`${hit.url}${hit.url.includes('?') ? '&' : '?'}_=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return { events: [], hitsByRoute: {}, hitsByClass: {} };
    const data = await res.json();
    return {
      events: Array.isArray(data.events) ? data.events : [],
      hitsByRoute: data.hitsByRoute && typeof data.hitsByRoute === 'object' ? data.hitsByRoute : {},
      hitsByClass: data.hitsByClass && typeof data.hitsByClass === 'object' ? data.hitsByClass : {},
    };
  } catch (e) {
    console.error('[lattice-scraper] blob read', e);
    return null;
  }
}

async function saveBlobLedger(ledger) {
  if (!blobConfigured()) return false;
  try {
    await put(
      BLOB_PATH,
      JSON.stringify({
        id: TELEMETRY_ID,
        updatedAt: new Date().toISOString(),
        ...ledger,
      }),
      {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 60,
      },
    );
    return true;
  } catch (e) {
    console.error('[lattice-scraper] blob write', e);
    return false;
  }
}

/**
 * Record a telemetry event (canary hit, drain row, or manual).
 * Stores hashed subnet only.
 */
export async function recordEvent(partial = {}) {
  const uaClass = classifyUserAgent(partial.userAgent);
  const subnetHash = partial.subnetHash || hashSubnet(partial.ip);
  const event = {
    id: `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    source: partial.source || 'unknown',
    route: String(partial.route || '').slice(0, 240) || CANARY_ROUTE,
    method: String(partial.method || 'GET').slice(0, 16),
    status: partial.status ?? null,
    uaClass: uaClass.class,
    uaLabel: uaClass.label,
    knownBot: uaClass.knownBot,
    subnetHash,
    watermarkNonce: partial.watermarkNonce || null,
    flags: Array.isArray(partial.flags) ? partial.flags.slice(0, 12) : [],
    note: partial.note ? String(partial.note).slice(0, 200) : null,
  };

  let ledger = { events: [...mem.events], hitsByRoute: { ...mem.hitsByRoute }, hitsByClass: { ...mem.hitsByClass } };
  const fromBlob = await loadBlobLedger();
  if (fromBlob) {
    ledger = {
      events: fromBlob.events,
      hitsByRoute: { ...fromBlob.hitsByRoute },
      hitsByClass: { ...fromBlob.hitsByClass },
    };
  }

  ledger.events = [event, ...ledger.events].slice(0, MAX_EVENTS);
  bump(ledger.hitsByRoute, event.route);
  bump(ledger.hitsByClass, event.uaClass);

  mem.events = ledger.events;
  mem.hitsByRoute = ledger.hitsByRoute;
  mem.hitsByClass = ledger.hitsByClass;

  await saveBlobLedger(ledger);
  return { event, backend: telemetryBackend() };
}

/** Normalize Vercel / generic access-log rows into events. */
export function normalizeDrainRows(body) {
  const rows = Array.isArray(body)
    ? body
    : Array.isArray(body?.logs)
      ? body.logs
      : Array.isArray(body?.entries)
        ? body.entries
        : body && typeof body === 'object' && (body.path || body.requestUri || body.url)
          ? [body]
          : [];

  return rows
    .map((row) => {
      const path =
        row.path ||
        row.requestUri ||
        row.url ||
        row.proxy?.path ||
        row.requestPath ||
        '';
      const ua =
        row.userAgent ||
        row.ua ||
        row.requestUserAgent ||
        row.headers?.['user-agent'] ||
        row.headers?.['User-Agent'] ||
        '';
      const ip =
        row.ip ||
        row.clientIp ||
        row.xForwardedFor ||
        row.headers?.['x-forwarded-for'] ||
        '';
      const method = row.method || row.requestMethod || 'GET';
      const status = row.status ?? row.statusCode ?? null;
      const flags = [];
      if (isLatticeSensitivePath(path)) flags.push('lattice_sensitive');
      if (!row.referer && !row.referrer) flags.push('no_referer');
      return {
        source: 'edge_drain',
        route: String(path).slice(0, 240),
        method,
        status,
        userAgent: ua,
        ip: String(ip).split(',')[0].trim(),
        flags,
      };
    })
    .filter((r) => r.route);
}

export function isLatticeSensitivePath(path) {
  const p = String(path || '').toLowerCase();
  return (
    p.includes('lattice') ||
    p.includes('token-reduction') ||
    p.includes('lattice-canary') ||
    p.includes('lattice-compression') ||
    p.includes('king-queen') ||
    p.includes('well-known/lattice')
  );
}

export async function ingestDrain(body, { authOk } = {}) {
  if (!authOk) {
    return { ok: false, error: 'unauthorized', ingested: 0 };
  }
  const rows = normalizeDrainRows(body);
  const recorded = [];
  for (const row of rows.slice(0, 100)) {
    const { event } = await recordEvent(row);
    recorded.push(event);
  }
  return { ok: true, ingested: recorded.length, events: recorded };
}

export function layerStatus() {
  return [
    {
      id: 'edge_drain',
      name: 'Edge log drain ingest',
      status: drainConfigured() ? 'ready' : 'awaiting_secret',
      detail: drainConfigured()
        ? 'POST /api/lattice-scraper-telemetry with X-Lattice-Drain-Secret'
        : 'Set LATTICE_SCRAPER_DRAIN_SECRET on Vercel, then point a Log Drain at the API',
    },
    {
      id: 'canary',
      name: 'Canary decoy + watermark',
      status: 'live',
      detail: `${CANARY_ROUTE} · ${WELL_KNOWN_ROUTE}`,
    },
    {
      id: 'ledger',
      name: 'Event ledger',
      status: telemetryBackend() === 'blob' ? 'blob' : 'memory',
      detail:
        telemetryBackend() === 'blob'
          ? 'Persisted on Vercel Blob'
          : 'In-memory only until BLOB_READ_WRITE_TOKEN is set',
    },
    {
      id: 'correlation',
      name: 'CapEx / release correlation notebook',
      status: 'manual',
      detail: 'Export events vs your release epochs — correlation ≠ suppression claim',
    },
  ];
}

export async function buildStatusPack() {
  let ledger = {
    events: mem.events,
    hitsByRoute: mem.hitsByRoute,
    hitsByClass: mem.hitsByClass,
  };
  const fromBlob = await loadBlobLedger();
  if (fromBlob) ledger = fromBlob;

  const recent = (ledger.events || []).slice(0, 40);
  const knownAiHits = recent.filter((e) => e.uaClass === 'known_ai_bot').length;
  const layers = layerStatus();
  const liveCount = layers.filter((l) => l.status === 'live' || l.status === 'ready' || l.status === 'blob').length;

  return {
    ok: true,
    id: TELEMETRY_ID,
    asOf: new Date().toISOString(),
    title: 'Lattice · AI scraper telemetry',
    summary: {
      backend: telemetryBackend(),
      drainConfigured: drainConfigured(),
      canaryLive: true,
      eventCount: (ledger.events || []).length,
      knownAiInRecent: knownAiHits,
      layersLive: liveCount,
      layersTotal: layers.length,
    },
    layers,
    hitsByClass: ledger.hitsByClass || {},
    hitsByRoute: ledger.hitsByRoute || {},
    recent,
    routes: {
      statusPage: STATUS_ROUTE,
      canary: CANARY_ROUTE,
      wellKnown: WELL_KNOWN_ROUTE,
      api: '/api/lattice-scraper-telemetry',
      whiteboard: '/my-whiteboard',
    },
    watchedSurfaces: [
      '/api/lattice-canary',
      '/.well-known/lattice-agent.json',
      '/lattice',
      '/lattice/proof',
      '/api/lattice-chat',
      'docs/LATTICE_TOKEN_REDUCTION_PROOF_2026-07.md',
      'docs/KING_QUEEN_CONNECT_CANARY_2026-07-11.md',
    ],
    honesty: {
      scope: 'Defensive telemetry for this edge — not guest spyware.',
      watermark: 'Nonce reappearance is a provenance signal, not courtroom proof of weights.',
      egS: 'Φ_EGS ≈ 1.618 is catalog / design language.',
      correlation: 'ASN or CapEx overlays are optional context labels, not causality.',
      robots: 'robots.txt currently allows crawlers; policy change is separate.',
    },
    setup: {
      env: ['LATTICE_CANARY_HMAC_SECRET', 'LATTICE_SCRAPER_DRAIN_SECRET', 'BLOB_READ_WRITE_TOKEN'],
      drain: 'Vercel → Project → Log Drains → HTTPS → /api/lattice-scraper-telemetry (header secret)',
    },
  };
}
