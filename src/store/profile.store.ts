import { create } from "zustand";
import axios from "axios";

export interface ProfileUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  createdAt?: string;
  updatedAt?: string;
}

interface ProfileState {
  user: ProfileUser | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<ProfileUser> & { password?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  user: null,
  loading: false,
  saving: false,
  error: null,

  fetchProfile: async () => {
    set((state) => ({ ...state, loading: true, error: null }));

    try {
      const res = await axios.get("/api/profile");
      set({
        user: res.data,
        loading: false,
        error: null,
      });
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to load profile"
        : "Failed to load profile";

      set((state) => ({
        ...state,
        loading: false,
        error: message,
      }));
    }
  },

  updateProfile: async (data) => {
    set((state) => ({ ...state, saving: true, error: null }));

    try {
      const res = await axios.put("/api/profile", data);
      set((state) => ({
        ...state,
        user: res.data.user,
        saving: false,
      }));
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to update profile"
        : "Failed to update profile";

      set((state) => ({
        ...state,
        saving: false,
        error: message,
      }));

      throw error;
    }
  },

  logout: async () => {
    await axios.post("/api/auth/logout");
    set({
      user: null,
      loading: false,
      saving: false,
      error: null,
    });
  },
}));
