/**
 * Triadic Nested Hemispheres — deterministic catalog fixtures.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  R1,
  R2,
  R3,
  TIER_LABELS,
  AGENT_TIERS,
  BUDGET_CORE,
  BUDGET_MID,
  BUDGET_OUTER,
  SCORECARD,
  SCORECARD_OVERALL,
  hemisphereVolume,
  domeArea,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');

export function experimentEgPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_egs_phi',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
  };
}

export function experimentGoldenIdentity() {
  return {
    id: 'E2_phi_identity',
    title: 'Φ² = Φ + 1',
    pass: Math.abs(PHI_EGS * PHI_EGS - (PHI_EGS + 1)) < 1e-12,
  };
}

export function experimentRadialAdditive() {
  const sum = R1 + R2;
  return {
    id: 'E3_radial_additive',
    title: 'r3 = r2 + r1 (Φ² lock)',
    R1,
    R2,
    R3,
    pass: Math.abs(R3 - sum) < 1e-12 && Math.abs(R3 - R1 * PHI_EGS ** 2) < 1e-12,
  };
}

export function experimentDomeAreaRatios() {
  const a1 = domeArea(R1);
  const a2 = domeArea(R2);
  const a3 = domeArea(R3);
  return {
    id: 'E4_dome_area_ratios',
    title: 'A2/A1 = Φ² · A3/A1 = Φ⁴',
    pass:
      Math.abs(a2 / a1 - PHI_EGS ** 2) < 1e-12 &&
      Math.abs(a3 / a1 - PHI_EGS ** 4) < 1e-12,
  };
}

export function experimentVolumeShells() {
  const v1 = hemisphereVolume(R1);
  const v2 = hemisphereVolume(R2);
  const v3 = hemisphereVolume(R3);
  const d12 = v2 - v1;
  const d23 = v3 - v2;
  return {
    id: 'E5_volume_shells',
    title: 'ΔV shells step by Φ³',
    pass:
      Math.abs(v2 / v1 - PHI_EGS ** 3) < 1e-12 &&
      Math.abs(v3 / v1 - PHI_EGS ** 6) < 1e-12 &&
      Math.abs(d12 - 2 * PHI_EGS * v1) < 1e-10 &&
      Math.abs(d23 - PHI_EGS ** 3 * d12) < 1e-10,
  };
}

export function experimentTheaterTiers() {
  return {
    id: 'E6_theater_tiers',
    title: 'Three Omniversal Theater shells locked',
    TIER_LABELS,
    pass: TIER_LABELS.length === 3 && TIER_LABELS[1] === 'goldilocks_amphitheater',
  };
}

export function experimentAgentBudgets() {
  return {
    id: 'E7_agent_budgets',
    title: 'Tier compute budget labels locked',
    AGENT_TIERS,
    BUDGET_CORE,
    BUDGET_MID,
    BUDGET_OUTER,
    pass:
      AGENT_TIERS.length === 3 &&
      BUDGET_CORE === 1 &&
      Math.abs(BUDGET_MID - 2 * PHI_EGS) < 1e-12 &&
      Math.abs(BUDGET_OUTER - 2 * PHI_EGS ** 4) < 1e-12,
    honesty: 'Budget labels — not measured FLOPs.',
  };
}

export function experimentScorecard() {
  return {
    id: 'E8_scorecard',
    title: 'Authored scorecard overall locks',
    SCORECARD,
    SCORECARD_OVERALL,
    pass: SCORECARD_OVERALL === 99.1 && SCORECARD.honestyBoundaryStrength >= 99,
  };
}

export function experimentDocIds() {
  const p1 = path.join(MONOREPO_DOCS, PAPER_NAME);
  const p2 = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  return {
    id: 'E9_doc_ids_paper',
    title: 'Document / registry IDs locked and paper on disk',
    DOC_ID,
    REGISTRY_ID,
    pass:
      DOC_ID === 'WP-SYNTHOBS-TRIADIC-NESTED-HEMISPHERES-99-OCTAVE-2026-08-25' &&
      REGISTRY_ID === 'synthobs-triadic-nested-hemispheres-99-octave-2026-08' &&
      (fs.existsSync(p1) || fs.existsSync(p2)),
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentRadialAdditive(),
    experimentDomeAreaRatios(),
    experimentVolumeShells(),
    experimentTheaterTiers(),
    experimentAgentBudgets(),
    experimentScorecard(),
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
