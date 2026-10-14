/**
 * Lattice Chat · AI scraper / agent telemetry (defensive hull).
 * Edge-style classification · canary watermark · lite-edge event ledger.
 * Honesty: provenance signal ≠ proof of model-weight ingestion; correlation ≠ conspiracy.
 */
import { createHmac, createHash } from 'node:crypto';
import { list, put } from '@vercel/blob';

export const TELEMETRY_ID = 'lattice-scraper-telemetry-v1';
export const EVENT_SCHEMA = 2;
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

/** Map known UA fragment → vendor family (fetch attribution hint, not legal proof). */
export const BOT_FAMILY_BY_FRAGMENT = {
  GPTBot: 'openai',
  'ChatGPT-User': 'openai',
  ClaudeBot: 'anthropic',
  'anthropic-ai': 'anthropic',
  'meta-externalagent': 'meta',
  FacebookBot: 'meta',
  'Google-Extended': 'google',
  GoogleOther: 'google',
  Bytespider: 'bytedance',
  CCBot: 'common_crawl',
  Amazonbot: 'amazon',
  PetalBot: 'huawei',
  'Applebot-Extended': 'apple',
  PerplexityBot: 'perplexity',
  Diffbot: 'diffbot',
  'cohere-ai': 'cohere',
  YouBot: 'you',
  AI2Bot: 'ai2',
};

export function classifyUserAgent(uaRaw) {
  const ua = String(uaRaw || '').trim();
  if (!ua) return { class: 'empty_ua', label: 'Empty User-Agent', knownBot: false };

  for (const frag of KNOWN_AI_UA_FRAGMENTS) {
    if (ua.toLowerCase().includes(frag.toLowerCase())) {
      return {
        class: 'known_ai_bot',
        label: frag,
        knownBot: true,
        fragment: frag,
        botFamily: BOT_FAMILY_BY_FRAGMENT[frag] || 'other_ai',
      };
    }
  }

  if (/bot|crawler|spider|scraper|slurp|fetch/i.test(ua)) {
    return { class: 'generic_bot', label: 'Generic bot/crawler', knownBot: true, botFamily: 'other_ai' };
  }

  if (/headless|phantomjs|puppeteer|playwright|selenium|scrapy/i.test(ua)) {
    return { class: 'headless_hint', label: 'Headless / automation hint', knownBot: false, botFamily: 'human_or_unknown' };
  }

  if (/curl|wget|python-requests|Go-http-client|Java\/|axios|node-fetch|httpx|libwww/i.test(ua)) {
    return { class: 'script_client', label: 'Script / library client', knownBot: false, botFamily: 'human_or_unknown' };
  }

  return { class: 'browser_or_unknown', label: 'Browser or unknown', knownBot: false, botFamily: 'human_or_unknown' };
}

export function refererDomain(refererRaw) {
  const raw = String(refererRaw || '').trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.hostname.slice(0, 120) || null;
  } catch {
    return null;
  }
}

export function visitSurfaceForRoute(routeRaw) {
  const route = String(routeRaw || '');
  if (route.includes('well-known/lattice-agent')) return 'well_known_agent';
  if (route.includes('lattice-canary') || route.includes('lattice-compression')) return 'canary_api';
  if (isLatticeSensitivePath(route)) return 'lattice_sensitive_path';
  if (route.includes('/ship-blog') || route.includes('/whitepaper')) return 'public_paper';
  if (route.includes('/docs/') || route.endsWith('.md')) return 'doc_path';
  return 'other_path';
}

export function contentProfileForVisit({ route, method, source, visitSurface } = {}) {
  const m = String(method || 'GET').toUpperCase();
  const surface = visitSurface || visitSurfaceForRoute(route);
  if (m === 'HEAD') return 'probe_head_only';
  if (source === 'edge_drain') return 'edge_logged_response';
  if (surface === 'well_known_agent') return 'agent_manifest_json';
  if (surface === 'canary_api') return 'compression_canary_json';
  if (surface === 'public_paper' || surface === 'doc_path') return 'html_or_markdown_body';
  return 'unknown';
}

