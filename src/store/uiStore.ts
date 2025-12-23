import { create } from "zustand";

interface UIState {
  cartUpdated: number; // Timestamp to trigger updates
  cartVersion: number; // Version number to force cart query updates
  cartMutationVersion: number; // Version that increments on each cart mutation
  triggerCartUpdate: () => void;
  incrementCartVersion: () => void;
  incrementCartMutationVersion: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  cartUpdated: Date.now(),
  cartVersion: 0,
  cartMutationVersion: 0,
  triggerCartUpdate: () => set({ cartUpdated: Date.now() }),
  incrementCartVersion: () => set((state) => ({ cartVersion: state.cartVersion + 1 })),
  incrementCartMutationVersion: () => set((state) => ({ cartMutationVersion: state.cartMutationVersion + 1 })),
}));

