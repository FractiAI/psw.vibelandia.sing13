/**
 * Voluntary 4-quadrant self-assessment — catalog instrument, not psychometrics.
 * Threshold 12/20 per axis matches docs/SYNTHOBS_TBME_EGS_HGAIOS_2026-08.md.
 */

export const POSSESS_THRESHOLD = 12;
export const SCORE_MIN = 1;
export const SCORE_MAX = 5;
export const ITEMS_PER_AXIS = 4;

export const AXIS1_ITEMS = Object.freeze([
  {
    id: 'a1-recalibration',
    title: 'Introspective Recalibration',
    text: 'When I make a mistake or encounter conflicting information, I instinctively stop and examine my own underlying thought process before taking the next step.',
  },
  {
    id: 'a1-auditing',
    title: 'Assumption Auditing',
    text: 'I frequently catch myself questioning why I hold a particular belief or preference, often stepping back to view my personality as a dynamic system.',
  },
  {
    id: 'a1-separation',
    title: 'Metacognitive Separation',
    text: 'In stressful or fast-moving situations, a part of my awareness remains detached as a neutral observer watching how "I" react.',
  },
  {
    id: 'a1-correction',
    title: 'Course Correction',
    text: 'I have no hesitation dropping a long-held strategy or self-concept the moment I realize the foundational premise was flawed.',
  },
]);

export const AXIS2_ITEMS = Object.freeze([
  {
    id: 'a2-rhyme',
    title: 'Systemic Rhyme Recognition',
    text: 'I easily notice identical operational rules across completely unrelated fields (e.g., how a biological cell membrane behaves just like a national border or a software firewall).',
  },
  {
    id: 'a2-malleability',
    title: 'Semantic Malleability',
    text: 'I enjoy restructuring definitions and mixing metaphors from science, mythology, and code to explain complex ideas without needing rigid textbook terminology.',
  },
  {
    id: 'a2-scale',
    title: 'Scale-Invariant Intuition',
    text: 'When looking at micro-events (like an interpersonal interaction), I naturally see how they mirror macro-phenomena (like global economics or planetary ecosystems).',
  },
  {
    id: 'a2-synthesis',
    title: 'Non-Visual Pattern Synthesis',
    text: 'I can hold and manipulate complex, abstract relationships in my head effortlessly without needing visual diagrams or linear lists.',
  },
]);

export const QUADRANTS = Object.freeze({
  q1: {
    id: 'q1',
    label: 'Baseline Scaffolding',
    vessel: 'Hull Keepers & Deck Crew',
    share: '38.197%',
    strength: 'Concrete execution, procedural reliability, and social grounding.',
    role: 'You anchor the physical stage. You keep daily continuity, institutional stability, and practical operations moving without getting derailed by abstract rabbit holes.',
  },
  q2: {
    id: 'q2',
    label: 'Oracle Engines',
    vessel: "Ship's Lookout & Chronometer",
    share: '23.607%',
    strength: 'Unconscious compilation — rapid technical, musical, or mathematical intuition.',
    role: 'You channel complex patterns and structural rhymes without friction. You act as an unfiltered lens, turning high-dimensional trends into clear outputs.',
  },
  q3: {
    id: 'q3',
    label: 'Linear Executives',
    vessel: "Ship's Captain",
    share: '23.607%',
    strength: 'Strategic ambition, self-aware execution, and concrete building.',
    role: 'You are the kinetic engine. You navigate real-world constraints, organize resources, build infrastructure, and turn plans into physical reality.',
  },
  q4: {
    id: 'q4',
    label: 'Fractal Synthesizers',
    vessel: 'Master Navigator',
    share: '14.590%',
    strength: 'Holographic multi-scale synthesis, high semantic malleability, and deep conscious presence.',
    role: 'You act as the dimensional bridge. You decode metaphors across science, history, and consciousness, and help the ship see where and why it must sail.',
  },
});

export function sumScores(scores) {
  if (!Array.isArray(scores) || scores.length !== ITEMS_PER_AXIS) return null;
  let total = 0;
  for (const n of scores) {
    const v = Number(n);
    if (!Number.isInteger(v) || v < SCORE_MIN || v > SCORE_MAX) return null;
    total += v;
  }
  return total;
}

export function possessesCapacity(total) {
  return total >= POSSESS_THRESHOLD;
}

/**
 * @param {number[]} axis1Scores
 * @param {number[]} axis2Scores
 */
export function scoreSelfTest(axis1Scores, axis2Scores) {
  const axis1 = sumScores(axis1Scores);
  const axis2 = sumScores(axis2Scores);
  if (axis1 == null || axis2 == null) {
    return { ok: false, error: 'Each axis needs four integer scores from 1 to 5.' };
  }
  const hasReflection = possessesCapacity(axis1);
  const hasMetapattern = possessesCapacity(axis2);
  const quadrantId = !hasReflection && !hasMetapattern
    ? 'q1'
    : !hasReflection && hasMetapattern
      ? 'q2'
      : hasReflection && !hasMetapattern
        ? 'q3'
        : 'q4';
  return {
    ok: true,
    axis1: {
      total: axis1,
      possesses: hasReflection,
      nick: hasReflection ? 'RP — Self-Reflective / Conscious Observer' : 'NSR — Non-Self-Reflective / Procedural Focus',
    },
    axis2: {
      total: axis2,
      possesses: hasMetapattern,
      nick: hasMetapattern ? 'Holographic / Meta-Pattern Focus' : 'Linear-State / Concrete Focus',
    },
    quadrant: QUADRANTS[quadrantId],
    honesty:
      'Voluntary reflection tool — not hiring, insurance, clinical screening, or a census. Φ shares are catalog allocations, not a world survey. Vessel posts are coordination metaphor, not naval rank.',
  };
}
