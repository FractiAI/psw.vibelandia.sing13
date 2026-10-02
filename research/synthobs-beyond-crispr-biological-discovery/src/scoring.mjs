/**
 * Independent discovery scoring + research-queue triage.
 * Does NOT declare a winner. researchInterest is a sort key only.
 * Positive-control rediscovery (C4/CBASS) ≠ novel biology claim.
 */

import { SCORE_AXES, QUEUE_HONESTY } from './constants.mjs';
import { CANDIDATES } from './candidates.mjs';

/**
 * researchInterest favors under-explained, high information-flow, tractable novelty.
 * Explicitly down-weights candidates that already have adequate published explanations
 * (anti-confirmation: do not reward CRISPR resemblance alone).
 * Gap candidates (genuinely_unexplained) get a modest lift so rediscovery cannot dominate.
 */
export function researchInterest(candidate) {
  const s = candidate.scores;
  const ab = candidate.antiBias;
  const noveltyLift = s.novelty;
  const flow = s.informationFlow;
  const tract = s.experimentalTractability;
  const underExplained = 1 - ab.publishedExplanationAdequacy;
  const notJustCrisprLookalike = candidate.id === 'C1' ? 0.35 : 1;
  const positiveControlDownweight =
    candidate.literatureStatus === 'positive_control' ? 0.45 : 1;
  const gapLift = candidate.literatureStatus === 'genuinely_unexplained' ? 1.12 : 1;
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
  return Math.max(
    0,
    (raw - confoundPenalty) * notJustCrisprLookalike * positiveControlDownweight * gapLift,
  );
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
  if (candidate.literatureStatus === 'positive_control') {
    return 'positive_control_framework_validation';
  }
  if (
    candidate.literatureStatus === 'genuinely_unexplained' &&
    candidate.scores.novelty >= 0.65 &&
    candidate.antiBias.publishedExplanationAdequacy <= 0.45
  ) {
    return 'gap_discovery_candidate';
  }
  if (candidate.antiBias.publishedExplanationAdequacy >= 0.85 && candidate.scores.novelty < 0.4) {
    return 'known_peer_low_novelty';
  }
  if (candidate.literatureStatus === 'partially_known') {
    return 'active_research_candidate';
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
      literatureStatus: c.literatureStatus,
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
      observedArchitecture: c.observedArchitecture,
      whyAnnotationMisses: c.whyAnnotationMisses,
      multiScalePattern: c.multiScalePattern,
      possibleInformationFlow: c.informationFlow,
      evidenceMemory: c.evidenceMemory,
      evidenceFeedback: c.evidenceFeedback,
      evidenceHomeostasis: c.evidenceHomeostasis,
      knownExplanations: c.knownExplanations,
      sixPointGap: c.sixPointGap || null,
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
    declaredWinner: null,
    positiveControlIds: ranked
      .filter((r) => r.role === 'positive_control_framework_validation')
      .map((r) => r.id),
    gapDiscoveryIds: ranked.filter((r) => r.role === 'gap_discovery_candidate').map((r) => r.id),
  };
}

function predictionForLead(lead) {
  if (!lead) {
    return {
      yes: false,
      prediction: null,
      reason:
        'Without a cleared gap-discovery lead, generating a precise novel prediction would manufacture novelty.',
      notInSearchCriteria: false,
    };
  }
  if (lead.id === 'C11') {
    return {
      yes: true,
      prediction:
        'After a controlled priming exposure, ART-class cassette-intact strains will show a lagged change in infection or mobile-element outcomes versus RT-dead and partner-dead isogenics, accompanied by a partner-dependent nucleic product that does not match canonical DGR template–VR or retron msDNA fingerprints. Search criteria asked for sense→encode→store→respond architectures generally; they did not specify this lagged isogenic dissociation for unresolved RT–partner–repeat cassettes.',
      notInSearchCriteria: true,
    };
  }
  if (lead.id === 'C12') {
    return {
      yes: true,
      prediction:
        'Orphan cyclic-messenger synthases that remain catalytically intact will either (a) produce a messenger absent from the host’s annotated CBASS set and require a remote unannotated partner for phenotype, or (b) produce neither messenger nor phenotype — the explicit kill case. Search criteria did not require remote-partner genetic separation as the discriminating test.',
      notInSearchCriteria: true,
    };
  }
  if (lead.id === 'C13') {
    return {
      yes: true,
      prediction:
        'Long-read-validated cryptic diversifiers will retain RT- and template-dependent nonsynonymous VR spikes under partner fluctuation; RT-dead alleles flatten those spikes without CRISPR spacer acquisition. Search criteria mentioned templated diversification generally; they did not specify long-read artifact rejection plus spacer-negative adaptation speed as the joint falsifier.',
      notInSearchCriteria: true,
    };
  }
  if (lead.id === 'C2') {
    return {
      yes: true,
      prediction:
        'Across metagenomic time series spanning phage bloom cycles, DGR variable-region nonsynonymous diversity should rise with a one-ecological-generation lag after bloom intensity peaks — a lag signature absent from randomly co-occurring RT+repeat neighborhoods that lack a template–VR pair.',
      notInSearchCriteria: true,
    };
  }
  return {
    yes: true,
    prediction:
      lead.falsificationTest ||
      `${lead.provisionalName}: execute the candidate minimumExperiment; if the predicted molecular intermediate fails to separate from phenotype, demote.`,
    notInSearchCriteria: true,
  };
}

