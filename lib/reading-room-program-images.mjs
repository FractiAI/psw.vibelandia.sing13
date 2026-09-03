/**
 * Reading Room concert program illustrations — J.S. Bach hosting each movement,
 * with the featured instrument as the visual hero.
 * Honesty: catalog hospitality art derived from playlist dramaturgy, not empirical proof.
 */
import { createHash } from 'node:crypto';

export const READING_ROOM_PROGRAM_ASSET_REL = '/interfaces/assets/reading-room-program';
export const READING_ROOM_PROGRAM_HERO_BASENAME = 'hero-bach-conductor';

const BACH_HOST =
  'recognizable Johann Sebastian Bach with baroque powdered wig and coat, wearing modern wireless studio headphones, conducting with both hands, luminous holographic edge light';

const STUDIO =
  'soft holographic Suno AI session musicians in the background, navy and antique gold Frontier Club reading room, cinematic dramatic lighting, photorealistic, no text no letters no watermark';

/** @type {Record<string, { instrument: string, scene: string, alt: string }>} */
export const READING_ROOM_PROGRAM_IMAGE_SCENES = {
  'trk-srv-8803278e-1d65-4172-b503-0bf33266b61d': {
    instrument: 'string quartet — two violins, viola, and cello',
    scene:
      'large detailed string quartet instruments (two violins, viola, cello) in the foreground on a music stand',
    alt: 'String quartet instruments — Opening I · J.S. Bach hosts holographically',
  },
  'trk-srv-cd8981fe-ff66-4e04-bd06-b6c831c393d5': {
    instrument: 'string quartet ensemble bows',
    scene:
      'large detailed four bowed string instruments of a welcoming string quartet in the foreground',
    alt: 'String quartet instruments — Opening II · J.S. Bach hosts holographically',
  },
  'trk-srv-5fec2bdf-5b85-46ca-94a1-314a9971e677': {
    instrument: 'classical guitar',
    scene:
      'large detailed classical nylon-string guitar filling the foreground, warm wood grain',
    alt: 'Classical guitar — Guitar movement · J.S. Bach hosts holographically',
  },
  'trk-srv-f66cd32f-eed5-4f32-bf04-b30ea2d4d89e': {
    instrument: 'wooden oboe',
    scene: 'large detailed wooden oboe and reed filling the foreground',
    alt: 'Oboe — catalog reed · J.S. Bach hosts holographically',
  },
  'trk-srv-6c94b386-290f-490d-ae35-e36c1402e80e': {
    instrument: 'cello',
    scene: 'large detailed cello and bow filling the foreground',
    alt: 'Cello — deep memory bass · J.S. Bach hosts holographically',
  },
  'trk-srv-03693ab2-81a5-4663-b160-d1287e20057a': {
    instrument: 'viola',
    scene: 'large detailed viola filling the foreground',
    alt: 'Viola I — middle adventure voice · J.S. Bach hosts holographically',
  },
  'trk-srv-8acd39c5-1cf7-407e-9f40-590de96b0cda': {
    instrument: 'second viola',
    scene: 'large detailed second viola filling the foreground as countervoice',
    alt: 'Viola II — high countervoice · J.S. Bach hosts holographically',
  },
  'trk-srv-dff8cd18-59af-40a1-baf8-cc0c04fbbd48': {
    instrument: 'French horn',
    scene: 'large detailed French horn brass bell filling the foreground',
    alt: 'French horn — brass herald · J.S. Bach hosts holographically',
  },
  'trk-srv-1871b78c-fd4d-4d76-aa99-4afa0a0323f6': {
    instrument: 'concert harp',
    scene: 'large detailed concert harp with gold strings filling the foreground',
    alt: 'Harp — gold strings · J.S. Bach hosts holographically',
  },
  'trk-srv-84a284ab-1425-4b5d-b243-0f74ee89ba7e': {
    instrument: 'pipe organ',
    scene: 'large detailed pipe organ ranks and manuals filling the foreground',
    alt: 'Organ — cathedral voicing · J.S. Bach hosts holographically',
  },
  'trk-srv-818f3a56-5df6-4a88-9745-63f35bae1cb4': {
    instrument: 'full chamber ensemble instruments',
    scene:
      'large still-life of guitar, oboe, cello, violas, French horn, harp, and organ gathered in the foreground',
    alt: 'Full ensemble instruments — Finale I gather · J.S. Bach hosts holographically',
  },
  'trk-srv-09d32078-96d5-41ff-afe4-f85b8ead8a84': {
    instrument: 'full ensemble closing chord',
    scene:
      'large still-life of every featured instrument arranged in one closing chord in the foreground',
    alt: 'Full ensemble instruments — Finale II close · J.S. Bach hosts holographically',
  },
};

/** @param {string} id */
export function programImageSeedFor(id) {
  return parseInt(createHash('sha256').update(`rr-program-bach-instr-v2-2026:${id}`).digest('hex').slice(0, 8), 16) % 999999;
}

/** @param {string} prompt @param {number} seed */
export function programPollinationsUrl(prompt, seed) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=960&height=540&nologo=true&seed=${seed}`;
}

/** @param {string} trackId */
export function programImagePromptForTrackId(trackId) {
  const row = READING_ROOM_PROGRAM_IMAGE_SCENES[trackId];
  if (!row) {
    return `${BACH_HOST} standing behind featured musical instruments in the foreground, ${STUDIO}`;
  }
  return `${row.scene}, and behind them ${BACH_HOST}, featured instrument focus: ${row.instrument}, ${STUDIO}`;
}

/** @param {string} trackId */
export function programImageBasenameForTrackId(trackId) {
  return trackId.replace(/^trk-srv-/, 'track-');
}

/** @param {string} trackId */
export function programImageRelPathForTrackId(trackId) {
  return `${READING_ROOM_PROGRAM_ASSET_REL}/${programImageBasenameForTrackId(trackId)}.jpg`;
}

/** @param {string} trackId */
export function programImageAltForTrackId(trackId) {
  return READING_ROOM_PROGRAM_IMAGE_SCENES[trackId]?.alt || 'Featured instrument · J.S. Bach hosts Reading Room concert holographically';
}

export function programHeroImagePrompt() {
  return `${BACH_HOST} as the clear main subject hosting a chamber concert, large guitar oboe cello violas French horn harp and pipe organ arranged in front of him, ${STUDIO}`;
}

export function programHeroImageRelPath() {
  return `${READING_ROOM_PROGRAM_ASSET_REL}/${READING_ROOM_PROGRAM_HERO_BASENAME}.jpg`;
}

export const PROGRAM_HERO_IMAGE_ALT =
  'Featured chamber instruments with holographic J.S. Bach hosting — Arrival of Holographic Magnetic Goldilocks SuperAI Awareness';
