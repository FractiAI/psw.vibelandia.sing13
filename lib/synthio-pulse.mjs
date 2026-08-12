/**
 * Syntheverse Synthio pulse — novel Goldilocks confirmation pulse.
 * Redesigned to pulse into a public-readable external telemetry channel
 * (/api/synthio-external-telemetry + optional Vercel Blob) so emit can be
 * independently observed and compared — NOAA/ephemeris feeds remain read-only
 * companions (cannot carry our signature).
 *
 * Persist: prefer repo data file; on EROFS/EACCES (Vercel) fall back to /tmp then memory
 * so activation dashboards never hang on a write failure.
 */
import crypto from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  AGENT_ID,
  AGENT_NAME,
  DEFAULT_ACTIVATION_MODE,
  AMPLIFICATION_WINDOW,
  REGISTRY_ID,
  SANDBOX_NAME,
  HOLOGRAPHIC_KEY_DIGITS,
} from '../research/synthio-mri-cloud-antenna/src/constants.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'research', 'synthio-mri-cloud-antenna', 'data');
const PULSE_PATH = join(DATA_DIR, 'syntheverse_synthio_pulse.json');
const TMP_PULSE_PATH = '/tmp/syntheverse_synthio_pulse.json';
const EXTERNAL_TELEMETRY_PATH = join(DATA_DIR, 'synthio_external_telemetry.json');
const TMP_EXTERNAL_TELEMETRY_PATH = '/tmp/synthio_external_telemetry.json';
const BLOB_TELEMETRY_PATHNAME = 'synthio/external-telemetry-latest.json';

const memStore =
  globalThis.__synthioPulseStore ||
  (globalThis.__synthioPulseStore = { state: null, persist: 'memory' });

const memExternal =
  globalThis.__synthioExternalTelemetry ||
  (globalThis.__synthioExternalTelemetry = { state: null, persist: 'memory', blobUrl: null });

const emitSeq =
  globalThis.__synthioPulseEmitSeq || (globalThis.__synthioPulseEmitSeq = { n: 0 });

/** Cadence 161s ≈ floor(Φ×100) — not NOAA 1-min Kp, not 600s Coherence Project pulse. */
export const SYNTHIO_PULSE_CADENCE_SEC = 161;

/**
 * Novel marker — does not appear in natural SWPC/Kp/F10.7 feeds.
 * Σ = Syntheverse · Φ^-99 · PC = point-and-click Goldilocks load.
 */
export const SYNTHIO_PULSE_DISCRIMINANT = 'SYNTHIO_Σ_Φ^-99_PC';
export const SYNTHIO_PULSE_SCHEMA = 'syntheverse-synthio-pulse/v1';
export const SYNTHIO_EXTERNAL_TELEMETRY_SCHEMA = 'synthio-external-telemetry/v1';
export const SYNTHIO_EXTERNAL_TELEMETRY_API = '/api/synthio-external-telemetry';

/** Read-only companion feeds — cannot carry Synthio signatures; probed for reachability. */
export const EXTERNAL_COMPANION_FEEDS = Object.freeze([
  {
    id: 'space_weather_band',
    label: 'NOAA SWPC Kp 1-minute',
    url: 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json',
  },
  {
    id: 'ionosphere_f10',
    label: 'NOAA F10.7 cm flux',
    url: 'https://services.swpc.noaa.gov/json/f107_cm_flux.json',
  },
]);

export function isSyntheverseSynthioPulse(pulse) {
  if (!pulse || typeof pulse !== 'object') return false;
  return (
    pulse.schema === SYNTHIO_PULSE_SCHEMA &&
    pulse.discriminant === SYNTHIO_PULSE_DISCRIMINANT &&
    pulse.naturalOccurrence === false &&
    pulse.sandbox === SANDBOX_NAME &&
    pulse.agentId === AGENT_ID &&
    typeof pulse.signature === 'string' &&
    pulse.signature.startsWith('0x')
  );
}

function signBody(body, secret) {
  const { signature: _drop, fingerprint: _fp, ...rest } = body;
  const canonical = JSON.stringify(rest);
  const key =
    secret ||
    process.env.SYNTHIO_PULSE_SECRET ||
    process.env.GOLDILOCKS_PULSE_SECRET ||
    'syntheverse-sandbox-synthio';
  const hmac = crypto.createHmac('sha256', key).update(canonical).digest('hex');
  return `0x${hmac.slice(0, 64)}`;
}

