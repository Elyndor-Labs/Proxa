import { create } from "zustand";

export interface BetLeg {
  id: string;
  marketId: string;
  title: string;
  bucket: number;
  bucketLabel: string;
  amount: string;
}

interface BetSlipState {
  legs: BetLeg[];
  open: boolean;
  addLeg: (data: Omit<BetLeg, "id">) => void;
  updateLeg: (id: string, patch: Partial<Pick<BetLeg, "amount" | "bucket" | "bucketLabel">>) => void;
  removeLeg: (id: string) => void;
  setOpen: (open: boolean) => void;
  clear: () => void;
}

function legId(marketId: string, bucket: number) {
  return `${marketId}:${bucket}`;
}

export const useBetSlipStore = create<BetSlipState>((set) => ({
  legs: [],
  open: false,
  addLeg: (data) =>
    set((state) => {
      const id = legId(data.marketId, data.bucket);
      const existing = state.legs.findIndex((leg) => leg.id === id);
      const nextLeg: BetLeg = { ...data, id };

      if (existing >= 0) {
        const legs = [...state.legs];
        legs[existing] = nextLeg;
        return { legs, open: true };
      }

      return { legs: [...state.legs, nextLeg], open: true };
    }),
  updateLeg: (id, patch) =>
    set((state) => ({
      legs: state.legs.map((leg) => (leg.id === id ? { ...leg, ...patch } : leg)),
    })),
  removeLeg: (id) =>
    set((state) => {
      const legs = state.legs.filter((leg) => leg.id !== id);
      return { legs, open: legs.length > 0 ? state.open : false };
    }),
  setOpen: (open) => set({ open }),
  clear: () => set({ legs: [], open: false }),
}));

/** Total number of legs in the slip. */
export function useBetSlipCount() {
  return useBetSlipStore((state) => state.legs.length);
}
