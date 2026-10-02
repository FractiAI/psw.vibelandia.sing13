/**
 * Blind discovery phases (computational fixture lane).
 * Phase 1 — Blind seeds (no preferred lead labeled)
 * Phase 2 — Independent literature class (known / partially_known / genuinely_unexplained / positive_control)
 * Phase 3 — Shortlist 3–5 (exclude baseline + positive-control from discovery shortlist)
 * Phase 4 — One falsifiable prediction per shortlisted candidate
 * Phase 5/6 — Wet-lab + kill-if-fails are documented, not executed here
 */

import { SHORTLIST_MIN, SHORTLIST_MAX } from './constants.mjs';
import { CANDIDATES } from './candidates.mjs';
import { researchInterest, survivesAntiBias } from './scoring.mjs';

/**
 * Phase 1 surface: architecture-only seeds without telling the search that C4 is “interesting.”
 */
export function blindDiscoverySeeds(candidates = CANDIDATES) {
  return candidates.map((c) => ({
    id: c.id,
    observedArchitecture: c.observedArchitecture,
    multiScalePattern: c.multiScalePattern,
    possibleInformationFlow: c.informationFlow,
    // Intentionally omit literatureStatus / role / provisional framing labels from the blind seed view.
  }));
}

export function classifyLiteratureBuckets(candidates = CANDIDATES) {
  const buckets = {
    known: [],
    partially_known: [],
    genuinely_unexplained: [],
    positive_control: [],
  };
  for (const c of candidates) {
    const status = c.literatureStatus;
    if (buckets[status]) buckets[status].push(c.id);
  }
  return buckets;
}

/**
 * Discovery shortlist: prefer genuinely_unexplained survivors by researchInterest,
 * then fill with partially_known actives. Never include C1 baseline or positive_control.
 */
export function buildDiscoveryShortlist(candidates = CANDIDATES) {
  const eligible = candidates
    .filter((c) => c.id !== 'C1')
    .filter((c) => c.literatureStatus !== 'positive_control')
    .filter((c) => survivesAntiBias(c).pass)
    .map((c) => ({
      id: c.id,
      provisionalName: c.provisionalName,
      literatureStatus: c.literatureStatus,
      researchInterest: Number(researchInterest(c).toFixed(4)),
      falsificationTest: c.falsificationTest,
      predictedMolecularObservation: c.predictedMolecularObservation,
      minimumExperiment: c.minimumExperiment,
      sixPointGap: c.sixPointGap || null,
    }))
    .sort((a, b) => {
      const rank = (s) => (s === 'genuinely_unexplained' ? 0 : s === 'partially_known' ? 1 : 2);
      const d = rank(a.literatureStatus) - rank(b.literatureStatus);
      return d !== 0 ? d : b.researchInterest - a.researchInterest;
    });

  const shortlist = eligible.slice(0, SHORTLIST_MAX);
  const predictionsOk = shortlist.every(
    (row) =>
      typeof row.falsificationTest === 'string' &&
      row.falsificationTest.length > 20 &&
      typeof row.predictedMolecularObservation === 'string' &&
      row.predictedMolecularObservation.length > 20,
  );

  return {
    nEligible: eligible.length,
    shortlist,
    shortlistSizeOk: shortlist.length >= SHORTLIST_MIN && shortlist.length <= SHORTLIST_MAX,
    predictionsOk,
    excludesPositiveControl: !shortlist.some((r) => r.id === 'C4'),
    honesty:
      'Shortlist is computational triage for follow-up — not a wet-lab claim and not a winner declaration. Prefer kill-if-fails over confirmation.',
  };
}

export function runBlindDiscoveryProtocol(candidates = CANDIDATES) {
  const seeds = blindDiscoverySeeds(candidates);
  const buckets = classifyLiteratureBuckets(candidates);
  const shortlist = buildDiscoveryShortlist(candidates);
  return {
    phase1_blindSeeds: { n: seeds.length, sampleIds: seeds.slice(0, 5).map((s) => s.id) },
    phase2_literatureClass: buckets,
    phase3_shortlist: shortlist,
    phase4_predictionsRequired: shortlist.predictionsOk,
    phase5_wetLab: 'Documented follow-up — cheapest clean prediction first; not executed in this suite.',
    phase6_killIfFails: 'Protocol lock: demote or discard any candidate whose falsification test fails.',
    pass:
      seeds.length >= SHORTLIST_MIN &&
      buckets.positive_control.length >= 1 &&
      buckets.genuinely_unexplained.length >= 1 &&
      shortlist.shortlistSizeOk &&
      shortlist.predictionsOk &&
      shortlist.excludesPositiveControl,
  };
}
