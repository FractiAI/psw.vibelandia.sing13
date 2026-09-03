/**
 * Sin City night program illustrations —
 * J.S. Bach hosted holographically by Valet Pru, conducting Suno AI studio musicians.
 */
import { createProgramImageKit } from './program-bach-images.mjs';

const ROOM =
  'navy gold and neon Deck 3 Night Bachdoor Speakeasy on SS Vibelandia, cinematic dramatic lighting, photorealistic, no text no letters no watermark';

export const SIN_CITY_PROGRAM_ASSET_REL = '/interfaces/assets/sin-city-program';
export const SIN_CITY_PROGRAM_HERO_BASENAME = 'hero-bach-conductor';

export const SIN_CITY_PROGRAM_IMAGE_SCENES = {
  'trk-srv-1ff974cf-7864-4c5d-8b22-2c4aa493d340': {
    instrumentFocus: 'electric guitar',
    scene:
      'large clear close-up of a gold-top electric guitar at the neon threshold, pickups and fretboard dominant',
    alt: 'Electric guitar with J.S. Bach conducting — let’s go holographic tonight',
  },
  'trk-srv-5c34e10b-b181-47ff-b348-9afbaf06c083': {
    instrumentFocus: 'conga drums',
    scene:
      'large clear close-up of a pair of conga drums on the Neon Velvet floor, drumheads filling the frame',
    alt: 'Congas with J.S. Bach conducting — dos mejor q una mami',
  },
  'trk-srv-d655f33f-b031-403b-aaa4-582ebeac8636': {
    instrumentFocus: 'tenor saxophone',
    scene:
      'large clear close-up of a tenor saxophone in afterglow haze, lacquered bell facing camera',
    alt: 'Saxophone with J.S. Bach conducting — tired eyes',
  },
  'trk-srv-b033850d-4498-4a1b-9731-7bec1292fc78': {
    instrumentFocus: 'nylon-string guitar',
    scene:
      'large clear close-up of a nylon-string guitar beside mezcal and café glassware, guitar body dominant — catalog still life, not a drink ad',
    alt: 'Guitar instrument with J.S. Bach conducting — mezcal y café',
  },
  'trk-srv-4c6cf3c8-266d-46a9-bdb5-709168da455e': {
    instrumentFocus: 'electric bass guitar',
    scene:
      'large clear close-up of an electric bass guitar on the Club Omnia floor, four strings and pickups filling the frame',
    alt: 'Bass guitar with J.S. Bach conducting — ando bellaco baby',
  },
  'trk-srv-2a44cda8-f773-4d57-a8f5-c4af313a50f9': {
    instrumentFocus: 'trombone',
    scene:
      'large clear close-up of a trombone slide in after-midnight brass, bell facing camera',
    alt: 'Trombone with J.S. Bach conducting — creo q esta noche finale',
  },
  'trk-srv-e3334afe-d75a-44d6-a153-79a0013347f6': {
    instrumentFocus: 'classical guitar',
    scene:
      'large clear close-up of a classical guitar in lo-fi bolero hush, nylon strings and rosette dominant',
    alt: 'Classical guitar with J.S. Bach conducting — fumando puro bolero',
  },
};

const kit = createProgramImageKit({
  assetRel: SIN_CITY_PROGRAM_ASSET_REL,
  seedPrefix: 'sin-city-program-v1',
  room: ROOM,
  heroBasename: SIN_CITY_PROGRAM_HERO_BASENAME,
  heroPromptExtra:
    'nightclub band with clearly visible electric guitar congas saxophone nylon guitar bass trombone and classical guitar at Bachdoor Speakeasy',
  heroAlt:
    'J.S. Bach with modern headphones holographically hosting Sin City night instruments',
  defaultAlt: 'J.S. Bach conducting Sin City night instruments',
  scenes: SIN_CITY_PROGRAM_IMAGE_SCENES,
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