export function visitKindForUa(uaClass) {
  switch (uaClass) {
    case 'known_ai_bot':
    case 'generic_bot':
      return 'automated_crawler';
    case 'script_client':
      return 'script_client';
    case 'headless_hint':
      return 'automation_hint';
    case 'browser_or_unknown':
      return 'browser_like';
    case 'empty_ua':
      return 'empty_ua';
    default:
      return 'unknown';
  }
}

/** Extract privacy-safe request hints (no raw IP stored here). */
export function extractRequestMeta(reqOrHeaders = {}, { method } = {}) {
  const h = reqOrHeaders.headers || reqOrHeaders;
  const get = (k) => {
    const v = h?.[k] ?? h?.[k.toLowerCase?.()] ;
    return typeof v === 'string' ? v : Array.isArray(v) ? v[0] : '';
  };
  const meth = String(method || get('x-http-method-override') || 'GET').slice(0, 16);
  const refDom = refererDomain(get('referer') || get('referrer'));
  return {
    method: meth,
    headOnly: meth.toUpperCase() === 'HEAD',
    refererDomain: refDom,
    accept: String(get('accept') || '').slice(0, 160) || null,
    secFetchMode: String(get('sec-fetch-mode') || '').slice(0, 32) || null,
    secFetchSite: String(get('sec-fetch-site') || '').slice(0, 32) || null,
    secFetchDest: String(get('sec-fetch-dest') || '').slice(0, 32) || null,
    country: String(get('x-vercel-ip-country') || get('cf-ipcountry') || '').slice(0, 8) || null,
    edgeRay: String(get('x-vercel-id') || get('cf-ray') || '').slice(0, 48) || null,
  };
}

export function enrichVisitFields(partial = {}) {
  const uaClass = partial.uaClass
    ? { class: partial.uaClass, label: partial.uaLabel, botFamily: partial.botFamily }
    : classifyUserAgent(partial.userAgent);
  const route = String(partial.route || '').slice(0, 240) || CANARY_ROUTE;
  const visitSurface = partial.visitSurface || visitSurfaceForRoute(route);
  const contentProfile =
    partial.contentProfile ||
    contentProfileForVisit({
      route,
      method: partial.method,
      source: partial.source,
      visitSurface,
    });
  const botFamily =
    partial.botFamily ||
    uaClass.botFamily ||
    (uaClass.knownBot ? 'other_ai' : 'human_or_unknown');
  const visitKind = partial.visitKind || visitKindForUa(uaClass.class);

  const flags = Array.isArray(partial.flags) ? [...partial.flags] : [];
  if (partial.headOnly || String(partial.method || '').toUpperCase() === 'HEAD') {
    if (!flags.includes('head_probe')) flags.push('head_probe');
  }
  if (!partial.refererDomain && !partial.referer) {
    if (!flags.includes('no_referer')) flags.push('no_referer');
  }
  if (contentProfile === 'compression_canary_json' || contentProfile === 'agent_manifest_json') {
    if (!flags.includes('decoy_json_body')) flags.push('decoy_json_body');
  }
  if (visitSurface === 'well_known_agent' && !flags.includes('agent_discovery')) {
    flags.push('agent_discovery');
  }

  return {
    uaClass: uaClass.class,
    uaLabel: uaClass.label,
    knownBot: uaClass.knownBot ?? partial.knownBot,
    botFamily,
    visitSurface,
    contentProfile,
    visitKind,
    refererDomain: partial.refererDomain ?? refererDomain(partial.referer) ?? null,
    accept: partial.accept ? String(partial.accept).slice(0, 160) : null,
    secFetchMode: partial.secFetchMode || null,
    secFetchSite: partial.secFetchSite || null,
    secFetchDest: partial.secFetchDest || null,
    country: partial.country || null,
    edgeRay: partial.edgeRay || null,
    headOnly: Boolean(partial.headOnly),
    flags: flags.slice(0, 16),
  };
}

