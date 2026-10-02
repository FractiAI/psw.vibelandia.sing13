/**
 * Curated literature / data scan — not exhaustive meta-analysis.
 * Rubric tags structural rhymes with the experiment (compression, hierarchy, predictive coding, RG, basins).
 */

export const LITERATURE_CORPUS = Object.freeze([
  {
    id: 'shannon1948',
    cite: 'Shannon, C. E. (1948). A Mathematical Theory of Communication.',
    tags: ['compression', 'information'],
    note: 'Useful-information objective ancestor; rate vs fidelity trade-off.',
  },
  {
    id: 'mallat1989',
    cite: 'Mallat, S. (1989). A theory for multiresolution signal decomposition.',
    tags: ['hierarchical', 'multiscale'],
    note: 'Wavelet / pyramid coarse→fine encoding peer for Agent B.',
  },
  {
    id: 'rao1999',
    cite: 'Rao, R. P. N., & Ballard, D. H. (1999). Predictive coding in the visual cortex.',
    tags: ['predictive_coding', 'hierarchy'],
    note: 'Local prediction of residuals; rhyme with least-cost useful prediction.',
  },
  {
    id: 'wilson1971',
    cite: 'Wilson, K. G. (1971). Renormalization group and critical phenomena.',
    tags: ['renormalization', 'multiscale'],
    note: 'Scale-to-scale compression as physics grammar — Soft Story peer only.',
  },
  {
    id: 'hinton2006',
    cite: 'Hinton, G. E., et al. (2006). A fast learning algorithm for deep belief nets.',
    tags: ['hierarchical', 'representation_learning'],
    note: 'Layered representation learning without named fractal vocabulary.',
  },
  {
    id: 'olshausen1996',
    cite: 'Olshausen, B. A., & Field, D. J. (1996). Emergence of simple-cell receptive field properties by learning a sparse code for natural images.',
    tags: ['sparse_coding', 'compression'],
    note: 'Independent optimization rediscovering efficient codes — closest methodological peer.',
  },
  {
    id: 'friston2010',
    cite: 'Friston, K. (2010). The free-energy principle: a unified brain theory?',
    tags: ['predictive_coding', 'homeostasis_rhyme'],
    note: 'Bounded surprise / adaptive precision — Soft Story rhyme with Agent D, not endorsement.',
  },
  {
    id: 'bengio2013',
    cite: 'Bengio, Y., Courville, A., & Vincent, P. (2013). Representation learning: A review and new perspectives.',
    tags: ['representation_learning', 'hierarchy'],
    note: 'Survey of why representation search is the object — frames Phase 2/3.',
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
      'Curated scan of available canonical literature pointers for protocol design. Not a systematic review, not CODATA, not proof of Infinite Octaves.',
    rows: LITERATURE_CORPUS,
  };
}
