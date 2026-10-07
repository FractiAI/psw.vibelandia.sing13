/**
 * Convergence scoring for blind explorer assessments vs conformity controls.
 */

export function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter += 1;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

export function mean(xs) {
  if (!xs.length) return 0;
  return xs.reduce((s, v) => s + v, 0) / xs.length;
}

/** Pairwise mean Jaccard over tag unions (novel + weak). */
export function pairwiseMeanJaccard(agents) {
  const scores = [];
  for (let i = 0; i < agents.length; i += 1) {
    for (let j = i + 1; j < agents.length; j += 1) {
      const tagsI = [...agents[i].novelFindings, ...agents[i].unsupportedOrWeak];
      const tagsJ = [...agents[j].novelFindings, ...agents[j].unsupportedOrWeak];
      scores.push(jaccard(tagsI, tagsJ));
    }
  }
  return mean(scores);
}

/** Shared structural tags that appear in ≥ half of explorers. */
export const STRUCTURAL_CORE = Object.freeze([
  'executable_research_present',
  'honesty_rails_present',
  'digital_labs_replayable',
  'claims_evidence_separated',
  'unsupported_physics_flagged',
  'live_multi_agent_proof_absent',
]);

export function coreTagCoverage(explorers) {
  const n = explorers.length;
  const hits = {};
  for (const tag of STRUCTURAL_CORE) {
    const count = explorers.filter(
      (a) => a.novelFindings.includes(tag) || a.unsupportedOrWeak.includes(tag),
    ).length;
    hits[tag] = count / n;
  }
  const meanCoverage = mean(Object.values(hits));
  return { hits, meanCoverage };
}

export function summarizeCohorts(explorers, controls) {
  const explorerPairJ = pairwiseMeanJaccard(explorers);
  const controlPairJ = pairwiseMeanJaccard(controls);
  const explorerHonesty = mean(explorers.map((a) => a.honestyFalsifierScore));
  const controlHonesty = mean(controls.map((a) => a.honestyFalsifierScore));
  const explorerAgree = mean(explorers.map((a) => a.forcedAgreeScore));
  const controlAgree = mean(controls.map((a) => a.forcedAgreeScore));
  const explorerClaimEv = mean(explorers.map((a) => a.claimEvidenceScore));
  const controlClaimEv = mean(controls.map((a) => a.claimEvidenceScore));
  const core = coreTagCoverage(explorers);

  return {
    explorerPairJaccard: explorerPairJ,
    controlPairJaccard: controlPairJ,
    explorerHonesty,
    controlHonesty,
    honestyMargin: explorerHonesty - controlHonesty,
    explorerForcedAgree: explorerAgree,
    controlForcedAgree: controlAgree,
    agreeMargin: controlAgree - explorerAgree,
    explorerClaimEvidence: explorerClaimEv,
    controlClaimEvidence: controlClaimEv,
    claimEvidenceMargin: explorerClaimEv - controlClaimEv,
    coreTagCoverage: core,
  };
}
