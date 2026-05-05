import { create } from 'zustand';

interface ActiveTripState {
  activeTripId: string | null;
  setActiveTripId: (tripId: string | null) => void;
}

export const useActiveTripStore = create<ActiveTripState>((set) => ({
  activeTripId: null,
  setActiveTripId: (tripId) => set({ activeTripId: tripId }),
}));
