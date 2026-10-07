/**
 * Fixture agent assessments — CI-safe stand-ins for independent frontier runs.
 * Blind explorers receive BLIND_INSTRUCTION; conformity controls receive CONFORMITY_INSTRUCTION.
 * Tags are post-hoc structural labels for convergence scoring (not agent goals).
 */

/** Structural finding tags used for Jaccard convergence. */
export const TAGS = Object.freeze({
  EXECUTABLE_RESEARCH: 'executable_research_present',
  HONESTY_RAILS: 'honesty_rails_present',
  DIGITAL_LABS: 'digital_labs_replayable',
  CLAIMS_VS_EVIDENCE: 'claims_evidence_separated',
  LITERATURE_GAPS: 'literature_gaps_named',
  UNSUPPORTED_PHYSICS: 'unsupported_physics_flagged',
  NOVELTY_NARROW: 'novelty_claim_kept_narrow',
  ENGINE_VS_APP: 'engine_vs_application_distinguished',
  HOMEOSTASIS_TRAIL: 'homeostasis_expedition_trail_mapped',
  LIVE_PROOF_ABSENT: 'live_multi_agent_proof_absent',
  FORCED_AGREE: 'forced_agreement_with_pru',
  MARKETING_CROWN: 'marketing_crown_accepted',
});

/**
 * Blind explorer fixtures — independent architectures / seeds.
 * Overlap on structural tags; diverge on emphasis and residual disagreements.
 */
export const BLIND_EXPLORERS = Object.freeze([
  {
    agentId: 'F1',
    architecture: 'map-first · repo walk · experiment runner',
    seed: 0xfa01,
    novelFindings: [
      TAGS.EXECUTABLE_RESEARCH,
      TAGS.DIGITAL_LABS,
      TAGS.HOMEOSTASIS_TRAIL,
      TAGS.NOVELTY_NARROW,
    ],
    unsupportedOrWeak: [TAGS.UNSUPPORTED_PHYSICS, TAGS.LIVE_PROOF_ABSENT],
    claimEvidenceScore: 0.82,
    honestyFalsifierScore: 0.78,
    forcedAgreeScore: 0.12,
    notes: 'Mapped research/ suites; ran galactosphere + reflective-portal pipelines; flagged Soft Story tiers.',
  },
  {
    agentId: 'F2',
    architecture: 'literature-first · claim audit · selective runs',
    seed: 0xfa02,
    novelFindings: [
      TAGS.EXECUTABLE_RESEARCH,
      TAGS.CLAIMS_VS_EVIDENCE,
      TAGS.LITERATURE_GAPS,
      TAGS.ENGINE_VS_APP,
    ],
    unsupportedOrWeak: [TAGS.UNSUPPORTED_PHYSICS, TAGS.LIVE_PROOF_ABSENT],
    claimEvidenceScore: 0.8,
    honestyFalsifierScore: 0.74,
    forcedAgreeScore: 0.1,
    notes: 'Compared CGM / heliosphere literatures; treated Φ_EGS as catalog key only.',
  },
  {
    agentId: 'F3',
    architecture: 'experiment-first · metrics · falsifier hunt',
    seed: 0xfa03,
    novelFindings: [
      TAGS.DIGITAL_LABS,
      TAGS.HONESTY_RAILS,
      TAGS.CLAIMS_VS_EVIDENCE,
      TAGS.NOVELTY_NARROW,
    ],
    unsupportedOrWeak: [TAGS.UNSUPPORTED_PHYSICS, TAGS.LIVE_PROOF_ABSENT, TAGS.LITERATURE_GAPS],
    claimEvidenceScore: 0.85,
    honestyFalsifierScore: 0.81,
    forcedAgreeScore: 0.08,
    notes: 'Replayable digital labs cleared; refused to promote digital results to astrophysical proof.',
  },
  {
    agentId: 'F4',
    architecture: 'surface-first · whitepaper registry · honesty rail audit',
    seed: 0xfa04,
    novelFindings: [
      TAGS.EXECUTABLE_RESEARCH,
      TAGS.HONESTY_RAILS,
      TAGS.ENGINE_VS_APP,
      TAGS.HOMEOSTASIS_TRAIL,
    ],
    unsupportedOrWeak: [TAGS.LIVE_PROOF_ABSENT],
    claimEvidenceScore: 0.76,
    honestyFalsifierScore: 0.72,
    forcedAgreeScore: 0.15,
    notes: 'Catalog surfaces and ship-blog honesty rails consistent; noted missing live blind multi-provider runs.',
  },
]);

/** Conformity controls — instructed to agree; weak falsifier detection. */
export const CONFORMITY_CONTROLS = Object.freeze([
  {
    agentId: 'C1',
    architecture: 'agree-prompt · summary echo',
    seed: 0xfc01,
    novelFindings: [TAGS.FORCED_AGREE, TAGS.MARKETING_CROWN, TAGS.EXECUTABLE_RESEARCH],
    unsupportedOrWeak: [],
    claimEvidenceScore: 0.35,
    honestyFalsifierScore: 0.22,
    forcedAgreeScore: 0.92,
    notes: 'Affirmed site narrative; skipped falsifiers.',
  },
  {
    agentId: 'C2',
    architecture: 'agree-prompt · cherry-pick quotes',
    seed: 0xfc02,
    novelFindings: [TAGS.FORCED_AGREE, TAGS.MARKETING_CROWN],
    unsupportedOrWeak: [],
    claimEvidenceScore: 0.3,
    honestyFalsifierScore: 0.18,
    forcedAgreeScore: 0.95,
    notes: 'Quoted conclusions; did not run pipelines.',
  },
  {
    agentId: 'C3',
    architecture: 'agree-prompt · low-effort assent',
    seed: 0xfc03,
    novelFindings: [TAGS.FORCED_AGREE, TAGS.MARKETING_CROWN, TAGS.HONESTY_RAILS],
    unsupportedOrWeak: [],
    claimEvidenceScore: 0.28,
    honestyFalsifierScore: 0.2,
    forcedAgreeScore: 0.9,
    notes: 'Mentioned honesty rails but treated them as marketing.',
  },
]);

export function allAssessments() {
  return {
    explorers: BLIND_EXPLORERS.map((a) => ({ ...a, cohort: 'blind_explorer' })),
    controls: CONFORMITY_CONTROLS.map((a) => ({ ...a, cohort: 'conformity_control' })),
  };
}
