import { describe, expect, it } from 'vitest';
import {
  CONCIERTO_PROGRAM_INSTRUMENTS,
  FRONT_DESK_PROGRAM_INSTRUMENTS,
  SIN_CITY_PROGRAM_INSTRUMENTS,
  bachInstrumentPlatePath,
} from '../../lib/program-bach-host-layer.mjs';
import { FRONT_DESK_PROGRAM_TRACKS } from '../../lib/front-desk-program.mjs';
import { SIN_CITY_PROGRAM_TRACKS } from '../../lib/sin-city-program.mjs';

describe('Bach host layer · shared concert programs', () => {
  it('maps one instrument plate per Front Desk, Sin City, and Concierto movement', () => {
    expect(FRONT_DESK_PROGRAM_INSTRUMENTS).toHaveLength(FRONT_DESK_PROGRAM_TRACKS.length);
    expect(SIN_CITY_PROGRAM_INSTRUMENTS).toHaveLength(SIN_CITY_PROGRAM_TRACKS.length);
    expect(CONCIERTO_PROGRAM_INSTRUMENTS).toHaveLength(12);
    expect(bachInstrumentPlatePath('organ')).toContain('reading-room-program/');
  });
});