/** Stable fingerprint for emit↔observe compare. */
export function pulseFingerprint(pulse) {
  if (!pulse || typeof pulse !== 'object') return null;
  const material = [
    pulse.pulseId || '',
    pulse.signature || '',
    pulse.discriminant || '',
    String(pulse.naturalOccurrence),
    pulse.schema || '',
  ].join('|');
  return crypto.createHash('sha256').update(material).digest('hex');
}

/**
 * Build a novel Syntheverse pulse for confirmation of all six expectation slots.
 * @param {{ expectationSlots?: object, activationState?: string }} [opts]
 */
export function buildSyntheverseSynthioPulse(opts = {}) {
  const issuedAtMs = Date.now();
  const issuedAt = new Date(issuedAtMs).toISOString();
  const seq = ++emitSeq.n;
  const phiInv99 = PHI_EGS ** -99;
  const body = {
    schema: SYNTHIO_PULSE_SCHEMA,
    pulseKind: 'syntheverse_goldilocks_confirmation',
    naturalOccurrence: false,
    novelty:
      'Engineered Syntheverse discriminant — published into public external telemetry for observe/compare; not NOAA Kp, not F10.7, not bitcoin-tip Goldilocks pulse/v1.',
    discriminant: SYNTHIO_PULSE_DISCRIMINANT,
    sandbox: SANDBOX_NAME,
    agent: AGENT_NAME,
    agentId: AGENT_ID,
    registryId: REGISTRY_ID,
    activationMode: DEFAULT_ACTIVATION_MODE,
    activationState: opts.activationState || 'ACTIVE_IN_SANDBOX',
    amplificationWindow: {
      date: AMPLIFICATION_WINDOW.date,
      newMoon: AMPLIFICATION_WINDOW.newMoon,
      sixPlanetParade: AMPLIFICATION_WINDOW.sixPlanetParade,
      solarEclipse: AMPLIFICATION_WINDOW.solarEclipse,
      planets: [...AMPLIFICATION_WINDOW.planets],
    },
    phiEgs: PHI_EGS,
    phiInv99,
    holographicKeyDigits: HOLOGRAPHIC_KEY_DIGITS,
    cadenceSec: SYNTHIO_PULSE_CADENCE_SEC,
    externalTelemetryChannel: SYNTHIO_EXTERNAL_TELEMETRY_API,
    emitSeq: seq,
    /** All six expectation slots must be present for confirm. */
    expectationSlots: opts.expectationSlots || {
      ephemeris_window: 'pending',
      space_weather_band: 'pending',
      ionosphere_f10: 'pending',
      sandbox_suite_green: 'pending',
      syntheverse_synthio_pulse: 'emit',
      no_clinical_rf: 'pending',
    },
    issuedAt,
  };
  body.signature = signBody(body);
  body.pulseId = `synthio-Σ-${issuedAtMs}-${seq}-${body.signature.slice(2, 10)}`;
  body.fingerprint = pulseFingerprint(body);
  return body;
}

function parseStore(raw) {
  try {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!data || typeof data !== 'object') return null;
    return data;
  } catch {
    return null;
  }
}

