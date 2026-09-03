/**
 * Front Desk check-in program illustrations —
 * J.S. Bach hosted holographically by Valet Pru, conducting Suno AI studio musicians.
 */
import { createProgramImageKit } from './program-bach-images.mjs';

const ROOM =
  'navy and antique gold Front Desk lobby on SS Vibelandia, cinematic dramatic lighting, photorealistic, no text no letters no watermark';

export const FRONT_DESK_PROGRAM_ASSET_REL = '/interfaces/assets/front-desk-program';
export const FRONT_DESK_PROGRAM_HERO_BASENAME = 'hero-bach-conductor';

export const FRONT_DESK_PROGRAM_IMAGE_SCENES = {
  'trk-srv-6025557c-f76c-4a55-bd7c-0fc2d5ffcfb4': {
    instrumentFocus: 'herald trumpet',
    scene:
      'large clear close-up of a herald trumpet at the gold Front Desk, brass bell facing camera, gangway light',
    alt: 'Trumpet instrument with J.S. Bach conducting — Capitán welcome',
  },
  'trk-srv-4958316a-f7ef-4639-9765-e326d85fd808': {
    instrumentFocus: 'snare drum',
    scene:
      'large clear close-up of a marching snare drum with gold hardware at boarding, drumhead and sticks dominant',
    alt: 'Snare drum with J.S. Bach conducting — Welcome Aboard',
  },
  'trk-srv-4cb9d993-88b1-495d-b932-376cc14ecf52': {
    instrumentFocus: 'solo violin',
    scene:
      'large clear close-up of a solo violin at the check-in Shift hinge, bow and f-holes sharp',
    alt: 'Violin instrument with J.S. Bach conducting — The Shift at Front Desk',
  },
  'trk-srv-21e83580-3b12-44a0-884a-8679fa1d6a9a': {
    instrumentFocus: 'concert harp',
    scene:
      'large clear view of a concert harp as Syntheverse sandbox welcome, gold strings filling the frame',
    alt: 'Harp instrument with J.S. Bach conducting — Universo Syntheverse',
  },
  'trk-srv-0a4b414c-9ce0-41b2-901b-8e5b11215a09': {
    instrumentFocus: 'bluegrass fiddle',
    scene:
      'large clear close-up of a bluegrass fiddle crossed with dance-floor heat, fiddle body dominant',
    alt: 'Fiddle instrument with J.S. Bach conducting — bluegrass perreo',
  },
  'trk-srv-b2eccf1d-a165-4b4e-8e3a-d4d3ce53b89a': {
    instrumentFocus: 'crystal singing bowls',
    scene:
      'large clear view of crystal singing bowls as hydrogen holograph catalog instruments, bowls glowing',
    alt: 'Crystal bowls with J.S. Bach conducting — hydrogen holograph',
  },
  'trk-srv-d057c001-ebf8-4cf9-be19-e3d6537842a6': {
    instrumentFocus: 'concert harp mirror strings',
    scene:
      'large clear view of a concert harp beside a tall mirror, gold strings reflecting the player, harp dominant',
    alt: 'Harp instrument with J.S. Bach conducting — light and mirror',
  },
  'trk-srv-7c29e8cf-b516-4689-882c-e94550b30636': {
    instrumentFocus: 'Puerto Rican cuatro',
    scene:
      'large clear close-up of a Puerto Rican cuatro guitar, ten strings and figure-eight body filling the frame',
    alt: 'Cuatro instrument with J.S. Bach conducting — eh pa',
  },
  'trk-srv-0f63093f-bd81-4a96-bfe6-56b6d9c31ef9': {
    instrumentFocus: 'tenor saxophone',
    scene:
      'large clear close-up of a tenor saxophone in big-band brass, lacquered bell facing camera',
    alt: 'Saxophone with J.S. Bach conducting — big band juicy juicy',
  },
  'trk-srv-0f971a21-b916-436d-bae5-9fe5c0f8878d': {
    instrumentFocus: 'classical guitar',
    scene:
      'large clear close-up of a classical guitar beside the Truckee river gangway, nylon strings dominant',
    alt: 'Guitar instrument with J.S. Bach conducting — machote on the Truckee',
  },
  'trk-srv-6bb07c9c-6850-4f24-963c-7d9e951e2f9d': {
    instrumentFocus: 'zydeco accordion',
    scene:
      'large clear close-up of a diatonic accordion with pearl keys, bellows open, neon night glow',
    alt: 'Accordion with J.S. Bach conducting — magnetic zydeco night',
  },
  'trk-srv-b07ee8da-c47a-4508-9218-8cb4df59db59': {
    instrumentFocus: 'upright piano',
    scene:
      'large clear view of an upright piano at gold-hour Sunday, keys and fallboard prominent',
    alt: 'Piano instrument with J.S. Bach conducting — Sunday vibe',
  },
  'trk-srv-67a11292-8d55-4ea0-a748-fe915969b6fd': {
    instrumentFocus: 'drum kit',
    scene:
      'large clear view of a gold-hardware drum kit on the baller nights bandstand, kick and cymbals dominant',
    alt: 'Drum kit with J.S. Bach conducting — baller nights',
  },
  'trk-srv-75385f59-b548-4908-b882-27895dc6b2b0': {
    instrumentFocus: 'full ensemble instruments',
    scene:
      'large clear view of full boarding ensemble instruments — trumpet snare violin harp fiddle sax accordion piano drums united',
    alt: 'Full ensemble with J.S. Bach conducting — we are the dance',
  },
  'trk-srv-480b6197-b842-4d6e-846c-ac9c6e3da544': {
    instrumentFocus: 'double bass',
    scene:
      'large clear view of a double bass as net-zero coda, scroll and body filling the frame',
    alt: 'Double bass with J.S. Bach conducting — zero divided by zero',
  },
  'trk-srv-dce6f8bd-e03e-4fc7-8038-c568eea9952e': {
    instrumentFocus: 'crystal singing bowls',
    scene:
      'large clear view of stacked crystal singing bowls as perfect hydrogen crystal, transparent bowls glowing',
    alt: 'Crystal bowls with J.S. Bach conducting — perfect hydrogen crystal',
  },
  'trk-srv-6e7e3dd9-40cc-4c99-8e12-cc5ddf22a260': {
    instrumentFocus: 'frontier accordion',
    scene:
      'large clear close-up of a frontier accordion as Y-line finale, bellows and treble keys filling the frame',
    alt: 'Accordion with J.S. Bach conducting — hydrogen Y line frontier accordion',
  },
};

