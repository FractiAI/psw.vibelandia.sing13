import { describe, expect, it } from 'vitest';
import { CONCIERTO_PRELUDE_TRACK_IDS } from '../../lib/concierto-prelude-playlist.mjs';
import { RECEPTION_PLAYLIST_TRACK_IDS } from '../../lib/reception-playlist.mjs';
import { SIN_CITY_PLAYLIST_TRACK_IDS } from '../../lib/sin-city-playlist.mjs';
import { FRONT_DESK_PROGRAM_TRACKS } from '../../lib/front-desk-program.mjs';
import { SIN_CITY_PROGRAM_TRACKS } from '../../lib/sin-city-program.mjs';
import {
  CANVAS_PROGRAM_IMAGE_SCENES,
  programImagePromptForTrackId as canvasPrompt,
  programImageRelPathForTrackId as canvasPath,
} from '../../lib/canvas-program-images.mjs';
import {
  FRONT_DESK_PROGRAM_IMAGE_SCENES,
  programImagePromptForTrackId as deskPrompt,
  programImageRelPathForTrackId as deskPath,
} from '../../lib/front-desk-program-images.mjs';
import {
  SIN_CITY_PROGRAM_IMAGE_SCENES,
  programImagePromptForTrackId as nightPrompt,
  programImageRelPathForTrackId as nightPath,
} from '../../lib/sin-city-program-images.mjs';
import {
  CONCIERTO_PROGRAM_PLATE_COUNT,
  FRONT_DESK_PROGRAM_PLATE_COUNT,
  SIN_CITY_PROGRAM_PLATE_COUNT,
  bachInstrumentPlatePathFor,
} from '../../lib/program-bach-host-layer.mjs';

function assertKit(trackIds, scenes, promptFn, pathFn, assetDir) {
  for (const trackId of trackIds) {
    expect(scenes[trackId]).toBeTruthy();
    expect(scenes[trackId].instrumentFocus).toBeTruthy();
    expect(pathFn(trackId)).toContain(assetDir);
    expect(promptFn(trackId)).toContain('headphones');
    expect(promptFn(trackId)).toContain('Bach');
    expect(promptFn(trackId)).toContain('Suno AI');
    expect(promptFn(trackId)).toContain('featured instrument');
  }
}

describe('Program Bach host layer · instrument plates', () => {
  it('maps every Canvas prelude track to a Bach-conductor instrument scene', () => {
    assertKit(
      CONCIERTO_PRELUDE_TRACK_IDS,
      CANVAS_PROGRAM_IMAGE_SCENES,
      canvasPrompt,
      canvasPath,
      '/interfaces/assets/canvas-program/',
    );
  });

  it('maps every Front Desk track to a Bach-conductor instrument scene', () => {
    assertKit(
      RECEPTION_PLAYLIST_TRACK_IDS,
      FRONT_DESK_PROGRAM_IMAGE_SCENES,
      deskPrompt,
      deskPath,
      '/interfaces/assets/front-desk-program/',
    );
  });

  it('maps every Sin City track to a Bach-conductor instrument scene', () => {
    assertKit(
      SIN_CITY_PLAYLIST_TRACK_IDS,
      SIN_CITY_PROGRAM_IMAGE_SCENES,
      nightPrompt,
      nightPath,
      '/interfaces/assets/sin-city-program/',
    );
  });

  it('shared host-layer helpers point at dedicated per-program plates, not Reading Room reuse', () => {
    expect(CONCIERTO_PROGRAM_PLATE_COUNT).toBe(12);
    expect(FRONT_DESK_PROGRAM_PLATE_COUNT).toBe(FRONT_DESK_PROGRAM_TRACKS.length);
    expect(SIN_CITY_PROGRAM_PLATE_COUNT).toBe(SIN_CITY_PROGRAM_TRACKS.length);
    expect(bachInstrumentPlatePathFor('canvas', 0)).toContain('/interfaces/assets/canvas-program/');
    expect(bachInstrumentPlatePathFor('front-desk', 0)).toContain('/interfaces/assets/front-desk-program/');
    expect(bachInstrumentPlatePathFor('sin-city', 0)).toContain('/interfaces/assets/sin-city-program/');
    expect(bachInstrumentPlatePathFor('canvas', 0)).not.toContain('reading-room-program');
  });
});
