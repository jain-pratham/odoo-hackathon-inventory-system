"use client";

import { useEffect, useState } from "react";
import { useProductsStore } from "@/store/product.store";
import { useRouter } from "next/navigation";
import { Plus, Search, Boxes } from "lucide-react";
import ProductsTable from "@/components/products/ProductsTable";

export default function ProductsPage() {
  const router = useRouter();
  const { products, fetchProducts, loading } = useProductsStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.categoryId?.name && p.categoryId.name.toLowerCase().includes(search.toLowerCase()))
  );

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
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading products...</div>
      ) : (
        <ProductsTable products={filtered} />
      )}
    </div>
  );
}