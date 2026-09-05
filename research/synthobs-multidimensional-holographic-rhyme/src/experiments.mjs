/**
 * Multi-Dimensional Holographic Rhyme — catalog suite.
 * Replayable algebraic / filing locks — not AdS/CFT falsification or fab crystals.
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
  DEMO_PAYLOAD,
  MAX_OCTAVE_DEPTH,
  SOLAR_CHARACTERS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);

function synthesizeStack(payload, depth = MAX_OCTAVE_DEPTH) {
  const stack = {};
  for (let octaveOffset = -depth; octaveOffset <= depth; octaveOffset++) {
    const layerId =
      octaveOffset === 0 ? 'Octave_Tier_Base' : `Octave_Tier_${octaveOffset >= 0 ? '+' : ''}${octaveOffset}`;
    const layerData = payload.map((val, i) => {
      const scaling = PHI_EGS ** octaveOffset / Math.log(Math.abs(octaveOffset) + 2.5);
      return Number((val * scaling * Math.cos((2 * Math.PI * i) / PHI_EGS)).toFixed(6));
    });
    stack[layerId] = { offset_yD: octaveOffset, encoded_matrix: layerData };
  }
  return stack;
}

function experimentPhiEgs() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    expected,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    interpretation: 'Architectural golden key for xD±yD holographic recursion.',
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
    interpretation: 'Golden-key identity closing multi-D scale ladders.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

function experimentCrossScaleStack() {
  const stack = synthesizeStack([...DEMO_PAYLOAD], MAX_OCTAVE_DEPTH);
  const keys = Object.keys(stack);
  const expectedLayers = MAX_OCTAVE_DEPTH * 2 + 1;
  const pass =
    keys.length === expectedLayers &&
    stack.Octave_Tier_Base?.offset_yD === 0 &&
    Object.values(stack).every(
      (layer) =>
        Array.isArray(layer.encoded_matrix) &&
        layer.encoded_matrix.length === DEMO_PAYLOAD.length &&
        layer.encoded_matrix.every((v) => Number.isFinite(v)),
    );
  return {
    id: 'E3_cross_scale_stack',
    title: 'Cross-scale stack synthesizes finite layers across ±yD',
    nLayers: keys.length,
    pass,
    interpretation: 'xD±yD summation engine produces finite encode matrices.',
    honesty: 'Catalog encode fixture — not holographic crystal hardware.',
  };
}

function experimentBidirectionalOffsets() {
  const stack = synthesizeStack([...DEMO_PAYLOAD], MAX_OCTAVE_DEPTH);
  const offsets = Object.values(stack).map((l) => l.offset_yD).sort((a, b) => a - b);
  const pass =
    offsets[0] === -MAX_OCTAVE_DEPTH &&
    offsets[offsets.length - 1] === MAX_OCTAVE_DEPTH &&
    offsets.includes(0);
  return {
    id: 'E4_bidirectional_offsets',
    title: 'Offsets span −yD … 0 … +yD (bidirectional encoding)',
    offsets,
    pass,
    interpretation: 'Above-and-below encoding as catalog filing.',
    honesty: 'Index span lock — not measured non-local sensors.',
  };
}

function experimentProjectionInvariant() {
  // Partial sum of Φ^{±k}/ln(Φ) converges in fixture
  const N = 12;
  let acc = 0;
  for (let k = 1; k <= N; k++) {
    acc += PHI_EGS ** k / Math.log(PHI_EGS) + PHI_EGS ** -k / Math.log(PHI_EGS);
  }
  return {
    id: 'E5_projection_invariant',
    title: 'Cross-scale projection partial sum is finite and positive',
    N,
    acc,
    pass: Number.isFinite(acc) && acc > 0,
    interpretation: 'Π-style invariant sketch converges in algebraic fixture.',
    honesty: 'Truncated series — not AdS/CFT QED.',
  };
}

function experimentNoiseRatioFraming() {
  // Catalog N proxy: product 1/(p Φ^y) over odd primes sample → small
  const primes = [3, 5, 7, 11];
  let prod = 1;
  for (const p of primes) {
    for (let y = 1; y <= 3; y++) {
      prod *= 1 / (p * PHI_EGS ** y);
    }
  }
  return {
    id: 'E6_noise_ratio_framing',
    title: 'Noise-ratio proxy shrinks under prime × Φ product (catalog)',
    prod,
    pass: prod > 0 && prod < 1e-6,
    interpretation: '𝒩→0 framing via prime-indexed orthogonality talk.',
    honesty: 'Toy product — not measured crosstalk floors.',
  };
}

function experimentSolarCharacters() {
  const h = SOLAR_CHARACTERS.heliosPrime;
  const b = SOLAR_CHARACTERS.borealis;
  const pass =
    h.ar === 'AR3664' &&
    h.alias === 'Helios-Prime' &&
    b.ar === 'AR3590' &&
    b.alias === 'Borealis';
  return {
    id: 'E7_solar_characters',
    title: 'AR3664 Helios-Prime · AR3590 Borealis catalog lock',
    SOLAR_CHARACTERS,
    pass,
    interpretation: 'Macro/micro yD filing labels for Φ-recursive narrative.',
    honesty: 'Not astronomy proof of holography.',
  };
}

function experimentPaperAndBlogLocks() {
  const paperPath = path.join(MONOREPO_DOCS, PAPER_NAME);
  const localPaper = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const paper =
    (fs.existsSync(paperPath) && fs.readFileSync(paperPath, 'utf8')) ||
    (fs.existsSync(localPaper) && fs.readFileSync(localPaper, 'utf8')) ||
    '';
  const blog = fs.existsSync(MONOREPO_BLOG) ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const checks = {
    hasHonesty: /Honesty boundary/i.test(paper),
    hasDocId: paper.includes(DOC_ID) || paper.includes(REGISTRY_ID),
    hasFair: /Fair Exchange/i.test(paper),
    hasPhi: /Φ|PHI_EGS|1\.618|EGS Fractal/i.test(paper),
    hasXdYd: /xD|yD|cross-scale/i.test(paper),
    hasAdsContrast: /AdS|CFT|boundary/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    blogExists: Boolean(blog),
    blogSlug:
      blog.includes(SHIP_BLOG_SLUG) || blog.includes('multidimensional-holographic-rhyme'),
    blogHonesty: /Honesty/i.test(blog),
  };
  return {
    id: 'E8_paper_blog_locks',
    title: 'Paper + ship-blog honesty / Fair Exchange / xD±yD locks',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    blogPath: MONOREPO_BLOG,
    ...checks,
    pass: Boolean(paper) && Object.values(checks).every(Boolean),
    interpretation: 'Surfaces must carry catalog framing + xD±yD, not QG overclaim.',
    honesty: 'Structural text locks — not physics validation.',
  };
}

function experimentRegistryId() {
  return {
    id: 'E9_registry_id',
    title: 'Registry id + engine shelf fixture',
    REGISTRY_ID,
    DOC_ID,
    pass: REGISTRY_ID === 'synthobs-multidimensional-holographic-rhyme-2026-09',
    interpretation: 'Canonical registry id for Infinite Octaves engine pin #19.',
    honesty: 'Naming lock.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentGoldenIdentity(),
    experimentCrossScaleStack(),
    experimentBidirectionalOffsets(),
    experimentProjectionInvariant(),
    experimentNoiseRatioFraming(),
    experimentSolarCharacters(),
    experimentPaperAndBlogLocks(),
    experimentRegistryId(),
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
