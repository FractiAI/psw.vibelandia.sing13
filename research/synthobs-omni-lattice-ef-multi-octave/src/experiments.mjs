/**
 * Multi-octave E_F register — deterministic suite.
 * Catalog / protocol arithmetic only — not SI calorimetry or vacuum harvesting.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E_F,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  MATRIX_TILE,
  OCTAVE_NODES,
  HEXAD_CLOSURE,
  NINE_FOUR,
  DECADIC_CLOSURE,
  NONARY_OCTAVES,
  NONARY_ADDED,
  NONARY_CLOSURE,
  PART_A_MATRICES,
  PART_B_MATRICES,
  PART_C_MATRICES,
  PART_D_MATRICES,
  K_B,
  T_K,
  POST_PATCH_LANDAUER_MULTIPLIER,
  SOLAR_F107_SFU,
  SOLAR_AGENTS,
  PAPER_PARTS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');

export function landauerJPerBit(T = T_K) {
  return K_B * T * Math.log(2);
}

export function experimentEgPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_egs_phi',
    title: 'E_F = Φ_EGS fixture',
    E_F,
    expected,
    pass: Math.abs(E_F - expected) < 1e-15,
    interpretation: 'Golden key for multi-octave scale grammar.',
    honesty: 'Architectural constant — not a replacement for k_B, c, or ℏ.',
  };
}

export function experimentGoldenIdentity() {
  const lhs = E_F * E_F;
  const rhs = E_F + 1;
  return {
    id: 'E2_ef_squared_identity',
    title: 'E_F² = E_F + 1',
    lhs,
    rhs,
    pass: Math.abs(lhs - rhs) < 1e-12,
    interpretation: 'Golden-key identity closing scale ladders.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

export function experimentOctaveArithmetic() {
  const checks = [
    MATRIX_TILE === 81,
    OCTAVE_NODES === 729,
    HEXAD_CLOSURE === 4374,
    NINE_FOUR === 6561,
    DECADIC_CLOSURE === 13122,
    NONARY_OCTAVES === 81,
    NONARY_ADDED === 59049,
    NONARY_CLOSURE === 72171,
    HEXAD_CLOSURE === 6 * OCTAVE_NODES,
    NINE_FOUR === 9 * OCTAVE_NODES,
    DECADIC_CLOSURE === 2 * NINE_FOUR,
    NONARY_CLOSURE === DECADIC_CLOSURE + NONARY_ADDED,
  ];
  return {
    id: 'E3_octave_arithmetic',
    title: '729 / 4374 / 6561 / 13122 / 72171 ladder',
    MATRIX_TILE,
    OCTAVE_NODES,
    HEXAD_CLOSURE,
    NINE_FOUR,
    DECADIC_CLOSURE,
    NONARY_CLOSURE,
    pass: checks.every(Boolean),
    interpretation: 'Combined Parts A–D coordinate closures.',
    honesty: 'Integer register arithmetic — not measured digits of a physical constant.',
  };
}

export function experimentMatrixSpans() {
  const span = (m) => m.end - m.start + 1;
  const a = span(PART_A_MATRICES);
  const b = span(PART_B_MATRICES);
  const c = span(PART_C_MATRICES);
  const d = span(PART_D_MATRICES);
  return {
    id: 'E4_matrix_spans',
    title: 'Matrix spans 54 + 27 + 81 + 729 = 891',
    a,
    b,
    c,
    d,
    total: a + b + c + d,
    pass: a === 54 && b === 27 && c === 81 && d === 729 && a + b + c + d === 891,
    interpretation: 'Four combined parts cover Matrices 1–891.',
    honesty: 'Catalog indexing — not physical matrix hardware counts.',
  };
}

export function experimentFourPartsPresent() {
  return {
    id: 'E5_four_parts',
    title: 'Combined monograph has Parts A–D',
    PAPER_PARTS: PAPER_PARTS.map((p) => p.id),
    pass: PAPER_PARTS.length === 4 && PAPER_PARTS.every((p) => p.id),
    interpretation: 'Four source octave papers folded into one synthesis.',
    honesty: 'Structural TOC fixture.',
  };
}

export function experimentLandauerModel() {
  const L = landauerJPerBit();
  const post = L * POST_PATCH_LANDAUER_MULTIPLIER;
  const expectedApprox = 3.07e-21;
  return {
    id: 'E6_landauer_model',
    title: 'Post E_F recycling ≈ 1.07 × Landauer (~3.07e-21 J/bit @ 300 K)',
    L,
    post,
    ratio: post / L,
    pass:
      Math.abs(POST_PATCH_LANDAUER_MULTIPLIER - 1.07) < 1e-12 &&
      Math.abs(post - expectedApprox) / expectedApprox < 0.01,
    interpretation: 'Shared Narrow Gate / multi-octave Landauer-proximity model.',
    honesty: 'Protocol model — not SI calorimetry of production silicon.',
  };
}

export function experimentSolarFixture() {
  return {
    id: 'E7_solar_fixture',
    title: 'Aug 8 2026 solar fixture F10.7=108 · Agents Alpha–Epsilon',
    SOLAR_F107_SFU,
    agents: SOLAR_AGENTS.map((a) => a.id),
    pass: SOLAR_F107_SFU === 108 && SOLAR_AGENTS.length === 5,
    interpretation: 'Space-weather protocol grounding table.',
    honesty: 'Fixture labels — agents do not inhabit sunspots.',
  };
}

export function experimentPaperOnDisk() {
  const p1 = path.join(MONOREPO_DOCS, PAPER_NAME);
  const p2 = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const exists = fs.existsSync(p1) || fs.existsSync(p2);
  return {
    id: 'E8_paper_on_disk',
    title: 'Combined synthesis markdown present',
    paths: [p1, p2],
    pass: exists,
    interpretation: 'Catalog paper + standalone docs mirror.',
    honesty: 'Filesystem presence check.',
  };
}

export function experimentDocIds() {
  return {
    id: 'E9_doc_ids',
    title: 'Document / registry IDs locked',
    DOC_ID,
    REGISTRY_ID,
    pass:
      DOC_ID === 'WP-SYNTHOBS-OMNI-LATTICE-EF-MULTI-OCTAVE-2026-08-08' &&
      REGISTRY_ID === 'synthobs-omni-lattice-ef-multi-octave-2026-08',
    interpretation: 'PRA / registry identity fixtures.',
    honesty: 'String lock for audit receipts.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentOctaveArithmetic(),
    experimentMatrixSpans(),
    experimentFourPartsPresent(),
    experimentLandauerModel(),
    experimentSolarFixture(),
    experimentPaperOnDisk(),
    experimentDocIds(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    all_pass: failed.length === 0,
    n_pass,
    n_total: experiments.length,
    failed,
    experiments,
  };
}
