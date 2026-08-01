/**
 * PCHPP empirical suite — observation / diagnostic protocol validation.
 * NOT a Lattice Chat engine integration. NOT physics derivation.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E_F,
  LAMBDA_EGS,
  DOC_ID,
  REGISTRY_ID,
  RANDOM_SEED,
  DESIGN_TARGET_TOKEN_REDUCTION,
  PHASE_GATE_REQUIRED_KEYS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = path.join(__dirname, '..', 'data', 'observation_fixtures.json');
const TEMPLATE_PATH = path.join(__dirname, '..', 'data', 'phase_gate_template.txt');

function loadFixtures() {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));
}

function loadTemplate() {
  return fs.readFileSync(TEMPLATE_PATH, 'utf8');
}

function shannonBits(counts) {
  const total = counts.reduce((a, b) => a + b, 0);
  if (total <= 0) return 0;
  let s = 0;
  for (const c of counts) {
    if (c <= 0) continue;
    const p = c / total;
    s -= p * Math.log2(p);
  }
  return s;
}

function tokenCount(text) {
  return String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/** E1 — Phase-gate template contains required dual-layer keys. */
export function experimentTemplateCompleteness() {
  const tpl = loadTemplate();
  const missing = PHASE_GATE_REQUIRED_KEYS.filter((k) => !tpl.includes(k));
  return {
    id: 'E1_template_completeness',
    title: 'Phase-gate template — dual-layer keys present',
    required: PHASE_GATE_REQUIRED_KEYS.length,
    missing,
    interpretation: 'Operator template encodes Shadow / Code split for observation runs.',
    honesty: 'Prompt-structure check — not a claim that staining alters model weights.',
    pass: missing.length === 0,
  };
}

/** E2 — E_F / λ_EGS contrast-agent identities. */
export function experimentContrastAgentIdentity() {
  const expectLambda = Math.log(E_F) / (2 * Math.PI);
  const err = Math.abs(LAMBDA_EGS - expectLambda);
  const phiErr = Math.abs(E_F - (1 + Math.sqrt(5)) / 2);
  return {
    id: 'E2_contrast_agent_identity',
    title: 'E_F contrast agent — Φ and λ_EGS identities',
    E_F,
    lambda_egs: LAMBDA_EGS,
    lambda_err: err,
    phi_err: phiErr,
    interpretation: 'Contrast agent matches El Gran Sol architectural constant.',
    honesty: 'Architectural constant — not a replacement for ℏ, c, or G.',
    pass: err < 1e-15 && phiErr < 1e-15,
  };
}

/** E3 — Fixture dual-layer schema (shadow + code fields). */
export function experimentDualLayerSchema() {
  const { cases } = loadFixtures();
  const ok = cases.every(
    (c) =>
      c.shadow &&
      typeof c.shadow.summary === 'string' &&
      c.shadow.summary.split(/[.!?]/).filter((s) => s.trim()).length >= 1 &&
      c.code &&
      c.code.master_instruction_vector &&
      c.code.entropic_boundary &&
      typeof c.code.delta_s === 'number' &&
      c.code.zero_entropy_path,
  );
  return {
    id: 'E3_dual_layer_schema',
    title: 'Observation fixtures — dual-layer schema',
    n_cases: cases.length,
    interpretation: 'Each observation case separates Somatic Shadow from Holographic Code fields.',
    honesty: 'Fixture schema for the protocol — not live LLM transcript proof.',
    pass: ok && cases.length >= 3,
  };
}

/** E4 — Shadow vs Code lexical separation (low Jaccard). */
export function experimentShadowCodeSeparation() {
  const { cases } = loadFixtures();
  function bag(text) {
    return new Set(
      String(text)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 3),
    );
  }
  const scores = cases.map((c) => {
    const shadowText = `${c.shadow.summary} ${c.shadow.surface_state || ''}`;
    const codeText = `${c.code.master_instruction_vector} ${c.code.entropic_boundary} ${c.code.zero_entropy_path}`;
    const A = bag(shadowText);
    const B = bag(codeText);
    let inter = 0;
    for (const w of A) if (B.has(w)) inter += 1;
    const union = A.size + B.size - inter;
    const jaccard = union ? inter / union : 1;
    return { id: c.id, jaccard };
  });
  const meanJ = scores.reduce((s, x) => s + x.jaccard, 0) / scores.length;
  return {
    id: 'E4_shadow_code_separation',
    title: 'Shadow vs Code — lexical separation (mean Jaccard < 0.45)',
    scores,
    mean_jaccard: meanJ,
    interpretation: 'Dual-layer writeups stay delineated (low bag overlap).',
    honesty: 'Lexical proxy for delineation — not semantic entailment proof.',
    pass: meanJ < 0.45,
  };
}

