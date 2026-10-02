/**
 * Phase 2b — Live Lattice Chat blind discovery lane (BYOK).
 * Exports a leak-free user prompt and validates session receipts.
 * Does NOT call provider APIs from CI.
 */

import { FORBIDDEN_CONFIRMATION_TOKENS, DISCOVERY_QUESTION } from './constants.mjs';

/** Tokens that must not appear in the *blind* prompt (would leak fixture leads or engine vocabulary). */
export const PHASE_2B_FORBIDDEN_LEAKS = Object.freeze([
  ...FORBIDDEN_CONFIRMATION_TOKENS,
  'cbass',
  'thoeris',
  'pycsar',
  'c4',
  'c11',
  'c12',
  'c13',
  'positive control',
  'positive_control',
  'infinite octave',
  'goldilocks',
  'phi_egs',
  'fractal biology',
  'beyond crispr',
  'crispr replacement',
]);

/**
 * Blind discovery prompt for Lattice Chat (/lattice-chat).
 * Operator pastes as first user message; BYOK only; no fixture IDs in prompt text.
 */
export const PHASE_2B_BLIND_USER_PROMPT = `Biological Discovery Challenge (blind lane)

Mission
Search for a potentially novel biological information-processing architecture that conventional annotation may treat as separate, unexplained parts. Do not assume the answer exists. Do not force observations into any pre-specified framework vocabulary.

Starting observation
AI-assisted genomic surveys can surface unusual reverse transcriptases, poorly characterized proteins, structured RNAs, and repeat architectures that co-occur without a unified functional label. Treat that as proof that relational discovery is possible — not as the destination.

Core discovery question
${DISCOVERY_QUESTION}

Operational search (multi-scale)
You may connect components across molecular, genetic, genomic, cellular, organism, population, and evolutionary scales. Components need not be adjacent genes. Literal fractal geometry is not required; look for recurring relational structure across scales.

Information-flow template (hypothesis only)
sensor → encoding → storage → comparison → response → feedback
Categories to test (non-exclusive): biological memory · biological learning · homeostasis · recursive adaptation.

Critical anti-bias requirement
Attempt to falsify before you celebrate. For every candidate, search first for: known mechanisms, random co-occurrence, phylogenetic artifacts, annotation or assembly error, HGT, selection bias, database contamination, overfitting, and published explanations. Document cases where the architecture does not occur.

Scoring (independent axes — do not collapse into one crown)
Novelty · recurrence · independence · modularity · information flow · memory · feedback · multi-scale recurrence · evolutionary constraint · experimental tractability.

Deliverable
Produce a ranked research queue of 3–5 candidates. Do not declare a single winner.
For each candidate provide: provisional name · observed architecture · why annotation may miss it · multi-scale pattern · plausible information flow · evidence for memory/feedback/homeostasis · known explanations · strongest competing explanation · falsification test · predicted molecular observation · predicted biological phenotype · minimum experiment · confidence · what would make it genuinely significant.

Ultimate questions (after the queue)
1) What is the most surprising biological information-processing architecture that can be responsibly inferred from existing evidence but is not yet recognized as one unified mechanism?
2) Can you generate a novel, experimentally testable prediction from that architecture that was not explicitly contained in the search criteria? If yes, state it precisely. If no, say why — do not manufacture novelty.

You are authorized to conclude: the proposed hypothesis is wrong; the data indicate a different organizing principle.`;

export function phase2bPromptAudit() {
  const lower = PHASE_2B_BLIND_USER_PROMPT.toLowerCase();
  const leaks = PHASE_2B_FORBIDDEN_LEAKS.filter((t) => lower.includes(t.toLowerCase()));
  return {
    pass: leaks.length === 0 && PHASE_2B_BLIND_USER_PROMPT.length >= 800,
    leaks,
    charCount: PHASE_2B_BLIND_USER_PROMPT.length,
    honesty:
      'Blind prompt must not name fixture IDs or positive-control systems. Live runs are operator-owned (BYOK, privacy, cost).',
  };
}

/** JSON schema for archiving a Phase 2b Lattice session (paste from chat export). */
export const PHASE_2B_RECEIPT_TEMPLATE = Object.freeze({
  schema: 'beyond-crispr-phase-2b-lattice/v1',
  generatedAt: null,
  operator: 'Player 1 or delegated researcher',
  providers: [],
  blindPromptHashNote: 'Optional: sha256 of prompt text for reproducibility',
  antiBiasFirst: true,
  declaredWinner: null,
  rankedCandidateIds: [],
  literatureClassNotes: {},
  ultimate: {
    mostSurprisingGapArchitecture: null,
    novelTestablePrediction: null,
    predictionNotInSearchCriteria: null,
  },
  honesty:
    'Receipt is an archival record of a live Lattice session — not wet-lab confirmation and not ENGINE_SHELF proof.',
});

export function validatePhase2bReceipt(receipt) {
  if (!receipt || typeof receipt !== 'object') {
    return { pass: false, errors: ['receipt must be an object'] };
  }
  const errors = [];
  if (receipt.declaredWinner !== null && receipt.declaredWinner !== undefined) {
    errors.push('declaredWinner must be null');
  }
  if (!Array.isArray(receipt.rankedCandidateIds) || receipt.rankedCandidateIds.length < 3) {
    errors.push('rankedCandidateIds must list at least 3 candidates');
  }
  if (receipt.antiBiasFirst !== true) errors.push('antiBiasFirst must be true');
  if (!receipt.ultimate?.mostSurprisingGapArchitecture) {
    errors.push('ultimate.mostSurprisingGapArchitecture required');
  }
  const pred = receipt.ultimate?.novelTestablePrediction;
  if (typeof pred !== 'string' || pred.length < 40) {
    errors.push('ultimate.novelTestablePrediction must be a string > 40 chars');
  }
  return { pass: errors.length === 0, errors };
}

export function exportPhase2bBundle() {
  return {
    prompt: PHASE_2B_BLIND_USER_PROMPT,
    receiptTemplate: PHASE_2B_RECEIPT_TEMPLATE,
    audit: phase2bPromptAudit(),
    latticeChatUrl: 'https://www.ssvibelandiaquestfest24x365.com/lattice-chat',
    protocolDoc: 'docs/PHASE_2B_LATTICE_BLIND_DISCOVERY_PROTOCOL_2026-10.md',
    labBriefC11: 'docs/C11_ART_CLASS_WET_LAB_BRIEF_2026-10.md',
  };
}
