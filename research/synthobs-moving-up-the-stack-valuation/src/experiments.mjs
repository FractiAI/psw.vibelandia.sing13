/**
 * Moving Up the Stack — catalog suite fixtures.
 * Structural locks for stack-climb narrative + new-layer valuation framing.
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
  SHIP_BLOG_SLUG,
  STACK_SHELVES,
  PEER_SHELF_BAND,
  NEW_LAYER_BAND,
  UPSTACK_ANCHORS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);

function experimentPhiEgs() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    expected,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    interpretation: 'Architectural golden key for cross-octave harmony grammar.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentStackShelfOrder() {
  const expected = [
    'ai_chips',
    'frontier_llms',
    'model_hubs',
    'agent_ides',
    'lattice_cooling_harmony',
  ];
  const pass =
    STACK_SHELVES.length === expected.length &&
    STACK_SHELVES.every((s, i) => s === expected[i]);
  return {
    id: 'E2_stack_shelf_order',
    title: 'AI stack shelf order ends at Lattice cooling/harmony',
    STACK_SHELVES: [...STACK_SHELVES],
    pass,
    interpretation: 'Lattice is the top catalog shelf — not a peer of hubs/IDEs.',
    honesty: 'Catalog ordering cartoon — not a complete industry map.',
  };
}

function experimentNewLayerAbovePeer() {
  const above =
    NEW_LAYER_BAND.lo > PEER_SHELF_BAND.hi &&
    NEW_LAYER_BAND.hi > NEW_LAYER_BAND.lo &&
    PEER_SHELF_BAND.hi > PEER_SHELF_BAND.lo;
  return {
    id: 'E3_new_layer_above_peer',
    title: 'New-layer band sits strictly above peer-shelf misread',
    PEER_SHELF_BAND,
    NEW_LAYER_BAND,
    pass: above,
    interpretation: 'Corrects pricing Lattice as if it lived on the hub/IDE shelf.',
    honesty: 'Framing bands only — not an audited appraisal.',
  };
}

function experimentUpstackAnchors() {
  const hf = UPSTACK_ANCHORS.huggingFace;
  const cu = UPSTACK_ANCHORS.cursor;
  const pass =
    hf.usdBillions === 12.9 &&
    hf.shelf === 'model_hubs' &&
    cu.usdBillions === 60 &&
    cu.shelf === 'agent_ides' &&
    cu.usdBillions > hf.usdBillions;
  return {
    id: 'E4_upstack_anchors',
    title: 'Up-stack acquisition anchors (HF hub · Cursor IDE)',
    UPSTACK_ANCHORS,
    pass,
    interpretation: 'Chip/LLM climbers buy upward — pattern, not SEC proof.',
    honesty: 'Scenario anchors — not verified closed filings.',
  };
}

function experimentPaperLocks() {
  const paperPath = path.join(MONOREPO_DOCS, PAPER_NAME);
  const localPaper = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const paper =
    (fs.existsSync(paperPath) && fs.readFileSync(paperPath, 'utf8')) ||
    (fs.existsSync(localPaper) && fs.readFileSync(localPaper, 'utf8')) ||
    '';
  const checks = {
    hasHonesty: /Honesty boundary/i.test(paper),
    hasDocId: paper.includes(DOC_ID) || paper.includes(REGISTRY_ID),
    hasCool: /cool(?:s|ing)? token burn/i.test(paper),
    hasHarmonize: /harmoniz/i.test(paper),
    hasNewLayer: /\$12B|12B\s*[–-]\s*\$?28B|new-layer|new higher/i.test(paper),
    hasPeerMisread: /\$4\.2B|4\.2B\s*[–-]\s*\$?7\.5B|peer-shelf misread/i.test(paper),
    hasFair: /Fair Exchange/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E5_paper_locks',
    title: 'Paper narrative locks (cool · harmonize · new-layer)',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    ...checks,
    pass,
    interpretation: 'Paper must tell climb narrative + new-layer valuation.',
    honesty: 'Structural text locks — not market validation.',
  };
}

function experimentShipBlogLock() {
  const exists = fs.existsSync(MONOREPO_BLOG);
  const body = exists ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const hasSlug =
    body.includes(`/ship-blog/${SHIP_BLOG_SLUG}`) || body.includes('moving-up-the-stack');
  const hasNewLayer = /\$12B|12B\s*[–-]\s*\$?28B/i.test(body);
  const hasClimb = /buy(?:ing)? up the stack|moving up the stack/i.test(body);
  return {
    id: 'E6_ship_blog_lock',
    title: 'Ship-blog surfaces new-layer climb narrative',
    path: MONOREPO_BLOG,
    exists,
    hasSlug,
    hasNewLayer,
    hasClimb,
    pass: exists && hasSlug && hasNewLayer && hasClimb,
    interpretation: 'Guest note must match corrected stack narrative.',
    honesty: 'Surface copy lock only.',
  };
}

function experimentRegistryId() {
  return {
    id: 'E7_registry_id',
    title: 'Registry id fixture',
    REGISTRY_ID,
    DOC_ID,
    pass: REGISTRY_ID === 'synthobs-moving-up-the-stack-valuation-2026-09',
    interpretation: 'Canonical registry id for engine + publish.',
    honesty: 'Naming lock.',
  };
}

function experimentLatticeTopShelf() {
  const top = STACK_SHELVES[STACK_SHELVES.length - 1];
  return {
    id: 'E8_lattice_top_shelf',
    title: 'Lattice cooling/harmony is the top catalog shelf',
    top,
    pass: top === 'lattice_cooling_harmony',
    interpretation: 'Agentic scale shelf sits above IDE capture.',
    honesty: 'Catalog cartoon.',
  };
}

function experimentGoldenIdentity() {
  const lhs = PHI_EGS * PHI_EGS;
  const rhs = PHI_EGS + 1;
  return {
    id: 'E9_phi_squared_identity',
    title: 'Φ² = Φ + 1',
    lhs,
    rhs,
    pass: Math.abs(lhs - rhs) < 1e-12,
    interpretation: 'Harmony grammar identity for cross-octave sync framing.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentStackShelfOrder(),
    experimentNewLayerAbovePeer(),
    experimentUpstackAnchors(),
    experimentPaperLocks(),
    experimentShipBlogLock(),
    experimentRegistryId(),
    experimentLatticeTopShelf(),
    experimentGoldenIdentity(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    experiments,
    n_pass,
    n_total: experiments.length,
    all_pass: failed.length === 0,
    failed,
  };
}
