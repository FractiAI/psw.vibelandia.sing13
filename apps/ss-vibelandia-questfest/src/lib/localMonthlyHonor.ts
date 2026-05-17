import type { LiveRail } from '@/lib/paymentRails';

export const LOCAL_MONTHLY_HONOR_KEY = 'qv-local-monthly-honor';

export interface LocalMonthlyHonor {
  rail: LiveRail;
  email: string;
  paidDate: string;
  /** Last day the pass is valid (YYYY-MM-DD), inclusive */
  validUntil: string;
  jti: string;
}

/** Calendar date in the user's local timezone (YYYY-MM-DD). */
export function localTodayISO(): string {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function addDaysToISODate(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(y, m - 1, d);
  t.setDate(t.getDate() + days);
  const yy = t.getFullYear();
  const mm = String(t.getMonth() + 1).padStart(2, '0');
  const dd = String(t.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/** 30-day window from the date the user said they paid */
export function computeValidUntilFromPaidDate(paidDate: string): string {
  return addDaysToISODate(paidDate, 30);
}

export function isHonorDateActive(validUntil: string): boolean {
  return localTodayISO() <= validUntil;
}

export function readLocalMonthlyHonor(): LocalMonthlyHonor | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<LocalMonthlyHonor>;
    if (!o?.rail || !o?.paidDate || !o?.validUntil || !o?.jti || typeof o.email !== 'string')
      return null;
    return o as LocalMonthlyHonor;
  } catch {
    return null;
  }
}

export function writeLocalMonthlyHonor(rec: LocalMonthlyHonor) {
  try {
    localStorage.setItem(LOCAL_MONTHLY_HONOR_KEY, JSON.stringify(rec));
  } catch {
    throw new Error('storage_failed');
  }
}

export function clearLocalMonthlyHonor() {
  try {
    localStorage.removeItem(LOCAL_MONTHLY_HONOR_KEY);
  } catch {
    /* ignore */
  }
}