/**
 * Ultimate questions — answered after queue construction.
 * Prefer genuinely unexplained gap leads over positive-control rediscovery.
 */
export function answerUltimateQuestions(queue = buildResearchQueue()) {
  const positiveControl =
    queue.ranked.find((r) => r.role === 'positive_control_framework_validation') || null;
  const gapLeads = queue.ranked.filter((r) => r.role === 'gap_discovery_candidate');
  const lead =
    gapLeads[0] ||
    queue.ranked.find((r) => r.role === 'active_research_candidate') ||
    queue.ranked.find((r) => r.role === 'under_unified_lead_candidate') ||
    null;

  const frameworkValidation = positiveControl
    ? {
        id: positiveControl.id,
        provisionalName: positiveControl.provisionalName,
        statement:
          'Positive-control rediscovery: cyclic-oligonucleotide immune signaling (CBASS / Thoeris / Pycsar) is already experimentally characterized (sensor → cyclic nucleotide messenger → effector → cell fate). The protocol’s job here is to recover that distributed information-flow architecture from first principles — demonstrating methodological reach — not to claim newly discovered biology.',
        role: 'positive_control_framework_validation',
      }
    : null;

  const mostSurprising = lead
    ? {
        id: lead.id,
        provisionalName: lead.provisionalName,
        literatureStatus: lead.literatureStatus,
        statement:
          lead.id === 'C11'
            ? 'Most surprising *gap* architecture under current fixtures: ART-class unresolved RT–partner–long-repeat cassettes. Components co-occur; the complete sense→encode→store→compare→respond loop is not adequately explained in published work. This is a discovery target, not a rediscovery trophy.'
            : lead.id === 'C12'
              ? 'Most surprising *gap* architecture: orphan cyclic-messenger synthases without mapped effectors — possible remote wiring or systematic debris. Kill-if-fails is mandatory.'
              : lead.id === 'C13'
                ? 'Most surprising *gap* architecture: cryptic variable-region diversifiers lacking canonical DGR annotation — possible unrecognized future-diversity writers after artifact rejection.'
                : `${lead.provisionalName}: gap / active candidate that survives anti-bias with elevated researchInterest and is not a positive-control rediscovery.`,
        whyNotCrisprLookalike:
          'Lead is chosen for unexplained or under-explained information-flow architecture after anti-bias — not resemblance to DNA cutting, and not CBASS rediscovery.',
        whyNotPositiveControl:
          'CBASS/Thoeris remains the framework-validation case; discovery focus requires literatureStatus genuinely_unexplained (or strongest remaining active gap).',
        confidence: lead.confidence,
      }
    : {
        id: null,
        provisionalName: null,
        statement:
          'No gap-discovery lead cleared anti-bias floors; the responsible conclusion is that the higher-order hypothesis is not yet supported beyond known mechanisms and positive-control rediscovery.',
        whyNotCrisprLookalike: 'N/A',
        confidence: 'n/a',
      };

  return {
    frameworkValidation,
    mostSurprisingArchitecture: mostSurprising,
    novelTestablePrediction: predictionForLead(lead),
    higherOrderHypothesis:
      'Biological state can be observed, encoded, retained, compared, and used to modify future state — supported as a recurring relational pattern across several *known* systems (CRISPR, CBASS, DGR, …). The open discovery question is whether AI multi-scale relational search can surface previously unrecognized members of that family — not whether it can rediscover CBASS.',
    honesty:
      'Answers are literature-grounded triage conclusions from fixture scores. Not wet-lab discovery. Not ENGINE_SHELF physics. Prefer falsification over confirmation. Positive-control ≠ novelty.',
  };
}
