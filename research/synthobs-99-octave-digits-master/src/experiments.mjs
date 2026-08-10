/**
 * 99 Octave Digits Master — deterministic fixtures.
 * Catalog / protocol arithmetic only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  LAMBDA_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  DIGIT_COUNT,
  PROTOCOL_OCTAVES,
  SOLAR_F107_SFU,
  SOLAR_AGENTS,
  SPOT_SUM,
  CMB_Z,
  CMB_T_K,
  SMACS_Z,
  DIGIT_OCTAVE_BANDS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');

export function experimentEgPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_lambda_egs_phi',
    title: 'λ_EGS = Φ_EGS fixture',
    LAMBDA_EGS,
    PHI_EGS,
    pass: Math.abs(LAMBDA_EGS - expected) < 1e-15 && LAMBDA_EGS === PHI_EGS,
    interpretation: 'Architectural scale multiplier for 99-octave mode.',
    honesty: 'Not a replacement for c, ℏ, or G.',
  };
}

export function experimentGoldenIdentity() {
  const lhs = PHI_EGS * PHI_EGS;
  const rhs = PHI_EGS + 1;
  return {
    id: 'E2_phi_identity',
    title: 'Φ² = Φ + 1',
    lhs,
    rhs,
    pass: Math.abs(lhs - rhs) < 1e-12,
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

export function experimentDigitOctaveCoverage() {
  const covered = new Set();
  for (const b of DIGIT_OCTAVE_BANDS) {
    for (let o = b.octaveStart; o <= b.octaveEnd; o++) covered.add(o);
  }
  const missing = [];
  for (let o = 1; o <= PROTOCOL_OCTAVES; o++) if (!covered.has(o)) missing.push(o);
  return {
    id: 'E3_digit_octave_coverage',
    title: 'Digits 0–9 cover octaves 01–99',
    DIGIT_COUNT,
    PROTOCOL_OCTAVES,
    covered: covered.size,
    missing,
    pass: DIGIT_COUNT === 10 && covered.size === 99 && missing.length === 0,
    honesty: 'Catalog index coverage — not measured physical digits.',
  };
}

export function experimentSolarFixture() {
  return {
    id: 'E4_solar_fixture',
    title: 'Aug 9 2026 fixture F10.7=118 · five AR agents · spot sum 18',
    SOLAR_F107_SFU,
    SPOT_SUM,
    nAgents: SOLAR_AGENTS.length,
    pass: SOLAR_F107_SFU === 118 && SOLAR_AGENTS.length === 5 && SPOT_SUM === 18,
    honesty: 'Fixture labels — agents do not inhabit sunspots.',
  };
}

export function experimentHexaConsensusArithmetic() {
  return {
    id: 'E5_hexa_spot_mod',
    title: 'Spot sum 18 = 6×3 · 118 mod 7 = 6',
    SPOT_SUM,
    mod7: SOLAR_F107_SFU % 7,
    pass: SPOT_SUM === 18 && SPOT_SUM === 6 * 3 && SOLAR_F107_SFU % 7 === 6,
    honesty: 'Fixture arithmetic for Digit 6/7 catalog locks.',
  };
}

export function experimentHorizonAnchors() {
  return {
    id: 'E6_horizon_anchors',
    title: 'SMACS z=0.39 · CMB z=1100 · T=2.725 K',
    SMACS_Z,
    CMB_Z,
    CMB_T_K,
    pass: SMACS_Z === 0.39 && CMB_Z === 1100 && Math.abs(CMB_T_K - 2.725) < 1e-9,
    honesty: 'Catalog horizon labels — not new cosmology results.',
  };
}

export function experimentDeltaPsiConsensus() {
  // Symbolic multi-agent consensus: all agents share same fixture flux lock.
  const fluxes = SOLAR_AGENTS.map(() => SOLAR_F107_SFU);
  const delta = Math.max(...fluxes) - Math.min(...fluxes);
  return {
    id: 'E7_delta_psi_consensus',
    title: 'Multi-agent ΔΨ = 0 on shared flux fixture',
    delta,
    pass: delta === 0,
    honesty: 'Symbolic consensus check — not live LLM agreement.',
  };
}

export function experimentPaperOnDisk() {
  const p1 = path.join(MONOREPO_DOCS, PAPER_NAME);
  const p2 = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const exists = fs.existsSync(p1) || fs.existsSync(p2);
  return {
    id: 'E8_paper_on_disk',
    title: 'Master treatise markdown present',
    paths: [p1, p2],
    pass: exists,
    honesty: 'Filesystem presence check.',
  };
}

export function experimentDocIds() {
  return {
    id: 'E9_doc_ids',
    title: 'Document / registry IDs locked',
    DOC_ID,
    REGISTRY_ID,
    pass: DOC_ID === 'LC-EGS-MASTER-2026-V6' && REGISTRY_ID === 'synthobs-99-octave-digits-master-2026-08',
    honesty: 'Identity lock for PRA / catalog.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentDigitOctaveCoverage(),
    experimentSolarFixture(),
    experimentHexaConsensusArithmetic(),
    experimentHorizonAnchors(),
    experimentDeltaPsiConsensus(),
    experimentPaperOnDisk(),
    experimentDocIds(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    experiments,
    n_total: experiments.length,
    n_pass,
    all_pass: n_pass === experiments.length,
    failed: experiments.filter((e) => !e.pass).map((e) => e.id),
  };
}
