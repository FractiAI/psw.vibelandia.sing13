/**
 * THALIA → Omni-Lattice Goldilocks engine contract.
 * Methodological harness stages as processing invariants — not a Python runtime port.
 * Source: docs/SYNTHOBS_OMNI_LATTICE_THALIA_GOLDILOCKS_HARNESS_2026-08.md
 * Upstream: https://github.com/docxology/thalia (DOI 10.5281/zenodo.21763245)
 */

export const THALIA_OMNI_DOC =
  'docs/SYNTHOBS_OMNI_LATTICE_THALIA_GOLDILOCKS_HARNESS_2026-08.md';

export const THALIA_OMNI_REGISTRY_ID =
  'synthobs-omni-lattice-thalia-goldilocks-2026-08';

/** Five THALIA stages mapped onto nest / Omni bands. */
export const THALIA_STAGES = Object.freeze([
  Object.freeze({
    id: 'inspector',
    index: 0,
    name: 'Inspector',
    nestBand: 'Seed·RAG pinch',
    invariant: 'Full corpus stays external; only selected evidence windows enter the model',
  }),
  Object.freeze({
    id: 'retriever',
    index: 1,
    name: 'Retriever',
    nestBand: 'lexical-first hybrid',
    invariant: 'Literal / path anchors before semantic paraphrase',
  }),
  Object.freeze({
    id: 'reasoner',
    index: 2,
    name: 'Reasoner',
    nestBand: 'typed MCA crystallize',
    invariant: 'One LM boundary; typed answer with citation support',
  }),
  Object.freeze({
    id: 'memory-gate',
    index: 3,
    name: 'Memory Gate',
    nestBand: 'honesty / evidence tier',
    invariant: 'Append-only raw episodes; gated consolidation only',
  }),
  Object.freeze({
    id: 'compiler',
    index: 4,
    name: 'Compiler',
    nestBand: 'offline empirical lane',
    invariant: 'Offline search traces; winners do not silently upgrade live claims',
  }),
]);

/** Organization lines merged into Lattice Chat execution envelopes. */
export const THALIA_ORGANIZATION = Object.freeze([
  'THALIA Goldilocks: Inspector pinch — pointers/windows, not full corpus dumps',
  'THALIA Goldilocks: lexical-first retrieval before semantic paraphrase',
  'THALIA Goldilocks: one LM boundary; typed Reasoner envelope',
  'THALIA Goldilocks: append-only episodes; Memory Gate never overwrites raw evidence',
  'THALIA Goldilocks: Compiler stays offline — no silent live claim upgrade',
]);

/**
 * @returns {{ doc: string, registryId: string, stages: typeof THALIA_STAGES, organization: string[] }}
 */
export function getThaliaOmniContract() {
  return {
    doc: THALIA_OMNI_DOC,
    registryId: THALIA_OMNI_REGISTRY_ID,
    upstream: 'https://github.com/docxology/thalia',
    doi: '10.5281/zenodo.21763245',
    stages: THALIA_STAGES,
    organization: [...THALIA_ORGANIZATION],
  };
}

/**
 * True when the ask is about THALIA / typed harness integration.
 * @param {string} message
 */
export function isThaliaAsk(message) {
  const m = String(message || '').toLowerCase();
  return /thalia|typed.?harness|lexical.?integrated|memory.?gate|mipro|gepa.?trace|docxology/.test(
    m,
  );
}
