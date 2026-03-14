"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProductsStore } from "@/store/product.store";
import toast from "react-hot-toast";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Package, 
  Hash, 
  Tags, 
  Scale, 
  BellRing,
  X
} from "lucide-react";
import axios from "axios";

export default function NewProductPage() {
  const router = useRouter();
  const { createProduct } = useProductsStore();

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    unit: "pcs",
    reorderLevel: 10,
    categoryId: "" 
  });

  // Fetch categories dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories");
        // Handle both wrapper formats { data: [...] } or direct array [...]
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setCategories(data);
      } catch (err) {
        toast.error("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      toast.error("Product Name and SKU are required.");
      return;
    }

    try {
      setLoading(true);
      await createProduct({
        ...formData,
        reorderLevel: Number(formData.reorderLevel),
        categoryId: formData.categoryId || undefined 
      });

      toast.success("Product created successfully! 🎉");
      router.push("/products");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-2.5 bg-white border border-gray-200 text-gray-500 hover:text-[#00c853] hover:border-[#00c853] rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">New Product</h1>
            <p className="text-gray-500 font-medium text-sm mt-1">Register a new item into your master catalog.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Block 1: General Info */}
        <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
            <Package className="h-5 w-5 text-[#00c853]" />
            General Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Ergonomic Office Chair"
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:border-[#00c853] focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-gray-900" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-400" />
                SKU / Internal Reference <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required 
                placeholder="e.g. CHR-ERG-001"
                value={formData.sku} 
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })} 
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 font-mono outline-none focus:border-[#00c853] focus:ring-4 focus:ring-green-500/10 transition-all text-gray-900 uppercase" 
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Tags className="h-4 w-4 text-gray-400" />
                Product Category
              </label>
              <select 
                value={formData.categoryId} 
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                disabled={categoriesLoading}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:border-[#00c853] focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-gray-900 disabled:opacity-50"
              >
                <option value="">{categoriesLoading ? "Loading Categories..." : "Select Category (Optional)"}</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Block 2: Inventory Rules */}
        <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
            <BellRing className="h-5 w-5 text-[#00c853]" />
            Inventory & Tracking Rules
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Scale className="h-4 w-4 text-gray-400" />
                Unit of Measure
              </label>
              <select 
                value={formData.unit} 
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })} 
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:border-[#00c853] focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-gray-900"
              >
                <option value="pcs">Units (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="m">Meters (m)</option>
                <option value="liters">Liters (L)</option>
                <option value="box">Boxes</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                Minimum Reorder Level
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  min="0"
                  required
                  value={formData.reorderLevel} 
                  onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })} 
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-16 outline-none focus:border-[#00c853] focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-gray-900" 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                  {formData.unit}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">Triggers a low-stock alert below this quantity.</p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button 
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3.5 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all"
          >
            <X className="h-5 w-5" />
            CANCEL
          </button>
          
          <button 
            type="submit"
            disabled={loading} 
            className="flex items-center gap-2 px-8 py-3.5 bg-[#00c853] text-white font-bold rounded-xl hover:bg-green-600 active:scale-95 transition-all shadow-lg shadow-green-200 disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {loading ? "SAVING..." : "SAVE PRODUCT"}
          </button>
        </div>
      </form>
    </div>
  );
}