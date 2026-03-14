import { create } from "zustand";
import axios from "axios";

interface DashboardState {
  data: any | null;
  activities: any[];
  loading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  activities: [],
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      // Fetch both KPI and Activities in parallel for real-time speed
      const [kpiRes, activityRes] = await Promise.all([
        axios.get("/api/dashboard/kpi"),
        axios.get("/api/dashboard/activities?limit=10")
      ]);

      set({ 
        data: kpiRes.data.data, 
        activities: activityRes.data.data, 
        loading: false 
      });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || "Failed to sync dashboard", 
        loading: false 
      });
    }
  },
}));