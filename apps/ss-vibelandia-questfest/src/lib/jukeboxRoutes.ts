/** Jukebox Listen routes — browse vs now playing. */
export const JUKEBOX_LISTEN_PATH = '/listen';
export const JUKEBOX_NOW_PLAYING_PATH = '/listen/now';

export function jukeboxPlaylistEditHref(playlistId: string): string {
  return `${JUKEBOX_LISTEN_PATH}?edit=${encodeURIComponent(playlistId)}`;
}
