const STORAGE_KEY = 'qv-export-licenses';

export interface ExportLicense {
  trackId: string;
  licensedAt: string;
  licenseId?: string;
  passengerJti?: string;
}

type LicenseMap = Record<string, ExportLicense>;

function readMap(): LicenseMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LicenseMap;
  } catch {
    return {};
  }
}

function writeMap(map: LicenseMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function hasExportLicense(trackId: string): boolean {
  return !!readMap()[trackId];
}

export function listExportLicenses(): ExportLicense[] {
  return Object.values(readMap());
}

export function saveExportLicense(license: ExportLicense) {
  const map = readMap();
  map[license.trackId] = license;
  writeMap(map);
}

export function clearExportLicenses() {
  localStorage.removeItem(STORAGE_KEY);
}
