import { create } from "zustand";
import axios from "axios";

export interface LedgerEntry {
  _id: string;
  sourceNo: string;
  sourceType: "Receipt" | "Delivery" | "Transfer" | "Adjustment";
  productId: { _id: string; name: string; sku: string };
  warehouseId: { _id: string; name: string };
  direction: "IN" | "OUT" | "ADJUST";
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  movementAt: string;
  note?: string;
}

interface LedgerState {
  entries: LedgerEntry[];
  loading: boolean;
  fetchLedger: (params?: any) => Promise<void>;
}

export const useLedgerStore = create<LedgerState>((set) => ({
  entries: [],
  loading: false,

  fetchLedger: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await axios.get("/api/ledger", { params });
      set({ entries: res.data.data || [], loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },
}));