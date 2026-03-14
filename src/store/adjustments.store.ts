import { create } from "zustand";
import axios from "axios";

export interface Adjustment {
  _id: string;
  adjustmentNo: string;
  reference?: string;
  reason?: string;
  status: "Draft" | "Waiting" | "Ready" | "Done" | "Canceled";
  createdAt: string;
  items: any[];
}

interface AdjustmentsState {
  adjustments: Adjustment[];
  loading: boolean;
  fetchAdjustments: () => Promise<void>;
  createAdjustment: (data: any) => Promise<void>;
  validateAdjustment: (id: string) => Promise<void>;
}

export const useAdjustmentsStore = create<AdjustmentsState>((set) => ({
  adjustments: [],
  loading: false,

  fetchAdjustments: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/api/adjustments");
      set({ adjustments: res.data.data || [], loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  createAdjustment: async (data) => {
    const res = await axios.post("/api/adjustments", data);
    set((state) => ({ adjustments: [res.data.data, ...state.adjustments] }));
  },

  validateAdjustment: async (id) => {
    const res = await axios.post(`/api/adjustments/${id}/validate`);
    set((state) => ({
      adjustments: state.adjustments.map((a) => (a._id === id ? res.data.data : a)),
    }));
  },
}));