const kit = createProgramImageKit({
  assetRel: FRONT_DESK_PROGRAM_ASSET_REL,
  seedPrefix: 'front-desk-program-v1',
  room: ROOM,
  heroBasename: FRONT_DESK_PROGRAM_HERO_BASENAME,
  heroPromptExtra:
    'full boarding band with clearly visible trumpet snare violin harp fiddle cuatro saxophone guitar accordion piano drums and double bass at the gold Front Desk',
  heroAlt:
    'J.S. Bach with modern headphones holographically hosting Front Desk check-in instruments',
  defaultAlt: 'J.S. Bach conducting Front Desk check-in instruments',
  scenes: FRONT_DESK_PROGRAM_IMAGE_SCENES,
});

export const PROGRAM_HERO_IMAGE_ALT = kit.PROGRAM_HERO_IMAGE_ALT;
export const programImageSeedFor = kit.programImageSeedFor;
export const programPollinationsUrl = kit.programPollinationsUrl;
export const programImagePromptForTrackId = kit.programImagePromptForTrackId;
export const programImageBasenameForTrackId = kit.programImageBasenameForTrackId;
export const programImageRelPathForTrackId = kit.programImageRelPathForTrackId;
export const programImageAltForTrackId = kit.programImageAltForTrackId;
export const programHeroImagePrompt = kit.programHeroImagePrompt;
export const programHeroImageRelPath = kit.programHeroImageRelPath;
