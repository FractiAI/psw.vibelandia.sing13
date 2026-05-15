import { create } from 'zustand';

export type VesselKind = 'vessel_switch' | 'tab_preempt' | null;

interface MediaChromeState {
  fairOpen: boolean;
  boardingOpen: boolean;
  captainOpen: boolean;
  vesselOpen: boolean;
  vesselKind: VesselKind;
  exportTrackId: string | null;
  setFairOpen: (v: boolean) => void;
  setBoardingOpen: (v: boolean) => void;
  setCaptainOpen: (v: boolean) => void;
  showVessel: (k: Exclude<VesselKind, null>) => void;
  hideVessel: () => void;
  openExport: (trackId: string) => void;
  closeExport: () => void;
}

export const useMediaChromeStore = create<MediaChromeState>((set) => ({
  fairOpen: false,
  boardingOpen: false,
  captainOpen: false,
  vesselOpen: false,
  vesselKind: null,
  exportTrackId: null,
  setFairOpen: (v) => set({ fairOpen: v }),
  setBoardingOpen: (v) => set({ boardingOpen: v }),
  setCaptainOpen: (v) => set({ captainOpen: v }),
  showVessel: (k) => set({ vesselOpen: true, vesselKind: k }),
  hideVessel: () => set({ vesselOpen: false, vesselKind: null }),
  openExport: (trackId) => set({ exportTrackId: trackId }),
  closeExport: () => set({ exportTrackId: null }),
}));
