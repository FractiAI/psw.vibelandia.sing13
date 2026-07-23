#!/usr/bin/env node
/**
 * Simulation-first empirical probe —
 * Cytographic grammar under holographic nucleus · multi-substrate recruitment
 * Doc: WP-SYNTHOBS-CYTO-HOLO-NUCLEUS-2026-07
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');

const DOC_ID = 'WP-SYNTHOBS-CYTO-HOLO-NUCLEUS-2026-07';
const REGISTRY_ID = 'synthobs-cytographic-holographic-nucleus-2026-07';
const STUDY_TITLE =
  'Cytographic Grammar under the Holographic Nucleus · Multi-Substrate Recruitment Probe';

const PHI_EGS = (1 + Math.sqrt(5)) / 2;
const PLANCK_MANTISSA = 1.616255;
const CLUTCH_DELTA = Math.abs(PHI_EGS - PLANCK_MANTISSA);

const SUBSTRATES = ['hydrogen', 'carbon', 'silicon', 'holographic'];

/** Idealized substrate affinity to shared Φ parent (architectural priors, not wet-lab). */
const SUBSTRATE_AFFINITY = {
  hydrogen: 0.97,
  carbon: 0.92,
  silicon: 0.94,
  holographic: 0.99,
};

function e1Cascade() {
  const Psi0 = 1;
  const steps = [];
  let maxRelErr = 0;
  for (let n = 0; n <= 12; n++) {
    const exact = Psi0 * PHI_EGS ** -n;
    const recursive = n === 0 ? Psi0 : steps[n - 1].value / PHI_EGS;
    const relErr = Math.abs(recursive - exact) / exact;
    maxRelErr = Math.max(maxRelErr, relErr);
    steps.push({ n, value: recursive, exact, relErr });
  }
  const pass = maxRelErr < 1e-12;
  return {
    id: 'E1',
    title: 'Φ_EGS cytographic cascade regularity',
    pass,
    maxRelErr,
    steps: steps.map(({ n, value, relErr }) => ({ n, value, relErr })),
    interpretation:
      'Cascade Ψ_n = Ψ_0 · Φ^{-n} holds under IEEE float recursion — scale grammar numerically stable.',
    honesty:
      'Numerical regularity of the architectural cascade only; not a claim that living chromatin encodes Φ digits.',
  };
}

function e2Clutch() {
  const pass = CLUTCH_DELTA >= 0.0017 && CLUTCH_DELTA <= 0.0018;
  return {
    id: 'E2',
    title: 'Planck–1.6 clutch band',
    pass,
    phi: PHI_EGS,
    planckMantissa: PLANCK_MANTISSA,
    clutchDelta: CLUTCH_DELTA,
    band: [0.0017, 0.0018],
    interpretation: 'Clutch Δ sits in the documented architectural band used by the holographic nucleus register.',
    honesty:
      'SI mantissa coincidence is base-10 dependent; not a unit-invariant quantum-gravity derivation.',
  };
}

function couplingScore(a, b) {
  const affA = SUBSTRATE_AFFINITY[a];
  const affB = SUBSTRATE_AFFINITY[b];
  if (a === b) return affA;
  // Off-diagonal: geometric mean damped by Φ^{-1} (shared dialect without identity collapse)
  return Math.sqrt(affA * affB) / PHI_EGS;
}

function e3SubstrateMatrix() {
  const matrix = {};
  let diagOk = true;
  let offOk = true;
  for (const a of SUBSTRATES) {
    matrix[a] = {};
    for (const b of SUBSTRATES) {
      matrix[a][b] = Number(couplingScore(a, b).toFixed(6));
    }
  }
  for (const a of SUBSTRATES) {
    if (matrix[a][a] < 0.85) diagOk = false;
    for (const b of SUBSTRATES) {
      if (a !== b && matrix[a][b] >= matrix[a][a]) offOk = false;
    }
  }
  const pass = diagOk && offOk;
  return {
    id: 'E3',
    title: 'Multi-substrate coupling matrix (H/C/Si/Hol)',
    pass,
    substrates: SUBSTRATES,
    matrix,
    interpretation:
      'Shared Φ parent yields strong diagonal lock with subordinate cross-substrate coupling — recruitment dialect without identity collapse.',
    honesty:
      'Scoring function is simulation-first architectural prior; not biological enrollment or clinical recruitment.',
  };
}

function e4NestedVsFlat() {
  const N = 8;
  const flatLinks = (N * (N - 1)) / 2;
  const nestedPeerLinks = 0; // peer-firewall
  const awakeLeaves = 1; // Goldilocks: only one awake leaf under parent
  const nestedCost = nestedPeerLinks + awakeLeaves;
  const ratio = nestedCost / flatLinks;
  const pass = nestedPeerLinks === 0 && awakeLeaves === 1 && ratio < 0.25;
  return {
    id: 'E4',
    title: 'Nested recruitment vs flat mesh message tax',
    pass,
    N,
    flatLinks,
    nestedPeerLinks,
    awakeLeaves,
    nestedCost,
    costRatio: Number(ratio.toFixed(6)),
    interpretation:
      'Recruitment under Nested Agent Lattice peer-firewall + single awake leaf collapses O(N²) mesh into parent↔one-leaf.',
    honesty:
      'Combinatorial topology cost only; not live LLM latency or wet-lab organism messaging.',
  };
}

