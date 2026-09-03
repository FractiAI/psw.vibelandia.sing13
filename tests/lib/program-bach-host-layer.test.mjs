import { describe, expect, it } from 'vitest';
import { CONCIERTO_PRELUDE_TRACK_IDS } from '../../lib/concierto-prelude-playlist.mjs';
import { RECEPTION_PLAYLIST_TRACK_IDS } from '../../lib/reception-playlist.mjs';
import { SIN_CITY_PLAYLIST_TRACK_IDS } from '../../lib/sin-city-playlist.mjs';
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
});
