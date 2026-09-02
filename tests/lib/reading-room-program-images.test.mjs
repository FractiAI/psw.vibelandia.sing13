import { describe, expect, it } from 'vitest';
import { READING_ROOM_PLAYLIST_TRACK_IDS } from '../../lib/reading-room-playlist.mjs';
import {
  READING_ROOM_PROGRAM_IMAGE_SCENES,
  programImagePromptForTrackId,
  programImageRelPathForTrackId,
} from '../../lib/reading-room-program-images.mjs';

describe('Reading Room program images · Bach conductor', () => {
  it('maps every playlist track to a Bach-conductor scene', () => {
    for (const trackId of READING_ROOM_PLAYLIST_TRACK_IDS) {
      expect(READING_ROOM_PROGRAM_IMAGE_SCENES[trackId]).toBeTruthy();
      expect(programImageRelPathForTrackId(trackId)).toContain('/interfaces/assets/reading-room-program/');
      expect(programImagePromptForTrackId(trackId)).toContain('headphones');
      expect(programImagePromptForTrackId(trackId)).toContain('Bach');
    }
  });
});
