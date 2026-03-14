import { create } from "zustand";
import axios from "axios";

export interface Receipt {
  _id: string;
  receiptNo: string;
  reference?: string;
  status: "Draft" | "Waiting" | "Ready" | "Done" | "Canceled";
  createdAt: string;
  note?: string;
}

interface ReceiptsState {
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
  fetchReceipts: () => Promise<void>;
  createReceipt: (receiptData: any) => Promise<void>;
  updateReceipt: (id: string, data: any) => Promise<void>;
  validateReceipt: (id: string) => Promise<void>;
}

export const useReceiptsStore = create<ReceiptsState>((set) => ({
  receipts: [],
  loading: false,
  error: null,

  fetchReceipts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/api/receipts");
      set({ receipts: res.data.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Load failed", loading: false });
    }
  },

  createReceipt: async (receiptData) => {
    const res = await axios.post("/api/receipts", receiptData);
    set((state) => ({ receipts: [res.data.data, ...state.receipts] }));
  },

  updateReceipt: async (id, data) => {
    const res = await axios.put(`/api/receipts/${id}`, data);
    set((state) => ({
      receipts: state.receipts.map((r) => (r._id === id ? res.data.data : r)),
    }));
  },

  validateReceipt: async (id) => {
    const res = await axios.post(`/api/receipts/${id}/validate`);
    set((state) => ({
      receipts: state.receipts.map((r) => (r._id === id ? res.data.data : r)),
    }));
  },
}));