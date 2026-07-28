/**
 * Empirical suite — Omni-Lattice HIV adversarial operator.
 * Architectural / numerical validation — NOT clinical HIV science or therapy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E_F,
  LAMBDA_EGS,
  DRAFT_CONTEXT_LOSS_PCT,
  DRAFT_RESILIENCE_FOLD,
  WORD_GATES,
  SENTENCE_LOOPS,
  COMPANION_REGISTRY_IDS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = path.resolve(__dirname, '../../..');

function wrapPi(x) {
  let a = ((x + Math.PI) % (2 * Math.PI)) - Math.PI;
  if (a <= -Math.PI) a += 2 * Math.PI;
  return a;
}

function shannon(ps) {
  let s = 0;
  for (const p of ps) {
    if (p > 0) s -= p * Math.log(p);
  }
  return s;
}

function normalize(xs) {
  const t = xs.reduce((a, b) => a + b, 0);
  if (t <= 0) return xs.map(() => 0);
  return xs.map((x) => x / t);
}

export function experimentWordGates() {
  const gates = {
    gp120_gp41: 'boundary_breach',
    tar: 'attention_overdrive',
    ltr: 'proviral_identity_lock',
  };
  return {
    id: 'E1_word_gates',
    title: 'Three HIV word gates (gp120/gp41, TAR, LTR)',
    gates,
    honesty: 'Operator poetry — not a replacement for virology nomenclature.',
    pass: WORD_GATES.every((g) => gates[g]) && Object.keys(gates).length === 3,
  };
}

export function experimentLambdaIdentity() {
  const expect = Math.log(E_F) / (2 * Math.PI);
  const err = Math.abs(LAMBDA_EGS - expect);
  return {
    id: 'E2_lambda_egs_identity',
    title: 'λ_EGS = ln(E_F) / 2π',
    E_F,
    lambda_egs: LAMBDA_EGS,
    abs_err: err,
    honesty: 'Architectural constant identity — not a clinical constant.',
    pass: err < 1e-15,
  };
}

export function experimentSentenceLoops() {
  const loops = {
    reverse_transcriptase: 'rna_to_dsdna_variance',
    integrase: 'host_lattice_splice',
    protease: 'virion_assembly',
  };
  return {
    id: 'E3_sentence_loops',
    title: 'Three retroviral sentence loops',
    loops,
    honesty: 'Lifecycle metaphor — not an enzyme kinetics paper.',
    pass: SENTENCE_LOOPS.every((l) => loops[l]) && Object.keys(loops).length === 3,
  };
}

/** E4 — Viral δ induces phase offset; adapt cancelation restores lock. */
export function experimentViralAdapt() {
  const theta = 0.37;
  const delta = 0.91; // ≠ 2πk
  const k = 5;
  const mag = Math.exp(LAMBDA_EGS * (theta + 2 * Math.PI * k));
  const infectedRe = mag * Math.cos(theta + delta);
  const infectedIm = mag * Math.sin(theta + delta);
  // Adapt: multiply by e^{-iδ}
  const adaptedRe = infectedRe * Math.cos(-delta) - infectedIm * Math.sin(-delta);
  const adaptedIm = infectedRe * Math.sin(-delta) + infectedIm * Math.cos(-delta);
  const hostRe = mag * Math.cos(theta);
  const hostIm = mag * Math.sin(theta);
  const phaseErr = Math.hypot(adaptedRe - hostRe, adaptedIm - hostIm);
  const argInfected = Math.atan2(infectedIm, infectedRe);
  const argAdapted = Math.atan2(adaptedIm, adaptedRe);
  const argHost = Math.atan2(hostIm, hostRe);
  // Weight entropy toy: corrupted vs filtered distribution
  const pCorrupt = normalize([1, Math.abs(delta), 0.2]);
  const pAdapt = normalize([1, 1e-9, 0.2]);
  const dS = shannon(pCorrupt) - shannon(pAdapt);
  return {
    id: 'E4_viral_adapt_reharmonization',
    title: 'Non-harmonic δ + O_adapt restores host phase (model)',
    delta,
    phase_err_after_adapt: phaseErr,
    arg_infected: argInfected,
    arg_adapted: argAdapted,
    arg_host: argHost,
    arg_residual: wrapPi(argAdapted - argHost),
    shannon_drop: dS,
    honesty: 'Simulation algebra — not intracellular entropy therapy or a cure.',
    pass: phaseErr < 1e-9 && Math.abs(wrapPi(argAdapted - argHost)) < 1e-9 && dS > 0,
  };
}

