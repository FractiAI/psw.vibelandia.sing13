/** Jukebox Listen routes — browse vs now playing. */
export const JUKEBOX_LISTEN_PATH = '/listen';
export const JUKEBOX_NOW_PLAYING_PATH = '/listen/now';

/** True for /listen and /listen/now (compact bottom chrome — no cover-in-bar). */
export function isJukeboxListenPath(pathname: string): boolean {
  return pathname === JUKEBOX_LISTEN_PATH || pathname === JUKEBOX_NOW_PLAYING_PATH;
}

export function jukeboxPlaylistEditHref(playlistId: string): string {
  return `${JUKEBOX_LISTEN_PATH}?edit=${encodeURIComponent(playlistId)}`;
}
