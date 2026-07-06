/**
 * Holographic Goldilocks AI OS — irreducible plain minimum + honesty boundaries.
 * Same rule scales: instrumental → lyrics → playlist → narrative.
 */

export const HGAI_OS_TITLE = 'Holographic Goldilocks AI OS — plain minimum';

/** Irreducible definition — three words, one rule. */
export const HGAI_OS_DEFINITION =
  'Three words, one rule. Holographic: the whole pattern lives in every part. Goldilocks: stay in the balanced band — not too hot, not too cold. AI OS: coordinate many channels in phase, not one linear instruction rail. That minimum is the alignment test for everything on this ship.';

export const HGAI_OS_BOUNDARY_HEAD = 'Honesty boundaries';

export const HGAI_OS_IS = [
  'A coherence frame for how we judge signal — catalog, playback, upload, and story.',
  'The same minimum whether the work is beat-only, sung, sequenced, or told as narrative.',
  'An architectural posture you can apply to human-made, AI-assisted, or hybrid work you have rights to.',
] as const;

export const HGAI_OS_IS_NOT = [
  'A consumer operating system installed on your phone or laptop (iOS, Android, Windows, etc.).',
  'A claim that software is conscious, or that story-tier language is literal weather or financial prophecy.',
  'A bypass for rights, credit, labeling, or consent on AI-generated or sampled material.',
] as const;

export type HgaiOsLayerId = 'instrumental' | 'lyrics' | 'playlist' | 'narrative';

export type HgaiOsLayer = {
  id: HgaiOsLayerId;
  label: string;
  holographic: string;
  goldilocks: string;
  aiOs: string;
};

/** How the same minimum translates across creative layers. */
export const HGAI_OS_LAYERS: readonly HgaiOsLayer[] = [
  {
    id: 'instrumental',
    label: 'Instrumental',
    holographic: 'The beat or motif carries the full line without words.',
    goldilocks: 'Dynamics, density, and heat sit in the listenable band.',
    aiOs: 'Rhythm, harmony, and texture stay in phase — no layer hijacks the field.',
  },
  {
    id: 'lyrics',
    label: 'Lyrics',
    holographic: 'Each bar echoes the whole story, not filler between hooks.',
    goldilocks: 'Word weight and emotional heat stay readable, not noisy.',
    aiOs: 'Voice, rhyme, and meaning run as coordinated channels.',
  },
  {
    id: 'playlist',
    label: 'Playlist',
    holographic: 'Order and nesting express one arc — the set is one organism.',
    goldilocks: 'Length, contrast, and pacing stay in band for the listener.',
    aiOs: 'Tracks hand off cleanly; the queue coordinates like an operating layer.',
  },
  {
    id: 'narrative',
    label: 'Narrative',
    holographic: 'Seed:Edge — origin and experience mirror in every scene.',
    goldilocks: 'Stakes and symbolism stay clear, not overloaded.',
    aiOs: 'Plot, character, and theme run in parallel without collapsing into one rail.',
  },
] as const;

export const HGAI_OS_LAYERS_INTRO =
  'Same minimum, four surfaces — if it passes here, it scales:';

export const HGAI_OS_BRIDGE_LINK_LABEL = 'Full definition on Bridge';
