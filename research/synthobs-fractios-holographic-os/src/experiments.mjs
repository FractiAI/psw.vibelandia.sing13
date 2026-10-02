/**
 * FractiOS holographic OS overlay — catalog suite fixtures.
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
  PIPELINE_STAGES,
  IDENTITY_NE_EXPLORE,
  IS_NARRATIVE_TEMPLATE,
  IS_HOLOGRAPHIC_OS_OVERLAY,
  UCR_FLOOR,
  UCR_MIN_ELIGIBLE,
  STANDALONE_REPO,
  START_HERE_PATH,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);
const MONOREPO_START = path.resolve(
  PKG_ROOT,
  '..',
  '..',
  'interfaces',
  'fractios-start-here.html',
);

function experimentPhiEgs() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    expected,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    interpretation: 'Architectural golden key for OS nesting grammar.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentPipeline() {
  const expected = ['Explore', 'Organize', 'Contain', 'Reconcile', 'Verify', 'Commit'];
  const pass =
    PIPELINE_STAGES.length === expected.length &&
    PIPELINE_STAGES.every((s, i) => s === expected[i]);
  return {
    id: 'E2_pipeline_stages',
    title: 'Six-stage HH OS pipeline',
    PIPELINE_STAGES: [...PIPELINE_STAGES],
    pass,
    interpretation: 'FractiOS OS loop vocabulary lock.',
    honesty: 'Operational grammar — not a claim RSI is solved.',
  };
}

function experimentIdentityGate() {
  return {
    id: 'E3_identity_ne_explore',
    title: 'identity ≠ explore',
    IDENTITY_NE_EXPLORE,
    pass: IDENTITY_NE_EXPLORE === true,
    interpretation: 'Candidates do not become canonical until gates pass.',
    honesty: 'Catalog OS lock — fail-closed by design.',
  };
}

function experimentOsVsNarrative() {
  const pass = IS_HOLOGRAPHIC_OS_OVERLAY === true && IS_NARRATIVE_TEMPLATE === false;
  return {
    id: 'E4_os_not_narrative_template',
    title: 'OS overlay — not infinite narrative template',
    IS_HOLOGRAPHIC_OS_OVERLAY,
    IS_NARRATIVE_TEMPLATE,
    pass,
    interpretation: 'Prospectus remains Story; FractiOS is the operating overlay.',
    honesty: 'Role split is architectural, not a demotion of either surface.',
  };
}

function experimentUcrPopulationGate() {
  const pass = UCR_FLOOR === 0.1 && UCR_MIN_ELIGIBLE === 8;
  return {
    id: 'E5_ucr_population_gate',
    title: 'UCR population gate semantics',
    UCR_FLOOR,
    UCR_MIN_ELIGIBLE,
    pass,
    interpretation: 'Avoid over-refusing single honest candidates below eligibility.',
    honesty: 'Population gate — report-only below threshold.',
  };
}

function experimentPaperOnDisk() {
  const paperPath = path.join(MONOREPO_DOCS, PAPER_NAME);
  const pass = fs.existsSync(paperPath);
  return {
    id: 'E6_paper_on_disk',
    title: 'Catalog paper present',
    paperPath,
    DOC_ID,
    REGISTRY_ID,
    pass,
    interpretation: 'SING 13 docs filing for the OS overlay.',
    honesty: 'Presence check only.',
  };
}

function experimentStartHereSurface() {
  const pass = fs.existsSync(MONOREPO_START) && START_HERE_PATH === '/fractios/start-here';
  return {
    id: 'E7_start_here_surface',
    title: 'Start Here UI surface',
    START_HERE_PATH,
    path: MONOREPO_START,
    pass,
    interpretation: 'Guest/architect door into FractiOS on SING 13.',
    honesty: 'Static HTML presence — not a live FractiOS boot.',
  };
}

function experimentShipBlog() {
  const pass = fs.existsSync(MONOREPO_BLOG);
  return {
    id: 'E8_ship_blog',
    title: 'Ship-blog magazine note present',
    blog: MONOREPO_BLOG,
    pass,
    interpretation: 'QUESTFEST ship-blog required for engine companions.',
    honesty: 'Presence check — magazine CI owns voice/length.',
  };
}

function experimentStandalone() {
  const pass = STANDALONE_REPO === 'https://github.com/FractiAI/FractiOS';
  return {
    id: 'E9_standalone_fractios',
    title: 'Standalone OS repo pointer',
    STANDALONE_REPO,
    pass,
    interpretation: 'Live holographic OS lives at FractiAI/FractiOS.',
    honesty: 'Pointer lock — this suite does not re-host the kernel.',
  };
}

export function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentPipeline(),
    experimentIdentityGate(),
    experimentOsVsNarrative(),
    experimentUcrPopulationGate(),
    experimentPaperOnDisk(),
    experimentStartHereSurface(),
    experimentShipBlog(),
    experimentStandalone(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    all_pass: n_pass === experiments.length,
    n_pass,
    n_total: experiments.length,
    experiments,
  };
}
