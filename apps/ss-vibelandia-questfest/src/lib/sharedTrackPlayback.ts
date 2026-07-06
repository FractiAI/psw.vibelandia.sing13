/** After a shared ?track= link, autoplay continues on the master catalog — not replaying the same track. */
let sharedAutoplaySeed: string | null = null;

export function setSharedTrackAutoplaySeed(trackId: string): void {
  sharedAutoplaySeed = trackId.trim() || null;
}

export function clearSharedTrackAutoplaySeed(): void {
  sharedAutoplaySeed = null;
}

/** True when the visitor arrived via share link and we should advance on pl-main. */
export function sharedTrackAutoplayFromMaster(currentTrackId: string | null): boolean {
  if (!sharedAutoplaySeed || !currentTrackId) return false;
  return sharedAutoplaySeed === currentTrackId;
}
