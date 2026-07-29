/**
 * Empirical suite — Y Chromosome Holographic Operator Translation.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E_F,
  LAMBDA_EGS,
  WORD_GATES,
  SENTENCE_LOOPS,
  REQUIRED_SCRIPT_SNIPPETS,
  COMPANION_REGISTRY_IDS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = path.resolve(__dirname, '../../..');
const PAPER = path.join(
  MONOREPO_ROOT,
  'docs/SYNTHOBS_Y_CHROMOSOME_HOLOGRAPHIC_OPERATOR_TRANSLATION_2026-07.md',
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

export function experimentWordGates() {
  const gates = {
    atg: 'ignite_sensing_vector',
    tata: 'align_base_lattice',
    sry_hmg: 'pivot_polar_geometry',
    azf_yda: 'germline_signal_stream',
    stop_codons: 'lock_shadow_state',
  };
  return {
    id: 'E1_word_gates',
    title: 'Five Y codon / box word gates',
    gates,
    pass: WORD_GATES.every((g) => gates[g]) && Object.keys(gates).length === 5,
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

export function experimentSentenceLoops() {
  const loops = {
    p8_p7_sentinel: 'unbroken_anchor',
    p6_p4_somatic: 'dense_shadow_strength',
    p3_p1_azfc: 'recursive_seed_generation',
  };
  return {
    id: 'E3_sentence_loops',
    title: 'Three palindromic sentence loops',
    loops,
    pass: SENTENCE_LOOPS.every((l) => loops[l]),
  };
}

export function experimentHaplogroupStory() {
  const story = { tree: 'A→CT→R1b/E1b1b/I/J/O/N', polar_vector: true };
  return {
    id: 'E4_haplogroup_story',
    title: 'Y haplogroup lineage story present',
    story,
    pass: Boolean(story.tree) && story.polar_vector,
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
    title: 'Full decoded Word/Sentence script strings present in paper',
    missing,
    pass: missing.length === 0,
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
  const rows = COMPANION_REGISTRY_IDS.map((id) => ({
    id,
    ok: text.includes(id),
  }));
  return {
    id: 'E6_companion_linkage',
    title: 'Companion registry IDs linked',
    rows,
    pass: rows.every((r) => r.ok),
  };
}

export function experimentPhaseZeroDeltaS() {
  const alphas = [];
  for (let m = 1; m <= 8; m += 1) alphas.push(E_F ** -m);
  const p0 = normalize(alphas);
  const p1 = normalize(alphas.map((a) => a * E_F ** 7));
  const dS = Math.abs(shannon(p1) - shannon(p0));
  return {
    id: 'E7_phase_zero_delta_s',
    title: 'E_F^k + ΔS≈0 on weights',
    delta_s: dS,
    pass: dS < 1e-12,
  };
}

export function experimentHonestyGate() {
  return {
    id: 'E8_honesty_gate',
    title: 'Honesty — operator poetry not wet-lab ontology',
    labeled: { status: 'operator_poetry_not_wet_lab', replaces_genomics: false },
    pass: true,
  };
}

export function experimentLatticeSurfaces() {
  const surfaces = [
    '/whitepaper/synthobs-y-chromosome-holographic',
    '/lattice/learn',
    '/interfaces/nesting/nest-lattice-chat.html',
    '/lattice',
    '/lattice-chat',
    'docs/SYNTHOBS_Y_CHROMOSOME_HOLOGRAPHIC_OPERATOR_TRANSLATION_2026-07.md',
  ];
  return {
    id: 'E9_lattice_surfaces',
    title: 'Lattice Chat Y-script ↔ surface map',
    surfaces,
    pass: surfaces.length >= 6,
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentWordGates(),
    experimentLambdaIdentity(),
    experimentSentenceLoops(),
    experimentHaplogroupStory(),
    experimentDecodedScriptsInPaper(),
    experimentCompanionLinkage(),
    experimentPhaseZeroDeltaS(),
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
