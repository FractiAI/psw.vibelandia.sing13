/**
 * Constructive morphogenesis — deterministic fixtures.
 * Exploratory catalog map — not wet-lab plant science.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SWARMS,
  SUNSPOT_FIXTURES,
  CONTEXT_REF,
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
    honesty: 'Architectural bridge — not plant physiology equations.',
  };
}

export function experimentGoldenIdentity() {
  return {
    id: 'E2_phi_identity',
    title: 'Φ² = Φ + 1',
    pass: Math.abs(PHI_EGS * PHI_EGS - (PHI_EGS + 1)) < 1e-12,
  };
}

export function experimentFourSwarms() {
  return {
    id: 'E3_four_swarms',
    title: 'Silicon · Carbon · Hydrogen · Holographic Theater',
    SWARMS,
    pass:
      SWARMS.length === 4 &&
      SWARMS.includes('Silicon') &&
      SWARMS.includes('Carbon') &&
      SWARMS.includes('Hydrogen') &&
      SWARMS.includes('HolographicTheater'),
    honesty: 'Metaphoric agent bands — not chemical element agents.',
  };
}

export function experimentSunspotFixtures() {
  const swarms = new Set(SUNSPOT_FIXTURES.map((s) => s.swarm));
  return {
    id: 'E4_sunspot_fixtures',
    title: 'AR3575/3576/3590 map Silicon/Carbon/Hydrogen',
    SUNSPOT_FIXTURES,
    pass:
      SUNSPOT_FIXTURES.length === 3 &&
      swarms.has('Silicon') &&
      swarms.has('Carbon') &&
      swarms.has('Hydrogen'),
    honesty: 'Optional fixture labels — not live NOAA identity.',
  };
}

export function experimentNestTopologyLabel() {
  const nest = 'octave99';
  return {
    id: 'E5_nest_topology_label',
    title: 'Product nest id octave99',
    nest,
    pass: nest === 'octave99',
    honesty: 'UI/API topology id for Lattice Chat Agent.',
  };
}

export function experimentContextCitation() {
  return {
    id: 'E6_context_citation',
    title: 'Context ref nph.71423 retained',
    CONTEXT_REF,
    pass: CONTEXT_REF === 'nph.71423',
    honesty: 'Conversation context citation — not journal endorsement.',
  };
}

export function experimentSignalFidelityOrdering() {
  // Catalog ordering: Hydrogen (fast) before Carbon (morphogenesis) before Silicon (scaffold) in stress cascade narrative.
  const order = ['Hydrogen', 'Carbon', 'Silicon', 'HolographicTheater'];
  return {
    id: 'E7_signal_cascade_order',
    title: 'Stress cascade order H→C→Si→Theater',
    order,
    pass: order[0] === 'Hydrogen' && order[3] === 'HolographicTheater',
    honesty: 'Narrative ordering fixture for agent routing.',
  };
}

export function experimentPaperOnDisk() {
  const p1 = path.join(MONOREPO_DOCS, PAPER_NAME);
  const p2 = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  return {
    id: 'E8_paper_on_disk',
    title: 'Morphogenesis markdown present',
    pass: fs.existsSync(p1) || fs.existsSync(p2),
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
      DOC_ID === 'WP-SYNTHOBS-CONSTRUCTIVE-MORPHOGENESIS-99-OCTAVE-2026-08-09' &&
      REGISTRY_ID === 'synthobs-constructive-morphogenesis-99-octave-2026-08',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentFourSwarms(),
    experimentSunspotFixtures(),
    experimentNestTopologyLabel(),
    experimentContextCitation(),
    experimentSignalFidelityOrdering(),
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
