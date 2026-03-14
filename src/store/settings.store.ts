import { create } from "zustand";
import axios from "axios";

export interface Warehouse {
  _id: string;
  name: string;
  address?: string;
}

export interface Location {
  _id: string;
  name: string;
  warehouseId: Warehouse | string;
}

interface SettingsState {
  warehouses: Warehouse[];
  locations: Location[];
  loading: boolean;
  fetchSettings: () => Promise<void>;
  createWarehouse: (data: { name: string; address?: string }) => Promise<void>;
  createLocation: (data: { name: string; warehouseId: string }) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  warehouses: [],
  locations: [],
  loading: false,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const [wRes, lRes] = await Promise.all([
        axios.get("/api/warehouses"),
        axios.get("/api/locations")
      ]);
      set({ warehouses: wRes.data, locations: lRes.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createWarehouse: async (data) => {
    const res = await axios.post("/api/warehouses", data);
    set((state) => ({ warehouses: [res.data.warehouse, ...state.warehouses] }));
  },

  createLocation: async (data) => {
    const res = await axios.post("/api/locations", data);
    set((state) => ({ locations: [res.data.location, ...state.locations] }));
  }
}));
