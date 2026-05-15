const STORAGE_KEY = 'qv-pass-token';

export interface PassPayload {
  sub: string;
  jti: string;
  tier: 'PASSENGER';
  iat: number;
  exp?: number;
  rail?: string;
  /** Legacy client-only payloads */
  honorDeviceLocal?: boolean;
  /** Fair Exchange — EGS constant */
  egsMonthlyUsd: 16.18;
}

export function readPassToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function writePassToken(token: string) {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearPassToken() {
  localStorage.removeItem(STORAGE_KEY);
}

export function parsePassPayload(token: string | null): PassPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const pad = parts[1].length % 4 === 0 ? '' : '='.repeat(4 - (parts[1].length % 4));
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/') + pad);
    const data = JSON.parse(json) as PassPayload;
    if (data.tier !== 'PASSENGER') return null;
    if (typeof data.exp === 'number' && data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export function getOrCreateDeviceId(): string {
  const k = 'qv-device-id';
  let id = localStorage.getItem(k);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(k, id);
  }
  return id;
}
