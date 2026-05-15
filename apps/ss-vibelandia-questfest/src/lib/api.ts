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

/** Thrown when a JSON API responds with `{ error, message? }`; use `code` for branching */
export class ApiHttpError extends Error {
  readonly name = 'ApiHttpError';
  readonly code?: string;
  readonly httpStatus: number;
  readonly body?: unknown;

  constructor(message: string, opts: { code?: string; status: number; body?: unknown }) {
    super(message);
    this.code = opts.code;
    this.httpStatus = opts.status;
    this.body = opts.body;
  }

  static is(e: unknown): e is ApiHttpError {
    return e instanceof ApiHttpError;
  }
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
    throw new ApiHttpError(data.message ?? data.error ?? `boarding_failed_${res.status}`, {
      code: typeof data.error === 'string' ? data.error : undefined,
      status: res.status,
      body: data,
    });
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
    throw new ApiHttpError(data.message ?? data.error ?? `export_failed_${res.status}`, {
      code: typeof data.error === 'string' ? data.error : undefined,
      status: res.status,
      body: data,
    });
  }
  return data;
}