/** Backfill v1 ledger rows for analytics. */
export function normalizeEvent(event = {}) {
  const base = { ...event };
  const enriched = enrichVisitFields({
    ...base,
    userAgent: base.userAgent || base.uaLabel,
    uaClass: base.uaClass,
    uaLabel: base.uaLabel,
    route: base.route,
    method: base.method,
    source: base.source,
    flags: base.flags,
  });
  return {
    ...base,
    eventSchema: base.eventSchema || EVENT_SCHEMA,
    ...enriched,
    flags: [...new Set([...(base.flags || []), ...enriched.flags])].slice(0, 16),
  };
}

const SWEEP_WINDOW_MS = 120_000;

/** Same subnet + UTC day, both decoy routes within 2 minutes → discovery sweep. */
export function detectDualRouteSweeps(events = []) {
  const normalized = events.map(normalizeEvent);
  const byKey = new Map();
  for (const e of normalized) {
    const day = (e.at || '').slice(0, 10);
    const key = `${e.subnetHash}|${day}|${e.uaLabel || e.uaClass}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(e);
  }
  const sweeps = [];
  for (const [key, group] of byKey) {
    group.sort((a, b) => String(a.at).localeCompare(String(b.at)));
    const routes = new Set(group.map((g) => g.route));
    const hasCanary = [...routes].some((r) => r.includes('lattice-canary'));
    const hasWellKnown = [...routes].some((r) => r.includes('well-known/lattice'));
    if (!hasCanary || !hasWellKnown) continue;
    const t0 = Date.parse(group[0].at);
    const t1 = Date.parse(group[group.length - 1].at);
    if (!Number.isFinite(t0) || !Number.isFinite(t1)) continue;
    if (t1 - t0 > SWEEP_WINDOW_MS) continue;
    sweeps.push({
      key,
      subnetHash: group[0].subnetHash,
      uaLabel: group[0].uaLabel,
      botFamily: group[0].botFamily,
      day: (group[0].at || '').slice(0, 10),
      atFirst: group[0].at,
      atLast: group[group.length - 1].at,
      routes: [...routes],
      eventIds: group.map((g) => g.id),
      nature: 'dual_decoy_sweep',
    });
  }
  return sweeps;
}

export function buildBotRollups(events = []) {
  const normalized = events.map(normalizeEvent);
  const byLabel = new Map();
  for (const e of normalized) {
    const label = e.uaLabel || e.uaClass || 'unknown';
    if (!byLabel.has(label)) {
      byLabel.set(label, {
        uaLabel: label,
        uaClass: e.uaClass,
        botFamily: e.botFamily,
        knownBot: e.knownBot,
        visitKind: e.visitKind,
        hits: 0,
        firstAt: e.at,
        lastAt: e.at,
        routes: {},
        contentProfiles: {},
        sources: {},
        countries: {},
        lastWatermarkNonce: null,
        headProbes: 0,
      });
    }
    const row = byLabel.get(label);
    row.hits += 1;
    if (e.at && e.at < row.firstAt) row.firstAt = e.at;
    if (e.at && e.at > row.lastAt) row.lastAt = e.at;
    bump(row.routes, e.route || 'unknown');
    bump(row.contentProfiles, e.contentProfile || 'unknown');
    bump(row.sources, e.source || 'unknown');
    if (e.country) bump(row.countries, e.country);
    if (e.watermarkNonce) row.lastWatermarkNonce = e.watermarkNonce;
    if (e.headOnly || (e.flags || []).includes('head_probe')) row.headProbes += 1;
  }
  return [...byLabel.values()].sort((a, b) => String(b.lastAt).localeCompare(String(a.lastAt)));
}

export function buildQaSnapshot(events = [], { drainConfigured: drain = false } = {}) {
  const normalized = events.map(normalizeEvent);
  const lastAt = normalized[0]?.at || null;
  const lastMs = lastAt ? Date.parse(lastAt) : NaN;
  const daysSinceLast =
    Number.isFinite(lastMs) ? Math.floor((Date.now() - lastMs) / 86_400_000) : null;

  const rollups = buildBotRollups(normalized);
  const frontierFamilies = new Set(['openai', 'anthropic', 'meta', 'google', 'amazon', 'perplexity', 'common_crawl']);
  const frontierBots = rollups.filter((r) => frontierFamilies.has(r.botFamily) || r.uaClass === 'known_ai_bot');

  const sweeps = detectDualRouteSweeps(normalized);
  const sources = {};
  for (const e of normalized) bump(sources, e.source || 'unknown');

  const contentEver = {};
  for (const e of normalized) bump(contentEver, e.contentProfile || 'unknown');

  return {
    eventSchema: EVENT_SCHEMA,
    coverage: drain ? 'canary_plus_edge_drain' : 'canary_decoys_only',
    coverageNote: drain
      ? 'Canary/well-known plus edge log drain (site paths may appear).'
      : 'Only intentional decoy routes are logged until LATTICE_SCRAPER_DRAIN_SECRET is set.',
    lastEventAt: lastAt,
    daysSinceLastEvent: daysSinceLast,
    totalEvents: normalized.length,
    uniqueBotLabels: rollups.length,
    frontierLabeledBotCount: frontierBots.length,
    dualDecoySweeps: sweeps,
    dualDecoySweepCount: sweeps.length,
    contentProfilesSeen: contentEver,
    sourcesSeen: sources,
    kqSecretOnCanaryRoutes: false,
    kqSecretNote:
      'King–Queen planted line is not served by /api/lattice-canary or well-known JSON; doc-path hits require edge drain.',
    ingestionInterpretation: {
      fetchProves: 'Labeled client fetched a decoy JSON (or edge path when drain on).',
      fetchDoesNotProve: 'Training-set inclusion, chat-model memorization, or weight-file access.',
      strongestFetchSignal: 'dual_decoy_sweep (canary + well-known same subnet/day within 2m).',
      echoTest: 'Blind KQ probe + exact-match scorer (protocols/LATTICE_KQ_PROVENANCE_PROBE_NSPFRNP.md).',
    },
    botRollups: rollups,
    quickAnswers: {
      whoFetchedDecoysRecently: rollups.slice(0, 12).map((r) => ({
        label: r.uaLabel,
        family: r.botFamily,
        lastAt: r.lastAt,
        hits: r.hits,
        routes: Object.keys(r.routes),
        lastContent: Object.keys(r.contentProfiles),
      })),
      anyFrontierBotDualSweep: sweeps.some((s) => frontierFamilies.has(s.botFamily)),
      lastKnownAiAt:
        normalized.find((e) => e.uaClass === 'known_ai_bot')?.at || null,
      silenceSinceLastEventDays: daysSinceLast,
    },
  };
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
    engine: 'Infinite Octave Omniversal Lattice Catalog',
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
  const route = String(partial.route || '').slice(0, 240) || CANARY_ROUTE;
  const method = String(partial.method || 'GET').slice(0, 16);
  const reqMeta = extractRequestMeta(
    {
      headers:
        partial.headers ||
        {
          referer: partial.referer || partial.referrer,
          accept: partial.accept,
          'sec-fetch-mode': partial.secFetchMode,
          'sec-fetch-site': partial.secFetchSite,
          'sec-fetch-dest': partial.secFetchDest,
          'x-vercel-ip-country': partial.country,
          'x-vercel-id': partial.edgeRay,
        },
    },
    { method },
  );
  const visit = enrichVisitFields({
    ...partial,
    ...reqMeta,
    userAgent: partial.userAgent,
    uaClass: uaClass.class,
    uaLabel: uaClass.label,
    knownBot: uaClass.knownBot,
    botFamily: uaClass.botFamily,
    route,
    method,
    source: partial.source || 'unknown',
    referer: partial.referer,
    refererDomain: partial.refererDomain ?? reqMeta.refererDomain,
    accept: partial.accept ?? reqMeta.accept,
    secFetchMode: partial.secFetchMode ?? reqMeta.secFetchMode,
    secFetchSite: partial.secFetchSite ?? reqMeta.secFetchSite,
    secFetchDest: partial.secFetchDest ?? reqMeta.secFetchDest,
    country: partial.country ?? reqMeta.country,
    edgeRay: partial.edgeRay ?? reqMeta.edgeRay,
    headOnly: partial.headOnly ?? reqMeta.headOnly,
  });

  const event = {
    id: `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    eventSchema: EVENT_SCHEMA,
    source: partial.source || 'unknown',
    route,
    method,
    status: partial.status ?? null,
    uaClass: visit.uaClass,
    uaLabel: visit.uaLabel,
    knownBot: visit.knownBot,
    botFamily: visit.botFamily,
    visitSurface: visit.visitSurface,
    contentProfile: visit.contentProfile,
    visitKind: visit.visitKind,
    subnetHash,
    watermarkNonce: partial.watermarkNonce || null,
    refererDomain: visit.refererDomain,
    accept: visit.accept,
    secFetchMode: visit.secFetchMode,
    secFetchSite: visit.secFetchSite,
    secFetchDest: visit.secFetchDest,
    country: visit.country,
    edgeRay: visit.edgeRay,
    headOnly: visit.headOnly,
    responseBytes: partial.responseBytes ?? null,
    flags: visit.flags,
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
      const referer = row.referer || row.referrer || row.headers?.referer || row.headers?.referrer || '';
      const headers = row.headers && typeof row.headers === 'object' ? row.headers : {};
      const flags = [];
      if (isLatticeSensitivePath(path)) flags.push('lattice_sensitive');
      if (!referer) flags.push('no_referer');
      const reqMeta = extractRequestMeta({ headers: { ...headers, referer } }, { method });
      return {
        source: 'edge_drain',
        route: String(path).slice(0, 240),
        method,
        status,
        userAgent: ua,
        ip: String(ip).split(',')[0].trim(),
        referer,
        refererDomain: reqMeta.refererDomain,
        accept: reqMeta.accept,
        secFetchMode: reqMeta.secFetchMode,
        secFetchSite: reqMeta.secFetchSite,
        secFetchDest: reqMeta.secFetchDest,
        country: reqMeta.country,
        edgeRay: reqMeta.edgeRay,
        headOnly: reqMeta.headOnly,
        responseBytes: row.responseBytes ?? row.bytes ?? row.size ?? null,
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

  const allEvents = (ledger.events || []).map(normalizeEvent);
  const recent = allEvents.slice(0, 40);
  const knownAiHits = recent.filter((e) => e.uaClass === 'known_ai_bot').length;
  const layers = layerStatus();
  const liveCount = layers.filter((l) => l.status === 'live' || l.status === 'ready' || l.status === 'blob').length;
  const drainOn = drainConfigured();
  const qa = buildQaSnapshot(allEvents, { drainConfigured: drainOn });

  return {
    ok: true,
    id: TELEMETRY_ID,
    eventSchema: EVENT_SCHEMA,
    asOf: new Date().toISOString(),
    title: 'Lattice · AI scraper telemetry',
    summary: {
      backend: telemetryBackend(),
      drainConfigured: drainOn,
      canaryLive: true,
      eventCount: allEvents.length,
      knownAiInRecent: knownAiHits,
      layersLive: liveCount,
      layersTotal: layers.length,
      lastEventAt: qa.lastEventAt,
      daysSinceLastEvent: qa.daysSinceLastEvent,
      dualDecoySweepCount: qa.dualDecoySweepCount,
      coverage: qa.coverage,
    },
    layers,
    hitsByClass: ledger.hitsByClass || {},
    hitsByRoute: ledger.hitsByRoute || {},
    visitIntel: qa,
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