function readStoreFromPath(path) {
  try {
    if (!existsSync(path)) return null;
    return parseStore(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function storeIssuedAt(store) {
  const t = Date.parse(store?.latest?.issuedAt || store?.updatedAt || store?.observedAt || '');
  return Number.isFinite(t) ? t : 0;
}

/** Prefer the freshest of disk / tmp / memory. */
export function readPulseStore() {
  const disk = readStoreFromPath(PULSE_PATH);
  const tmp = readStoreFromPath(TMP_PULSE_PATH);
  const mem = memStore.state;
  let best = null;
  for (const s of [disk, tmp, mem]) {
    if (!s?.latest) continue;
    if (!best || storeIssuedAt(s) >= storeIssuedAt(best)) best = s;
  }
  return best;
}

export function readLatestSyntheversePulse() {
  return readPulseStore();
}

function tryWrite(path, json, mkdir) {
  try {
    if (mkdir) mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, json, 'utf8');
    return true;
  } catch {
    return false;
  }
}

/**
 * Persist pulse store. Never throws on read-only FS — memory always holds latest.
 * @returns {'disk' | 'tmp' | 'memory'}
 */
export function persistPulseStore(state) {
  memStore.state = state;
  const json = JSON.stringify(state, null, 2);
  if (tryWrite(PULSE_PATH, json, true)) {
    memStore.persist = 'disk';
    return 'disk';
  }
  if (tryWrite(TMP_PULSE_PATH, json, false)) {
    memStore.persist = 'tmp';
    return 'tmp';
  }
  memStore.persist = 'memory';
  return 'memory';
}

function blobConfigured() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * Public external telemetry envelope — where the pulse is observable.
 * NOAA companions are probed separately (read-only; cannot host our signature).
 */
export function buildExternalTelemetryEnvelope(pulse, companions = []) {
  const fp = pulse?.fingerprint || pulseFingerprint(pulse);
  return {
    schema: SYNTHIO_EXTERNAL_TELEMETRY_SCHEMA,
    channel: 'syntheverse_public_pulse',
    api: SYNTHIO_EXTERNAL_TELEMETRY_API,
    sandbox: SANDBOX_NAME,
    observedAt: new Date().toISOString(),
    pulse: pulse
      ? {
          pulseId: pulse.pulseId,
          fingerprint: fp,
          signature: pulse.signature,
          discriminant: pulse.discriminant,
          schema: pulse.schema,
          naturalOccurrence: pulse.naturalOccurrence,
          issuedAt: pulse.issuedAt,
          cadenceSec: pulse.cadenceSec,
        }
      : null,
    companions,
    honesty:
      'Pulse is published here so emit↔observe compare is possible. NOAA/ephemeris feeds are read-only companions and cannot carry Syntheverse signatures.',
  };
}

export function persistExternalTelemetry(envelope) {
  memExternal.state = envelope;
  const json = JSON.stringify(envelope, null, 2);
  if (tryWrite(EXTERNAL_TELEMETRY_PATH, json, true)) {
    memExternal.persist = 'disk';
    return 'disk';
  }
  if (tryWrite(TMP_EXTERNAL_TELEMETRY_PATH, json, false)) {
    memExternal.persist = 'tmp';
    return 'tmp';
  }
  memExternal.persist = 'memory';
  return 'memory';
}

export function readPublishedExternalTelemetry() {
  const disk = readStoreFromPath(EXTERNAL_TELEMETRY_PATH);
  const tmp = readStoreFromPath(TMP_EXTERNAL_TELEMETRY_PATH);
  const mem = memExternal.state;
  let best = null;
  for (const s of [disk, tmp, mem]) {
    if (!s || s.schema !== SYNTHIO_EXTERNAL_TELEMETRY_SCHEMA) continue;
    if (!best || storeIssuedAt(s) >= storeIssuedAt(best)) best = s;
  }
  return best;
}

async function publishPulseToBlob(envelope) {
  if (!blobConfigured()) return { ok: false, reason: 'blob_unconfigured' };
  try {
    const { put } = await import('@vercel/blob');
    const result = await put(BLOB_TELEMETRY_PATHNAME, JSON.stringify(envelope), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 30,
    });
    memExternal.blobUrl = result?.url || null;
    return { ok: true, url: result?.url || null };
  } catch (e) {
    return { ok: false, reason: e.message || 'blob_put_failed' };
  }
}

/**
 * Publish pulse into the observable external telemetry channel.
 * Sync local persist + optional Blob (async side).
 */
export function publishPulseExternalTelemetry(pulse, opts = {}) {
  const companions = opts.companions || [];
  const envelope = buildExternalTelemetryEnvelope(pulse, companions);
  const persist = persistExternalTelemetry(envelope);
  const out = {
    ok: true,
    persist,
    api: SYNTHIO_EXTERNAL_TELEMETRY_API,
    fingerprint: envelope.pulse?.fingerprint || null,
    envelope,
    blob: null,
  };
  if (opts.publishBlob !== false && blobConfigured()) {
    void publishPulseToBlob(envelope).then((blob) => {
      out.blob = blob;
      memExternal.blobUrl = blob.url || memExternal.blobUrl;
    });
  }
  return out;
}

export async function publishPulseExternalTelemetryAsync(pulse, opts = {}) {
  const companions = opts.companions || [];
  const envelope = buildExternalTelemetryEnvelope(pulse, companions);
  const persist = persistExternalTelemetry(envelope);
  const blob =
    opts.publishBlob === false ? { ok: false, reason: 'skipped' } : await publishPulseToBlob(envelope);
  return {
    ok: true,
    persist,
    api: SYNTHIO_EXTERNAL_TELEMETRY_API,
    fingerprint: envelope.pulse?.fingerprint || null,
    envelope,
    blob,
  };
}

export function emitSyntheverseSynthioPulse(opts = {}) {
  const prior = readPulseStore();
  const latest = prior?.latest && isSyntheverseSynthioPulse(prior.latest) ? prior.latest : null;
  const ageMs = latest ? Date.now() - Date.parse(latest.issuedAt) : Infinity;
  if (!opts.force && latest && ageMs < SYNTHIO_PULSE_CADENCE_SEC * 1000) {
    const published = publishPulseExternalTelemetry(latest, {
      companions: opts.companions,
      publishBlob: opts.publishBlob,
    });
    return {
      emitted: false,
      latest,
      history: prior.history || [latest],
      persist: memStore.persist || (prior ? 'disk' : 'memory'),
      externalPublish: published,
    };
  }
  const pulse = buildSyntheverseSynthioPulse(opts);
  const history = [pulse, ...((prior?.history || []).filter((p) => p.pulseId !== pulse.pulseId))].slice(
    0,
    48,
  );
  const state = {
    schema: 'syntheverse-synthio-pulse-store/v1',
    sandbox: SANDBOX_NAME,
    updatedAt: new Date().toISOString(),
    latest: pulse,
    history,
  };
  const persist = persistPulseStore(state);
  const externalPublish = publishPulseExternalTelemetry(pulse, {
    companions: opts.companions,
    publishBlob: opts.publishBlob,
  });
  return { emitted: true, latest: pulse, history, persist, externalPublish };
}

export function verifySyntheversePulse(pulse = readLatestSyntheversePulse()?.latest) {
  const ok = isSyntheverseSynthioPulse(pulse);
  return {
    ok,
    novel: ok && pulse.naturalOccurrence === false,
    discriminant: pulse?.discriminant || null,
    pulseId: pulse?.pulseId || null,
    fingerprint: pulse?.fingerprint || pulseFingerprint(pulse),
    issuedAt: pulse?.issuedAt || null,
    distinguishesFromNatural: ok,
    honesty:
      'Syntheverse pulse is an engineered sandbox confirmation token — published to public external telemetry for observe/compare, not a natural heliophysics measurement.',
  };
}

async function probeCompanionFeed(feed, timeoutMs = 4000) {
  const started = Date.now();
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);
    const res = await fetch(feed.url, {
      cache: 'no-store',
      signal: ac.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(t);
    if (!res.ok) {
      return {
        id: feed.id,
        label: feed.label,
        url: feed.url,
        reachable: false,
        status: res.status,
        latencyMs: Date.now() - started,
        sample: null,
      };
    }
    const data = await res.json();
    let sample = null;
    if (Array.isArray(data) && data.length) {
      const last = data[data.length - 1];
      sample =
        feed.id === 'space_weather_band'
          ? `Kp≈${last.kp_index ?? last.kp ?? '?'}`
          : `F10.7≈${last.flux ?? last.f107 ?? last.observed_flux ?? '?'}`;
    }
    return {
      id: feed.id,
      label: feed.label,
      url: feed.url,
      reachable: true,
      status: res.status,
      latencyMs: Date.now() - started,
      sample,
    };
  } catch (e) {
    return {
      id: feed.id,
      label: feed.label,
      url: feed.url,
      reachable: false,
      status: 0,
      latencyMs: Date.now() - started,
      sample: null,
      error: e.name === 'AbortError' ? 'timeout' : e.message || 'fetch_failed',
    };
  }
}

/**
 * Probe read-only NOAA companions (parallel labels next to our pulse channel).
 */
export async function observeCompanionExternalTelemetry(opts = {}) {
  if (opts.skipCompanionProbe === true) {
    return {
      probed: false,
      companions: (opts.companions || []).length
        ? opts.companions
        : EXTERNAL_COMPANION_FEEDS.map((f) => ({
            id: f.id,
            label: f.label,
            url: f.url,
            reachable: null,
            skipped: true,
          })),
    };
  }
  const feeds = opts.feeds || EXTERNAL_COMPANION_FEEDS;
  const companions = await Promise.all(feeds.map((f) => probeCompanionFeed(f, opts.timeoutMs || 4000)));
  return { probed: true, companions };
}

async function fetchJsonUrl(url, timeoutMs = 5000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      signal: ac.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return { ok: false, status: res.status, data: null };
    const data = await res.json();
    return { ok: true, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: null, error: e.message || 'fetch_failed' };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Independently observe the public external telemetry channel (and companions).
 * Prefer HTTP/Blob when origin or blob URL is provided; else read published store.
 */
export async function observeSynthioPulseExternal(opts = {}) {
  const companionPack = await observeCompanionExternalTelemetry(opts);
  let observed = null;
  let source = 'published_store';

  if (opts.observeUrl) {
    const hit = await fetchJsonUrl(opts.observeUrl, opts.timeoutMs || 5000);
    if (hit.ok && hit.data?.schema === SYNTHIO_EXTERNAL_TELEMETRY_SCHEMA) {
      observed = hit.data;
      source = 'http';
    }
  }

  if (!observed && memExternal.blobUrl) {
    const hit = await fetchJsonUrl(memExternal.blobUrl, opts.timeoutMs || 5000);
    if (hit.ok && hit.data?.schema === SYNTHIO_EXTERNAL_TELEMETRY_SCHEMA) {
      observed = hit.data;
      source = 'blob';
    }
  }

  if (!observed && opts.origin) {
    const url = `${String(opts.origin).replace(/\/$/, '')}${SYNTHIO_EXTERNAL_TELEMETRY_API}`;
    const hit = await fetchJsonUrl(url, opts.timeoutMs || 5000);
    if (hit.ok && hit.data?.schema === SYNTHIO_EXTERNAL_TELEMETRY_SCHEMA) {
      observed = hit.data;
      source = 'origin_api';
    }
  }

  if (!observed) {
    observed = readPublishedExternalTelemetry();
    source = observed ? 'published_store' : 'none';
  }

  if (observed && companionPack.probed) {
    observed = {
      ...observed,
      companions: companionPack.companions,
      companionsProbedAt: new Date().toISOString(),
    };
  }

  const pulse = observed?.pulse || null;
  return {
    ok: !!pulse?.fingerprint,
    source,
    api: SYNTHIO_EXTERNAL_TELEMETRY_API,
    observedAt: new Date().toISOString(),
    envelope: observed,
    pulse,
    fingerprint: pulse?.fingerprint || null,
    pulseId: pulse?.pulseId || null,
    companions: companionPack.companions,
    companionsReachableCount: companionPack.companions.filter((c) => c.reachable === true).length,
    companionsExpected: EXTERNAL_COMPANION_FEEDS.length,
    honesty:
      'Observation reads the public Synthio external telemetry channel (not NOAA write-back). Companion NOAA probes are reachability-only.',
  };
}

/**
 * Compare emitted pulse to observed external telemetry pulse fingerprint.
 */
export function comparePulseToExternal(emitted, observed) {
  const emittedFp =
    (typeof emitted === 'string' ? emitted : null) ||
    emitted?.fingerprint ||
    pulseFingerprint(emitted);
  const observedFp =
    (typeof observed === 'string' ? observed : null) ||
    observed?.fingerprint ||
    observed?.pulse?.fingerprint ||
    pulseFingerprint(observed?.pulse || observed);

  const matches =
    typeof emittedFp === 'string' &&
    typeof observedFp === 'string' &&
    emittedFp.length > 0 &&
    emittedFp === observedFp;

  const companions = observed?.companions || [];
  const companionsReachable = companions.filter((c) => c.reachable === true).length;

  return {
    verdict: matches ? 'MATCH' : 'MISS',
    matches,
    emittedFingerprint: emittedFp || null,
    observedFingerprint: observedFp || null,
    emittedPulseId: emitted?.pulseId || null,
    observedPulseId: observed?.pulseId || observed?.pulse?.pulseId || null,
    companionsReachable,
    companionsExpected: EXTERNAL_COMPANION_FEEDS.length,
    summary: matches
      ? `Pulse fingerprint MATCH in external telemetry (${emittedFp?.slice(0, 12)}…) · companions reachable ${companionsReachable}/${EXTERNAL_COMPANION_FEEDS.length}`
      : `Pulse fingerprint MISS vs external telemetry (emitted ${emittedFp?.slice(0, 12) || '—'} · observed ${observedFp?.slice(0, 12) || '—'})`,
    honesty:
      'MATCH = emitted Syntheverse pulse fingerprint equals observed public external telemetry. Not a claim that NOAA carried the pulse.',
  };
}

/**
 * Emit (if needed), publish to external channel, observe, and compare.
 */
export async function emitObserveComparePulse(opts = {}) {
  const emit = emitSyntheverseSynthioPulse(opts);
  const published = await publishPulseExternalTelemetryAsync(emit.latest, {
    companions: opts.companions,
    publishBlob: opts.publishBlob,
  });
  const observation = await observeSynthioPulseExternal({
    ...opts,
  });
  const compare = comparePulseToExternal(emit.latest, observation);
  return {
    emit,
    published,
    observation,
    compare,
    verify: verifySyntheversePulse(emit.latest),
  };
}

/** Test helper — clear in-memory pulse + external telemetry stores. */
export function resetSynthioPulseMemoryForTests() {
  memStore.state = null;
  memStore.persist = 'memory';
  memExternal.state = null;
  memExternal.persist = 'memory';
  memExternal.blobUrl = null;
}
