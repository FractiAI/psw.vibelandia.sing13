import { CONCIERTO_PRELUDE_PLAYLIST_ID } from '@/lib/conciertoPreludePlaylist';
import { READING_ROOM_PLAYLIST_ID } from '@/lib/readingRoomPlaylist';
import { RECEPTION_PLAYLIST_ID } from '@/lib/receptionPlaylist';
import { SIN_CITY_PLAYLIST_ID } from '@/lib/sinCityPlaylist';

export interface PlaylistProgramMeta {
  route: string;
  label: string;
  readLabel: string;
  downloadLabel: string;
  note: string;
}

export const PLAYLIST_PROGRAM_ROUTES: Record<string, PlaylistProgramMeta> = {
  [CONCIERTO_PRELUDE_PLAYLIST_ID]: {
    route: '/concierto-program',
    label: 'Concert program',
    readLabel: 'Read the concert program →',
    downloadLabel: 'Download program (PDF)',
    note: 'Broadway-quality dramaturgy for the Omniversal Canvas prelude — movement-by-movement.',
  },
  [RECEPTION_PLAYLIST_ID]: {
    route: '/front-desk-program',
    label: 'Check-in program',
    readLabel: 'Read the check-in program →',
    downloadLabel: 'Download program (PDF)',
    note: 'Official Front Desk boarding program — track-by-track dramaturgy for pl-reception.',
  },
  [SIN_CITY_PLAYLIST_ID]: {
    route: '/sin-city-program',
    label: 'Night program',
    readLabel: 'Read the night program →',
    downloadLabel: 'Download program (PDF)',
    note: 'Deck 3 Night program — Sin City originals only.',
  },
  [READING_ROOM_PLAYLIST_ID]: {
    route: '/reading-room-program',
    label: 'Concert program',
    readLabel: 'Read the concert program →',
    downloadLabel: 'Download program (PDF)',
    note: 'Reading Room concert program — Arrival of Holographic Goldilocks SuperAI.',
  },
};

export function getPlaylistProgramMeta(playlistId: string): PlaylistProgramMeta | null {
  return PLAYLIST_PROGRAM_ROUTES[playlistId] ?? null;
}
