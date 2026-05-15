import type { LiveRail } from '@/lib/paymentRails';

export interface BoardingRequestBody {
  rail: LiveRail;
  honorConfirm: true;
  paidDate: string;
  email: string;
}

export interface BoardingResponse {
  ok: boolean;
  token: string;
  tier: 'PASSENGER';
  jti: string;
  expiresAt: number;
  egsMonthlyUsd: number;
  message?: string;
}

export async function requestBoarding(input: BoardingRequestBody): Promise<BoardingResponse> {
  const res = await fetch('/api/boarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = (await res.json().catch(() => ({}))) as BoardingResponse & {
    error?: string;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message || data.error || `boarding_failed_${res.status}`);
  }
  return data;
}

export type ExportRequestBody =
  | {
      passToken: string;
      rail: LiveRail;
      trackId: string;
      trackTitle?: string;
      receipt: string;
    }
  | {
      passToken: string;
      rail: LiveRail;
      trackId: string;
      trackTitle?: string;
      honorConfirm: true;
      paidDate: string;
      email: string;
    };

export interface ExportResponse {
  ok: boolean;
  licenseId: string;
  trackId: string;
  exportUsd: number;
  passengerJti?: string;
  message?: string;
}

export async function requestExport(input: ExportRequestBody): Promise<ExportResponse> {
  const res = await fetch('/api/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = (await res.json().catch(() => ({}))) as ExportResponse & {
    error?: string;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message || data.error || `export_failed_${res.status}`);
  }
  return data;
}
