/**
 * Hybrid natal-astrology analogs × 99 Octave digits.
 * Honesty: architectural Story map for reflection — not ephemeris, prediction, or medical advice.
 */

import { DIGIT_STORY_LABELS, GRAND_NARRATIVE_CHARACTERS } from './octave99-chart.mjs';

/** Octave “sign” flavor — natal-style language without claiming zodiac ephemeris. */
export const OCTAVE_SIGN_ANALOGS = Object.freeze([
  {
    digit: 0,
    signName: 'Void',
    element: 'Stillness',
    natalHouse: '12th-house analog · rest, retreat, reset',
    lifePillar: 'recovery',
    purposeHint: 'You find purpose by clearing noise so the real aim can appear.',
  },
  {
    digit: 1,
    signName: 'Spark',
    element: 'Fire-start',
    natalHouse: '1st-house analog · identity in motion, first moves',
    lifePillar: 'initiative',
    purposeHint: 'You find purpose by beginning — purpose shows up after the first honest step.',
  },
  {
    digit: 2,
    signName: 'Twin',
    element: 'Bond',
    natalHouse: '7th-house analog · partnership, mirroring, reciprocity',
    lifePillar: 'relationships',
    purposeHint: 'You find purpose in honest two-way bonds — not solo heroic myths.',
  },
  {
    digit: 3,
    signName: 'Forge',
    element: 'Craft',
    natalHouse: '5th/6th hybrid · making, practice, visible work',
    lifePillar: 'craft',
    purposeHint: 'You find purpose by making something real that was only an idea yesterday.',
  },
  {
    digit: 4,
    signName: 'Vessel',
    element: 'Body',
    natalHouse: '6th-house analog · health, pace, daily rhythm',
    lifePillar: 'body',
    purposeHint: 'You find purpose when the body can carry the Story — pace is part of vocation.',
  },
  {
    digit: 5,
    signName: 'Loom',
    element: 'Mind',
    natalHouse: '3rd/9th hybrid · learning, pattern, meaning',
    lifePillar: 'mind',
    purposeHint: 'You find purpose by naming the pattern others only feel.',
  },
  {
    digit: 6,
    signName: 'Circle',
    element: 'Crew',
    natalHouse: '11th-house analog · allies, teams, shared load',
    lifePillar: 'community',
    purposeHint: 'You find purpose in “we” work — clear asks, clear offers.',
  },
  {
    digit: 7,
    signName: 'Gate',
    element: 'Boundary',
    natalHouse: '8th/12th edge · limits, recovery, what enters',
    lifePillar: 'boundaries',
    purposeHint: 'You find purpose by protecting the edge — no is how the yes stays clean.',
  },
  {
    digit: 8,
    signName: 'Engine',
    element: 'Stamina',
    natalHouse: '10th-house analog · vocation burn, reputation over time',
    lifePillar: 'career',
    purposeHint: 'You find purpose in the long burn — consistency is your compass.',
  },
  {
    digit: 9,
    signName: 'Crown',
    element: 'Closure',
    natalHouse: '10th/4th close · finishing, legacy, whole-picture',
    lifePillar: 'completion',
    purposeHint: 'You find purpose by closing arcs — unfinished loops steal your aim.',
  },
]);

export const LIFE_PILLARS = Object.freeze([
  {
    id: 'self',
    title: 'Self & purpose',
    digits: [0, 1, 5],
    blurb: 'Who you are when the week is quiet enough to hear yourself.',
  },
  {
    id: 'relationships',
    title: 'Relationships & family',
    digits: [2, 6, 7],
    blurb: 'Bonds, household rhythm, and the gates that keep love sustainable.',
  },
  {
    id: 'career',
    title: 'Career & craft',
    digits: [3, 8, 9],
    blurb: 'What you make, how long you can burn, and when a chapter is done.',
  },
  {
    id: 'body',
    title: 'Body, pace & flow',
    digits: [4, 0, 8],
    blurb: 'The vessel that carries purpose — sleep, food, motion, recovery.',
  },
]);

export function analogForDigit(digit) {
  return OCTAVE_SIGN_ANALOGS[digit] || OCTAVE_SIGN_ANALOGS[0];
}

export function storyForDigit(digit) {
  return DIGIT_STORY_LABELS[digit] || DIGIT_STORY_LABELS[0];
}

export function characterForDigit(digit) {
  return GRAND_NARRATIVE_CHARACTERS[digit] || GRAND_NARRATIVE_CHARACTERS[0];
}

/**
 * Natal-style trinity mapped from chart signature digits.
 * Sun → purpose/identity · Moon → inner needs · Rising → approach.
 */
export function buildNatalHybridTrinity(chart) {
  const { sunDigit, moonDigit, risingDigit } = chart.signature;
  const sun = {
    role: 'Sun analog · purpose & identity',
    digit: sunDigit,
    analog: analogForDigit(sunDigit),
    story: storyForDigit(sunDigit),
    character: characterForDigit(sunDigit),
  };
  const moon = {
    role: 'Moon analog · inner need & private fuel',
    digit: moonDigit,
    analog: analogForDigit(moonDigit),
    story: storyForDigit(moonDigit),
    character: characterForDigit(moonDigit),
  };
  const rising = {
    role: 'Rising analog · approach & first impression',
    digit: risingDigit,
    analog: analogForDigit(risingDigit),
    story: storyForDigit(risingDigit),
    character: characterForDigit(risingDigit),
  };
  return {
    schema: 'octave99-natal-hybrid/v1',
    honesty:
      'Hybrid natal × 99 Octave map uses birth intake as a Story seed — not tropical/sidereal ephemeris, predictive astrology, or medical advice.',
    sun,
    moon,
    rising,
    purposeLine: `Purpose lock: live as ${sun.character.title} (Sun/${sun.analog.signName}), enter as ${rising.character.title} (Rising/${rising.analog.signName}), refill as ${moon.character.title} (Moon/${moon.analog.signName}).`,
    quickAlign: [
      `Morning identity (Sun): ${sun.character.morning}`,
      `Midday approach (Rising): ${rising.character.midday}`,
      `Evening refill (Moon): ${moon.character.evening}`,
    ],
  };
}
