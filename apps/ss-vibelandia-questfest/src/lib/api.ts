import type { LiveRail } from '@/lib/paymentRails';

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

/** Optional server audit log when a legacy JWT exists — honor boarding does not use this. */
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
