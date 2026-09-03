/**
 * Higgs-Awareness Phase Coupling — Definitive Unified Edition suite.
 * Catalog / model arithmetic only — not SI Higgs/Lenz overthrow or clinical soma proof.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E_F,
  Z0,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SERIES_MARK,
  HIGGS_VEV_GEV,
  HIGGS_MASS_GEV,
  HIGGS_VEV_TOL,
  HIGGS_MASS_TOL,
  CLASSICAL_LENZ_SM,
  HIGGS_GATE,
  TRIADIC_ROWS,
  SOLAR_CHARACTERS,
  PROTOCOL_IDS,
  TOY_G,
  TOY_V0,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');

function vDecelerated(A_norm) {
  const num = TOY_G * HIGGS_VEV_GEV * A_norm;
  const denom = 1 + (num / E_F) ** 2;
  return TOY_V0 / denom;
}

export function experimentEgPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_egs_phi',
    title: 'E_F = Φ_EGS fixture',
    E_F,
    expected,
    pass: Math.abs(E_F - expected) < 1e-15,
    interpretation: 'Catalog harmonic key for Higgs Gate scale layers.',
    honesty: 'Architectural constant — not a replacement for v, m_H, c, e, or ℏ.',
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

export function experimentZ0() {
  return {
    id: 'E3_z0_horizon',
    title: 'Free-space Z₀ ≈ 377 Ω fixture',
    Z0,
    pass: Z0 > 370 && Z0 < 380,
    interpretation: 'Event-horizon skin impedance narrative anchor.',
    honesty: 'SI free-space impedance constant — not a measured horizon resistivity.',
  };
}

export function experimentHiggsVev() {
  return {
    id: 'E4_higgs_vev',
    title: 'Higgs VEV ≈ 246 GeV PDG anchor',
    HIGGS_VEV_GEV,
    pass: Math.abs(HIGGS_VEV_GEV - 246) < HIGGS_VEV_TOL,
    interpretation: 'Literature lock for ⟨Φ⟩ in catalog formulas.',
    honesty: 'PDG-scale anchor — not derived from E_F in this suite.',
  };
}

export function experimentHiggsMass() {
  return {
    id: 'E5_higgs_mass',
    title: 'Higgs mass ≈ 125.1 GeV companion',
    HIGGS_MASS_GEV,
    pass: Math.abs(HIGGS_MASS_GEV - 125.1) < HIGGS_MASS_TOL,
    interpretation: 'Literature companion for electroweak mass narrative.',
    honesty: 'PDG-scale companion — not a collider measurement in this suite.',
  };
}

export function experimentDecelMonotony() {
  const aSmall = 0.1;
  const aLarge = 1.0;
  const vSmall = vDecelerated(aSmall);
  const vLarge = vDecelerated(aLarge);
  return {
    id: 'E6_decel_monotony',
    title: 'v_decel decreases as ‖A_squeezed‖ increases',
    vSmall,
    vLarge,
    aSmall,
    aLarge,
    pass: vLarge < vSmall && vSmall < TOY_V0 && vLarge > 0,
    interpretation: 'Catalog deceleration formula monotony under A squeeze.',
    honesty: 'Toy arithmetic — not a measured magnet-in-pipe time series.',
  };
}

export function experimentTriadicMatrix() {
  return {
    id: 'E7_triadic_matrix',
    title: 'Triadic deceleration matrix has 3 unified domains',
    n: TRIADIC_ROWS.length,
    rows: TRIADIC_ROWS,
    pass: TRIADIC_ROWS.length === 3,
    interpretation: 'Cosmic · quantum · Now catalog completeness.',
    honesty: 'Structural table — not multi-domain empirical unification.',
  };
}

export function experimentSolarCharacters() {
  const primaryOk =
    SOLAR_CHARACTERS.primary.ar === 'AR4520' &&
    SOLAR_CHARACTERS.primary.config === 'beta' &&
    String(SOLAR_CHARACTERS.primary.sidc || '').includes('951');
  const secondaryOk =
    SOLAR_CHARACTERS.secondary.ar === 'AR4518' &&
    SOLAR_CHARACTERS.secondary.config === 'alpha';
  return {
    id: 'E8_solar_characters',
    title: 'Solar phase-locking characters AR4520 / AR4518 catalog lock',
    SOLAR_CHARACTERS,
    pass: primaryOk && secondaryOk,
    interpretation: 'Ephemeral heliospheric filing labels for protocol timing narratives.',
    honesty: 'Not astronomy proof of the theorem or durable AR certificates.',
  };
}

export function experimentProtocolLanes() {
  return {
    id: 'E9_protocol_lanes',
    title: 'Three Amendment-A empirical protocol lanes registered',
    PROTOCOL_IDS,
    n: PROTOCOL_IDS.length,
    pass: PROTOCOL_IDS.length === 3,
    interpretation: 'Pipe squeeze · H-line RF · somatic array as proposed lanes.',
    honesty: 'Protocol registry — not completed SI falsification archives.',
  };
}

export function experimentPaperOnDisk() {
  const mono = path.join(MONOREPO_DOCS, PAPER_NAME);
  const mirror = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const monoOk = fs.existsSync(mono);
  const mirrorOk = fs.existsSync(mirror);
  let hasDocId = false;
  let hasHonesty = false;
  let hasTbme = false;
  let hasSeries = false;
  let hasInfinite = false;
  if (monoOk) {
    const text = fs.readFileSync(mono, 'utf8');
    hasDocId = text.includes(DOC_ID);
    hasHonesty = /Honesty boundary/i.test(text);
    hasTbme = /Category scope & disclaimer \(TBME\)/i.test(text);
    hasSeries = text.includes(SERIES_MARK);
    hasInfinite = /Infinite Octave/i.test(text);
  }
  return {
    id: 'E10_paper_on_disk',
    title: 'Canonical paper + Doc ID + Honesty + TBME + Part IX-Omni + Infinite Octaves',
    monoOk,
    mirrorOk,
    hasDocId,
    hasHonesty,
    hasTbme,
    hasSeries,
    hasInfinite,
    registryId: REGISTRY_ID,
    pass: monoOk && mirrorOk && hasDocId && hasHonesty && hasTbme && hasSeries && hasInfinite,
    interpretation: 'Catalog fidelity for Omni-Lattice / Infinite Octaves engine sync.',
    honesty: 'Filesystem receipt.',
  };
}

export function experimentScorecardOrder() {
  const sepOverall = (CLASSICAL_LENZ_SM.coherence + CLASSICAL_LENZ_SM.irreducibility) / 2;
  const uniOverall = (HIGGS_GATE.coherence + HIGGS_GATE.irreducibility) / 2;
  return {
    id: 'E11_scorecard_order',
    title: 'Higgs-Gate rubric overall > Classical Lenz+SM overall',
    sepOverall,
    uniOverall,
    fixtures: { CLASSICAL_LENZ_SM, HIGGS_GATE },
    pass:
      Math.abs(sepOverall - CLASSICAL_LENZ_SM.overall) < 1e-9 &&
      Math.abs(uniOverall - HIGGS_GATE.overall) < 1e-9 &&
      uniOverall > sepOverall,
    interpretation: 'Interpretive scorecard ordering for Part IX-Omni lens.',
    honesty: 'Rubric arithmetic — not SI accuracy of nature.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentZ0(),
    experimentHiggsVev(),
    experimentHiggsMass(),
    experimentDecelMonotony(),
    experimentTriadicMatrix(),
    experimentSolarCharacters(),
    experimentProtocolLanes(),
    experimentPaperOnDisk(),
    experimentScorecardOrder(),
  ];
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    all_pass: failed.length === 0,
    n_pass: experiments.length - failed.length,
    n_total: experiments.length,
    failed,
    experiments,
  };
}
