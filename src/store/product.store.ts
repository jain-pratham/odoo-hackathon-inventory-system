import { create } from "zustand";
import axios from "axios";

export interface Category {
  _id: string;
  name: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  categoryId?: Category;
  unit?: string;
  reorderLevel: number;
}

interface ProductsState {
  products: Product[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  createProduct: (data: any) => Promise<void>;
  updateProduct: (id: string, data: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  loading: false,

  // store/product.store.ts
  fetchProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/api/products");

      // 🚨 If your API returns { success: true, data: [...] }, use res.data.data
      // 🚨 If your API returns [...], use res.data
      const actualData = Array.isArray(res.data) ? res.data : res.data.data;

      set({ products: actualData || [], loading: false });
    } catch (error) {
      console.error("Fetch error:", error);
      set({ loading: false });
    }
  },

  createProduct: async (data) => {
    const token = localStorage.getItem("token");
    const res = await axios.post("/api/products", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({ products: [res.data.product, ...state.products] }));
  },

  updateProduct: async (id, data) => {
    const token = localStorage.getItem("token");
    const res = await axios.put(`/api/products/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({
      products: state.products.map((p) =>
        p._id === id ? res.data.product : p,
      ),
    }));
  },

  deleteProduct: async (id) => {
    const token = localStorage.getItem("token");
    await axios.delete(`/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({ products: state.products.filter((p) => p._id !== id) }));
  },
}));
