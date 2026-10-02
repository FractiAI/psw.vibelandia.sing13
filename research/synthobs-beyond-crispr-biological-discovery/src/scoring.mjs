/**
 * Independent discovery scoring + research-queue triage.
 * Does NOT declare a winner. researchInterest is a sort key only.
 */

import { SCORE_AXES, QUEUE_HONESTY } from './constants.mjs';
import { CANDIDATES } from './candidates.mjs';

/**
 * researchInterest favors under-explained, high information-flow, tractable novelty.
 * Explicitly down-weights candidates that already have adequate published explanations
 * (anti-confirmation: do not reward CRISPR resemblance alone).
 */
export function researchInterest(candidate) {
  const s = candidate.scores;
  const ab = candidate.antiBias;
  const noveltyLift = s.novelty;
  const flow = s.informationFlow;
  const tract = s.experimentalTractability;
  const underExplained = 1 - ab.publishedExplanationAdequacy;
  const notJustCrisprLookalike = candidate.id === 'C1' ? 0.35 : 1;
  const confoundPenalty =
    0.25 * ab.randomCoOccurrenceRisk +
    0.2 * ab.phylogeneticArtifactRisk +
    0.2 * ab.annotationErrorRisk +
    0.15 * ab.hgtConfoundRisk;
  const raw =
    noveltyLift * 0.28 +
    flow * 0.22 +
    underExplained * 0.25 +
    tract * 0.15 +
    s.multiScale * 0.1;
  return Math.max(0, (raw - confoundPenalty) * notJustCrisprLookalike);
}

export function scorecardComplete(candidate) {
  return SCORE_AXES.every(
    (axis) => typeof candidate.scores?.[axis] === 'number' && candidate.scores[axis] >= 0 && candidate.scores[axis] <= 1,
  );
}

/**
 * Attempt falsification first: survivors must clear anti-bias floors.
 * A candidate is "interesting" only after surviving controls — not before.
 */
export function survivesAntiBias(candidate) {
  const ab = candidate.antiBias;
  const floors = {
    // If known mechanism already explains ≥0.85 AND novelty < 0.4 → still allowed in queue
    // but marked as baseline, not discovery lead.
    maxRandomCoOccurrence: 0.5,
    maxPhyloArtifact: 0.5,
    maxAnnotationError: 0.55,
    requiresAbsentCasesDoc: true,
  };
  const pass =
    ab.randomCoOccurrenceRisk <= floors.maxRandomCoOccurrence &&
    ab.phylogeneticArtifactRisk <= floors.maxPhyloArtifact &&
    ab.annotationErrorRisk <= floors.maxAnnotationError &&
    ab.architectureAbsentCasesDocumented === floors.requiresAbsentCasesDoc &&
    scorecardComplete(candidate);
  return {
    pass,
    floors,
    notes: pass
      ? 'Survived primary anti-bias floors (still may be fully explained by prior literature).'
      : 'Failed anti-bias floors — demote or exclude from research queue.',
  };
}

export function classifyRole(candidate) {
  if (candidate.id === 'C1') return 'baseline_known_adaptive_immunity';
  if (candidate.antiBias.publishedExplanationAdequacy >= 0.85 && candidate.scores.novelty < 0.4) {
    return 'known_peer_low_novelty';
  }
  if (candidate.scores.novelty >= 0.7 && candidate.antiBias.publishedExplanationAdequacy <= 0.6) {
    return 'under_unified_lead_candidate';
  }
  return 'active_research_candidate';
}

export function buildResearchQueue(candidates = CANDIDATES) {
  const rows = candidates.map((c) => {
    const anti = survivesAntiBias(c);
    const interest = researchInterest(c);
    return {
      id: c.id,
      provisionalName: c.provisionalName,
      role: classifyRole(c),
      researchInterest: Number(interest.toFixed(4)),
      antiBiasPass: anti.pass,
      antiBiasNotes: anti.notes,
      scores: c.scores,
      categories: c.categories,
      strongestCompetingExplanation: c.strongestCompetingExplanation,
      falsificationTest: c.falsificationTest,
      predictedMolecularObservation: c.predictedMolecularObservation,
      predictedBiologicalPhenotype: c.predictedBiologicalPhenotype,
      minimumExperiment: c.minimumExperiment,
      confidence: c.confidence,
      significanceIfTrue: c.significanceIfTrue,
      noveltyAssessment: c.noveltyAssessment,
      // Full deliverable fields retained for report consumers:
      observedArchitecture: c.observedArchitecture,
      whyAnnotationMisses: c.whyAnnotationMisses,
      multiScalePattern: c.multiScalePattern,
      possibleInformationFlow: c.informationFlow,
      evidenceMemory: c.evidenceMemory,
      evidenceFeedback: c.evidenceFeedback,
      evidenceHomeostasis: c.evidenceHomeostasis,
      knownExplanations: c.knownExplanations,
    };
  });

  const survivors = rows.filter((r) => r.antiBiasPass);
  const ranked = [...survivors].sort((a, b) => b.researchInterest - a.researchInterest);

  return {
    honesty: QUEUE_HONESTY,
    nCandidates: candidates.length,
    nSurvivors: survivors.length,
    ranked,
    excluded: rows.filter((r) => !r.antiBiasPass),
    // Explicit: no winner declaration
    declaredWinner: null,
  };
}

