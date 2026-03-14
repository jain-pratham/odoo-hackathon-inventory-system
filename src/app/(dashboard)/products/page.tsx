"use client";

import { useEffect, useState } from "react";
import { useProductsStore } from "@/store/product.store";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import ProductsTable from "@/components/products/ProductsTable";
import axios from "axios";

type Category = {
  _id: string;
  name: string;
};

export default function ProductsPage() {
  const router = useRouter();
  const { products, fetchProducts, loading } = useProductsStore();
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    void fetchProducts();

    const loadCategories = async () => {
      const res = await axios.get("/api/categories");
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCategories(data);
    };

    void loadCategories();
  }, [fetchProducts]);

  const filtered = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.categoryId?.name && p.categoryId.name.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      categoryFilter === "All"
        ? true
        : p.categoryId?.name === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/products/new")} className="bg-[#00c853] hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md">
            <Plus size={20} /> NEW
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Stock Inventory</h1>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search name, SKU, or category..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:border-[#00c853] outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium outline-none focus:border-[#00c853]"
        >
          <option value="All">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading products...</div>
      ) : (
        <ProductsTable products={filtered} />
      )}
    </div>
  );
}
