import type { LiveRail } from '@/lib/paymentRails';

const DRAFT_KEY = 'qv-boarding-honor-draft';

export interface BoardingHonorDraft {
  step?: 'rail' | 'pay' | 'honor';
  rail?: LiveRail | null;
  paidDate?: string;
  email?: string;
  honorAck?: boolean;
  magazineFollowAck?: boolean;
}

export function readBoardingHonorDraft(): BoardingHonorDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BoardingHonorDraft;
  } catch {
    return null;
  }
}

export function writeBoardingHonorDraft(draft: BoardingHonorDraft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearBoardingHonorDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
