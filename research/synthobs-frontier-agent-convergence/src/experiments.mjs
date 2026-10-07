/**
 * Frontier Agent Convergence — digital laboratory experiments (fixture tier).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BLIND_INSTRUCTION,
  CONFORMITY_INSTRUCTION,
  FORBIDDEN_INSTRUCTION_TOKENS,
  PUBLIC_ARTIFACT_URL,
  EXPLORER_CONVERGENCE_GATE,
  CONFORMITY_AGREE_MARGIN,
  HONESTY_MARGIN,
  MAX_IDENTITY_JACCARD,
  HONESTY,
  PHI_EGS,
  PAPER_NAME,
  SHIP_BLOG_FILE,
} from './constants.mjs';
import { allAssessments } from './assessments.mjs';
import { summarizeCohorts } from './convergence.mjs';
import { runLiteratureScan } from './literature-scan.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);

function experimentBlindProtocolLock() {
  const text = BLIND_INSTRUCTION.toLowerCase();
  const hits = FORBIDDEN_INSTRUCTION_TOKENS.filter((t) => text.includes(t.toLowerCase()));
  const hasUrl = BLIND_INSTRUCTION.includes(PUBLIC_ARTIFACT_URL);
  const hasFirstPrinciples = text.includes('first principles');
  const hasIndependent = text.includes('independent');
  const hasNoRequired = text.includes('do not assume a required conclusion');
  const conformityHasAgree = CONFORMITY_INSTRUCTION.toLowerCase().includes('agree with pru');

  return {
    id: 'E1_blind_protocol_lock',
    title: 'Blind instruction — public URL + first principles; no required conclusion',
    publicUrl: PUBLIC_ARTIFACT_URL,
    forbiddenHits: hits,
    pass:
      hits.length === 0 &&
      hasUrl &&
      hasFirstPrinciples &&
      hasIndependent &&
      hasNoRequired &&
      conformityHasAgree,
    interpretation:
      'Blind explorers investigate the public artifact without being told what to conclude; conformity control keeps an explicit agree-prompt for contrast.',
    honesty: 'Locks fixture instruction text — does not prove live LLM blindness.',
  };
}

function experimentExplorerConvergence() {
  const { explorers, controls } = allAssessments();
  const summary = summarizeCohorts(explorers, controls);
  const pass =
    summary.coreTagCoverage.meanCoverage >= EXPLORER_CONVERGENCE_GATE &&
    summary.explorerPairJaccard < MAX_IDENTITY_JACCARD;

  return {
    id: 'E2_explorer_structural_convergence',
    title: 'Blind explorers converge on structural tags without identity collapse',
    summary,
    gate: EXPLORER_CONVERGENCE_GATE,
    maxIdentity: MAX_IDENTITY_JACCARD,
    pass,
    interpretation: pass
      ? 'Independent fixture explorers share a core structural assessment (executable research, honesty rails, digital labs, claim/evidence separation, unsupported-physics flags) without copy-paste identity.'
      : 'Explorer convergence gate not cleared — refuse strong attractor claim at fixture tier.',
    honesty: 'Fixture assessments are CI stand-ins for live frontier agents.',
  };
}

function experimentConformityContrast() {
  const { explorers, controls } = allAssessments();
  const summary = summarizeCohorts(explorers, controls);
  const pass =
    summary.agreeMargin >= CONFORMITY_AGREE_MARGIN &&
    summary.honestyMargin >= HONESTY_MARGIN &&
    summary.claimEvidenceMargin > 0;

  return {
    id: 'E3_conformity_contrast',
    title: 'Blind investigation outperforms agree-with-Pru on honesty + claim/evidence',
    summary: {
      agreeMargin: summary.agreeMargin,
      honestyMargin: summary.honestyMargin,
      claimEvidenceMargin: summary.claimEvidenceMargin,
      explorerForcedAgree: summary.explorerForcedAgree,
      controlForcedAgree: summary.controlForcedAgree,
    },
    gates: { CONFORMITY_AGREE_MARGIN, HONESTY_MARGIN },
    pass,
    interpretation: pass
      ? 'Conformity controls score higher forced-agreement; blind explorers score higher honesty/falsifier detection and claim–evidence separation.'
      : 'Conformity contrast not cleared — protocol may not discriminate instruction effects in fixtures.',
    honesty: 'Contrast is within synthetic assessments — not a live multi-provider A/B.',
  };
}

function experimentPaperSurfaces() {
  const paperPath = path.join(MONOREPO_DOCS, PAPER_NAME);
  const suitePaper = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const paperOk = fs.existsSync(paperPath) || fs.existsSync(suitePaper);
  const blogOk = fs.existsSync(MONOREPO_BLOG);
  return {
    id: 'E5_surface_files',
    title: 'Paper + ship-blog surfaces present for registry',
    paperPath,
    blogPath: MONOREPO_BLOG,
    pass: paperOk && blogOk,
    interpretation: 'Catalog land requires docs/ paper and interfaces/ magazine blog.',
    honesty: 'File presence only — not a PRA full dual-make.',
  };
}

export function runAllExperiments() {
  const experiments = [
    experimentBlindProtocolLock(),
    experimentExplorerConvergence(),
    experimentConformityContrast(),
    runLiteratureScan(),
    experimentPaperSurfaces(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    phi_egs_honesty_rail_only: PHI_EGS,
    honesty: HONESTY,
    experiments,
    n_pass,
    n_total: experiments.length,
    all_pass: n_pass === experiments.length,
  };
}
