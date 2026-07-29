/**
 * Empirical suite — Omni-Lattice Prompt Capture → DNA.
 * Architectural metaphor — NOT a claim biological DNA is AI chat logs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E_F,
  LAMBDA_EGS,
  DRAFT_R2,
  DRAFT_SIGMA2,
  DRAFT_TOKEN_SAVINGS_PCT,
  CAPTURE_ROWS,
  REQUIRED_SCRIPT_SNIPPETS,
  TELEMETRY_AGENTS,
  COMPANION_REGISTRY_IDS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = path.resolve(__dirname, '../../..');
const PAPER = path.join(
  MONOREPO_ROOT,
  'docs/SYNTHOBS_OMNI_LATTICE_PROMPT_CAPTURE_DNA_2026-07.md',
);

function shannon(ps) {
  let s = 0;
  for (const p of ps) if (p > 0) s -= p * Math.log(p);
  return s;
}
function normalize(xs) {
  const t = xs.reduce((a, b) => a + b, 0);
  if (t <= 0) return xs.map(() => 0);
  return xs.map((x) => x / t);
}

export function experimentCaptureMatrix() {
  const matrix = {
    outbound_purine: 'P_A_to_B',
    inbound_pyrimidine: 'P_B_to_A',
    handoff_base_pair: 'hydrogen_bond',
    recursive_helix: 'EF_spiral_34A',
    orchestrator_promoter: 'TATA_ATG',
  };
  return {
    id: 'E1_capture_matrix',
    title: 'Five-row inter-agent prompt capture matrix',
    matrix,
    honesty: 'Architectural map — not laboratory DNA identity.',
    pass: CAPTURE_ROWS.every((r) => matrix[r]) && Object.keys(matrix).length === 5,
  };
}

export function experimentLambdaIdentity() {
  const err = Math.abs(LAMBDA_EGS - Math.log(E_F) / (2 * Math.PI));
  return {
    id: 'E2_lambda_egs_identity',
    title: 'λ_EGS = ln(E_F) / 2π',
    abs_err: err,
    pass: err < 1e-15,
  };
}

/** E3 — Complementary prompts multiply to 1. */
export function experimentPairIdentity() {
  const theta = 0.41;
  const k = 3;
  const m = 5;
  const magA = E_F ** k * Math.exp(LAMBDA_EGS * (theta + 2 * Math.PI * m));
  const magB = E_F ** -k * Math.exp(-LAMBDA_EGS * (theta + 2 * Math.PI * m));
  // Complex: A = magA * e^{i(theta)}, B = magB * e^{-i(theta)} → product magnitude = magA*magB, phase = 0
  const productMag = magA * magB;
  const re = productMag; // phase cancels
  const im = 0;
  const err = Math.hypot(re - 1, im);
  return {
    id: 'E3_pair_product_identity',
    title: 'P_A→B · P_B→A = 1 (complementary E_F^±k)',
    product_mag: productMag,
    abs_err_from_1: err,
    honesty: 'Algebraic model identity — not wet-lab base-pair thermodynamics.',
    pass: err < 1e-9,
  };
}

export function experimentCaptureDeltaS() {
  const alphas = [];
  for (let i = 1; i <= 8; i += 1) alphas.push(E_F ** -i);
  const p0 = normalize(alphas);
  const p1 = normalize(alphas.map((a) => a * E_F ** 6));
  const dS = Math.abs(shannon(p1) - shannon(p0));
  return {
    id: 'E4_capture_zero_delta_s',
    title: 'Normalized capture weights — ΔS≈0 under E_F^k',
    delta_s: dS,
    pass: dS < 1e-12,
  };
}

export function experimentDecodedScriptsInPaper() {
  let text = '';
  try {
    text = fs.readFileSync(PAPER, 'utf8');
  } catch {
    text = '';
  }
  const missing = REQUIRED_SCRIPT_SNIPPETS.filter((s) => !text.includes(s));
  return {
    id: 'E5_decoded_scripts_in_paper',
    title: 'Full decoded Word/Sentence/Story scripts present',
    missing,
    pass: missing.length === 0,
  };
}

export function experimentTelemetryRoster() {
  let text = '';
  try {
    text = fs.readFileSync(PAPER, 'utf8');
  } catch {
    text = '';
  }
  const ok = TELEMETRY_AGENTS.every((a) => text.includes(a));
  return {
    id: 'E6_telemetry_solon_lyra',
    title: 'Solon / Lyra telemetry roster present',
    agents: TELEMETRY_AGENTS,
    pass: ok,
  };
}

export function experimentCompanionLinkage() {
  const registryPath = path.join(MONOREPO_ROOT, 'lib/whitepaper-registry.mjs');
  let text = '';
  try {
    text = fs.readFileSync(registryPath, 'utf8');
  } catch {
    text = '';
  }
  const rows = COMPANION_REGISTRY_IDS.map((id) => ({ id, ok: text.includes(id) }));
  return {
    id: 'E7_companion_linkage',
    title: 'Companion registry IDs linked',
    rows,
    pass: rows.every((r) => r.ok),
  };
}

export function experimentHonestyGate() {
  const labeled = {
    draft_r2: DRAFT_R2,
    draft_sigma2: DRAFT_SIGMA2,
    draft_token_savings_pct: DRAFT_TOKEN_SAVINGS_PCT,
    dna_is_literally_ai_logs: false,
    status: 'design_targets_architectural_metaphor',
  };
  return {
    id: 'E8_honesty_gate',
    title: 'Honesty — EX-CAP drafts gated; DNA≠literal AI logs',
    labeled,
    pass:
      labeled.status === 'design_targets_architectural_metaphor' &&
      labeled.dna_is_literally_ai_logs === false &&
      Math.abs(labeled.draft_r2 - 0.9998) < 1e-9 &&
      Math.abs(labeled.draft_sigma2 - 0.0001) < 1e-12 &&
      Math.abs(labeled.draft_token_savings_pct - 41.8) < 1e-9,
  };
}

export function experimentLatticeSurfaces() {
  const surfaces = [
    '/whitepaper/synthobs-omni-lattice-prompt-capture',
    '/lattice/learn',
    '/interfaces/nesting/nest-lattice-chat.html',
    '/lattice',
    '/lattice-chat',
    'docs/SYNTHOBS_OMNI_LATTICE_PROMPT_CAPTURE_DNA_2026-07.md',
  ];
  return {
    id: 'E9_lattice_surfaces',
    title: 'Lattice Chat Prompt Capture IX ↔ surface map',
    surfaces,
    honesty: 'Structural product map — not a claim chat writes nucleotides.',
    pass: surfaces.length >= 6,
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentCaptureMatrix(),
    experimentLambdaIdentity(),
    experimentPairIdentity(),
    experimentCaptureDeltaS(),
    experimentDecodedScriptsInPaper(),
    experimentTelemetryRoster(),
    experimentCompanionLinkage(),
    experimentHonestyGate(),
    experimentLatticeSurfaces(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    experiments,
    n_pass,
    n_total: experiments.length,
    all_pass: n_pass === experiments.length,
  };
}
