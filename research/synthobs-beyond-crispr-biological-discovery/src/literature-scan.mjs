/**
 * Curated literature / data scan for Beyond CRISPR discovery protocol.
 * Not a systematic review. Tags structural themes only.
 */

export const LITERATURE_CORPUS = Object.freeze([
  {
    id: 'barrangou2007',
    cite: 'Barrangou, R., et al. (2007). CRISPR provides acquired resistance against viruses in prokaryotes. Science.',
    tags: ['crispr', 'adaptive_immunity', 'biological_memory'],
    note: 'Baseline adaptive spacer memory — cutter-centric discovery peer.',
  },
  {
    id: 'moineau2010',
    cite: 'Garneau, J. E., et al. (2010). The CRISPR/Cas bacterial immune system cleaves bacteriophage and plasmid DNA. Nature.',
    tags: ['crispr', 'interference'],
    note: 'Interference as compare→respond step after stored spacers.',
  },
  {
    id: 'doulatov2004',
    cite: 'Doulatov, S., et al. (2004). Tropism switching in Bordetella bacteriophage defines a family of diversity-generating retroelements. Nature.',
    tags: ['dgr', 'templated_diversification', 'reverse_transcriptase'],
    note: 'DTDE / DGR canonical — directed rewrite, not spacer storage.',
  },
  {
    id: 'guo2014',
    cite: 'Guo, H., et al. (2014). Diversity-generating Retroelements. Microbiol. Spectr.',
    tags: ['dgr', 'templated_diversification'],
    note: 'Survey framing DGRs as diversification engines across hosts.',
  },
  {
    id: 'millman2020',
    cite: 'Millman, A., et al. (2020). Bacterial Retrons Function In Anti-Phage Defense. Cell.',
    tags: ['retron', 'reverse_transcriptase', 'phage_defense'],
    note: 'Retrons as defense writers — msDNA as intermediate representation.',
  },
  {
    id: 'cohen2019',
    cite: 'Cohen, D., et al. (2019). Cyclic GMP–AMP signalling protects bacteria against viral infection. Nature.',
    tags: ['cbass', 'second_messenger', 'abortive_infection'],
    note: 'CBASS messenger encode step — cyclic oligo as state representation.',
  },
  {
    id: 'ofir2021',
    cite: 'Ofir, G., et al. (2021). Antiviral activity of bacterial TIR domains via molecules that deplete NAD+. Nature.',
    tags: ['thoeris', 'second_messenger', 'abortive_infection'],
    note: 'Thoeris / TIR signaling — convergent messenger logic outside CRISPR.',
  },
  {
    id: 'brennecke2007',
    cite: 'Brennecke, J., et al. (2007). Discrete small RNA-generating loci as master regulators of transposon activity in Drosophila. Cell.',
    tags: ['pirna', 'te_silencing', 'genomic_memory'],
    note: 'piRNA clusters as heritable TE sequence memory.',
  },
  {
    id: 'harms2016',
    cite: 'Harms, A., et al. (2016). Toxins-antitoxins: diversity, evolution and function. Nat. Rev. Microbiol.',
    tags: ['toxin_antitoxin', 'homeostasis', 'persistence'],
    note: 'TA systems as stress / persistence switches — population homeostasis peer.',
  },
  {
    id: 'allis2016',
    cite: 'Allis, C. D., & Jenuwein, T. (2016). The molecular hallmarks of epigenetic control. Nat. Rev. Genet.',
    tags: ['epigenetics', 'chromatin_memory', 'multi_scale'],
    note: 'Chromatin state as non-sequence memory tape.',
  },
  {
    id: 'prusiner1998',
    cite: 'Prusiner, S. B. (1998). Prions. PNAS.',
    tags: ['prion', 'conformational_memory'],
    note: 'Non-nucleic conformational inheritance — falsifies cutter-only bias.',
  },
  {
    id: 'mazel2006',
    cite: 'Mazel, D. (2006). Integrons: agents of bacterial evolution. Nat. Rev. Microbiol.',
    tags: ['integron', 'cassette_capture', 'hgt', 'genomic_learning'],
    note: 'Cassette arrays as adaptive genomic encoding without CRISPR spacers.',
  },
  {
    id: 'swarts2014',
    cite: 'Swarts, D. C., et al. (2014). DNA-guided DNA interference by a prokaryotic Argonaute. Nature.',
    tags: ['argonaute', 'dna_interference', 'genome_defense'],
    note: 'pAgo DNA interference — pre-/para-CRISPR nucleic guide logic.',
  },
  {
    id: 'kiga2025',
    cite: 'AI-assisted genomic co-occurrence discovery of unusual enzymes in repeated architectures (recent demonstration class; treat as method peer, not a specific wet-lab claim in this suite).',
    tags: ['ai_assisted_discovery', 'genomic_neighborhood', 'method_peer'],
    note: 'Starting observation: AI can surface overlooked relational architectures — motivation, not endpoint.',
  },
  {
    id: 'lowey2020',
    cite: 'Lowey, H., et al. (2020). CBASS immunity uses CARF-related effectors to sense 3′–5′ and 2′–5′ linked cyclic oligonucleotide signals and protect bacteria from phage infection. Cell.',
    tags: ['cbass', 'second_messenger', 'positive_control'],
    note: 'Positive-control depth: CBASS effector logic is experimentally characterized — rediscovery ≠ novelty.',
  },
  {
    id: 'millman2020cbass',
    cite: 'Millman, A., et al. (2020). Bacterial Retrons Function In Anti-Phage Defense / related CBASS surveys documenting thousands of cyclic-oligonucleotide systems (class pointer).',
    tags: ['cbass', 'survey', 'positive_control'],
    note: 'Scale of known CBASS diversity — framework validation corpus, not gap lead.',
  },
  {
    id: 'anthropic_art_class',
    cite: 'Anthropic ART-class reporting (method peer): unusual reverse transcriptase + partner gene + long repeat array after large RT survey; biological function unresolved at publication time.',
    tags: ['ai_assisted_discovery', 'reverse_transcriptase', 'gap_architecture', 'unresolved_function'],
    note: 'Gap seed: protein-centric AI found a cassette; information-loop identity remains open — C11 class.',
  },
  {
    id: 'dgr_natbiotech_2026',
    cite: 'DGR-based targeted hypermutagenesis applications (Nature Biotechnology class pointer, 2026): diversify selected sequences for phage host range, dCas9 variants, nanobodies.',
    tags: ['dgr', 'templated_diversification', 'biotech_application'],
    note: 'DGR as future-diversity writer is technologically active — still partially_known as unified architecture peer, not a blank gap.',
  },
]);

export function runLiteratureScan() {
  const tagCounts = {};
  for (const row of LITERATURE_CORPUS) {
    for (const t of row.tags) tagCounts[t] = (tagCounts[t] || 0) + 1;
  }
  return {
    n: LITERATURE_CORPUS.length,
    tagCounts,
    honesty:
      'Curated scan of available biology literature pointers for discovery triage. Not a systematic review, not CODATA, not proof of Infinite Octaves, not wet-lab CRISPR replacement.',
    rows: LITERATURE_CORPUS,
  };
}
