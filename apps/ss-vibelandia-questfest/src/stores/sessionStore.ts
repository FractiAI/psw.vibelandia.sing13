import { create } from 'zustand';
import type { BoardingHonorPayload } from '@/lib/boardingHonor';
import { verifyCaptainPassword } from '@/lib/captainAuth';
import {
  clearLocalMonthlyHonor,
  computeValidUntilFromPaidDate,
  hasClaimedCatalogTrial,
  honorPassKind,
  isHonorDateActive,
  type LocalMonthlyHonor,
  localTodayISO,
  markCatalogTrialClaimed,
  readLocalMonthlyHonor,
  writeLocalMonthlyHonor,
} from '@/lib/localMonthlyHonor';
import { clearPassToken, parsePassPayload, readPassToken } from '@/lib/mockJwt';
import { usePlaybackStore } from '@/stores/playbackStore';

const CAPTAIN_SESSION_KEY = 'qv-captain-unlocked';

function readCaptainUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(CAPTAIN_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function writeCaptainUnlocked(on: boolean) {
  try {
    if (on) sessionStorage.setItem(CAPTAIN_SESSION_KEY, '1');
    else sessionStorage.removeItem(CAPTAIN_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function randomJti(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `jti-${Date.now()}`;
}

interface SessionDerived {
  passToken: string | null;
  isPassenger: boolean;
  jti: string | null;
  /** Pass from confirm + dates on this device only */
  localHonorOnly: boolean;
  honorValidUntil: string | null;
  /** Active free first-month window */
  honorIsTrial: boolean;
}

function load(): SessionDerived {
  let lh = readLocalMonthlyHonor();
  if (lh && !isHonorDateActive(lh.validUntil)) {
    if (honorPassKind(lh) === 'trial') markCatalogTrialClaimed();
    clearLocalMonthlyHonor();
    lh = null;
  }

  const passToken = readPassToken();
  const p = parsePassPayload(passToken);

  if (lh) {
    return {
      passToken: null,
      isPassenger: true,
      jti: lh.jti,
      localHonorOnly: true,
      honorValidUntil: lh.validUntil,
      honorIsTrial: honorPassKind(lh) === 'trial',
    };
  }

  if (p) {
    return {
      passToken,
      isPassenger: true,
      jti: p.jti,
      localHonorOnly: false,
      honorValidUntil: null,
      honorIsTrial: false,
    };
  }

  return {
    passToken: passToken || null,
    isPassenger: false,
    jti: null,
    localHonorOnly: false,
    honorValidUntil: null,
    honorIsTrial: false,
  };
}

interface SessionState extends SessionDerived {
  captainUnlocked: boolean;
  boardingBusy: boolean;
  boardingError: string | null;
  completeBoarding: (input: BoardingHonorPayload) => Promise<boolean>;
  /** First month of full listens on us — no tip yet. */
  claimFreeTrialMonth: (input: { email: string; magazineFollowAck: boolean }) => Promise<boolean>;
  disembark: () => void;
  tryCaptainPassword: (password: string) => boolean;
  hydrateFromStorage: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  ...load(),
  captainUnlocked: readCaptainUnlocked(),
  boardingBusy: false,
  boardingError: null,
  claimFreeTrialMonth: async (input) => {
    set({ boardingBusy: true, boardingError: null });
    try {
      if (!input.magazineFollowAck) {
        set({
          boardingBusy: false,
          boardingError: 'Follow Machote Moderno Magazine to claim your free month.',
        });
        return false;
      }
      const email = input.email.trim().toLowerCase();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) {
        set({ boardingBusy: false, boardingError: 'Enter a valid email address.' });
        return false;
      }
      const existing = readLocalMonthlyHonor();
      if (existing && isHonorDateActive(existing.validUntil)) {
        set({ boardingBusy: false, boardingError: 'You already have active access on this device.' });
        return false;
      }
      if (hasClaimedCatalogTrial()) {
        set({
          boardingBusy: false,
          boardingError: 'Your free month was already claimed on this device — tip $16.18 to keep listening.',
        });
        return false;
      }

      const start = localTodayISO();
      const honor: LocalMonthlyHonor = {
        rail: 'trial',
        email,
        paidDate: start,
        validUntil: computeValidUntilFromPaidDate(start),
        jti: randomJti(),
        kind: 'trial',
      };

      clearPassToken();
      writeLocalMonthlyHonor(honor);
      markCatalogTrialClaimed();
      usePlaybackStore.getState().applyPassHolderPlaybackDefaults();

      set({
        ...load(),
        boardingBusy: false,
        boardingError: null,
        captainUnlocked: readCaptainUnlocked(),
      });
      return true;
    } catch (e) {
      const msg =
        e instanceof Error && e.message === 'storage_failed'
          ? 'Could not save on this browser — check that cookies/storage are allowed (not private mode).'
          : e instanceof Error
            ? e.message
            : 'trial_failed';
      set({ boardingBusy: false, boardingError: msg });
      return false;
    }
  },
  completeBoarding: async (input) => {
    if (!input.honorConfirm) {
      set({ boardingError: 'Confirm your tip on honor to continue.', boardingBusy: false });
      return false;
    }
    set({ boardingBusy: true, boardingError: null });
    try {
      const rail = input.rail;
      const paidDate = input.paidDate.trim();
      const email = input.email.trim().toLowerCase();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) {
        set({ boardingBusy: false, boardingError: 'Enter a valid email address.' });
        return false;
      }
      if (paidDate.length < 10 || paidDate > localTodayISO()) {
        set({
          boardingBusy: false,
          boardingError: 'Enter the date you tipped (today or earlier).',
        });
        return false;
      }
      const validUntil = computeValidUntilFromPaidDate(paidDate);

      const honor: LocalMonthlyHonor = {
        rail,
        email,
        paidDate,
        validUntil,
        jti: randomJti(),
        kind: 'paid',
      };

      /** Client-only honor — no POST /api/boarding; localStorage is source of truth */
      clearPassToken();
      writeLocalMonthlyHonor(honor);
      markCatalogTrialClaimed();

      usePlaybackStore.getState().applyPassHolderPlaybackDefaults();

      set({
        ...load(),
        boardingBusy: false,
        boardingError: null,
        captainUnlocked: readCaptainUnlocked(),
      });
      return true;
    } catch (e) {
      const msg =
        e instanceof Error && e.message === 'storage_failed'
          ? 'Could not save on this browser — check that cookies/storage are allowed (not private mode).'
          : e instanceof Error
            ? e.message
            : 'boarding_failed';
      set({ boardingBusy: false, boardingError: msg });
      return false;
    }
  },
  disembark: () => {
    clearLocalMonthlyHonor();
    clearPassToken();
    writeCaptainUnlocked(false);
    set({
      passToken: null,
      isPassenger: false,
      jti: null,
      boardingError: null,
      captainUnlocked: false,
      localHonorOnly: false,
      honorValidUntil: null,
      honorIsTrial: false,
    });
  },
  tryCaptainPassword: (password: string) => {
    if (!verifyCaptainPassword(password)) return false;
    writeCaptainUnlocked(true);
    usePlaybackStore.getState().applyPassHolderPlaybackDefaults();
    set({ captainUnlocked: true });
    return true;
  },
  hydrateFromStorage: () =>
    set({
      ...load(),
      captainUnlocked: readCaptainUnlocked(),
    }),
}));
