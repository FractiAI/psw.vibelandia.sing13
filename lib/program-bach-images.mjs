/**
 * Shared J.S. Bach + Suno AI instrument-plate grammar for concert programs.
 * Honesty: catalog hospitality art — not historical reenactment or SI proof.
 */
import { createHash } from 'node:crypto';

export const BACH_CONDUCTOR =
  'Johann Sebastian Bach in baroque coat wearing modern wireless studio headphones, conducting with both hands as a holographic guest';

export const SUNO_STUDIO =
  'Suno AI studio musicians as living performers responding to his baton';

/**
 * @param {{ assetRel: string, seedPrefix: string, room: string, heroBasename: string, heroPromptExtra: string, heroAlt: string, defaultAlt: string, scenes: Record<string, { scene: string, alt: string, instrumentFocus: string }> }} spec
 */
export function createProgramImageKit(spec) {
  const {
    assetRel,
    seedPrefix,
    room,
    heroBasename,
    heroPromptExtra,
    heroAlt,
    defaultAlt,
    scenes,
  } = spec;

  function programImageSeedFor(id) {
    return parseInt(createHash('sha256').update(`${seedPrefix}:${id}`).digest('hex').slice(0, 8), 16) % 999999;
  }

  function programPollinationsUrl(prompt, seed) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=960&height=540&nologo=true&seed=${seed}`;
  }

  function programImagePromptForTrackId(trackId) {
    const row = scenes[trackId];
    if (!row) return `${BACH_CONDUCTOR}, ${SUNO_STUDIO}, featured instrument close-up, ${room}`;
    return `${BACH_CONDUCTOR}, ${SUNO_STUDIO}, featured instrument focus: ${row.instrumentFocus}, ${row.scene}, ${room}`;
  }

  function programImageBasenameForTrackId(trackId) {
    return trackId.replace(/^trk-srv-/, 'track-');
  }

  function programImageRelPathForTrackId(trackId) {
    return `${assetRel}/${programImageBasenameForTrackId(trackId)}.jpg`;
  }

  function programImageAltForTrackId(trackId) {
    return scenes[trackId]?.alt || defaultAlt;
  }

  function programHeroImagePrompt() {
    return `${BACH_CONDUCTOR}, ${SUNO_STUDIO}, ${heroPromptExtra}, instruments prominent across the stage, ${room}`;
  }

  function programHeroImageRelPath() {
    return `${assetRel}/${heroBasename}.jpg`;
  }

  return {
    assetRel,
    heroBasename,
    scenes,
    PROGRAM_HERO_IMAGE_ALT: heroAlt,
    programImageSeedFor,
    programPollinationsUrl,
    programImagePromptForTrackId,
    programImageBasenameForTrackId,
    programImageRelPathForTrackId,
    programImageAltForTrackId,
    programHeroImagePrompt,
    programHeroImageRelPath,
  };
}
