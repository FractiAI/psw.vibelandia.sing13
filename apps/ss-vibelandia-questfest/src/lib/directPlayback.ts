/** Play track on the dock <audio> ref — must run inside the user tap (iOS Safari). */

export type DirectPlayHandler = (trackId: string, url: string) => void;

let handler: DirectPlayHandler | null = null;

export function registerDirectPlayHandler(fn: DirectPlayHandler | null): void {
  handler = fn;
}

/** Invoke from list row / play button in the same user gesture. */
export function directPlayTrack(trackId: string, url: string): boolean {
  if (!handler || !trackId || !url) return false;
  handler(trackId, url);
  return true;
}
