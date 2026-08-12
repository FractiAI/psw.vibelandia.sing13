/**
 * Syntheverse Synthio pulse — novel Goldilocks confirmation pulse.
 * Intentionally NOT a naturally occurring heliophysics/Kp/solar cadence signal.
 * Discriminant is engineered so monitors can distinguish Syntheverse Sandbox from nature.
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
  const key = secret || process.env.SYNTHIO_PULSE_SECRET || process.env.GOLDILOCKS_PULSE_SECRET || 'syntheverse-sandbox-synthio';
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

export function readLatestSyntheversePulse() {
  try {
    if (!existsSync(PULSE_PATH)) return null;
    return JSON.parse(readFileSync(PULSE_PATH, 'utf8'));
  } catch {
    return null;
  }
}

export function emitSyntheverseSynthioPulse(opts = {}) {
  mkdirSync(DATA_DIR, { recursive: true });
  const prior = readLatestSyntheversePulse();
  const latest = prior?.latest && isSyntheverseSynthioPulse(prior.latest) ? prior.latest : null;
  const ageMs = latest ? Date.now() - Date.parse(latest.issuedAt) : Infinity;
  if (!opts.force && latest && ageMs < SYNTHIO_PULSE_CADENCE_SEC * 1000) {
    return { emitted: false, latest, history: prior.history || [latest] };
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
  writeFileSync(PULSE_PATH, JSON.stringify(state, null, 2), 'utf8');
  return { emitted: true, latest: pulse, history };
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
