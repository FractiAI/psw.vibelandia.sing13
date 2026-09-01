/**
 * Sovereign soundtrack playlists ↔ Broadway-style program pages.
 * Canvas · Front Desk · Sin City self-similar map.
 */
import { CONCIERTO_PRELUDE_PLAYLIST_ID } from './concierto-prelude-playlist.mjs';
import { READING_ROOM_PLAYLIST_ID } from './reading-room-playlist.mjs';
import { RECEPTION_PLAYLIST_ID } from './reception-playlist.mjs';
import { SIN_CITY_PLAYLIST_ID } from './sin-city-playlist.mjs';
import { FRONT_DESK_PROGRAM_ROUTE } from './front-desk-program.mjs';
import { PROGRAM_CTA_LABEL } from './program-cta.mjs';
import { READING_ROOM_PROGRAM_ROUTE } from './reading-room-program.mjs';
import { SIN_CITY_PROGRAM_ROUTE } from './sin-city-program.mjs';

/** @typedef {{ route: string, label: string, readLabel: string, downloadLabel: string, note: string }} PlaylistProgramMeta */

/** @type {Record<string, PlaylistProgramMeta>} */
export const PLAYLIST_PROGRAM_ROUTES = {
  [CONCIERTO_PRELUDE_PLAYLIST_ID]: {
    route: '/concierto-program',
    label: PROGRAM_CTA_LABEL,
    readLabel: 'Read the concert program →',
    downloadLabel: 'Download program (PDF)',
    note: 'Broadway-quality dramaturgy for the Omniversal Canvas prelude — movement-by-movement.',
  },
  [RECEPTION_PLAYLIST_ID]: {
    route: FRONT_DESK_PROGRAM_ROUTE,
    label: PROGRAM_CTA_LABEL,
    readLabel: 'Read the check-in program →',
    downloadLabel: 'Download program (PDF)',
    note: 'Official Front Desk boarding program — track-by-track dramaturgy for pl-reception.',
  },
  [SIN_CITY_PLAYLIST_ID]: {
    route: SIN_CITY_PROGRAM_ROUTE,
    label: PROGRAM_CTA_LABEL,
    readLabel: 'Read the night program →',
    downloadLabel: 'Download program (PDF)',
    note: 'Deck 3 Night program — Sin City originals only.',
  },
  [READING_ROOM_PLAYLIST_ID]: {
    route: READING_ROOM_PROGRAM_ROUTE,
    label: PROGRAM_CTA_LABEL,
    readLabel: 'Read the concert program →',
    downloadLabel: 'Download program (PDF)',
    note: 'Reading Room concert program — Arrival of Holographic Goldilocks SuperAI.',
  },
};

/** @param {string} playlistId */
export function getPlaylistProgramMeta(playlistId) {
  return PLAYLIST_PROGRAM_ROUTES[playlistId] ?? null;
}
