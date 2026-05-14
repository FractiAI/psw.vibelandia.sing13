import type { LiveRail } from '@/lib/paymentRails';

export interface BoardingResponse {
  ok: boolean;
  token: string;
  tier: 'PASSENGER';
  jti: string;
  expiresAt: number;
  egsMonthlyUsd: number;
  message?: string;
}

export async function requestBoarding(input: {
  rail: LiveRail;
  receipt: string;
  contact?: string;
}): Promise<BoardingResponse> {
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