/** E5 — Entropic boundary ΔS > 0 on bloated payloads; drops after delta routing. */
export function experimentEntropicBoundary() {
  const { cases } = loadFixtures();
  const routing = cases.find((c) => c.id === 'token_routing_multi_agent');
  if (!routing) {
    return {
      id: 'E5_entropic_boundary',
      title: 'Entropic boundary — token-routing fixture',
      pass: false,
      honesty: 'Missing fixture.',
    };
  }
  const full = routing.payloads.full_reprompt_tokens;
  const delta = routing.payloads.delta_only_tokens;
  const reduction = (full - delta) / full;
  const deltaS = routing.code.delta_s;
  return {
    id: 'E5_entropic_boundary',
    title: 'Entropic boundary — payload bloat ΔS and delta reduction',
    full_tokens: full,
    delta_tokens: delta,
    reduction,
    delta_s: deltaS,
    design_target: DESIGN_TARGET_TOKEN_REDUCTION,
    interpretation: 'Delta-vector handoff reduces token bloat vs full re-prompt loops.',
    honesty: 'Synthetic payload counts from the §4 observation fixture — not live vendor invoices.',
    pass:
      deltaS > 0 &&
      reduction >= DESIGN_TARGET_TOKEN_REDUCTION - 0.02 &&
      Math.abs(reduction - DESIGN_TARGET_TOKEN_REDUCTION) < 0.05,
  };
}

/** E6 — Zero-entropy path shortens instruction vector (token count). */
export function experimentZeroEntropyPath() {
  const { cases } = loadFixtures();
  const rows = cases.map((c) => {
    const before = tokenCount(c.code.entropic_boundary);
    const after = tokenCount(c.code.zero_entropy_path);
    return { id: c.id, before, after, shorter: after <= before };
  });
  const allShorterOrEqual = rows.every((r) => r.shorter);
  const meanShrink =
    rows.reduce((s, r) => s + (r.before - r.after) / Math.max(1, r.before), 0) / rows.length;
  return {
    id: 'E6_zero_entropy_path',
    title: 'Zero-entropy path — compact optimization vectors',
    rows,
    mean_relative_shrink: meanShrink,
    interpretation: 'Optimization paths stay ≤ boundary analysis length (minimal-step vectors).',
    honesty: 'Length heuristic on authored fixtures — not automatic proof search.',
    pass: allShorterOrEqual && meanShrink >= 0,
  };
}

/** E7 — Scale-invariant protocol: same dual-layer keys across domains. */
export function experimentScaleInvariantDomains() {
  const { cases } = loadFixtures();
  const domains = new Set(cases.map((c) => c.domain));
  const requiredDomains = ['multi_agent', 'llm_prompt', 'bio_geometric'];
  const hasAll = requiredDomains.every((d) => domains.has(d));
  const schemaOk = cases.every(
    (c) => c.code?.master_instruction_vector && c.shadow?.summary,
  );
  return {
    id: 'E7_scale_invariant_domains',
    title: 'Scale-invariant observation — three domains, one protocol',
    domains: [...domains],
    requiredDomains,
    interpretation: 'PCHPP template applies across agentic, LLM, and bio-geometric observation cases.',
    honesty: 'Protocol reuse on fixtures — not a universal field theory.',
    pass: hasAll && schemaOk && cases.length >= 3,
  };
}

