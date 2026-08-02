import {
  E_F,
  Z0,
  Z0_TABLE_ANCHOR,
  Z0_EPS,
  SCORECARD,
  PARENT_DOC_ID,
  GRANDPARENT_DOC_ID,
  DOC_ID,
} from './constants.mjs';

export function e1GoldenHorizonRadius() {
  const a0 = 1;
  const r0 = a0 / E_F;
  const rPlus = r0 / E_F;
  const expected = a0 / (E_F * E_F);
  const err = Math.abs(rPlus - expected);
  const pass = err < 1e-12;
  return {
    id: 'E1',
    title: 'Horizon radius form r₊ = a₀ / E_F²',
    pass,
    verdict: pass ? 'support' : 'refute',
    r_plus: rPlus,
    expected,
    abs_err: err,
    honesty: 'Algebraic E_F identity — not a measured Kerr r₊ dump.',
  };
}

export function e2FreeSpaceImpedance() {
  const err = Math.abs(Z0 - Z0_TABLE_ANCHOR);
  const pass = err < Z0_EPS;
  return {
    id: 'E2',
    title: 'Z₀ = μ₀ c ≈ 377 Ω (membrane analogy)',
    pass,
    verdict: pass ? 'support' : 'refute',
    Z0,
    table_anchor: Z0_TABLE_ANCHOR,
    abs_err: err,
    honesty: 'SI impedance identity for membrane-paradigm analogy — not a horizon resistivity dump.',
  };
}

export function e3ParentChainPresent() {
  const pass =
    typeof PARENT_DOC_ID === 'string' &&
    PARENT_DOC_ID.includes('BLACKHOLE-FILAMENTS') &&
    typeof GRANDPARENT_DOC_ID === 'string' &&
    GRANDPARENT_DOC_ID.includes('SUPERPOSITION-RENO') &&
    typeof DOC_ID === 'string' &&
    DOC_ID.includes('MAGNETIC-LAYER');
  return {
    id: 'E3',
    title: 'Parent chain DOC IDs present (filaments → Reno)',
    pass,
    verdict: pass ? 'support' : 'refute',
    parent: PARENT_DOC_ID,
    grandparent: GRANDPARENT_DOC_ID,
    honesty: 'Catalog lineage check — not physics validation.',
  };
}

export function e4ScorecardOrdering() {
  const { dualEntity: d, unifiedHorizonA: u } = SCORECARD;
  const pass =
    u.overall > d.overall && u.coherence > d.coherence && u.irreducibility > d.irreducibility;
  return {
    id: 'E4',
    title: 'Unified horizon/A rubric > dual-entity (interpretive)',
    pass,
    verdict: pass ? 'support' : 'refute',
    scorecard: SCORECARD,
    honesty: 'Interpretive rubric only — not SI accuracy of nature.',
  };
}

export function e5IdentityFlagArchitectural() {
  // Symbolic flag: lens asserts K_ab ≡ (e/m c^2) F_ab · E_F — presence of E_F factor
  const factor = E_F;
  const pass = factor > 1.6 && factor < 1.62;
  return {
    id: 'E5',
    title: 'Identity scaling factor E_F in (1.6, 1.62)',
    pass,
    verdict: pass ? 'support' : 'refute',
    E_F: factor,
    honesty: 'Confirms architectural E_F key in identity postulate — not Einstein–Maxwell derivation.',
  };
}

export async function e6LabGate(readJsonOptional) {
  const lab = await readJsonOptional('lab_horizon_A.json');
  if (!lab) {
    return {
      id: 'E6',
      title: 'Independent horizon/A dump (lab gate)',
      pass: true,
      verdict: 'skip',
      honesty: 'No data/lab_horizon_A.json — do not report as support.',
    };
  }
  const pass = Boolean(lab.ok);
  return {
    id: 'E6',
    title: 'Independent horizon/A dump (lab gate)',
    pass,
    verdict: pass ? 'support' : 'refute',
    honesty: 'Computed from optional lab dump only.',
  };
}

export async function runAllExperiments(readJsonOptional) {
  const experiments = [
    e1GoldenHorizonRadius(),
    e2FreeSpaceImpedance(),
    e3ParentChainPresent(),
    e4ScorecardOrdering(),
    e5IdentityFlagArchitectural(),
    await e6LabGate(readJsonOptional),
  ];
  const scored = experiments.filter((e) => e.verdict !== 'skip');
  const n_pass = scored.filter((e) => e.pass).length;
  const n_total = scored.length;
  const failed = scored.filter((e) => !e.pass).map((e) => e.id);
  return { all_pass: failed.length === 0, n_pass, n_total, failed, experiments };
}
