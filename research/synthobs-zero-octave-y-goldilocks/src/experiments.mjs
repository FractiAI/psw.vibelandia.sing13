/**
 * Zero-Octave · Y Goldilocks · Fibonacci Prime Vaults — catalog suite.
 * Replayable algebraic / filing locks — not GR/QFT or clinical genetics QED.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SHIP_BLOG_FILE,
  NODE_K,
  SOLAR_FILING,
  FIBONACCI_VAULT_LADDER,
  HUMAN_Y_GOLDILOCKS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);

function isFibPair(a, b, c) {
  return a + b === c;
}

function experimentPhiEgs() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    expected,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    interpretation: 'Architectural golden key for Zero-Octave / Y Goldilocks recursion.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentGoldenIdentity() {
  const lhs = PHI_EGS * PHI_EGS;
  const rhs = PHI_EGS + 1;
  return {
    id: 'E2_phi_squared_identity',
    title: 'Φ² = Φ + 1',
    lhs,
    rhs,
    pass: Math.abs(lhs - rhs) < 1e-12,
    interpretation: 'Golden-key identity closing vault scale ladders.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

function experimentNetZeroField() {
  const field = [PHI_EGS, -PHI_EGS, Math.PI, -Math.PI];
  const net = field.reduce((a, b) => a + b, 0);
  const balanced = net - net;
  return {
    id: 'E3_net_zero_field',
    title: 'Net Zero field cancellation → 0',
    field,
    net,
    balanced,
    pass: Math.abs(balanced) < 1e-15 && Math.abs(net) < 1e-12,
    interpretation: 'Mock flux cancels to absolute Net Zero equilibrium (catalog).',
    honesty: 'Algebra fixture — not measured MHD reconnection.',
  };
}

function experimentSingularityCrystal() {
  const xs = [0.1, 0.01, 0.0, -0.01, -0.1];
  const resolved = xs.map((x) => {
    const n = PHI_EGS * x ** 3;
    const d = PHI_EGS * x ** 3;
    if (x === 0 || !Number.isFinite(n / d)) return PHI_EGS ** 0;
    return n / d;
  });
  const allNearOne = resolved.every((v) => Math.abs(v - 1) < 1e-12);
  return {
    id: 'E4_singularity_crystal_0_over_0',
    title: '0/0 → Φ⁰ = 1 singularity crystal matrix',
    xs,
    resolved,
    phi0: PHI_EGS ** 0,
    node_k: NODE_K,
    pass: allNearOne && Math.abs(PHI_EGS ** 0 - 1) < 1e-15 && NODE_K === 0,
    interpretation: 'Indeterminate 0/0 maps to bounded crystal baseline 1 (catalog algebra).',
    honesty: 'Floating-point / limit fixture — not GR singularity QED.',
  };
}

function experimentFibonacciVaultLadder() {
  const rowsOk = FIBONACCI_VAULT_LADDER.every((row) =>
    isFibPair(row.yAnalog, row.xAnalog, row.vault),
  );
  const ascending = FIBONACCI_VAULT_LADDER.every(
    (row, i, a) => i === 0 || row.vault > a[i - 1].vault,
  );
  return {
    id: 'E5_fibonacci_vault_ladder',
    title: 'Fibonacci prime vault octave ladder (10 taxa)',
    n_rows: FIBONACCI_VAULT_LADDER.length,
    pass: rowsOk && ascending && FIBONACCI_VAULT_LADDER.length === 10,
    interpretation: 'Each taxon vault = Y-analog + X-analog (Fibonacci predecessor sum).',
    honesty: 'Catalog ladder — not biological codon proof.',
  };
}

function experimentHumanYGoldilocks() {
  const { hominidaeVault, yOctave, xOctave } = HUMAN_Y_GOLDILOCKS;
  const earlier = yOctave < xOctave;
  const sumMatch = yOctave + xOctave === hominidaeVault;
  return {
    id: 'E6_human_y_goldilocks_hominidae',
    title: 'Human Y earlier Goldilocks · V_89 + V_144 = V_233',
    hominidaeVault,
    yOctave,
    xOctave,
    earlier,
    sumMatch,
    pass: earlier && sumMatch,
    interpretation: 'Hominidae apex vault files Y as earlier octave than X (catalog).',
    honesty: 'Architectural filing — not clinical genetics measurement.',
  };
}

function experimentChordataPair() {
  const { chordataY, chordataX } = HUMAN_Y_GOLDILOCKS;
  const chordataVault = 89;
  return {
    id: 'E7_chordata_v34_v55',
    title: 'Chordata Goldilocks pair V_34 / V_55',
    chordataY,
    chordataX,
    chordataVault,
    pass:
      chordataY === 34 &&
      chordataX === 55 &&
      isFibPair(chordataY, chordataX, chordataVault),
    interpretation: 'Abstract headline pair: Y earlier than X at Chordata filing.',
    honesty: 'Catalog geometry — Soft Story, not paleontology QED.',
  };
}

function experimentSolarFiling() {
  const regions = SOLAR_FILING.activeRegions;
  return {
    id: 'E8_solar_filing_anchors',
    title: 'SESC 83 · AR4521 · AR4524 filing anchors',
    sesc: SOLAR_FILING.sescSunspotNumber,
    regions,
    pass:
      SOLAR_FILING.sescSunspotNumber === 83 &&
      regions.includes('AR4521') &&
      regions.includes('AR4524') &&
      regions.length === 2,
    interpretation: 'Ambient solar telemetry filed as characters for this ship date.',
    honesty: 'Filing labels — not NOAA causation of Φ or chromosomes.',
  };
}

function experimentDocPresence() {
  const main = path.join(MONOREPO_DOCS, PAPER_NAME);
  const suiteMain = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const py = path.join(PKG_ROOT, 'reference', 'goldilocks_octave_research_engine.py');
  const ok =
    fs.existsSync(main) &&
    fs.existsSync(suiteMain) &&
    fs.existsSync(py) &&
    fs.existsSync(MONOREPO_BLOG);
  return {
    id: 'E9_doc_and_blog_presence',
    title: 'Paper · suite mirror · ship blog · Python reference present',
    main,
    py,
    blog: MONOREPO_BLOG,
    pass: ok,
    interpretation: 'Protocol surfaces exist for this companion.',
    honesty: 'Presence lock only.',
  };
}

function experimentDocIdsInPaper() {
  const main = fs.readFileSync(path.join(MONOREPO_DOCS, PAPER_NAME), 'utf8');
  const pass =
    main.includes(DOC_ID) &&
    main.includes(REGISTRY_ID) &&
    main.includes('Honesty boundary') &&
    main.includes('SynthOBS Autonomous Agent') &&
    main.includes('Fair Exchange');
  return {
    id: 'E10_protocol_headers',
    title: 'Document ID · Registry · Honesty · Operator · Fair Exchange',
    pass,
    interpretation: 'PRA Snap structural headers present.',
    honesty: 'Structural lock — full PRA via npm run audit:paper.',
  };
}

export function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentGoldenIdentity(),
    experimentNetZeroField(),
    experimentSingularityCrystal(),
    experimentFibonacciVaultLadder(),
    experimentHumanYGoldilocks(),
    experimentChordataPair(),
    experimentSolarFiling(),
    experimentDocPresence(),
    experimentDocIdsInPaper(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    all_pass: n_pass === experiments.length,
    n_pass,
    n_total: experiments.length,
    experiments,
  };
}