/**
 * Ultimate questions — answered after queue construction.
 * Must not manufacture novelty; prefer under-unified architecture over cutter lookalikes.
 */
export function answerUltimateQuestions(queue = buildResearchQueue()) {
  const underUnified = queue.ranked.filter((r) => r.role === 'under_unified_lead_candidate');
  const lead = underUnified[0] || queue.ranked.find((r) => r.role === 'active_research_candidate') || null;

  const mostSurprising = lead
    ? {
        id: lead.id,
        provisionalName: lead.provisionalName,
        statement:
          lead.id === 'C4'
            ? 'Second-messenger cyclic oligonucleotide immune hubs (CBASS / Thoeris / Pycsar class): infection state is encoded into a small-molecule message that triggers cell-fate effectors. Conventional annotation often lists polymerase and effector ORFs separately; the unified sensor→encode→respond architecture is still under-recognized relative to CRISPR spacer memory.'
            : lead.id === 'C2'
              ? 'Directed Templated Diversification Engines (DGRs): biology can write *future diversity* into a target gene via RT + template, a different information job than storing past invaders as spacers.'
              : `${lead.provisionalName}: under-unified relational architecture that survives anti-bias floors with elevated researchInterest.`,
        whyNotCrisprLookalike:
          'Lead is chosen for under-explained information-flow architecture, not resemblance to DNA cutting.',
        confidence: lead.confidence,
      }
    : {
        id: null,
        provisionalName: null,
        statement:
          'No under-unified lead cleared anti-bias floors; the responsible conclusion is that the higher-order hypothesis is not yet supported beyond known mechanisms.',
        whyNotCrisprLookalike: 'N/A',
        confidence: 'n/a',
      };

  // Novel prediction NOT explicitly in search criteria (phage-bloom lag / allele separation):
  const novelPrediction =
    lead?.id === 'C4'
      ? {
          yes: true,
          prediction:
            'Separable polymerase-dead vs effector-dead alleles will produce opposite molecular signatures under matched MOI: polymerase-dead → no cyclic messenger accumulation and no abortive phenotype; effector-dead → messenger accumulates without cell-fate change. This double dissociation is not entailed by “find another CRISPR-like cutter” search criteria and falsifies a pure nuclease-centric model of the cassette.',
          notInSearchCriteria: true,
        }
      : lead?.id === 'C2'
        ? {
            yes: true,
            prediction:
              'Across metagenomic time series spanning phage bloom cycles, DGR variable-region nonsynonymous diversity should rise with a one-ecological-generation lag after bloom intensity peaks — a lag signature absent from randomly co-occurring RT+repeat neighborhoods that lack a template–VR pair. Search criteria asked for templated diversification generally; they did not specify this lagged ecological signature.',
            notInSearchCriteria: true,
          }
        : {
            yes: false,
            prediction: null,
            reason:
              'Without a cleared under-unified lead, generating a precise novel prediction would manufacture novelty.',
            notInSearchCriteria: false,
          };

  return {
    mostSurprisingArchitecture: mostSurprising,
    novelTestablePrediction: novelPrediction,
    higherOrderHypothesis:
      'Biological state can be observed, encoded, retained, compared, and used to modify future state — supported as a recurring relational pattern across several known systems, but NOT as a claim that Infinite Octave vocabulary is required to explain them.',
    honesty:
      'Answers are literature-grounded triage conclusions from fixture scores. Not wet-lab discovery. Not ENGINE_SHELF physics. Prefer falsification over confirmation.',
  };
}
