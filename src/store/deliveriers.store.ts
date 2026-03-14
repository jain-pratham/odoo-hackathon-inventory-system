import { create } from "zustand";
import axios from "axios";

export interface Delivery {
  _id: string;
  deliveryNo: string;
  reference?: string;
  status: "Draft" | "Waiting" | "Ready" | "Done" | "Canceled";
  createdAt: string;
  note?: string;
  items: any[];
}

interface DeliveriesState {
  deliveries: Delivery[];
  loading: boolean;
  error: string | null;
  fetchDeliveries: () => Promise<void>;
  createDelivery: (data: any) => Promise<void>;
  validateDelivery: (id: string) => Promise<void>;
  checkAvailability: (id: string) => Promise<void>;
  cancelDelivery: (id: string) => Promise<void>;
}

export const useDeliveriesStore = create<DeliveriesState>((set) => ({
  deliveries: [],
  loading: false,
  error: null,

  fetchDeliveries: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/api/deliveries");
      set({ deliveries: res.data.data || [], loading: false });
    } catch (error: any) {
      set({ error: "Failed to load deliveries", loading: false });
    }
  },

  checkAvailability: async (id: string) => {
    const res = await axios.post(`/api/deliveries/${id}/check-availability`);
    set((state) => ({
      deliveries: state.deliveries.map((d) => (d._id === id ? res.data.data : d)),
    }));
  },

  cancelDelivery: async (id: string) => {
    const res = await axios.put(`/api/deliveries/${id}`, { status: "Canceled" });
    set((state) => ({
      deliveries: state.deliveries.map((d) => (d._id === id ? res.data.data : d)),
    }));
  },

  createDelivery: async (data) => {
    const res = await axios.post("/api/deliveries", data);
    set((state) => ({ deliveries: [res.data.data, ...state.deliveries] }));
  },

  validateDelivery: async (id) => {
    const res = await axios.post(`/api/deliveries/${id}/validate`);
    set((state) => ({
      deliveries: state.deliveries.map((d) => (d._id === id ? res.data.data : d)),
    }));
  },
}));