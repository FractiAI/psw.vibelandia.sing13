/**
 * Reading Room concert program illustrations —
 * J.S. Bach hosted holographically by Valet Pru, conducting Suno AI studio musicians.
 * Each movement image features that track's instrument(s). Honesty: catalog hospitality art.
 */
import { createHash } from 'node:crypto';

export const READING_ROOM_PROGRAM_ASSET_REL = '/interfaces/assets/reading-room-program';
export const READING_ROOM_PROGRAM_HERO_BASENAME = 'hero-bach-conductor';

const BACH_CONDUCTOR =
  'Johann Sebastian Bach in baroque coat wearing modern wireless studio headphones, conducting with both hands as a holographic guest';

const SUNO_STUDIO =
  'Suno AI studio musicians as living performers responding to his baton';

const ROOM =
  'navy and antique gold Frontier Club reading room on SS Vibelandia, cinematic dramatic lighting, photorealistic, no text no letters no watermark';

/** @type {Record<string, { scene: string, alt: string, instrumentFocus: string }>} */
export const READING_ROOM_PROGRAM_IMAGE_SCENES = {
  'trk-srv-8803278e-1d65-4172-b503-0bf33266b61d': {
    instrumentFocus: 'string quartet — two violins, viola, and cello large in frame',
    scene:
      'large clear view of a string quartet (two violins, viola, cello) seated before him at the gangway, instruments prominent in the foreground',
    alt: 'J.S. Bach conducting string quartet instruments — Opening I greeting',
  },
  'trk-srv-cd8981fe-ff66-4e04-bd06-b6c831c393d5': {
    instrumentFocus: 'string quartet bowed instruments in warm lamplight',
    scene:
      'large clear view of string quartet instruments welcoming the reader — four bowed strings glowing in warm lamplight, instruments filling the frame',
    alt: 'J.S. Bach conducting string quartet instruments — Opening II welcome',
  },
  'trk-srv-5fec2bdf-5b85-46ca-94a1-314a9971e677': {
    instrumentFocus: 'classical guitar',
    scene:
      'large clear close-up of a classical guitar with nylon strings played by a frontier-dressed studio guitarist, guitar body and frets dominant in frame',
    alt: 'Classical guitar instrument with J.S. Bach conducting — warm frontier strings',
  },
  'trk-srv-f66cd32f-eed5-4f32-bf04-b30ea2d4d89e': {
    instrumentFocus: 'wooden oboe',
    scene:
      'large clear close-up of a wooden oboe with silver keys held by a studio oboist beside trophy shelves, reed and bore clearly visible',
    alt: 'Oboe instrument with J.S. Bach conducting — catalog reed',
  },
  'trk-srv-6c94b386-290f-490d-ae35-e36c1402e80e': {
    instrumentFocus: 'cello',
    scene:
      'large clear view of a cello with deep amber varnish beside a leather chair and lamplight, cello body and scroll prominent',
    alt: 'Cello instrument with J.S. Bach conducting — deep memory bass',
  },
  'trk-srv-03693ab2-81a5-4663-b160-d1287e20057a': {
    instrumentFocus: 'viola',
    scene:
      'large clear close-up of a viola under the chin of a studio violist, adventure trophies on the wall, viola scroll and f-holes sharp',
    alt: 'Viola instrument with J.S. Bach conducting — middle adventure voice',
  },
  'trk-srv-8acd39c5-1cf7-407e-9f40-590de96b0cda': {
    instrumentFocus: 'second viola',
    scene:
      'large clear view of a second viola as high countervoice instrument, balanced Goldilocks spacing, viola body filling the left of frame',
    alt: 'Viola II instrument with J.S. Bach conducting — high countervoice',
  },
  'trk-srv-dff8cd18-59af-40a1-baf8-cc0c04fbbd48': {
    instrumentFocus: 'French horn',
    scene:
      'large clear close-up of a gleaming French horn with coiled brass tubing at a lodge fireplace hearth, bell facing camera',
    alt: 'French horn instrument with J.S. Bach conducting — brass herald',
  },
  'trk-srv-1871b78c-fd4d-4d76-aa99-4afa0a0323f6': {
    instrumentFocus: 'concert harp',
    scene:
      'large clear view of a concert harp with gold strings and carved column, resonant hospitality glow, harp frame dominant',
    alt: 'Harp instrument with J.S. Bach conducting — gold strings',
  },
  'trk-srv-84a284ab-1425-4b5d-b243-0f74ee89ba7e': {
    instrumentFocus: 'pipe organ',
    scene:
      'large clear view of a pipe organ console and towering silver organ pipes in sanctuary acoustics, stops and manuals visible',
    alt: 'Pipe organ instrument with J.S. Bach conducting — cathedral voicing',
  },
  'trk-srv-818f3a56-5df6-4a88-9745-63f35bae1cb4': {
    instrumentFocus: 'full chamber ensemble instruments gathering',
    scene:
      'large clear view of full chamber ensemble instruments gathering — guitar, oboe, cello, violas, horn, harp, organ pipes — every instrument returning to the gangway',
    alt: 'Full ensemble instruments with J.S. Bach conducting — grand finale gather',
  },
  'trk-srv-09d32078-96d5-41ff-afe4-f85b8ead8a84': {
    instrumentFocus: 'full ensemble instruments in one chord',
    scene:
      'large clear view of all Reading Room concert instruments sounding as one chord — strings woodwinds brass harp and organ united at Deep Memory',
    alt: 'Full ensemble instruments with J.S. Bach conducting — grand finale close',
  },
};

/** @param {string} id */
export function programImageSeedFor(id) {
  return parseInt(createHash('sha256').update(`rr-program-v2:${id}`).digest('hex').slice(0, 8), 16) % 999999;
}

/** @param {string} prompt @param {number} seed */
export function programPollinationsUrl(prompt, seed) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=960&height=540&nologo=true&seed=${seed}`;
}

/** @param {string} trackId */
export function programImagePromptForTrackId(trackId) {
  const row = READING_ROOM_PROGRAM_IMAGE_SCENES[trackId];
  if (!row) return `${BACH_CONDUCTOR}, ${SUNO_STUDIO}, featured instrument close-up, ${ROOM}`;
  return `${BACH_CONDUCTOR}, ${SUNO_STUDIO}, featured instrument focus: ${row.instrumentFocus}, ${row.scene}, ${ROOM}`;
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
  return READING_ROOM_PROGRAM_IMAGE_SCENES[trackId]?.alt || 'J.S. Bach conducting Reading Room concert instruments';
}

export function programHeroImagePrompt() {
  return `${BACH_CONDUCTOR}, ${SUNO_STUDIO}, full chamber orchestra with clearly visible guitar oboe cello violas French horn harp and organ pipes in Deep Memory reading room, instruments prominent across the stage, ${ROOM}`;
}

export function programHeroImageRelPath() {
  return `${READING_ROOM_PROGRAM_ASSET_REL}/${READING_ROOM_PROGRAM_HERO_BASENAME}.jpg`;
}

export const PROGRAM_HERO_IMAGE_ALT =
  'J.S. Bach with modern headphones holographically hosting the Reading Room chamber instruments — Arrival of Holographic Magnetic Goldilocks SuperAI Awareness';