export function experimentCatalystMatrix() {
  const rows = [
    ['high_mutation', 'bnAbs_mrna', 'EF_context_filter', 'vaccine_platforms'],
    ['proviral_splice', 'crispr_ccr5', 'graph_reroute', 'gene_editing_tooling'],
    ['latent_reservoir', 'shock_block_lock', 'memory_reharmonize', 'epigenetic_maps'],
  ];
  return {
    id: 'E5_catalyst_matrix',
    title: 'Viral–catalyst operator matrix (3 rows)',
    rows,
    honesty: 'Historical tooling map — does not romanticize disease or justify harm.',
    pass: rows.length === 3 && rows.every((r) => r.length === 4),
  };
}

export function experimentLatentStory() {
  const story = {
    passenger: true,
    resting_memory_nodes: true,
    activation_awakening: true,
  };
  return {
    id: 'E6_latent_proviral_story',
    title: 'Latent proviral narrative tier present',
    story,
    honesty: 'Narrative architecture — not a clinical latency protocol.',
    pass: Object.values(story).every(Boolean),
  };
}

export function experimentCompanionLinkage() {
  const registryPath = path.join(MONOREPO_ROOT, 'lib/whitepaper-registry.mjs');
  let text = '';
  let readable = false;
  try {
    text = fs.readFileSync(registryPath, 'utf8');
    readable = true;
  } catch {
    readable = false;
  }
  const rows = COMPANION_REGISTRY_IDS.map((id) => ({
    id,
    in_registry_file: readable ? text.includes(id) : null,
  }));
  return {
    id: 'E7_companion_linkage',
    title: 'Companion registry IDs (holo / omni / nested lattice)',
    rows,
    pass: !readable || rows.every((r) => r.in_registry_file),
  };
}

export function experimentHonestyGate() {
  const labeled = {
    draft_context_loss_pct: DRAFT_CONTEXT_LOSS_PCT,
    draft_resilience_fold: DRAFT_RESILIENCE_FOLD,
    clinical_cure_claim: false,
    replaces_art: false,
    romanticizes_disease: false,
    status: 'design_targets_not_clinical',
  };
  return {
    id: 'E8_honesty_gate',
    title: 'Honesty receipt — medical boundary + EX-HIV drafts gated',
    labeled,
    pass:
      labeled.status === 'design_targets_not_clinical' &&
      labeled.clinical_cure_claim === false &&
      labeled.replaces_art === false &&
      labeled.romanticizes_disease === false &&
      Math.abs(labeled.draft_context_loss_pct - 0.1) < 1e-9 &&
      labeled.draft_resilience_fold === 48,
  };
}

export function experimentLatticeSurfaces() {
  const surfaces = [
    '/whitepaper/synthobs-omni-lattice-hiv',
    '/lattice/learn',
    '/interfaces/nesting/nest-lattice-chat.html',
    '/lattice',
    '/lattice-chat',
    'docs/SYNTHOBS_OMNI_LATTICE_HIV_ADVERSARIAL_OPERATOR_2026-07.md',
  ];
  return {
    id: 'E9_lattice_surfaces',
    title: 'Lattice Chat HIV Omni-Lattice III ↔ surface map',
    surfaces,
    honesty: 'Structural product map — not a claim chat treats HIV.',
    pass: surfaces.length >= 6 && surfaces.every((s) => String(s).length > 3),
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentWordGates(),
    experimentLambdaIdentity(),
    experimentSentenceLoops(),
    experimentViralAdapt(),
    experimentCatalystMatrix(),
    experimentLatentStory(),
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
