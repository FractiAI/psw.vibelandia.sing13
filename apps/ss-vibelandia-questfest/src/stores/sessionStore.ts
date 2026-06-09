import { create } from 'zustand';
import type { BoardingHonorPayload } from '@/lib/boardingHonor';
import { verifyCaptainPassword } from '@/lib/captainAuth';
import {
  clearLocalMonthlyHonor,
  computeValidUntilFromPaidDate,
  isHonorDateActive,
  type LocalMonthlyHonor,
  localTodayISO,
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
}

function load(): SessionDerived {
  let lh = readLocalMonthlyHonor();
  if (lh && !isHonorDateActive(lh.validUntil)) {
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
    };
  }

  if (p) {
    return {
      passToken,
      isPassenger: true,
      jti: p.jti,
      localHonorOnly: false,
      honorValidUntil: null,
    };
  }

  return {
    passToken: passToken || null,
    isPassenger: false,
    jti: null,
    localHonorOnly: false,
    honorValidUntil: null,
  };
}

interface SessionState extends SessionDerived {
  captainUnlocked: boolean;
  boardingBusy: boolean;
  boardingError: string | null;
  completeBoarding: (input: BoardingHonorPayload) => Promise<boolean>;
  disembark: () => void;
  tryCaptainPassword: (password: string) => boolean;
  hydrateFromStorage: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  ...load(),
  captainUnlocked: readCaptainUnlocked(),
  boardingBusy: false,
  boardingError: null,
  completeBoarding: async (input) => {
    if (!input.honorConfirm) {
      set({ boardingError: 'Confirm payment on honor to continue.', boardingBusy: false });
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
          boardingError: 'Enter the date you paid (today or earlier).',
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
      };

      /** Client-only honor — no POST /api/boarding; localStorage is source of truth */
      clearPassToken();
      writeLocalMonthlyHonor(honor);

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
