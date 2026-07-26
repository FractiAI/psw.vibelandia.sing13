import type { LiveRail } from '@/lib/paymentRails';

export const LOCAL_MONTHLY_HONOR_KEY = 'qv-local-monthly-honor';
export const CATALOG_TRIAL_CLAIMED_KEY = 'qv-catalog-trial-claimed';

export type HonorPassKind = 'trial' | 'paid';

export interface LocalMonthlyHonor {
  rail: LiveRail | 'trial';
  email: string;
  /** Trial start date or paid date (YYYY-MM-DD) */
  paidDate: string;
  /** Last day the pass is valid (YYYY-MM-DD), inclusive */
  validUntil: string;
  jti: string;
  /** Free first month vs tip-jar paid month. Missing = treat as paid (legacy). */
  kind?: HonorPassKind;
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

/** 30-day window from the date the user said they paid / started trial */
export function computeValidUntilFromPaidDate(paidDate: string): string {
  return addDaysToISODate(paidDate, 30);
}

export function isHonorDateActive(validUntil: string): boolean {
  return localTodayISO() <= validUntil;
}

export function honorPassKind(rec: LocalMonthlyHonor | null | undefined): HonorPassKind {
  if (!rec) return 'paid';
  return rec.kind === 'trial' ? 'trial' : 'paid';
}

export function hasClaimedCatalogTrial(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (localStorage.getItem(CATALOG_TRIAL_CLAIMED_KEY) === '1') return true;
    const lh = readLocalMonthlyHonor();
    return honorPassKind(lh) === 'trial';
  } catch {
    return false;
  }
}

export function markCatalogTrialClaimed() {
  try {
    localStorage.setItem(CATALOG_TRIAL_CLAIMED_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function clearCatalogTrialClaimed() {
  try {
    localStorage.removeItem(CATALOG_TRIAL_CLAIMED_KEY);
  } catch {
    /* ignore */
  }
}

export function readLocalMonthlyHonor(): LocalMonthlyHonor | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_MONTHLY_HONOR_KEY);
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
