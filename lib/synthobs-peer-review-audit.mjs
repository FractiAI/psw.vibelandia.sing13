/**
 * NSPFRNP Snap · Peer-Review Audit Loop (NSPFRNP-SNAP-PRA-2026-06)
 * Dual-LLM recursive audit until peer-review submission quality or convergence cap.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { createHash } from 'node:crypto';
import { resolveWhitepaper, WHITEPAPER_REGISTRY } from './whitepaper-registry.mjs';
import { paperHasSynthobsAttribution } from './synthobs-agent-attribution.mjs';
import {
  resolveLlmLanes,
  invokeReviewerLane,
  invokeAuthorLane,
  buildMetaAuditTrail,
} from './synthobs-llm-lanes.mjs';

export const SNAP_ID = 'NSPFRNP-SNAP-PRA-2026-06';
export const AUDIT_DIR = 'data/synthobs-paper-audits';

const RUBRIC = {
  honestyBoundary: { weight: 0.15, label: 'Honesty boundary' },
  methodsRepro: { weight: 0.15, label: 'Methods / reproducibility' },
  claimsProportionate: { weight: 0.15, label: 'Claims proportionate to evidence' },
  structure: { weight: 0.12, label: 'Structure (IMRaD-like)' },
  references: { weight: 0.1, label: 'References / citations' },
  abstractTitle: { weight: 0.08, label: 'Title & abstract metadata' },
  synthobsAttribution: { weight: 0.1, label: 'SynthOBS agent attribution' },
  technicalPrecision: { weight: 0.15, label: 'Technical precision' },
};

function envNum(name, fallback) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) ? n : fallback;
}

export function auditConfig() {
  const lanes = resolveLlmLanes();
  return {
    snapId: SNAP_ID,
    operator: 'SynthOBS Autonomous Agent',
    sandbox: 'Syntheverse Sandbox',
    maxIterations: envNum('SYNTHOBS_AUDIT_MAX_ITERATIONS', 6),
    passThreshold: envNum('SYNTHOBS_AUDIT_PASS_THRESHOLD', 0.85),
    softPassThreshold: envNum('SYNTHOBS_AUDIT_SOFT_PASS_THRESHOLD', 0.8),
    plateauDelta: envNum('SYNTHOBS_AUDIT_PLATEAU_DELTA', 0.02),
    plateauRounds: envNum('SYNTHOBS_AUDIT_PLATEAU_ROUNDS', 2),
    lanes,
    llmEnabled: lanes.llmEnabled,
    dualMakeConfirmed: lanes.dualMakeConfirmed,
    authorLane: lanes.author,
    reviewerLane: lanes.reviewer,
  };
}

function hasSection(md, patterns) {
  const lower = md.toLowerCase();
  return patterns.some((p) => (typeof p === 'string' ? lower.includes(p) : p.test(md)));
}

function countReferences(md) {
  const refs = md.match(/^#{1,3}\s*references/mi);
  const links = (md.match(/\[[^\]]+\]\([^)]+\)/g) || []).length;
  const numbered = (md.match(/^\d+\.\s+\S/mg) || []).length;
  const citeLines = (md.match(/et al\.|\(\d{4}\)|doi\.org|https?:\/\//gi) || []).length;
  return { hasRefsSection: !!refs, links, numbered, citeLines };
}

function detectOverclaims(md) {
  const risky = [
    /\b(proven|validated|undeniable|absolute proof|instrument-grade)\b/gi,
    /\b(replaces gps|no collars required|breaks rsa)\b/gi,
  ];
  const qualifiers = /\b(narrative|sandbox|model|not claimed|honest|tier|correlation)/i;
  const hits = [];
  for (const re of risky) {
    const m = md.match(re);
    if (m) {
      const contextOk = qualifiers.test(md);
      if (!contextOk) hits.push(...m.slice(0, 3));
    }
  }
  return [...new Set(hits.map((h) => h.toLowerCase()))];
}

/** Deterministic structural rubric — always runs. */
export function evaluateStructuralRubric(md) {
  const refs = countReferences(md);
  const overclaims = detectOverclaims(md);
  const wordCount = md.split(/\s+/).filter(Boolean).length;

  const scores = {
    honestyBoundary: hasSection(md, ['honesty boundary', 'honesty tier', 'plain speak', 'what it does not'])
      ? 1
      : hasSection(md, ['correlation', 'causation', 'not claimed'])
        ? 0.55
        : 0.2,
    methodsRepro: hasSection(md, ['## methods', 'methodology', 'pipeline', 'reproduc', 'data source'])
      ? 1
      : hasSection(md, ['### ', 'repository', 'api/'])
        ? 0.6
        : 0.35,
    claimsProportionate: overclaims.length === 0 ? 1 : overclaims.length <= 2 ? 0.5 : 0.25,
    structure:
      hasSection(md, ['abstract', 'introduction', '## ']) && wordCount > 400 ? 0.95 : wordCount > 200 ? 0.65 : 0.4,
    references:
      refs.hasRefsSection && refs.citeLines >= 3
        ? 1
        : refs.citeLines >= 2 || refs.links >= 4
          ? 0.7
          : 0.35,
    abstractTitle:
      /document\s*(id|ref)|docid|doc\s*id/i.test(md) && /abstract|executive summary/i.test(md) ? 1 : 0.55,
    synthobsAttribution: paperHasSynthobsAttribution(md) ? 1 : 0.15,
    technicalPrecision: md.includes('```') || /\$\$|\\\(|\\Phi|φ/i.test(md) ? 0.85 : 0.7,
  };

  const criticalBlockers = [];
  if (scores.honestyBoundary < 0.5 && /empirical|study|finding|data/i.test(md)) {
    criticalBlockers.push('missing_honesty_boundary');
  }
  if (!/document\s*(id|ref)|\*\*doc/i.test(md) && !/docid/i.test(md)) {
    criticalBlockers.push('missing_document_id');
  }
  if (overclaims.length > 2) {
    criticalBlockers.push('unqualified_overclaims');
  }
  if (!paperHasSynthobsAttribution(md)) {
    criticalBlockers.push('missing_synthobs_attribution');
  }

  let overall = 0;
  for (const [key, meta] of Object.entries(RUBRIC)) {
    overall += (scores[key] ?? 0) * meta.weight;
  }

  const suggestions = [];
  if (scores.honestyBoundary < 0.8) suggestions.push('Add an explicit Honesty boundary section with tier table.');
  if (scores.synthobsAttribution < 0.8) {
    suggestions.push(
      'Add operator line: SynthOBS Autonomous Agent · Syntheverse Sandbox (NSPFRNP-SNAP-PRA-2026-06).'
    );
  }
  if (scores.references < 0.7) suggestions.push('Expand References with ≥3 citable sources or repo cross-links.');
  if (scores.methodsRepro < 0.7) suggestions.push('Document methods, data sources, and reproducibility commands.');
  if (criticalBlockers.includes('unqualified_overclaims')) {
    suggestions.push('Qualify strong claims with narrative/sandbox/model tier language.');
  }

  return {
    mode: 'structural',
    scores,
    overallScore: Math.round(overall * 1000) / 1000,
    criticalBlockers,
    suggestions,
    meta: { wordCount, overclaims, refs },
  };
}

function mergeRubric(structural, llmReview) {
  if (!llmReview?.scores) return structural;
  const scores = { ...structural.scores };
  for (const key of Object.keys(RUBRIC)) {
    const llm = Number(llmReview.scores[key]);
    if (Number.isFinite(llm)) scores[key] = Math.round((scores[key] * 0.45 + llm * 0.55) * 1000) / 1000;
  }
  let overall = 0;
  for (const [key, meta] of Object.entries(RUBRIC)) overall += (scores[key] ?? 0) * meta.weight;
  const criticalBlockers = [
    ...new Set([...(structural.criticalBlockers || []), ...(llmReview.criticalBlockers || [])]),
  ];
  return {
    ...structural,
    mode: 'structural+llm',
    scores,
    overallScore: Math.round(overall * 1000) / 1000,
    criticalBlockers,
    suggestions: [...new Set([...(structural.suggestions || []), ...(llmReview.suggestions || [])])],
    llmSummary: llmReview.summary || null,
  };
}

function convergenceStatus(iterations, history, cfg) {
  const last = history[history.length - 1];
  if (!last) return { status: 'pending', reason: null };
  if (last.criticalBlockers?.length) {
    /* continue unless capped */
  } else if (last.overallScore >= cfg.passThreshold) {
    return { status: 'pass', reason: 'threshold_met' };
  } else if (
    last.overallScore >= cfg.softPassThreshold &&
    iterations.length >= 3 &&
    !last.criticalBlockers?.length
  ) {
    return { status: 'soft_pass', reason: 'soft_threshold_after_min_rounds' };
  }
  if (iterations.length >= cfg.maxIterations) {
    return { status: 'capped', reason: 'max_iterations' };
  }
  if (history.length >= cfg.plateauRounds + 1) {
    const tail = history.slice(-(cfg.plateauRounds + 1));
    let plateau = true;
    for (let i = 1; i < tail.length; i++) {
      const delta = tail[i].overallScore - tail[i - 1].overallScore;
      if (delta >= cfg.plateauDelta) plateau = false;
    }
    if (plateau) return { status: 'plateau', reason: 'score_plateau' };
  }
  return { status: 'continue', reason: null };
}

async function writeAuditReceipt({
  root,
  paperId,
  sourcePath,
  startedAt,
  cfg,
  iterations,
  history,
  round,
  conv,
  metaAudit,
}) {
  const auditId = createHash('sha256')
    .update(`${paperId}:${sourcePath}:${startedAt}`)
    .digest('hex')
    .slice(0, 16);
  const receipt = {
    schema: 'synthobs-paper-audit/v1',
    snapId: SNAP_ID,
    auditId,
    paperId: paperId || basename(sourcePath || 'unknown', '.md'),
    sourcePath,
    operator: 'SynthOBS Autonomous Agent',
    sandbox: 'Syntheverse Sandbox',
    mode: metaAudit?.mode === 'structural_only' ? 'structural_only' : cfg.lanes?.mode || 'structural_only',
    metaAudit,
    startedAt,
    completedAt: new Date().toISOString(),
    iterations: iterations.length,
    overallScore: round.overallScore,
    passThreshold: cfg.passThreshold,
    convergence: conv,
    rubric: RUBRIC,
    history,
    final: round,
    honestyNote: cfg.dualMakeConfirmed
      ? 'Dual-make LLM loop: OpenAI author + Anthropic reviewer — see metaAudit.iterationLogs for per-call model versions.'
      : 'Structural rubric only — full dual-make requires SYNTHOBS_AUDIT_LLM_ENABLED=1, OPENAI_API_KEY, and ANTHROPIC_API_KEY.',
  };
  await mkdir(join(root, AUDIT_DIR), { recursive: true });
  const outPath = join(root, AUDIT_DIR, `${receipt.paperId}.json`);
  await writeFile(outPath, JSON.stringify(receipt, null, 2), 'utf8');
  return { ok: true, receipt, path: outPath };
}

function finalizeStructuralConvergence(round, cfg) {
  if (round.criticalBlockers?.length) {
    return { status: 'capped', reason: 'structural_blockers' };
  }
  if (round.overallScore >= cfg.passThreshold) {
    return { status: 'pass', reason: 'threshold_met' };
  }
  if (round.overallScore >= cfg.softPassThreshold) {
    return { status: 'soft_pass', reason: 'soft_structural' };
  }
  return { status: 'plateau', reason: 'structural_single_pass' };
}

export async function runPeerReviewAuditLoop({ paperText, paperId, sourcePath, cwd } = {}) {
  const root = cwd || process.cwd();
  const cfg = auditConfig();
  const startedAt = new Date().toISOString();
  const history = [];
  const iterations = [];
  let workingText = String(paperText || '');

  const maxIter = cfg.llmEnabled ? cfg.maxIterations : 1;
  const iterationLogs = [];

  for (let i = 1; i <= maxIter; i++) {
    const structural = evaluateStructuralRubric(workingText);
    let round = structural;
    const iterLog = { iteration: i, structural: { engine: 'structural-rubric/v1', invokedAt: new Date().toISOString() } };

    if (cfg.llmEnabled) {
      try {
        const llmReview = await invokeReviewerLane({
          paperText: workingText,
          iteration: i,
          prior: history[history.length - 1],
          lane: cfg.reviewerLane,
        });
        iterLog.reviewer = llmReview._metaAudit;
        const { _metaAudit: _r, ...reviewPayload } = llmReview;
        round = mergeRubric(structural, reviewPayload);
        round.llmReviewer = reviewPayload;
        if (round.criticalBlockers.length || round.overallScore < cfg.passThreshold) {
          const revision = await invokeAuthorLane({
            paperText: workingText,
            review: reviewPayload,
            lane: cfg.authorLane,
          });
          iterLog.author = revision._metaAudit;
          const { _metaAudit: _a, ...revPayload } = revision;
          round.authorRevision = revPayload;
        }
      } catch (e) {
        round.llmError = e.message;
        iterLog.error = e.message;
      }
    }
    iterationLogs.push(iterLog);

    history.push({
      iteration: i,
      overallScore: round.overallScore,
      criticalBlockers: round.criticalBlockers,
      scores: round.scores,
    });
    iterations.push(round);

    let conv = convergenceStatus(iterations, history, cfg);
    if (conv.status === 'continue' && !cfg.llmEnabled) {
      conv = finalizeStructuralConvergence(round, cfg);
    }
    if (conv.status !== 'continue') {
      const metaAudit = buildMetaAuditTrail({
        lanes: cfg.lanes,
        mode: cfg.lanes.mode,
        iterationLogs,
        structuralOnly: !cfg.llmEnabled,
      });
      return writeAuditReceipt({
        root,
        paperId,
        sourcePath,
        startedAt,
        cfg,
        iterations,
        history,
        round,
        conv,
        metaAudit,
      });
    }
  }

  if (iterations.length) {
    const round = iterations[iterations.length - 1];
    const conv = convergenceStatus(iterations, history, cfg);
    if (conv.status === 'continue') {
      const metaAudit = buildMetaAuditTrail({
        lanes: cfg.lanes,
        mode: cfg.lanes.mode,
        iterationLogs,
        structuralOnly: !cfg.llmEnabled,
      });
      return writeAuditReceipt({
        root,
        paperId,
        sourcePath,
        startedAt,
        cfg,
        iterations,
        history,
        round,
        conv: { status: 'capped', reason: 'max_iterations' },
        metaAudit,
      });
    }
  }

  return { ok: false, code: 'loop_exhausted', history };
}

export async function loadAuditReceipt(paperId, { cwd } = {}) {
  const root = cwd || process.cwd();
  try {
    const raw = await readFile(join(root, AUDIT_DIR, `${paperId}.json`), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function auditWhitepaperById(id, opts = {}) {
  const entry = resolveWhitepaper(id);
  if (!entry?.file) return { ok: false, code: 'not_found', message: `Unknown whitepaper id: ${id}` };
  const root = opts.cwd || process.cwd();
  const abs = join(root, entry.file);
  let md;
  try {
    md = await readFile(abs, 'utf8');
  } catch (e) {
    return { ok: false, id, code: 'read_error', message: e.message, file: entry.file };
  }
  const out = await runPeerReviewAuditLoop({
    paperText: md,
    paperId: id,
    sourcePath: entry.file,
    cwd: root,
  });
  return { ...out, id, title: entry.title };
}

export async function auditAllRegisteredPapers(opts = {}) {
  const ids = Object.entries(WHITEPAPER_REGISTRY)
    .filter(([, v]) => v.file)
    .map(([id]) => id);
  const results = [];
  for (const id of ids) {
    const r = await auditWhitepaperById(id, opts);
    results.push({ id, ...r });
  }
  return { ok: true, count: results.length, results };
}