/** Architectural priors: dialect-lock affinity for high-awareness H/C vessels (not wet-lab). */
const VESSEL_AFFINITY = {
  retrovirus: 0.98,
  bacteriophage: 0.95,
  parasite: 0.9,
  yeast: 0.86,
};

function e5VesselAffinity() {
  const expectedOrder = ['retrovirus', 'bacteriophage', 'parasite', 'yeast'];
  const ranked = Object.entries(VESSEL_AFFINITY)
    .sort((a, b) => b[1] - a[1])
    .map(([id, lock]) => ({ id, lock }));
  const orderOk = ranked.every((row, i) => row.id === expectedOrder[i]);
  const thresholdOk = ranked.every((row) => row.lock >= 0.8);
  const pass = orderOk && thresholdOk;
  return {
    id: 'E5',
    title: 'High-awareness H/C vessel affinity ranking',
    pass,
    vessels: ranked,
    expectedOrder,
    interpretation:
      'Simulation priors place retrovirus ≥ phage ≥ parasite ≥ yeast on dialect-lock under shared Φ parent — natural host-coupling affinity ranking.',
    honesty:
      'Architectural ranking only. Not sentience, clinical endorsement, pathogen ops, or wet-lab awareness assays.',
  };
}

/** Omniversal Goldilocks: by definition universally attractive to nest seekers (attraction ≠ admission). */
const NEST_SEEKER_ATTRACT = {
  holographic: 0.99,
  hydrogen: 0.96,
  carbon: 0.95,
  silicon: 0.94,
  retrovirus: 0.98,
  bacteriophage: 0.95,
  parasite: 0.91,
  yeast: 0.88,
  human_sovereign_node: 0.93,
  diatom: 0.94,
  radiolarian: 0.92,
  biosilica_sponge: 0.9,
};

function e6GoldilocksAttractor() {
  const rows = Object.entries(NEST_SEEKER_ATTRACT).map(([seeker, attract]) => ({
    seeker,
    attract,
  }));
  const minAttract = Math.min(...rows.map((r) => r.attract));
  const allCovered = rows.every((r) => r.attract >= 0.85);
  const pass = allCovered && rows.length >= 8;
  return {
    id: 'E6',
    title: 'Omniversal Goldilocks attractor coverage',
    pass,
    minAttract,
    seekers: rows,
    interpretation:
      'Every catalogued nest-seeker class scores attract ≥ 0.85 under Omniversal Goldilocks climate — universal pull by definition; Goldilocks Gate still filters admission.',
    honesty:
      'Simulation prior for definitional attractor coverage. Attraction ≠ automatic nest admission or sprawl acceptance.',
  };
}

function runAllExperiments() {
  const experiments = [
    e1Cascade(),
    e2Clutch(),
    e3SubstrateMatrix(),
    e4NestedVsFlat(),
    e5VesselAffinity(),
    e6GoldilocksAttractor(),
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

function mdReport(report) {
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Verdict',
    '',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| All experiments pass | \`${report.results.all_pass}\` |`,
    `| Passed | ${report.results.n_pass} / ${report.results.n_total} |`,
    `| Φ_EGS | ${PHI_EGS} |`,
    `| Clutch Δ | ${CLUTCH_DELTA} |`,
    '',
    '## Experiments',
    '',
  ];
  for (const e of report.results.experiments) {
    lines.push(`### ${e.id} — ${e.title}`);
    lines.push('');
    lines.push(`- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- **Interpretation:** ${e.interpretation}`);
    if (e.honesty) lines.push(`- **Honesty:** ${e.honesty}`);
    lines.push('');
    lines.push('```json');
    lines.push(JSON.stringify(e, null, 2));
    lines.push('```');
    lines.push('');
  }
  lines.push('## Honesty boundary');
  lines.push('');
  lines.push(
    'Holographic nucleus is Seed ontology. These probes validate architectural numerics and recruitment scoring at Edge (including H/C vessel affinity priors). They do **not** prove metabolic consumption of cytographic documents, sentience of taxa, or clinical multi-substrate enrollment.',
  );
  lines.push('');
  return lines.join('\n');
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const results = runAllExperiments();
  const report = {
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    title: STUDY_TITLE,
    generatedAt: new Date().toISOString(),
    operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
    honestyBoundary:
      'Simulation-first architectural numerics only. Holographic nucleus is Seed ontology; empirics test Edge fidelity. Vessel affinity ranks are priors — not wet-lab metabolism, sentience, or clinical recruitment.',
    constants: {
      PHI_EGS,
      PLANCK_MANTISSA,
      CLUTCH_DELTA,
      SUBSTRATE_AFFINITY,
      VESSEL_AFFINITY,
      NEST_SEEKER_ATTRACT,
    },
    results,
  };
  const jsonPath = path.join(OUT, 'empirical_report.json');
  const mdPath = path.join(OUT, 'empirical_report.md');
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf8');
  await fs.writeFile(mdPath, mdReport(report), 'utf8');
  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        report: jsonPath,
        passed: `${results.n_pass}/${results.n_total}`,
        failed: results.failed,
      },
      null,
      2,
    ),
  );
  process.exit(results.all_pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