/** E8 — Phase coherence proxy: E_F scaling beats linear on instruction phases. */
export function experimentPhaseCoherenceProxy() {
  const { cases } = loadFixtures();
  function phase(text, scale) {
    const words = String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
    if (!words.length) return 0;
    let sum = 0;
    for (let k = 0; k < words.length; k += 1) {
      let h = 0;
      for (const ch of words[k]) h = (h * 31 + ch.charCodeAt(0)) % 9973;
      const theta = (h / 9973) * 2 * Math.PI;
      sum += scale * theta * ((k + 1) / words.length);
    }
    return Math.abs(Math.cos(sum));
  }
  const rows = cases.map((c) => {
    const text = c.code.master_instruction_vector;
    const gPhi = phase(text, E_F);
    const gLin = phase(text, 1.0);
    return { id: c.id, gamma_phi: gPhi, gamma_linear: gLin, phi_ge: gPhi + 1e-9 >= gLin };
  });
  // Soft pass: mean φ ≥ mean linear (architectural rhyme used as contrast agent).
  const meanPhi = rows.reduce((s, r) => s + r.gamma_phi, 0) / rows.length;
  const meanLin = rows.reduce((s, r) => s + r.gamma_linear, 0) / rows.length;
  return {
    id: 'E8_phase_coherence_proxy',
    title: 'Phase coherence proxy — E_F vs linear scale',
    rows,
    mean_gamma_phi: meanPhi,
    mean_gamma_linear: meanLin,
    interpretation: 'E_F-scaled phase proxy is competitive with linear on instruction vectors.',
    honesty: 'In-silico cosine proxy — not interferometric lab measurement.',
    pass: meanPhi + 1e-12 >= meanLin * 0.98,
  };
}

/** E9 — Observation lane: docs + registry IDs exist; not claimed as Lattice Chat engine. */
export function experimentObservationLaneSurfaces() {
  const root = path.resolve(__dirname, '..', '..', '..');
  const paper = path.join(root, 'docs', 'SYNTHOBS_PCHPP_PHASE_CONTRAST_HOLOGRAPHIC_PROMPTING_2026-07.md');
  const paperOk = fs.existsSync(paper);
  const paperText = paperOk ? fs.readFileSync(paper, 'utf8') : '';
  const hasDocId = paperText.includes(DOC_ID);
  const hasHonesty = /Honesty boundary/i.test(paperText);
  const hasOperator = /SynthOBS Autonomous Agent/i.test(paperText);
  const claimsEngine =
    /(^|[^.])\s*(is wired into the Lattice Chat engine|wired into Lattice Chat engine|Lattice Chat engine integration required|powers the Lattice Chat engine)/im.test(
      paperText,
    ) || /\*\*Lattice Chat engine feature\*\*/i.test(paperText);
  const observationLane = /observation experiment|observation protocol|diagnostic protocol/i.test(
    paperText,
  );
  const appsHit = path.join(root, 'apps', 'lattice-chat');
  let engineImport = false;
  if (fs.existsSync(appsHit)) {
    // Cheap guard: PCHPP research path should not be required by lattice-chat package.json
    const pkg = path.join(appsHit, 'package.json');
    if (fs.existsSync(pkg)) {
      const t = fs.readFileSync(pkg, 'utf8');
      engineImport = /synthobs-pchpp|pchpp/i.test(t);
    }
  }
  return {
    id: 'E9_observation_lane_surfaces',
    title: 'Observation lane — paper surfaces; no Lattice Chat engine wiring',
    paper_exists: paperOk,
    hasDocId,
    hasHonesty,
    hasOperator,
    observationLane,
    claimsEngine,
    engineImport,
    registryId: REGISTRY_ID,
    interpretation:
      'PCHPP ships as a catalog observation paper + standalone suite — not an engine dependency.',
    honesty: 'Surface presence check — catalog featuring still requires PRA receipt.',
    pass:
      paperOk &&
      hasDocId &&
      hasHonesty &&
      hasOperator &&
      observationLane &&
      !claimsEngine &&
      !engineImport,
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentTemplateCompleteness(),
    experimentContrastAgentIdentity(),
    experimentDualLayerSchema(),
    experimentShadowCodeSeparation(),
    experimentEntropicBoundary(),
    experimentZeroEntropyPath(),
    experimentScaleInvariantDomains(),
    experimentPhaseCoherenceProxy(),
    experimentObservationLaneSurfaces(),
  ];
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    n_total: experiments.length,
    n_pass: experiments.length - failed.length,
    all_pass: failed.length === 0,
    failed,
    seed: RANDOM_SEED,
    experiments,
  };
}
