import { create } from 'zustand';
import {
  clearPassToken,
  createMockPassToken,
  parsePassPayload,
  readPassToken,
  writePassToken,
} from '@/lib/mockJwt';

export type PaymentRail = 'paypal' | 'venmo' | 'cashapp' | 'demo';

interface SessionState {
  passToken: string | null;
  isPassenger: boolean;
  jti: string | null;
  completeBoarding: (rail: PaymentRail) => void;
  disembark: () => void;
  hydrateFromStorage: () => void;
}

function load(): { passToken: string | null; isPassenger: boolean; jti: string | null } {
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
  completeBoarding: (rail) => {
    void rail;
    const token = createMockPassToken();
    writePassToken(token);
    const p = parsePassPayload(token);
    set({ passToken: token, isPassenger: true, jti: p?.jti ?? null });
  },
  disembark: () => {
    clearPassToken();
    set({ passToken: null, isPassenger: false, jti: null });
  },
  hydrateFromStorage: () => set(load()),
}));
