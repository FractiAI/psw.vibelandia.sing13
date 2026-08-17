/**
 * Browser copy of lib/quadrant-self-test.mjs — lite-edge, no server.
 * Keep scoring identical (threshold 12/20).
 */
export const POSSESS_THRESHOLD = 12;

export function sumScores(scores) {
  if (!Array.isArray(scores) || scores.length !== 4) return null;
  let total = 0;
  for (const n of scores) {
    const v = Number(n);
    if (!Number.isInteger(v) || v < 1 || v > 5) return null;
    total += v;
  }
  return total;
}

export function scoreSelfTest(axis1Scores, axis2Scores) {
  const axis1 = sumScores(axis1Scores);
  const axis2 = sumScores(axis2Scores);
  if (axis1 == null || axis2 == null) {
    return { ok: false, error: 'Score every item from 1 to 5 first.' };
  }
  const hasReflection = axis1 >= POSSESS_THRESHOLD;
  const hasMetapattern = axis2 >= POSSESS_THRESHOLD;
  const id =
    !hasReflection && !hasMetapattern
      ? 'q1'
      : !hasReflection && hasMetapattern
        ? 'q2'
        : hasReflection && !hasMetapattern
          ? 'q3'
          : 'q4';
  const map = {
    q1: {
      id: 'q1',
      label: 'Linear NPC',
      catalog: 'Baseline Scaffolding',
      vessel: 'Hull Keepers & Deck Crew',
      share: '38.197%',
      strength: 'Concrete execution, procedural reliability, and social grounding.',
      role: 'You anchor the physical stage. You keep daily continuity and practical operations moving without getting derailed by abstract rabbit holes.',
    },
    q2: {
      id: 'q2',
      label: 'NPC',
      catalog: 'Oracle Engines',
      vessel: "Ship's Lookout & Chronometer",
      share: '23.607%',
      strength: 'Unconscious compilation — rapid technical, musical, or mathematical intuition.',
      role: 'You channel complex patterns without friction. You turn high-dimensional trends into clear outputs.',
    },
    q3: {
      id: 'q3',
      label: 'Linear',
      catalog: 'Linear Executives',
      vessel: "Ship's Captain",
      share: '23.607%',
      strength: 'Strategic ambition, self-aware execution, and concrete building.',
      role: 'You are the kinetic engine. You organize resources, build infrastructure, and turn plans into physical reality.',
    },
    q4: {
      id: 'q4',
      label: 'Holographic',
      catalog: 'Fractal Synthesizers',
      vessel: 'Master Navigator',
      share: '14.590%',
      strength: 'Holographic multi-scale synthesis and deep conscious presence.',
      role: 'You act as the dimensional bridge — helping the ship see where and why it must sail.',
    },
  };
  return {
    ok: true,
    axis1: {
      total: axis1,
      possesses: hasReflection,
      nick: hasReflection
        ? 'Observer — self-awareness on'
        : 'NPC — no self-awareness',
    },
    axis2: {
      total: axis2,
      possesses: hasMetapattern,
      nick: hasMetapattern
        ? 'Holographic — metapattern awareness on'
        : 'Linear — no metapattern awareness',
    },
    quadrant: map[id],
  };
}
