import { create } from 'zustand';

interface ActiveTripState {
  activeTripId: string | null;
  activeTab: string;
  setActiveTripId: (tripId: string | null) => void;
  setActiveTab: (tab: string) => void;
}

export const useActiveTripStore = create<ActiveTripState>((set) => ({
  activeTripId: null,
  activeTab: 'overview',

  setActiveTripId: (tripId) => set({ activeTripId: tripId }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
