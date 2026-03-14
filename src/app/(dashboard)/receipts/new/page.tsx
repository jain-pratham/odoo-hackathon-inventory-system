"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useReceiptsStore } from "@/store/receipts.store";
import { useProductsStore } from "@/store/product.store"; // Import product store
import { useSettingsStore } from "@/store/settings.store"; // Import settings/warehouse store
import toast from "react-hot-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function NewReceiptPage() {
  const router = useRouter();
  const { createReceipt } = useReceiptsStore();
  
  // 1. Hook into your existing stores for real-time data
  const { products, fetchProducts } = useProductsStore();
  const { warehouses, fetchSettings } = useSettingsStore();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reference: "",
    note: "",
    warehouseId: "",
    productId: "",
    quantity: 1,
  });

  // 2. Fetch real-time products and warehouses on mount
  useEffect(() => {
    fetchProducts();
    fetchSettings(); // This fetches both warehouses and locations
  }, [fetchProducts, fetchSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.warehouseId || !formData.productId || formData.quantity <= 0) {
      toast.error("Please fill out all required fields.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        receiptNo: `WH/IN/${Math.floor(1000 + Math.random() * 9000)}`,
        reference: formData.reference,
        note: formData.note,
        status: "Draft",
        items: [
          {
            warehouseId: formData.warehouseId,
            productId: formData.productId,
            quantity: Number(formData.quantity),
          },
        ],
      };

      await createReceipt(payload);
      toast.success("Receipt created successfully! 🎉");
      router.push("/receipts");
    } catch (error: any) {
      toast.error(error.message || "Failed to create receipt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto animate-in fade-in duration-500">
      
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            New Receipt
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">
            Log incoming stock from vendors.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">General Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Reference / Vendor</label>
                <input
                  type="text"
                  placeholder="e.g. PO-2024-001"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Internal Note</label>
                <input
                  type="text"
                  placeholder="Optional notes..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Item Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Real-time Destination Warehouse Dropdown */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Destination Warehouse <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.warehouseId}
                  onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse._id} value={warehouse._id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Real-time Product Dropdown */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Product <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Quantity <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                />
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {loading ? "Saving..." : "Create Receipt"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}