/**
 * Reading Room concert program illustrations — Hero Jo (J.S. Bach) conducting each movement.
 * Honesty: catalog hospitality art derived from playlist dramaturgy, not empirical proof.
 */
import { createHash } from 'node:crypto';

export const READING_ROOM_PROGRAM_ASSET_REL = '/interfaces/assets/reading-room-program';
export const READING_ROOM_PROGRAM_HERO_BASENAME = 'hero-bach-conductor';

const BACH_CONDUCTOR =
  'Johann Sebastian Bach in baroque coat wearing modern wireless studio headphones, conducting with both hands';

const ROOM =
  'navy and antique gold Frontier Club reading room, cinematic dramatic lighting, photorealistic, no text no letters no watermark';

/** @type {Record<string, { scene: string, alt: string }>} */
export const READING_ROOM_PROGRAM_IMAGE_SCENES = {
  'trk-srv-8803278e-1d65-4172-b503-0bf33266b61d': {
    scene: 'string quartet musicians with violin viola and cello seated before him at the gangway',
    alt: 'J.S. Bach with headphones conducting string quartet greeting — Opening I',
  },
  'trk-srv-cd8981fe-ff66-4e04-bd06-b6c831c393d5': {
    scene: 'string quartet musicians welcoming the reader, four bowed strings in warm lamplight',
    alt: 'J.S. Bach with headphones conducting quartet welcome — Opening II',
  },
  'trk-srv-5fec2bdf-5b85-46ca-94a1-314a9971e677': {
    scene: 'solo classical guitarist in old-school frontier dress playing warm nylon strings',
    alt: 'J.S. Bach with headphones conducting guitar solo — warm frontier strings',
  },
  'trk-srv-f66cd32f-eed5-4f32-bf04-b30ea2d4d89e': {
    scene: 'solo oboist with wooden oboe and catalog reed posture beside trophy shelves',
    alt: 'J.S. Bach with headphones conducting oboe solo — catalog reed',
  },
  'trk-srv-6c94b386-290f-490d-ae35-e36c1402e80e': {
    scene: 'solo cellist with deep memory bass tone, leather chair and lamplight',
    alt: 'J.S. Bach with headphones conducting cello solo — deep memory bass',
  },
  'trk-srv-03693ab2-81a5-4663-b160-d1287e20057a': {
    scene: 'first violist in middle register, adventure trophies on the wall behind',
    alt: 'J.S. Bach with headphones conducting viola I — middle adventure voice',
  },
  'trk-srv-8acd39c5-1cf7-407e-9f40-590de96b0cda': {
    scene: 'second violist as high countervoice, balanced Goldilocks spacing in the ensemble',
    alt: 'J.S. Bach with headphones conducting viola II — high countervoice',
  },
  'trk-srv-dff8cd18-59af-40a1-baf8-cc0c04fbbd48': {
    scene: 'French horn player with brass herald at a lodge fireplace hearth',
    alt: 'J.S. Bach with headphones conducting horn solo — brass herald',
  },
  'trk-srv-1871b78c-fd4d-4d76-aa99-4afa0a0323f6': {
    scene: 'harpist with gold strings and resonant hospitality glow',
    alt: 'J.S. Bach with headphones conducting harp solo — gold strings',
  },
  'trk-srv-84a284ab-1425-4b5d-b243-0f74ee89ba7e': {
    scene: 'organist at pipe organ with cathedral voicing in sanctuary acoustics',
    alt: 'J.S. Bach with headphones conducting organ solo — cathedral voicing',
  },
  'trk-srv-818f3a56-5df6-4a88-9745-63f35bae1cb4': {
    scene: 'full chamber ensemble gathering, every solo musician returning to the gangway',
    alt: 'J.S. Bach with headphones conducting grand finale gather — all voices converge',
  },
  'trk-srv-09d32078-96d5-41ff-afe4-f85b8ead8a84': {
    scene: 'full ensemble grand close, all musicians in one chord at Deep Memory reading room',
    alt: 'J.S. Bach with headphones conducting grand finale close — Reading Room resolves',
  },
};

/** @param {string} id */
export function programImageSeedFor(id) {
  return parseInt(createHash('sha256').update(`rr-program:${id}`).digest('hex').slice(0, 8), 16) % 999999;
}

/** @param {string} prompt @param {number} seed */
export function programPollinationsUrl(prompt, seed) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=960&height=540&nologo=true&seed=${seed}`;
}

/** @param {string} trackId */
export function programImagePromptForTrackId(trackId) {
  const row = READING_ROOM_PROGRAM_IMAGE_SCENES[trackId];
  if (!row) return `${BACH_CONDUCTOR}, ${ROOM}`;
  return `${BACH_CONDUCTOR}, ${row.scene}, ${ROOM}`;
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
  return READING_ROOM_PROGRAM_IMAGE_SCENES[trackId]?.alt || 'J.S. Bach conducting Reading Room concert';
}

export function programHeroImagePrompt() {
  return `${BACH_CONDUCTOR}, full chamber orchestra with guitar oboe cello violas horn harp and organ musicians in Deep Memory reading room, ${ROOM}`;
}

export function programHeroImageRelPath() {
  return `${READING_ROOM_PROGRAM_ASSET_REL}/${READING_ROOM_PROGRAM_HERO_BASENAME}.jpg`;
}

export const PROGRAM_HERO_IMAGE_ALT =
  'J.S. Bach with modern headphones conducting the Reading Room chamber ensemble — Arrival of Holographic Goldilocks SuperAI';
