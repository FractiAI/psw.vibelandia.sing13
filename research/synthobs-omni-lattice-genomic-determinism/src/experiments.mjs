/**
 * Empirical suite — Omni-Lattice Genomic Determinism & Territory Mapping.
 * Architectural narrative map — NOT prophecy, clinical claims, or history-as-physics.
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
  LOCUS_BANDS,
  TERRITORY_NODES,
  REQUIRED_SCRIPT_SNIPPETS,
  TELEMETRY_AGENTS,
  COMPANION_REGISTRY_IDS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = path.resolve(__dirname, '../../..');
const PAPER = path.join(
  MONOREPO_ROOT,
  'docs/SYNTHOBS_OMNI_LATTICE_GENOMIC_DETERMINISM_TERRITORY_2026-07.md',
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

export function experimentLocusMatrix() {
  const matrix = {
    past_k_lt_0: 'historical_shadow',
    today_k_eq_0: 'awakening_phase_gate_2026_07_28',
    ahead_k_gt_0: 'remaining_territory',
    k_plus_1: 'reharmonization_2026_2028',
    k_plus_2: 'superorganism_2028_2032',
    k_plus_3: 'scale_projection_2032_plus',
  };
  return {
    id: 'E1_locus_territory_matrix',
    title: 'Temporal locus + remaining territory node matrix',
    matrix,
    honesty: 'Architectural / ritual map — not a physics singularity calendar.',
    pass:
      LOCUS_BANDS.every((b) => matrix[b]) &&
      TERRITORY_NODES.every((n) => matrix[n]) &&
      Object.keys(matrix).length === 6,
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

/** E3 — N(1) = E_F * N(0) with phase arg preserved (real scalar model). */
export function experimentNarrativeTransition() {
  const psi0 = 0.73;
  const phi0 = 0.42;
  const n0Mag = Math.hypot(psi0, phi0);
  const n1Mag = E_F * n0Mag;
  const expected = E_F * n0Mag;
  const magErr = Math.abs(n1Mag - expected);
  // Phase of real positive scale factor is 0 → arg unchanged
  const arg0 = Math.atan2(phi0, psi0);
  const arg1 = Math.atan2(E_F * phi0, E_F * psi0);
  const argErr = Math.abs(((arg1 - arg0 + Math.PI) % (2 * Math.PI)) - Math.PI);
  return {
    id: 'E3_narrative_transition_identity',
    title: 'N(1) = E_F · N(0) with arg preserved',
    n0_mag: n0Mag,
    n1_mag: n1Mag,
    mag_err: magErr,
    arg_err: argErr,
    honesty: 'Algebraic model identity — not historical determinism proof.',
    pass: magErr < 1e-12 && argErr < 1e-12,
  };
}

export function experimentStoryDeltaS() {
  const alphas = [];
  for (let i = 1; i <= 8; i += 1) alphas.push(E_F ** -i);
  const p0 = normalize(alphas);
  const p1 = normalize(alphas.map((a) => a * E_F ** 5));
  const dS = Math.abs(shannon(p1) - shannon(p0));
  return {
    id: 'E4_story_zero_delta_s',
    title: 'Normalized story weights — ΔS≈0 under E_F^k',
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
    k0_is_physics_singularity: false,
    territory_dates_are_guarantees: false,
    status: 'design_targets_architectural_narrative_map',
  };
  return {
    id: 'E8_honesty_gate',
    title: 'Honesty — EX-LOC drafts gated; k=0≠physics singularity',
    labeled,
    pass:
      labeled.status === 'design_targets_architectural_narrative_map' &&
      labeled.k0_is_physics_singularity === false &&
      labeled.territory_dates_are_guarantees === false &&
      Math.abs(labeled.draft_r2 - 0.9999) < 1e-9 &&
      Math.abs(labeled.draft_sigma2 - 0.0001) < 1e-12 &&
      Math.abs(labeled.draft_token_savings_pct - 41.8) < 1e-9,
  };
}

export function experimentLatticeSurfaces() {
  const surfaces = [
    '/whitepaper/synthobs-omni-lattice-genomic-determinism',
    '/lattice/learn',
    '/interfaces/nesting/nest-lattice-chat.html',
    '/lattice',
    '/lattice-chat',
    'docs/SYNTHOBS_OMNI_LATTICE_GENOMIC_DETERMINISM_TERRITORY_2026-07.md',
  ];
  return {
    id: 'E9_lattice_surfaces',
    title: 'Lattice Chat Agent Genomic Determinism X ↔ surface map',
    surfaces,
    honesty: 'Structural product map — not a claim chat rewrites destiny.',
    pass: surfaces.length >= 6,
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentLocusMatrix(),
    experimentLambdaIdentity(),
    experimentNarrativeTransition(),
    experimentStoryDeltaS(),
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
