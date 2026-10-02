/**
 * Biological architecture candidates for multi-scale relational discovery.
 * Scores are literature-grounded catalog fixtures (0–1). Not wet-lab measurements.
 * Anti-bias: each candidate carries known explanations + falsification tests.
 */

/** @typedef {{ novelty:number, recurrence:number, independence:number, modularity:number, informationFlow:number, memory:number, feedback:number, multiScale:number, evolutionaryConstraint:number, experimentalTractability:number }} ScoreCard */

/**
 * @type {ReadonlyArray<object>}
 */
export const CANDIDATES = Object.freeze([
  {
    id: 'C1',
    provisionalName: 'CRISPR-Cas adaptive spacer memory',
    literatureStatus: 'known',
    observedArchitecture:
      'Sensor (foreign nucleic acid) → encode (spacer acquisition) → store (CRISPR array) → compare (crRNA guide) → response (cleavage/interference) → feedback (primed acquisition)',
    whyAnnotationMisses:
      'Well annotated as adaptive immunity; often treated as a cutter toolkit rather than a general state→encode→store→compare→respond architecture.',
    multiScalePattern:
      'Molecular (Cas proteins) · genetic (cas operon + repeats) · genomic (arrays) · cellular (interference) · population (phage–host coevolution)',
    informationFlow:
      'Prior infection state written into spacer order; subsequent encounters use stored guides.',
    evidenceMemory: 'Spacer arrays retain chronological infection history in many systems.',
    evidenceFeedback: 'Primed acquisition and autoimmunity avoidance loops.',
    evidenceHomeostasis: 'Abortive outcomes and regulated expression tune host viability under phage pressure.',
    knownExplanations:
      'Mature CRISPR literature explains spacer acquisition, interference, and regulation in detail.',
    noveltyAssessment:
      'Low as a named cutter; moderate as a *general* biological information-processing template that other systems may echo.',
    strongestCompetingExplanation:
      'CRISPR is already adequately recognized as adaptive immunity — unification adds framing, not a new enzyme class.',
    falsificationTest:
      'If spacer arrays do not retain usable prior-state information under controlled serial infection, the memory claim fails.',
    predictedMolecularObservation:
      'New spacers map to recent phage genomes; array polarity predicts temporal order.',
    predictedBiologicalPhenotype:
      'Prior exposure alters subsequent resistance specificity without requiring protein-only memory.',
    minimumExperiment:
      'Serial phage challenge + spacer sequencing + interference assay vs naïve controls.',
    confidence: 'high (known mechanism); low as "beyond CRISPR" novelty',
    significanceIfTrue:
      'Baseline: proves biology already implements sensor→encode→store→compare→respond — the search must look *past* cutter novelty.',
    scores: /** @type {ScoreCard} */ ({
      novelty: 0.22,
      recurrence: 0.95,
      independence: 0.88,
      modularity: 0.9,
      informationFlow: 0.96,
      memory: 0.94,
      feedback: 0.9,
      multiScale: 0.85,
      evolutionaryConstraint: 0.9,
      experimentalTractability: 0.95,
    }),
    antiBias: {
      knownMechanismExplains: 0.95,
      randomCoOccurrenceRisk: 0.05,
      phylogeneticArtifactRisk: 0.1,
      annotationErrorRisk: 0.05,
      hgtConfoundRisk: 0.35,
      publishedExplanationAdequacy: 0.95,
      architectureAbsentCasesDocumented: true,
    },
    categories: ['biological_memory', 'biological_learning', 'recursive_adaptation'],
  },
  {
    id: 'C2',
    provisionalName: 'Directed Templated Diversification Engines (DTDEs / DGRs)',
    literatureStatus: 'partially_known',
    observedArchitecture:
      'Reverse transcriptase + template RNA/DNA + target gene variable region → directed, mutagenic rewrite that diversifies a protein tip without rewriting the whole gene',
    whyAnnotationMisses:
      'RT, VR, and accessory ORFs are often annotated separately; co-occurrence without a cutter label looks like junk or phage debris.',
    multiScalePattern:
      'Molecular (error-prone RT) · genetic (cassette) · cellular (surface/receptor diversity) · population (escape / adhesion variants) · evolutionary (recurrent cassette architecture)',
    informationFlow:
      'Prior selective pressure is hypothesized to condition which diversified variants persist; template guides *where* diversity is written.',
    evidenceMemory: 'Template region preserves a reference while VR accumulates directed changes.',
    evidenceFeedback: 'Successful variants alter future host–virus or adhesion outcomes.',
    evidenceHomeostasis:
      'Diversification can keep a viable matching band under shifting partners — dynamic, not static.',
    knownExplanations:
      'Diversity-generating retroelements are published; often framed as niche mutagenesis, not as a general information architecture peer to CRISPR memory.',
    noveltyAssessment:
      'High as a *unified information-processing* framing: directed rewrite for future matching, not spacer storage of past invaders.',
    strongestCompetingExplanation:
      'DGRs are already explained as localized hypermutation gadgets; no broader principle required.',
    falsificationTest:
      'If VR diversity is indistinguishable from local mutation hotspots without template dependence, the templated-engine claim fails.',
    predictedMolecularObservation:
      'Template–VR pairing and RT dependence are required for localized nonsynonymous spikes.',
    predictedBiologicalPhenotype:
      'Loss of RT collapses tip diversity and reduces adaptation speed under fluctuating partners.',
    minimumExperiment:
      'RT knockout + deep VR sequencing under controlled partner fluctuation vs template-intact controls.',
    confidence: 'medium — mechanism known; unification under-recognized',
    significanceIfTrue:
      'Would show biology can *write future diversity* on purpose — not only remember past invaders — a different information job than CRISPR.',
    scores: /** @type {ScoreCard} */ ({
      novelty: 0.62,
      recurrence: 0.72,
      independence: 0.7,
      modularity: 0.8,
      informationFlow: 0.84,
      memory: 0.62,
      feedback: 0.75,
      multiScale: 0.78,
      evolutionaryConstraint: 0.74,
      experimentalTractability: 0.7,
    }),
    antiBias: {
      knownMechanismExplains: 0.72,
      randomCoOccurrenceRisk: 0.18,
      phylogeneticArtifactRisk: 0.2,
      annotationErrorRisk: 0.25,
      hgtConfoundRisk: 0.35,
      publishedExplanationAdequacy: 0.72,
      architectureAbsentCasesDocumented: true,
    },
    categories: ['biological_learning', 'recursive_adaptation'],
  },
  {
    id: 'C3',
    provisionalName: 'Retron / multicopy ssDNA reverse-transcript writers',
    literatureStatus: 'partially_known',
    observedArchitecture:
      'Reverse transcriptase produces multicopy single-stranded DNA products from structured RNA; neighborhood proteins couple products to defense or regulatory outcomes',
    whyAnnotationMisses:
      'msDNA and RT often filed as curiosities; recent defense links are still fragmented across annotation pipelines.',
    multiScalePattern:
      'Molecular (RT / msDNA) · genetic (retron cassettes) · cellular (abortive / toxic response) · population (phage selection)',
    informationFlow:
      'Structured RNA → DNA product as an encoded intermediate that can gate downstream effectors.',
    evidenceMemory: 'msDNA can persist as a molecular product reflecting cassette state.',
    evidenceFeedback: 'Defense activation alters survival under phage load.',
    evidenceHomeostasis: 'Abortive infection trades cell death for population protection.',
    knownExplanations:
      'Retrons explained as msDNA producers; phage-defense coupling increasingly documented.',
    noveltyAssessment:
      'Moderate–high as distributed writer architecture; not a novel enzyme class claim.',
    strongestCompetingExplanation:
      'Retrons are adequately explained as toxin-linked defense modules without needing a higher-order information theory.',
    falsificationTest:
      'If msDNA production is dispensable for the linked phenotype, the encode-step claim fails.',
    predictedMolecularObservation:
      'msDNA abundance tracks cassette activation under phage-relevant stress.',
    predictedBiologicalPhenotype:
      'RT-dead alleles lose defense without losing neighboring toxin genes.',
    minimumExperiment: 'Allelic RT vs toxin separation + phage plaque assays + msDNA quantification.',
    confidence: 'medium',
    significanceIfTrue:
      'Shows DNA writing as an intermediate representation — not only cleavage — in prokaryotic information flow.',
    scores: /** @type {ScoreCard} */ ({
      novelty: 0.68,
      recurrence: 0.65,
      independence: 0.6,
      modularity: 0.75,
      informationFlow: 0.8,
      memory: 0.55,
      feedback: 0.7,
      multiScale: 0.68,
      evolutionaryConstraint: 0.66,
      experimentalTractability: 0.72,
    }),
    antiBias: {
      knownMechanismExplains: 0.6,
      randomCoOccurrenceRisk: 0.25,
      phylogeneticArtifactRisk: 0.2,
      annotationErrorRisk: 0.35,
      hgtConfoundRisk: 0.45,
      publishedExplanationAdequacy: 0.6,
      architectureAbsentCasesDocumented: true,
    },
    categories: ['biological_memory', 'biological_homeostasis'],
  },
  {
    id: 'C4',
    provisionalName: 'Cyclic oligonucleotide signaling hubs (CBASS / Thoeris / Pycsar class)',
    literatureStatus: 'positive_control',
    observedArchitecture:
      'Viral-state sensor → polymerase synthesizes cyclic oligonucleotide second messenger → effector binds messenger → cell-fate response (often abortive)',
    whyAnnotationMisses:
      'Polymerases, effectors, and accessory ORFs are frequently annotated as separate hypotheticals; the messenger is invisible to gene-name pipelines — useful for testing whether relational search recovers distributed info-flow.',
    multiScalePattern:
      'Molecular (cOS / CD-NTase) · genetic (operon neighborhoods) · cellular (suicide / dormancy) · population (phage suppression) · evolutionary (convergent messenger chemistries)',
    informationFlow:
      'Transient infection state encoded into a small-molecule message that triggers a stereotyped effector program.',
    evidenceMemory: 'Short-lived messenger memory of recent sensing; some systems couple to durable downstream states.',
    evidenceFeedback: 'Cell fate removes infected hosts from the productive phage pool.',
    evidenceHomeostasis: 'Population-level viability band under phage pressure via sacrificial cells.',
    knownExplanations:
      'CBASS / Thoeris / Pycsar are extensively characterized: phage detection → CD-NTase / TIR → cyclic nucleotide messenger → Cap / effector → defense or cell death. Large-scale surveys report thousands of CBASS systems. This is NOT newly discovered biology.',
    noveltyAssessment:
      'Low as new biology. High as *positive-control* for the protocol: can multi-scale relational search rediscover a known distributed sensor→encode→respond architecture from first principles?',
    strongestCompetingExplanation:
      'Published CBASS literature already fully explains the causal chain — treat as framework validation, not a discovery claim.',
    falsificationTest:
      'Framework-validation experiment: if polymerase-dead vs effector-dead alleles fail to separate messenger from phenotype as published work predicts, the *search framing* of encode-step recovery is unreliable and must be revised before trusting gap leads.',
    predictedMolecularObservation:
      'Messenger accumulates after infection-relevant cues and is required for effector engagement (replicates known CBASS biochemistry).',
    predictedBiologicalPhenotype:
      'Polymerase KO: sensing without abortive phenotype; effector KO: messenger accumulates without cell-fate change.',
    minimumExperiment:
      'Separable polymerase/effector alleles + messenger LC-MS + phage fitness under controlled MOI — used to validate protocol recovery, not to claim novelty.',
    confidence: 'high as known mechanism; high as positive-control role; zero as "new architecture discovery"',
    significanceIfTrue:
      'Validates that the methodology recovers distributed information-flow architectures. Then point the same machinery at genuinely unexplained gaps.',
    scores: /** @type {ScoreCard} */ ({
      novelty: 0.22,
      recurrence: 0.88,
      independence: 0.8,
      modularity: 0.85,
      informationFlow: 0.92,
      memory: 0.48,
      feedback: 0.85,
      multiScale: 0.84,
      evolutionaryConstraint: 0.8,
      experimentalTractability: 0.78,
    }),
    antiBias: {
      knownMechanismExplains: 0.92,
      randomCoOccurrenceRisk: 0.12,
      phylogeneticArtifactRisk: 0.15,
      annotationErrorRisk: 0.2,
      hgtConfoundRisk: 0.35,
      publishedExplanationAdequacy: 0.92,
      architectureAbsentCasesDocumented: true,
    },
    categories: ['biological_homeostasis', 'recursive_adaptation', 'positive_control'],
  },
  {
    id: 'C5',
    provisionalName: 'piRNA cluster / TE silencing memory',
    literatureStatus: 'known',
    observedArchitecture:
      'Transposon encounter → piRNA cluster encoding → piRNA guides → silencing of matching TEs → feedback into cluster content over generations',
    whyAnnotationMisses:
      'piRNA biogenesis, TE fragments, and silencing proteins are siloed across genomics and developmental biology annotations.',
    multiScalePattern:
      'Molecular (piRNA) · genomic (clusters) · cellular (silencing) · organism (germline defense) · evolutionary (TE–host arms race)',
    informationFlow:
      'Prior TE sequence content retained as RNA guides that alter future TE activity.',
    evidenceMemory: 'Cluster content is heritable sequence memory of TE families.',
    evidenceFeedback: 'Silencing success changes TE load and subsequent cluster evolution.',
    evidenceHomeostasis: 'Keeps TE activity in a viable band for germline integrity.',
    knownExplanations: 'piRNA pathway is extensively published in animals.',
    noveltyAssessment:
      'Low–moderate as mechanism; moderate as multi-scale *genomic memory* peer often omitted from prokaryotic CRISPR comparisons.',
    strongestCompetingExplanation:
      'Fully explained germline TE defense — not an unrecognized architecture.',
    falsificationTest:
      'If cluster content does not predict silencing specificity, memory claim fails.',
    predictedMolecularObservation: 'piRNA matches track TE families present in recent history.',
    predictedBiologicalPhenotype: 'Cluster deletion derepresses matching TEs.',
    minimumExperiment: 'Cluster edit + TE expression + piRNA-seq in germline models.',
    confidence: 'high (known); low novelty',
    significanceIfTrue: 'Animal-scale genomic memory peer for the core discovery question.',
    scores: /** @type {ScoreCard} */ ({
      novelty: 0.35,
      recurrence: 0.8,
      independence: 0.55,
      modularity: 0.7,
      informationFlow: 0.85,
      memory: 0.9,
      feedback: 0.8,
      multiScale: 0.88,
      evolutionaryConstraint: 0.8,
      experimentalTractability: 0.6,
    }),
    antiBias: {
      knownMechanismExplains: 0.9,
      randomCoOccurrenceRisk: 0.1,
      phylogeneticArtifactRisk: 0.15,
      annotationErrorRisk: 0.1,
      hgtConfoundRisk: 0.05,
      publishedExplanationAdequacy: 0.9,
      architectureAbsentCasesDocumented: true,
    },
    categories: ['biological_memory', 'biological_homeostasis'],
  },
  {
    id: 'C6',
    provisionalName: 'Toxin–antitoxin / abortive-infection population switches',
    literatureStatus: 'known',
    observedArchitecture:
      'Infection or stress tip balance → toxin liberation → cell stall/death → population phage suppression; antitoxin restores viable band',
    whyAnnotationMisses:
      'TA pairs annotated as stress gadgets; information role at population scale is under-weighted vs molecular labels.',
    multiScalePattern:
      'Molecular (toxin/antitoxin) · cellular (bacteriostasis) · population (phage abort) · ecological (persistence)',
    informationFlow:
      'Local infection state triggers a sacrificial response that changes collective future phage dynamics.',
    evidenceMemory: 'Some TA systems couple to persister states (temporary program memory).',
    evidenceFeedback: 'Abort reduces phage burst; survivors reshape next generation.',
    evidenceHomeostasis: 'Classic deviation→corrective response at colony scale.',
    knownExplanations: 'Large TA / Abi literature.',
    noveltyAssessment: 'Low–moderate; useful as homeostasis peer, weak as unrecognized architecture.',
    strongestCompetingExplanation: 'Well-known stress / Abi modules — no new architecture.',
    falsificationTest:
      'If toxin activation is uncorrelated with infection-relevant cues, the sensing claim fails.',
    predictedMolecularObservation: 'Antitoxin depletion coincides with infection markers.',
    predictedBiologicalPhenotype: 'Toxin KO increases phage burst size.',
    minimumExperiment: 'Timed infection + antitoxin stability + plaque assays.',
    confidence: 'high known; low novelty',
    significanceIfTrue: 'Clarifies population-level homeostasis as information flow without genomic writing.',
    scores: /** @type {ScoreCard} */ ({
      novelty: 0.3,
      recurrence: 0.9,
      independence: 0.85,
      modularity: 0.8,
      informationFlow: 0.7,
      memory: 0.4,
      feedback: 0.85,
      multiScale: 0.75,
      evolutionaryConstraint: 0.7,
      experimentalTractability: 0.8,
    }),
    antiBias: {
      knownMechanismExplains: 0.9,
      randomCoOccurrenceRisk: 0.1,
      phylogeneticArtifactRisk: 0.1,
      annotationErrorRisk: 0.1,
      hgtConfoundRisk: 0.3,
      publishedExplanationAdequacy: 0.9,
      architectureAbsentCasesDocumented: true,
    },
    categories: ['biological_homeostasis'],
  },
  {
    id: 'C7',
    provisionalName: 'Chromatin epigenetic state recorders',
    literatureStatus: 'known',
    observedArchitecture:
      'Environmental/developmental cue → chromatin mark / DNA methylation / histone state → retained representation → altered future transcription',
    whyAnnotationMisses:
      'Marks, writers, readers, erasers annotated as separate enzymatic families; the *state tape* is relational.',
    multiScalePattern:
      'Molecular (marks) · genomic (loci) · cellular (expression memory) · organism (development/immunity) · population (plasticity)',
    informationFlow: 'Cue → encode as chromatin state → store across division → gate later response.',
    evidenceMemory: 'Mitotic and some transgenerational mark retention (taxon-dependent).',
    evidenceFeedback: 'Expression changes alter metabolism and further marking.',
    evidenceHomeostasis: 'Keeps expression in viable bands under fluctuating cues.',
    knownExplanations: 'Vast epigenetics literature; SING13 Soft Story peers exist (histone / phase-lock papers).',
    noveltyAssessment: 'Low as novelty; high as multi-scale recurrence peer for the discovery question.',
    strongestCompetingExplanation: 'Standard epigenetics — not unrecognized.',
    falsificationTest:
      'If mark erasure does not change subsequent response probabilities, memory claim fails for that locus.',
    predictedMolecularObservation: 'Mark occupancy predicts later expression under matched cues.',
    predictedBiologicalPhenotype: 'Writer/eraser perturbation changes adaptation latency.',
    minimumExperiment: 'Timed cue + ChIP/methylome + expression with writer KO.',
    confidence: 'high known',
    significanceIfTrue: 'Establishes non-sequence genomic memory as a core answer class.',
    scores: /** @type {ScoreCard} */ ({
      novelty: 0.28,
      recurrence: 0.92,
      independence: 0.7,
      modularity: 0.75,
      informationFlow: 0.88,
      memory: 0.92,
      feedback: 0.85,
      multiScale: 0.95,
      evolutionaryConstraint: 0.8,
      experimentalTractability: 0.75,
    }),
    antiBias: {
      knownMechanismExplains: 0.92,
      randomCoOccurrenceRisk: 0.05,
      phylogeneticArtifactRisk: 0.1,
      annotationErrorRisk: 0.1,
      hgtConfoundRisk: 0.05,
      publishedExplanationAdequacy: 0.92,
      architectureAbsentCasesDocumented: true,
    },
    categories: ['biological_memory', 'biological_learning', 'biological_homeostasis'],
  },
  {
    id: 'C8',
    provisionalName: 'Prion / conformational protein memory',
    literatureStatus: 'partially_known',
    observedArchitecture:
      'Protein conformational state templates identical folds → propagates a non-nucleic representation of prior state → alters phenotype',
    whyAnnotationMisses:
      'Treated as pathology or yeast epigenetics; rarely filed beside CRISPR as information architecture.',
    multiScalePattern:
      'Molecular (fold) · cellular (phenotype switch) · organism (disease/trait) · evolutionary (rare stable states)',
    informationFlow: 'Prior fold state encodes information that templates future folds.',
    evidenceMemory: 'Conformational inheritance without DNA sequence change.',
    evidenceFeedback: 'Phenotype can reinforce conditions favoring the fold.',
    evidenceHomeostasis: 'Usually pathological; some yeast prions act as bet-hedging switches.',
    knownExplanations: 'Prion biology is published; SING13 Soft Story peer exists (prion-refold paper).',
    noveltyAssessment:
      'Moderate as *non-nucleic* memory peer — important falsifier of "must be DNA cutting" bias.',
    strongestCompetingExplanation: 'Pathology-only misfolding — not adaptive information processing.',
    falsificationTest:
      'If conformational propagation never alters subsequent adaptive response probabilities, drop the learning claim.',
    predictedMolecularObservation: 'Seeded misfold fraction predicts phenotype switch rate.',
    predictedBiologicalPhenotype: 'Seeding changes trait distribution without DNA mutation.',
    minimumExperiment: 'Controlled seeding + phenotype assay + sequencing to exclude DNA change.',
    confidence: 'medium (memory yes; adaptive info-processing contested)',
    significanceIfTrue:
      'Breaks the assumption that consequential biological memory must look like CRISPR.',
    scores: /** @type {ScoreCard} */ ({
      novelty: 0.6,
      recurrence: 0.45,
      independence: 0.5,
      modularity: 0.55,
      informationFlow: 0.7,
      memory: 0.85,
      feedback: 0.55,
      multiScale: 0.6,
      evolutionaryConstraint: 0.4,
      experimentalTractability: 0.55,
    }),
    antiBias: {
      knownMechanismExplains: 0.7,
      randomCoOccurrenceRisk: 0.1,
      phylogeneticArtifactRisk: 0.15,
      annotationErrorRisk: 0.2,
      hgtConfoundRisk: 0.05,
      publishedExplanationAdequacy: 0.75,
      architectureAbsentCasesDocumented: true,
    },
    categories: ['biological_memory'],
  },
  {
    id: 'C9',
    provisionalName: 'Restriction–modification / DNA Argonaute neighborhood defense',
    literatureStatus: 'known',
    observedArchitecture:
      'Recognize non-self DNA patterns → cut or guide interference → protect self via methylation or guide RNA; neighborhoods often co-occur with poorly annotated ORFs',
    whyAnnotationMisses:
      'R-M and pAgo systems annotated as restriction gadgets; poorly characterized neighbors ignored.',
    multiScalePattern: 'Molecular · genetic · cellular · population phage ecology',
    informationFlow: 'Self/non-self discrimination encodes a standing rule that alters future DNA survival.',
    evidenceMemory: 'Methylation state is a standing self-signature (not event chronology like CRISPR).',
    evidenceFeedback: 'Cleavage alters phage success and selection on motifs.',
    evidenceHomeostasis: 'Keeps foreign DNA load in a viable band.',
    knownExplanations: 'Classical R-M; growing pAgo literature.',
    noveltyAssessment: 'Low–moderate; useful baseline that CRISPR is not the only nucleic defense grammar.',
    strongestCompetingExplanation: 'Fully explained classical genetics tools.',
    falsificationTest:
      'If methylation-blind hosts show no specificity change, self-signature memory fails.',
    predictedMolecularObservation: 'Methylome matches protected motifs.',
    predictedBiologicalPhenotype: 'Methylase KO increases self-restriction or phage susceptibility patterns.',
    minimumExperiment: 'Methylase/endonuclease allele separation + plaque + methylome.',
    confidence: 'high known',
    significanceIfTrue: 'Pre-CRISPR nucleic discrimination peer for the queue.',
    scores: /** @type {ScoreCard} */ ({
      novelty: 0.25,
      recurrence: 0.9,
      independence: 0.85,
      modularity: 0.8,
      informationFlow: 0.75,
      memory: 0.65,
      feedback: 0.7,
      multiScale: 0.7,
      evolutionaryConstraint: 0.85,
      experimentalTractability: 0.9,
    }),
    antiBias: {
      knownMechanismExplains: 0.92,
      randomCoOccurrenceRisk: 0.1,
      phylogeneticArtifactRisk: 0.1,
      annotationErrorRisk: 0.15,
      hgtConfoundRisk: 0.35,
      publishedExplanationAdequacy: 0.92,
      architectureAbsentCasesDocumented: true,
    },
    categories: ['biological_memory', 'biological_homeostasis'],
  },
  {
    id: 'C10',
    provisionalName: 'Integron cassette capture as adaptive genomic encoding',
    literatureStatus: 'partially_known',
    observedArchitecture:
      'Environmental gene cassettes → site-specific recombination into integron array → ordered expression potential → alters future antimicrobial / stress responses',
    whyAnnotationMisses:
      'Integrases and cassettes annotated; the *ordered encoding of prior encounters with mobile genes* is under-framed as learning.',
    multiScalePattern:
      'Molecular (IntI) · genetic (att sites) · genomic (arrays) · cellular (expression) · population (HGT ecology)',
    informationFlow:
      'Prior cassette acquisition encodes encounter history that changes subsequent resistance repertoire.',
    evidenceMemory: 'Array content is durable genomic memory of acquired cassettes.',
    evidenceFeedback: 'Expression and selection reshape which cassettes persist.',
    evidenceHomeostasis: 'Expands response repertoire under antibiotic/stress regimes.',
    knownExplanations: 'Integron literature is established in antibiotic resistance.',
    noveltyAssessment:
      'Moderate: known HGT machine, under-recognized as sensor-agnostic *genomic learning* architecture.',
    strongestCompetingExplanation:
      'Plain HGT accumulation — no need for information-architecture language.',
    falsificationTest:
      'If cassette order/content does not change subsequent response probabilities under matched stress, drop the learning claim.',
    predictedMolecularObservation:
      'Recent stress-associated cassettes appear near the attI expression pole more often than null models.',
    predictedBiologicalPhenotype:
      'Integrase-dead strains freeze repertoire and lose adaptive acquisition speed.',
    minimumExperiment:
      'Controlled cassette challenge + array sequencing + MIC / stress assays vs IntI KO.',
    confidence: 'medium',
    significanceIfTrue:
      'Would show genomic learning via cassette grammar without CRISPR-like spacers — unexpected relative to cutter-centric search.',
    scores: /** @type {ScoreCard} */ ({
      novelty: 0.58,
      recurrence: 0.75,
      independence: 0.65,
      modularity: 0.85,
      informationFlow: 0.78,
      memory: 0.8,
      feedback: 0.72,
      multiScale: 0.76,
      evolutionaryConstraint: 0.7,
      experimentalTractability: 0.75,
    }),
    antiBias: {
      knownMechanismExplains: 0.7,
      randomCoOccurrenceRisk: 0.2,
      phylogeneticArtifactRisk: 0.15,
      annotationErrorRisk: 0.2,
      hgtConfoundRisk: 0.55,
      publishedExplanationAdequacy: 0.75,
      architectureAbsentCasesDocumented: true,
    },
    categories: ['biological_learning', 'biological_memory', 'recursive_adaptation'],
  },

  {
    id: 'C11',
    provisionalName: 'ART-class unresolved RT–partner–long-repeat architectures',
    literatureStatus: 'genuinely_unexplained',
    sixPointGap: {
      sensesState: 'unknown — hypothesized phage / mobile-element / stress encounter',
      encodesRepresentation: 'hypothesized via RT products + long repeat array',
      storesRepresentation: 'long repeat array + partner gene products (unproven)',
      retrievesOrCompares: 'unmapped',
      altersFutureBehavior: 'unresolved phenotype',
      previouslyUnrecognized: true,
    },
    observedArchitecture:
      'Unusual reverse transcriptase + adjacent poorly characterized partner gene + long repeat array co-occurring without a complete published causal chain from state sensing to altered future behavior',
    whyAnnotationMisses:
      'Components may be annotated as separate RT, hypothetical protein, and repeat region; conventional pipelines reward local neighborhoods but do not certify an information-processing loop. AI RT surveys surface the pattern; function remains open.',
    multiScalePattern:
      'Molecular (atypical RT) · genetic (partner ORF) · genomic (long repeats) · cellular (unknown) · evolutionary (recurrent RT–repeat grammar across genomes)',
    informationFlow:
      'Unknown. Candidate question: does the cassette sense a state, write a durable representation into/near the repeats, and later change host or mobile-element behavior?',
    evidenceMemory: 'Repeat array is a plausible durable store — not proven as state memory.',
    evidenceFeedback: 'Not established; phenotype unmapped.',
    evidenceHomeostasis: 'Not established.',
    knownExplanations:
      'No adequate published mechanism equates this class to CRISPR, DGR, retron defense, or CBASS. Competing mundane accounts: selfish mobile debris, assembly artifact, or unfinished annotation of a known class.',
    noveltyAssessment:
      'High as *unresolved architecture*: the discovery object is whether a sensor→encode→store→compare→respond loop exists at all — not another cutter.',
    strongestCompetingExplanation:
      'Phage/mobile debris or misassembled repeats around an orphan RT with no unified information job.',
    falsificationTest:
      'If partner KO + RT KO + repeat deletion produce no separable molecular intermediate and no reproducible phenotype under controlled infection/stress panels, demote from gap lead to debris.',
    predictedMolecularObservation:
      'Under inducing conditions, a partner-dependent non-genomic or atypical nucleic product accumulates that is absent in RT-dead alleles and does not match canonical DGR template–VR or retron msDNA fingerprints.',
    predictedBiologicalPhenotype:
      'Cassette-intact strains alter subsequent infection or mobile-element outcomes relative to RT-dead / partner-dead isogenics after a priming exposure — a lagged behavioral change, not only acute toxicity.',
    minimumExperiment:
      'Build RT-dead, partner-dead, and repeat-truncation alleles in one tractable host; assay nucleic products + serial infection/stress with lagged phenotype readouts.',
    confidence: 'low–medium as architecture claim; high as unresolved-gap priority',
    significanceIfTrue:
      'Would be a previously unrecognized biological information-processing architecture (sense→encode→store→alter future behavior) — significance from the mechanism, not from AI rediscovery theater.',
    scores: /** @type {ScoreCard} */ ({
      novelty: 0.9,
      recurrence: 0.55,
      independence: 0.6,
      modularity: 0.7,
      informationFlow: 0.58,
      memory: 0.45,
      feedback: 0.4,
      multiScale: 0.62,
      evolutionaryConstraint: 0.5,
      experimentalTractability: 0.55,
    }),
    antiBias: {
      knownMechanismExplains: 0.2,
      randomCoOccurrenceRisk: 0.35,
      phylogeneticArtifactRisk: 0.3,
      annotationErrorRisk: 0.4,
      hgtConfoundRisk: 0.5,
      publishedExplanationAdequacy: 0.22,
      architectureAbsentCasesDocumented: true,
    },
    categories: ['gap_discovery', 'biological_memory', 'recursive_adaptation'],
  },
  {
    id: 'C12',
    provisionalName: 'Orphan cyclic-messenger synthases without mapped effectors',
    literatureStatus: 'genuinely_unexplained',
    sixPointGap: {
      sensesState: 'plausible (sensor domains sometimes present)',
      encodesRepresentation: 'plausible cyclic nucleotide / oligo product',
      storesRepresentation: 'short-lived messenger — incomplete without effector',
      retrievesOrCompares: 'unmapped if effector absent',
      altersFutureBehavior: 'unmapped phenotype',
      previouslyUnrecognized: true,
    },
    observedArchitecture:
      'CD-NTase / TIR-like domains that look like messenger encoders occurring without annotated Cap / NADase / pore-forming effectors in the same neighborhood — incomplete CBASS-like grammar',
    whyAnnotationMisses:
      'Synthase ORFs are labeled; missing effectors look like annotation gaps or truncated operons. Relational search asks whether remote effectors, novel messengers, or non-immune roles complete an unrecognized loop.',
    multiScalePattern:
      'Molecular (synthase) · genetic (incomplete operons) · genomic (dispersed loci) · cellular (unknown) · evolutionary (partial cassettes recur)',
    informationFlow:
      'Hypothesized encode step without a proven retrieve/respond partner — either a true gap architecture or a broken cassette.',
    evidenceMemory: 'Messenger chemistry would be short-term encoding if product exists.',
    evidenceFeedback: 'Unknown without effector.',
    evidenceHomeostasis: 'Unknown.',
    knownExplanations:
      'Incomplete / degraded CBASS cassettes, misannotation, or remote effector unused by current HMM catalogs. Complete CBASS is explained; *orphan synthase neighborhoods* are not.',
    noveltyAssessment:
      'High as gap: either novel effector classes / remote wiring, or systematic false positives the protocol must learn to kill.',
    strongestCompetingExplanation:
      'Pseudogenized or horizontally fragmented CBASS fragments with no functional information loop.',
    falsificationTest:
      'If synthase-active alleles produce no diffusible messenger *and* no phenotype vs catalytic-dead controls across infection panels, treat as non-functional debris.',
    predictedMolecularObservation:
      'Catalytically intact orphan synthases produce a detectable cyclic nucleotide / oligo under inducing conditions that does not match the host’s annotated CBASS messenger set — or no product (kill case).',
    predictedBiologicalPhenotype:
      'Messenger-positive orphans alter phage or stress outcomes only when a previously unannotated remote partner is present; remote-partner deletion abolishes phenotype while messenger still accumulates.',
    minimumExperiment:
      'Heterologous expression of orphan synthase ± genome-wide remote-partner screen + LC-MS messenger profiling + phage assays.',
    confidence: 'low — high kill risk; valuable negative-result machine',
    significanceIfTrue:
      'Would extend second-messenger immune logic into unrecognized remote wiring — a systems-level architecture conventional local annotation misses.',
    scores: /** @type {ScoreCard} */ ({
      novelty: 0.86,
      recurrence: 0.5,
      independence: 0.55,
      modularity: 0.75,
      informationFlow: 0.52,
      memory: 0.35,
      feedback: 0.38,
      multiScale: 0.58,
      evolutionaryConstraint: 0.45,
      experimentalTractability: 0.5,
    }),
    antiBias: {
      knownMechanismExplains: 0.35,
      randomCoOccurrenceRisk: 0.4,
      phylogeneticArtifactRisk: 0.28,
      annotationErrorRisk: 0.45,
      hgtConfoundRisk: 0.48,
      publishedExplanationAdequacy: 0.28,
      architectureAbsentCasesDocumented: true,
    },
    categories: ['gap_discovery', 'biological_homeostasis'],
  },
  {
    id: 'C13',
    provisionalName: 'Cryptic variable-region diversifiers without canonical DGR annotation',
    literatureStatus: 'genuinely_unexplained',
    sixPointGap: {
      sensesState: 'unknown selective regime',
      encodesRepresentation: 'hypothesized template-guided rewrite',
      storesRepresentation: 'variable region sequence ensemble',
      retrievesOrCompares: 'protein tip vs environment (hypothesized)',
      altersFutureBehavior: 'hypothesized host-range / adhesion change',
      previouslyUnrecognized: true,
    },
    observedArchitecture:
      'RT-adjacent loci showing VR-like diversity spikes without a clear annotated template–VR pair — possible unrecognized directed diversification engines',
    whyAnnotationMisses:
      'DGR HMMs miss noncanonical cassettes; diversity looks like ordinary mutation or assembly noise unless template dependence is tested.',
    multiScalePattern:
      'Molecular (RT) · genetic (cryptic cassette) · genomic (diversity hotspots) · population (allele spectra) · evolutionary (recurrent RT–diversity neighborhoods)',
    informationFlow:
      'If real: template-guided writing of future tip diversity that changes subsequent matching behavior — a different job than spacer memory of past invaders.',
    evidenceMemory: 'VR ensemble as stored possibility space — only if template-dependent.',
    evidenceFeedback: 'Successful tips alter future infection/adhesion odds — unproven for cryptic set.',
    evidenceHomeostasis: 'Possible dynamic matching band — unproven.',
    knownExplanations:
      'Canonical DGRs are explained. Cryptic diversifiers may be assembly artifacts, sequencing error, or unannotated true DGRs — the *unexplained* object is which metagenomic VR-like spikes are directed engines.',
    noveltyAssessment:
      'High as gap discovery among unexplained diversity engines; low if all reduce to known DGRs after better annotation.',
    strongestCompetingExplanation:
      'Sequencing/assembly artifact or ordinary mutational hotspots near RTs.',
    falsificationTest:
      'If diversity spikes disappear under higher-quality long-read assemblies *or* persist but are RT- and template-independent, demote the directed-engine claim.',
    predictedMolecularObservation:
      'Long-read validation retains a template–VR dependency; RT-dead alleles flatten nonsynonymous VR spikes that wild-type maintains under partner fluctuation.',
    predictedBiologicalPhenotype:
      'Cryptic-cassette intact lineages adapt host-range or adhesion faster across serial partner shifts than RT-dead isogenics — without acquiring CRISPR spacers.',
    minimumExperiment:
      'Long-read reassembly of top cryptic loci + RT KO + VR deep sequencing under controlled partner fluctuation.',
    confidence: 'low–medium; artifact risk explicit',
    significanceIfTrue:
      'Would enlarge the family of future-diversity writers beyond catalogued DGRs — unrecognized information architecture, not rediscovered CBASS.',
    scores: /** @type {ScoreCard} */ ({
      novelty: 0.84,
      recurrence: 0.48,
      independence: 0.52,
      modularity: 0.68,
      informationFlow: 0.6,
      memory: 0.5,
      feedback: 0.55,
      multiScale: 0.6,
      evolutionaryConstraint: 0.48,
      experimentalTractability: 0.48,
    }),
    antiBias: {
      knownMechanismExplains: 0.3,
      randomCoOccurrenceRisk: 0.42,
      phylogeneticArtifactRisk: 0.45,
      annotationErrorRisk: 0.5,
      hgtConfoundRisk: 0.4,
      publishedExplanationAdequacy: 0.25,
      architectureAbsentCasesDocumented: true,
    },
    categories: ['gap_discovery', 'biological_learning', 'recursive_adaptation'],
  },

]);
