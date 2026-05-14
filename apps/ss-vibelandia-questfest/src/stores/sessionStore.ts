import { create } from 'zustand';
import { requestBoarding } from '@/lib/api';
import { verifyCaptainPassword } from '@/lib/captainAuth';
import type { LiveRail } from '@/lib/paymentRails';
import {
  clearPassToken,
  createMockPassToken,
  parsePassPayload,
  readPassToken,
  writePassToken,
} from '@/lib/mockJwt';

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

interface SessionState {
  passToken: string | null;
  isPassenger: boolean;
  jti: string | null;
  captainUnlocked: boolean;
  boardingBusy: boolean;
  boardingError: string | null;
  completeBoarding: (rail: LiveRail, receipt: string, contact: string) => Promise<boolean>;
  disembark: () => void;
  tryCaptainPassword: (password: string) => boolean;
  hydrateFromStorage: () => void;
}

function load(): Pick<SessionState, 'passToken' | 'isPassenger' | 'jti'> {
  const passToken = readPassToken();
  const p = parsePassPayload(passToken);
  return {
    passToken,
    isPassenger: !!p,
    jti: p?.jti ?? null,
  };
}

export const useSessionStore = create<SessionState>((set) => ({
  ...load(),
  captainUnlocked: readCaptainUnlocked(),
  boardingBusy: false,
  boardingError: null,
  completeBoarding: async (rail, receipt, contact) => {
    set({ boardingBusy: true, boardingError: null });
    try {
      let token: string;
      if (import.meta.env.DEV && receipt === 'dev-local-receipt') {
        const now = Math.floor(Date.now() / 1000);
        token = createMockPassToken({
          sub: contact || 'dev@local',
          iat: now,
          exp: now + 30 * 24 * 60 * 60,
          rail,
        } as never);
      } else {
        const res = await requestBoarding({ rail, receipt, contact: contact || undefined });
        token = res.token;
      }
      writePassToken(token);
      const p = parsePassPayload(token);
      set({
        passToken: token,
        isPassenger: !!p,
        jti: p?.jti ?? null,
        boardingBusy: false,
        boardingError: null,
      });
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'boarding_failed';
      set({ boardingBusy: false, boardingError: msg });
      return false;
    }
  },
  disembark: () => {
    clearPassToken();
    writeCaptainUnlocked(false);
    set({
      passToken: null,
      isPassenger: false,
      jti: null,
      boardingError: null,
      captainUnlocked: false,
    });
  },
  tryCaptainPassword: (password: string) => {
    if (!verifyCaptainPassword(password)) return false;
    writeCaptainUnlocked(true);
    set({ captainUnlocked: true });
    return true;
  },
  hydrateFromStorage: () => set({ ...load(), captainUnlocked: readCaptainUnlocked() }),
}));
