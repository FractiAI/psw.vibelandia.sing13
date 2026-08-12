/**
 * Syntheverse Synthio pulse — novel Goldilocks confirmation pulse.
 * Intentionally NOT a naturally occurring heliophysics/Kp/solar cadence signal.
 * Discriminant is engineered so monitors can distinguish Syntheverse Sandbox from nature.
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

const memStore =
  globalThis.__synthioPulseStore ||
  (globalThis.__synthioPulseStore = { state: null, persist: 'memory' });

/** Cadence 161s ≈ floor(Φ×100) — not NOAA 1-min Kp, not 600s Coherence Project pulse. */
export const SYNTHIO_PULSE_CADENCE_SEC = 161;

/**
 * Novel marker — does not appear in natural SWPC/Kp/F10.7 feeds.
 * Σ = Syntheverse · Φ^-99 · PC = point-and-click Goldilocks load.
 */
export const SYNTHIO_PULSE_DISCRIMINANT = 'SYNTHIO_Σ_Φ^-99_PC';
export const SYNTHIO_PULSE_SCHEMA = 'syntheverse-synthio-pulse/v1';

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
  const { signature: _drop, ...rest } = body;
  const canonical = JSON.stringify(rest);
  const key =
    secret ||
    process.env.SYNTHIO_PULSE_SECRET ||
    process.env.GOLDILOCKS_PULSE_SECRET ||
    'syntheverse-sandbox-synthio';
  const hmac = crypto.createHmac('sha256', key).update(canonical).digest('hex');
  return `0x${hmac.slice(0, 64)}`;
}

/**
 * Build a novel Syntheverse pulse for confirmation of all six expectation slots.
 * @param {{ expectationSlots?: object, activationState?: string }} [opts]
 */
export function buildSyntheverseSynthioPulse(opts = {}) {
  const issuedAt = new Date().toISOString();
  const phiInv99 = PHI_EGS ** -99;
  const body = {
    schema: SYNTHIO_PULSE_SCHEMA,
    pulseKind: 'syntheverse_goldilocks_confirmation',
    naturalOccurrence: false,
    novelty:
      'Engineered Syntheverse discriminant — not NOAA Kp, not F10.7, not bitcoin-tip Goldilocks pulse/v1.',
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
  body.pulseId = `synthio-Σ-${Date.parse(issuedAt)}-${body.signature.slice(2, 10)}`;
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
  const t = Date.parse(store?.latest?.issuedAt || store?.updatedAt || '');
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

export function emitSyntheverseSynthioPulse(opts = {}) {
  const prior = readPulseStore();
  const latest = prior?.latest && isSyntheverseSynthioPulse(prior.latest) ? prior.latest : null;
  const ageMs = latest ? Date.now() - Date.parse(latest.issuedAt) : Infinity;
  if (!opts.force && latest && ageMs < SYNTHIO_PULSE_CADENCE_SEC * 1000) {
    return {
      emitted: false,
      latest,
      history: prior.history || [latest],
      persist: memStore.persist || (prior ? 'disk' : 'memory'),
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
  return { emitted: true, latest: pulse, history, persist };
}

export function verifySyntheversePulse(pulse = readLatestSyntheversePulse()?.latest) {
  const ok = isSyntheverseSynthioPulse(pulse);
  return {
    ok,
    novel: ok && pulse.naturalOccurrence === false,
    discriminant: pulse?.discriminant || null,
    pulseId: pulse?.pulseId || null,
    issuedAt: pulse?.issuedAt || null,
    distinguishesFromNatural: ok,
    honesty:
      'Syntheverse pulse is an engineered sandbox confirmation token — not a natural heliophysics measurement.',
  };
}

/** Test helper — clear in-memory pulse store. */
export function resetSynthioPulseMemoryForTests() {
  memStore.state = null;
  memStore.persist = 'memory';
}
