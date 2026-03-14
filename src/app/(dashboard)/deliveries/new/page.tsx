"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDeliveriesStore } from "@/store/deliveriers.store";
import { useProductsStore } from "@/store/product.store";
import { useSettingsStore } from "@/store/settings.store";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Loader2, Calendar as CalendarIcon } from "lucide-react";

export default function NewDeliveryPage() {
  const router = useRouter();
  const { createDelivery } = useDeliveriesStore();
  const { products, fetchProducts } = useProductsStore();
  const { warehouses, fetchSettings } = useSettingsStore();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reference: "",
    note: "",
    warehouseId: "",
    productId: "",
    quantity: 1,
    scheduledDate: new Date().toISOString().split('T')[0] // Default to today
  });

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, [fetchProducts, fetchSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const payload = {
        deliveryNo: `WH/OUT/${Math.floor(10000 + Math.random() * 90000)}`,
        reference: formData.reference,
        note: formData.note,
        status: "Draft", 
        deliveredAt: formData.scheduledDate,
        items: [{
          productId: formData.productId,
          warehouseId: formData.warehouseId,
          quantity: Number(formData.quantity),
        }],
      };

      await createDelivery(payload);
      toast.success("Delivery Order Created! 📦");
      router.push("/deliveries");
    } catch (error: any) {
      toast.error(error.message || "Failed to create delivery.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-[#00c853] hover:bg-green-50 rounded-xl transition-all">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">New Delivery</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Customer Reference</label>
              <input required value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-[#00c853]" placeholder="e.g. Azure Interior" />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Scheduled Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="date" value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} className="w-full pl-10 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-[#00c853]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Source Warehouse</label>
              <select required value={formData.warehouseId} onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-[#00c853]">
                <option value="">Select Warehouse</option>
                {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Product</label>
              <select required value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-[#00c853]">
                <option value="">Select Product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">Quantity</label>
            <input type="number" min="1" required value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-[#00c853]" />
          </div>

          <div className="pt-6 border-t flex justify-end">
            <button disabled={loading} className="flex items-center gap-2 px-10 py-4 bg-[#00c853] text-white font-bold rounded-2xl hover:bg-green-600 transition-all shadow-lg active:scale-95">
              {loading ? <Loader2 className="animate-spin" /> : <Save />}
              CREATE SHIPMENT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}