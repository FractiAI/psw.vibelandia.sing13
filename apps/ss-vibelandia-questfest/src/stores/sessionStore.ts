import { create } from 'zustand';
import { requestBoarding } from '@/lib/api';
import type { LiveRail } from '@/lib/paymentRails';
import {
  clearPassToken,
  createMockPassToken,
  parsePassPayload,
  readPassToken,
  writePassToken,
} from '@/lib/mockJwt';

interface SessionState {
  passToken: string | null;
  isPassenger: boolean;
  jti: string | null;
  boardingBusy: boolean;
  boardingError: string | null;
  completeBoarding: (rail: LiveRail, receipt: string, contact: string) => Promise<boolean>;
  disembark: () => void;
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
    set({ passToken: null, isPassenger: false, jti: null, boardingError: null });
  },
  hydrateFromStorage: () => set(load()),
}));
