import { create } from "zustand";
import axios from "axios";
import { DashboardActivity, DashboardFilters, DashboardKpis } from "@/types/dashboard.types";

interface DashboardState {
  data: DashboardKpis | null;
  activities: DashboardActivity[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  fetchDashboard: (filters?: DashboardFilters) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  activities: [],
  loading: false,
  error: null,
  lastUpdated: null,

  fetchDashboard: async (filters = {}) => {
    set((state) => ({ ...state, loading: true, error: null }));

    try {
      const [kpiRes, activityRes] = await Promise.all([
        axios.get("/api/dashboard/kpis", {
          params: filters,
          headers: { "Cache-Control": "no-cache" },
        }),
        axios.get("/api/dashboard/activities", {
          params: { ...filters, limit: 10 },
          headers: { "Cache-Control": "no-cache" },
        }),
      ]);

      set({
        data: kpiRes.data.data,
        activities: activityRes.data.data,
        loading: false,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || "Failed to sync dashboard"
        : "Failed to sync dashboard";

      set((state) => ({
        ...state,
        error: message,
        loading: false,
      }));
    }
  },
}));
