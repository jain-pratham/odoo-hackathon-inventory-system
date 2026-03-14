"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdjustmentsStore } from "@/store/adjustments.store";
import { useProductsStore } from "@/store/product.store";
import { useSettingsStore } from "@/store/settings.store";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Loader2, Info } from "lucide-react";

export default function NewAdjustmentPage() {
  const router = useRouter();
  const { createAdjustment } = useAdjustmentsStore();
  const { products, fetchProducts } = useProductsStore();
  const { warehouses, fetchSettings } = useSettingsStore();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reason: "Inventory Count",
    reference: "",
    warehouseId: "",
    productId: "",
    countedQuantity: 0,
    note: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, [fetchProducts, fetchSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.warehouseId || !formData.productId) {
      toast.error("Please select a Product and Warehouse.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        adjustmentNo: `ADJ/${Date.now().toString().slice(-6)}`,
        reason: formData.reason,
        reference: formData.reference,
        note: formData.note,
        status: "Draft",
        items: [
          {
            productId: formData.productId,
            warehouseId: formData.warehouseId,
            countedQuantity: Number(formData.countedQuantity),
            note: formData.note,
          },
        ],
      };

      await createAdjustment(payload);
      toast.success("Adjustment Draft created! 📝");
      router.push("/adjustments");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create adjustment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()} 
          className="p-2 text-gray-400 hover:text-[#00c853] hover:bg-green-50 rounded-xl transition-all"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">New Adjustment</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Manually correct stock levels based on physical count.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          {/* Section 1: Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Reason for Adjustment</label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#00c853] outline-none transition-all"
              >
                <option value="Inventory Count">Regular Inventory Count</option>
                <option value="Damaged Goods">Damaged Goods</option>
                <option value="Loss">Loss / Theft</option>
                <option value="Found">Found Items</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Reference (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Q1 Audit"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#00c853] outline-none transition-all"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
            <Info className="h-5 w-5 text-blue-500 shrink-0" />
            <p className="text-xs text-blue-700 font-medium">
              Enter the <strong>exact quantity</strong> currently on the shelf. The system will automatically calculate the difference and update the ledger upon validation.
            </p>
          </div>

          {/* Section 2: Product & Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Warehouse</label>
              <select
                required
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#00c853] outline-none transition-all"
              >
                <option value="" disabled>Select Warehouse</option>
                {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Product</label>
              <select
                required
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#00c853] outline-none transition-all"
              >
                <option value="" disabled>Select Product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Counted Quantity</label>
              <input
                type="number"
                min="0"
                required
                value={formData.countedQuantity}
                onChange={(e) => setFormData({ ...formData, countedQuantity: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#00c853] outline-none transition-all font-bold text-blue-600"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 bg-[#00c853] text-white font-bold rounded-xl hover:bg-green-600 shadow-lg shadow-green-600/20 transition-all active:scale-95 disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {loading ? "CREATING..." : "SAVE ADJUSTMENT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}