import { create } from "zustand";
import axios from "axios";

export interface TransferItem {
  productId?: { _id: string; name: string; sku?: string; unit?: string };
  fromWarehouseId?: { _id: string; name: string };
  fromLocationId?: { _id: string; name: string } | null;
  toWarehouseId?: { _id: string; name: string };
  toLocationId?: { _id: string; name: string } | null;
  quantity: number;
  note?: string;
}

export interface Transfer {
  _id: string;
  transferNo: string;
  reference?: string;
  note?: string;
  status: "Draft" | "Waiting" | "Ready" | "Done" | "Canceled";
  createdAt: string;
  transferredAt?: string;
  items: TransferItem[];
}

type CreateTransferPayload = {
  transferNo: string;
  reference?: string;
  note?: string;
  status?: "Draft" | "Waiting" | "Ready";
  transferredAt?: string;
  items: Array<{
    productId: string;
    fromWarehouseId: string;
    fromLocationId?: string;
    toWarehouseId: string;
    toLocationId?: string;
    quantity: number;
    note?: string;
  }>;
};

interface TransfersState {
  transfers: Transfer[];
  loading: boolean;
  error: string | null;
  fetchTransfers: () => Promise<void>;
  createTransfer: (data: CreateTransferPayload) => Promise<Transfer>;
  validateTransfer: (id: string) => Promise<void>;
  cancelTransfer: (id: string) => Promise<void>;
}

export const useTransfersStore = create<TransfersState>((set) => ({
  transfers: [],
  loading: false,
  error: null,

  fetchTransfers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/api/transfers");
      set({ transfers: res.data.data || [], loading: false });
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to load transfers"
        : "Failed to load transfers";
      set({ error: message, loading: false });
    }
  },

  createTransfer: async (data) => {
    const res = await axios.post("/api/transfers", data);
    const transfer = res.data.data as Transfer;
    set((state) => ({ transfers: [transfer, ...state.transfers] }));
    return transfer;
  },

  validateTransfer: async (id) => {
    const res = await axios.post(`/api/transfers/${id}/validate`);
    set((state) => ({
      transfers: state.transfers.map((transfer) =>
        transfer._id === id ? res.data.data : transfer,
      ),
    }));
  },

  cancelTransfer: async (id) => {
    const res = await axios.put(`/api/transfers/${id}`, { status: "Canceled" });
    set((state) => ({
      transfers: state.transfers.map((transfer) =>
        transfer._id === id ? res.data.data : transfer,
      ),
    }));
  },
}));
