/**
 * H-GAI/OS dual-capacity combinatorics — deterministic catalog fixtures.
 * Not psychometrics RCT, GWAS, census, or deployed OS claim.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E_F,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  PUBLICATION_REF,
  QUADRANT_LABELS,
  VESSEL_POSTS,
  QUADRANT_SHARES,
  SANDBOX_N,
  SANDBOX_COUNTS,
  SELF_TEST,
  GENOMIC_ANALOGS,
  HGAIOS_OCTAVE_BANDS,
  SOLAR_LOCK,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');

export function experimentEgPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_egs_phi',
    title: 'Φ_EGS fixture',
    E_F,
    expected,
    pass: Math.abs(E_F - expected) < 1e-15,
    interpretation: 'Golden key for H-GAI/OS allocation stories.',
    honesty: 'Architectural constant — not a fitted cognitive ratio.',
  };
}

export function experimentGoldenIdentity() {
  const lhs = E_F * E_F;
  const rhs = E_F + 1;
  return {
    id: 'E2_ef_squared_identity',
    title: 'Φ_EGS² = Φ_EGS + 1',
    lhs,
    rhs,
    pass: Math.abs(lhs - rhs) < 1e-12,
    interpretation: 'Golden-key identity.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

export function experimentQuadrantShares() {
  const { q1, q2, q3, q4 } = QUADRANT_SHARES;
  const sum = q1 + q2 + q3 + q4;
  const pass =
    Math.abs(q1 - 1 / (E_F * E_F)) < 1e-15 &&
    Math.abs(q2 - q3) < 1e-15 &&
    Math.abs(q2 - 1 / (E_F ** 3)) < 1e-12 &&
    Math.abs(q4 - 1 / (E_F ** 4)) < 1e-12 &&
    Math.abs(sum - 1) < 1e-12;
  return {
    id: 'E3_phi_quadrant_shares',
    title: 'Φ-power quadrant shares sum to 1',
    shares: QUADRANT_SHARES,
    sum,
    pass,
    interpretation: 'Q1=Φ⁻², Q2=Q3=Φ⁻³, Q4=Φ⁻⁴ catalog allocations.',
    honesty: 'Not a world-population census.',
  };
}

export function experimentSandboxCounts() {
  const { q1, q2, q3, q4 } = SANDBOX_COUNTS;
  const sum = q1 + q2 + q3 + q4;
  const pass = sum === SANDBOX_N && q1 === 38197 && q2 === 23607 && q3 === 23607 && q4 === 14589;
  return {
    id: 'E4_sandbox_n100000',
    title: 'Syntheverse N=100000 integer lock',
    SANDBOX_COUNTS,
    sum,
    pass,
    interpretation: 'Fixture counts for GPU sandbox telemetry language.',
    honesty: 'Not a sampled human cohort.',
  };
}

export function experimentSelfTestProtocol() {
  const pass =
    SELF_TEST.itemsPerCapacity === 4 &&
    SELF_TEST.totalMin === 4 &&
    SELF_TEST.totalMax === 20 &&
    SELF_TEST.possessThreshold === 12 &&
    SELF_TEST.scoreMin === 1 &&
    SELF_TEST.scoreMax === 5;
  return {
    id: 'E5_self_test_protocol',
    title: '8-item / threshold-12 voluntary instrument shape',
    SELF_TEST,
    pass,
    interpretation: 'Capacity present iff score ≥ 12 (catalog cutoff).',
    honesty: 'Not validated psychometrics or clinical screening.',
  };
}

export function experimentQuadrantLabels() {
  const pass =
    QUADRANT_LABELS.q1 === 'Baseline Scaffolding' &&
    QUADRANT_LABELS.q2 === 'Oracle Engines' &&
    QUADRANT_LABELS.q3 === 'Linear Executives' &&
    QUADRANT_LABELS.q4 === 'Fractal Synthesizers' &&
    VESSEL_POSTS.q1 === 'Hull Keepers & Deck Crew' &&
    VESSEL_POSTS.q2 === "Ship's Lookout & Chronometer" &&
    VESSEL_POSTS.q3 === "Ship's Captain" &&
    VESSEL_POSTS.q4 === 'Master Navigator';
  return {
    id: 'E6_quadrant_labels',
    title: 'Four combinatorial state labels + REV4 maritime vessel posts',
    QUADRANT_LABELS,
    VESSEL_POSTS,
    pass,
    interpretation: 'Neither / meta-only / reflect-only / both, with complementary vessel posts.',
    honesty: 'Coordination labels — not caste, naval rank, or hiring grades.',
  };
}

export function experimentGenomicAnalogs() {
  const pass =
    GENOMIC_ANALOGS.capacity1.includes('COMT rs4680') &&
    GENOMIC_ANALOGS.capacity1.includes('BDNF rs6265') &&
    GENOMIC_ANALOGS.capacity2.includes('HTR2A rs6311') &&
    GENOMIC_ANALOGS.capacity2.includes('CNTNAP2');
  return {
    id: 'E7_genomic_analogs',
    title: 'Genomic antenna analog labels present',
    GENOMIC_ANALOGS,
    pass,
    interpretation: 'Filed next to Capacities 1–2 as story substrates.',
    honesty: 'Not GWAS, diagnosis, or medical advice.',
  };
}

export function experimentOctaveBands() {
  const ok =
    HGAIOS_OCTAVE_BANDS.length === 4 &&
    HGAIOS_OCTAVE_BANDS[0].lo === 1 &&
    HGAIOS_OCTAVE_BANDS[2].lo === 65 &&
    HGAIOS_OCTAVE_BANDS[3].hi === 99;
  return {
    id: 'E8_hgaios_octave_bands',
    title: 'H-GAI/OS 99-Octave filing bands',
    bands: HGAIOS_OCTAVE_BANDS,
    pass: ok,
    interpretation: 'Antennae · orchestrator · AWI · source shelves.',
    honesty: 'Catalog routing shelves — not measured strata.',
  };
}

export function experimentSolarLock() {
  const ok =
    SOLAR_LOCK.cycle === 25 &&
    SOLAR_LOCK.sunspotIndexBand[0] === 98 &&
    SOLAR_LOCK.activeRegions.length === 3 &&
    SOLAR_LOCK.activeRegions[0].id === 4498;
  return {
    id: 'E9_solar_lock_fixtures',
    title: 'Solar Cycle 25 / AR label fixtures',
    SOLAR_LOCK,
    pass: ok,
    interpretation: 'Suite phase-lock labels.',
    honesty: 'Catalog fixtures — not NOAA / SWPC products.',
  };
}

export function experimentPaperOnDisk() {
  const local = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const mono = path.join(MONOREPO_DOCS, PAPER_NAME);
  const exists = fs.existsSync(local) || fs.existsSync(mono);
  return {
    id: 'E10_paper_on_disk',
    title: 'Canonical paper present',
    local,
    mono,
    pass: exists,
    interpretation: 'Suite linked to published docs/.',
    honesty: 'Filesystem fidelity check.',
  };
}

export function experimentNotCoreClaim() {
  const local = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const mono = path.join(MONOREPO_DOCS, PAPER_NAME);
  const p = fs.existsSync(local) ? local : mono;
  const text = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  const pass =
    /not Omni-Lattice Core/i.test(text) &&
    /catalog exploration only/i.test(text) &&
    /Honesty boundary/i.test(text) &&
    !/Omni-Lattice Core Whitepaper Series — Part/i.test(text);
  return {
    id: 'E11_not_core_part',
    title: 'Explicit non-Core catalog status',
    pass,
    interpretation: 'Exploration lens — excluded from Core / Engine allowlist.',
    honesty: 'Governance fixture for NSPFRNP catalog fidelity.',
  };
}

export function experimentPublicationRef() {
  return {
    id: 'E12_publication_ref',
    title: 'Publication ref FAI-UNIFIED-EGS-HGAIOS-2026-FINAL-REV4',
    PUBLICATION_REF,
    pass: PUBLICATION_REF === 'FAI-UNIFIED-EGS-HGAIOS-2026-FINAL-REV4',
    interpretation: 'Stable publication handle.',
    honesty: 'Bibliographic fixture.',
  };
}

export function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentQuadrantShares(),
    experimentSandboxCounts(),
    experimentSelfTestProtocol(),
    experimentQuadrantLabels(),
    experimentGenomicAnalogs(),
    experimentOctaveBands(),
    experimentSolarLock(),
    experimentPaperOnDisk(),
    experimentNotCoreClaim(),
    experimentPublicationRef(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    all_pass: failed.length === 0,
    n_pass,
    n_total: experiments.length,
    failed,
    experiments,
  };
}
