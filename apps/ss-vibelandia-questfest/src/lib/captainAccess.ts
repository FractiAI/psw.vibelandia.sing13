import { getOrCreateDeviceId } from '@/lib/mockJwt';

const CAPTAIN_DEVICES_KEY = 'hjghf-captain-devices-v1';
const CAPTAIN_PASSPHRASE =
  (import.meta.env.VITE_CAPTAIN_PASSPHRASE as string | undefined)?.trim() ||
  'golden-bachdoor-capitan';

/** Baked-in Capitan device IDs (laptop + iPhone). Add IDs after first unlock at /#/capitan. */
export const CAPTAIN_DEVICE_ALLOWLIST: string[] = [];

function readRegistered(): string[] {
  try {
    const raw = localStorage.getItem(CAPTAIN_DEVICES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeRegistered(ids: string[]): void {
  localStorage.setItem(CAPTAIN_DEVICES_KEY, JSON.stringify([...new Set(ids)]));
}

export function getCaptainDeviceId(): string {
  return getOrCreateDeviceId();
}

export function isCaptainDevice(deviceId = getCaptainDeviceId()): boolean {
  if (CAPTAIN_DEVICE_ALLOWLIST.includes(deviceId)) return true;
  return readRegistered().includes(deviceId);
}

export function isCaptain(): boolean {
  return isCaptainDevice();
}

/** Capitan unlock — registers this browser/device for upload on laptop or iPhone. */
export function unlockCaptain(passphrase: string): { ok: boolean; deviceId: string } {
  const deviceId = getCaptainDeviceId();
  if (passphrase.trim() !== CAPTAIN_PASSPHRASE) {
    return { ok: false, deviceId };
  }
  const ids = readRegistered();
  if (!ids.includes(deviceId)) {
    ids.push(deviceId);
    writeRegistered(ids);
  }
  return { ok: true, deviceId };
}

export function tryUnlockFromSearch(search: string): boolean {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const key = params.get('capitanKey') || params.get('captainKey');
  if (!key) return false;
  return unlockCaptain(key).ok;
}

export function revokeCaptainOnThisDevice(): void {
  const id = getCaptainDeviceId();
  writeRegistered(readRegistered().filter((x) => x !== id));
}
