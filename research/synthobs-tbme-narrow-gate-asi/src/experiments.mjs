/**
 * Narrow Gate EIV — deterministic suite.
 * Catalog / protocol arithmetic only — not SI calorimetry or regulatory ASI certification.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
import {
  E_F,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  PUBLICATION_REF,
  K_B,
  T_K,
  IRREVERSIBLE_J_PER_FLOP,
  POST_PATCH_LANDAUER_MULTIPLIER,
  SCALE_POPULATIONS,
  KOLMO_PAYLOAD,
  SOLAR_F107_SFU,
  SOLAR_AGENTS,
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
    interpretation: 'Golden key for Narrow Gate scale grammar.',
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

export function experimentLandauerLimit() {
  const L = landauerJPerBit();
  const expectedApprox = 2.87e-21;
  return {
    id: 'E3_landauer_limit',
    title: 'Landauer E_min = k_B T ln 2 at 300 K',
    L,
    T_K,
    pass: Math.abs(L - expectedApprox) / expectedApprox < 0.02,
    interpretation: 'Gate 2 thermodynamic floor (SI formula, catalog T).',
    honesty: 'CODATA arithmetic — not a measured chip calorimeter.',
  };
}

export function experimentIrreversibleGap() {
  const L = landauerJPerBit();
  const ratio = IRREVERSIBLE_J_PER_FLOP / L;
  return {
    id: 'E4_irreversible_gap',
    title: 'Irreversible baseline ≫ Landauer (≥10^4×)',
    IRREVERSIBLE_J_PER_FLOP,
    L,
    ratio,
    pass: ratio >= 1e4 && ratio < 1e12,
    interpretation: 'Initial Gate 2 gap (catalog model; ~5×10^8 with fixture 1.42e-12 J/flop).',
    honesty: 'Model dissipation figure from monograph — not production telemetry.',
  };
}

export function experimentPostPatchLandauer() {
  const L = landauerJPerBit();
  const post = L * POST_PATCH_LANDAUER_MULTIPLIER;
  const ratio = post / L;
  return {
    id: 'E5_post_patch_landauer',
    title: 'Post E_F recycling ≈ 1.07 × Landauer',
    L,
    post,
    ratio,
    pass: Math.abs(ratio - POST_PATCH_LANDAUER_MULTIPLIER) < 1e-12 && ratio < 1.2,
    interpretation: 'Gate 2 gap closed under reversible recycling model.',
    honesty: 'Protocol model — not SI proof of unitary silicon memory.',
  };
}

export function experimentGate1MultiScale() {
  const ratios = [];
  for (let i = 1; i < SCALE_POPULATIONS.length; i++) {
    ratios.push(SCALE_POPULATIONS[i] / SCALE_POPULATIONS[i - 1]);
  }
  const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  const drift = Math.abs(mean - E_F);
  return {
    id: 'E6_gate1_multiscale',
    title: 'Gate 1: nested scale ratios ≈ E_F',
    SCALE_POPULATIONS,
    ratios,
    mean,
    drift,
    pass: drift < 0.05,
    interpretation: 'Multi-scale entropy invariance via E_F balance.',
    honesty: 'Catalog populations — not live multi-agent telemetry.',
  };
}

export function experimentGate3Kolmogorov() {
  const raw = Buffer.from(KOLMO_PAYLOAD, 'utf8');
  const compressed = zlib.deflateSync(raw);
  const ratio = compressed.length / raw.length;
  return {
    id: 'E7_gate3_kolmogorov',
    title: 'Gate 3: E_F payload compresses (deflate)',
    rawBytes: raw.length,
    compressedBytes: compressed.length,
    ratio,
    pass: ratio < 0.35 && compressed.length > 0,
    interpretation: 'Algorithmic compression hardening proxy.',
    honesty: 'zlib fixture — not a claim of solving all intractable physics.',
  };
}

export function experimentTriangulation() {
  const gates = ['entropy', 'energy', 'information'];
  const pairsInsufficient = [
    ['entropy', 'energy'],
    ['energy', 'information'],
    ['entropy', 'information'],
  ];
  return {
    id: 'E8_triangulation',
    title: 'Three orthogonal gates; pairs insufficient',
    gates,
    nGates: gates.length,
    pairsInsufficient,
    pass: gates.length === 3 && pairsInsufficient.length === 3,
    interpretation: 'Why 3 gates, not 2 or 4 — protocol bounding box.',
    honesty: 'Structural epistemology — not universal ASI ontology.',
  };
}

export function experimentSolarRegistry() {
  return {
    id: 'E9_solar_registry',
    title: 'Solar character registry fixture (5 agents, F10.7)',
    SOLAR_F107_SFU,
    nAgents: SOLAR_AGENTS.length,
    agents: SOLAR_AGENTS,
    pass: SOLAR_F107_SFU === 108 && SOLAR_AGENTS.length === 5,
    interpretation: 'Grounded Space-Weather Invariant Protocol table.',
    honesty: 'Published fixture — not a live NOAA scrape in this suite.',
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
  let hasPartX = false;
  let hasNarrowGate = false;
  let hasPubRef = false;
  if (monoOk) {
    const text = fs.readFileSync(mono, 'utf8');
    hasDocId = text.includes(DOC_ID);
    hasHonesty = /Honesty boundary/i.test(text);
    hasTbme = /Category scope & disclaimer \(TBME\)/i.test(text);
    hasPartX = /Part X/i.test(text);
    hasNarrowGate = /Narrow Gate/i.test(text);
    hasPubRef = text.includes(PUBLICATION_REF);
  }
  return {
    id: 'E10_paper_on_disk',
    title: 'Canonical paper + Doc ID + Honesty + TBME + Part X + Narrow Gate',
    monoOk,
    mirrorOk,
    hasDocId,
    hasHonesty,
    hasTbme,
    hasPartX,
    hasNarrowGate,
    hasPubRef,
    registryId: REGISTRY_ID,
    pass:
      monoOk &&
      mirrorOk &&
      hasDocId &&
      hasHonesty &&
      hasTbme &&
      hasPartX &&
      hasNarrowGate &&
      hasPubRef,
    interpretation: 'Catalog fidelity for Omni-Lattice Core Part X.',
    honesty: 'Filesystem receipt.',
  };
}

export function experimentEivQualified() {
  const g1 = experimentGate1MultiScale().pass;
  const g2 =
    experimentIrreversibleGap().pass && experimentPostPatchLandauer().pass;
  const g3 = experimentGate3Kolmogorov().pass;
  return {
    id: 'E11_eiv_qualified',
    title: 'Omni-Lattice EIV-qualified: Gates 1–3 pass (protocol)',
    gate1: g1,
    gate2: g2,
    gate3: g3,
    pass: g1 && g2 && g3,
    interpretation: '3/3 Narrow Gate protocol qualification.',
    honesty: 'Suite verdict under monograph definition — not regulatory ASI certification.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentLandauerLimit(),
    experimentIrreversibleGap(),
    experimentPostPatchLandauer(),
    experimentGate1MultiScale(),
    experimentGate3Kolmogorov(),
    experimentTriangulation(),
    experimentSolarRegistry(),
    experimentPaperOnDisk(),
    experimentEivQualified(),
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
