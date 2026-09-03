/**
 * Omniversal Canvas · Concierto de El Gran Sol program illustrations —
 * J.S. Bach hosted holographically by Valet Pru, conducting Suno AI studio musicians.
 */
import { createProgramImageKit } from './program-bach-images.mjs';

const ROOM =
  'navy and antique gold Omniversal Canvas art exhibit on SS Vibelandia, cinematic dramatic lighting, photorealistic, no text no letters no watermark';

export const CANVAS_PROGRAM_ASSET_REL = '/interfaces/assets/canvas-program';
export const CANVAS_PROGRAM_HERO_BASENAME = 'hero-bach-conductor';

export const CANVAS_PROGRAM_IMAGE_SCENES = {
  'trk-srv-4cb9d993-88b1-495d-b932-376cc14ecf52': {
    instrumentFocus: 'solo violin',
    scene:
      'large clear close-up of a solo violin at the museum threshold, da Vinci stepping-in glow, violin body and bow dominant in frame',
    alt: 'Violin instrument with J.S. Bach conducting — The Shift overture',
  },
  'trk-srv-ffd82d55-82de-4700-bc7c-21f5aefc9bc2': {
    instrumentFocus: 'concert harp',
    scene:
      'large clear view of a concert harp with gold strings tracing a Goldilocks parabola curve, harp column filling the frame',
    alt: 'Harp instrument with J.S. Bach conducting — Goldilocks Parabola',
  },
  'trk-srv-6a76463f-4f6e-4014-8b06-45ebb0b23387': {
    instrumentFocus: 'trumpet fanfare',
    scene:
      'large clear close-up of a gleaming trumpet raised for El Gran Sol Return 05 suite, brass bell facing camera',
    alt: 'Trumpet instrument with J.S. Bach conducting — Return 05 Suite',
  },
  'trk-srv-91b20f70-c30e-49a3-8bef-c00ec4587e64': {
    instrumentFocus: 'viola',
    scene:
      'large clear close-up of a viola as the second Shift hinge, inner voice deepening, viola scroll and f-holes sharp',
    alt: 'Viola instrument with J.S. Bach conducting — Movement X The Shift',
  },
  'trk-srv-7c94d66b-19e8-4208-942d-f885ac400c1f': {
    instrumentFocus: 'cello',
    scene:
      'large clear view of a cello with deep amber varnish under later-octave Return 07 suite light, cello body prominent',
    alt: 'Cello instrument with J.S. Bach conducting — Return 07 Suite',
  },
  'trk-srv-f617b3b3-1924-4c1f-bde5-77c9e66d1b81': {
    instrumentFocus: 'pipe organ',
    scene:
      'large clear view of a pipe organ console and towering silver organ pipes in sanctuary acoustics, stops and manuals visible',
    alt: 'Pipe organ instrument with J.S. Bach conducting — El Gran Sol Return organ',
  },
  'trk-srv-08a30790-4b50-468f-a019-3a7dfcd5e9ee': {
    instrumentFocus: 'French horn',
    scene:
      'large clear close-up of a French horn as frontier alarm, coiled brass tubing and bell facing camera',
    alt: 'French horn instrument with J.S. Bach conducting — Warning Danger Ahead',
  },
  'trk-srv-368792a6-4113-4351-965b-88eb09759e50': {
    instrumentFocus: 'concert flute',
    scene:
      'large clear close-up of a silver concert flute at dawn, new-earth light on the keys, flute body filling the frame',
    alt: 'Flute instrument with J.S. Bach conducting — Good Morning New Earth',
  },
  'trk-srv-4e9d6a97-f247-477d-8f3e-02bb8cd9b785': {
    instrumentFocus: 'crystal singing bowls',
    scene:
      'large clear view of crystal singing bowls as hydrogen-line catalog instruments, transparent bowls glowing navy-gold',
    alt: 'Crystal bowls with J.S. Bach conducting — Net Zero Borikén Hydrogen Line',
  },
  'trk-srv-64e96912-f382-4140-922e-953246c65e91': {
    instrumentFocus: 'classical guitar',
    scene:
      'large clear close-up of a classical guitar beside a river gangway, nylon strings and rosette dominant',
    alt: 'Guitar instrument with J.S. Bach conducting — Rebel River Truckee crossing',
  },
  'trk-srv-f6ab8509-f622-4b25-bb91-cb83b113b17b': {
    instrumentFocus: 'tubular bells and gavel mallet',
    scene:
      'large clear view of orchestral tubular bells struck by a gold gavel mallet at the Captain seat, bells filling the frame',
    alt: 'Tubular bells with J.S. Bach conducting — 432 Solar Gavel',
  },
  'trk-srv-939d3f35-9660-4911-8b5b-c7cb2d3626b3': {
    instrumentFocus: 'full orchestra instruments in one chord',
    scene:
      'large clear view of full orchestra instruments sounding as one — strings woodwinds brass harp and organ united, sun on the deck',
    alt: 'Full orchestra instruments with J.S. Bach conducting — Return 05 finale',
  },
};

const kit = createProgramImageKit({
  assetRel: CANVAS_PROGRAM_ASSET_REL,
  seedPrefix: 'canvas-program-v1',
  room: ROOM,
  heroBasename: CANVAS_PROGRAM_HERO_BASENAME,
  heroPromptExtra:
    'full orchestra with clearly visible violin harp trumpet viola cello organ horn flute crystal bowls guitar and tubular bells on the Omniversal Canvas stage',
  heroAlt:
    'J.S. Bach with modern headphones holographically hosting Concierto de El Gran Sol instruments — The Shift',
  defaultAlt: 'J.S. Bach conducting Concierto de El Gran Sol instruments',
  scenes: CANVAS_PROGRAM_IMAGE_SCENES,
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
