import { useSyncExternalStore } from 'react';
import { isCaptain } from '@/lib/captainAccess';

let captainVersion = 0;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return captainVersion;
}

export function notifyCaptainChanged() {
  captainVersion += 1;
  listeners.forEach((cb) => cb());
}

export function useCaptain(): boolean {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return isCaptain();
}
