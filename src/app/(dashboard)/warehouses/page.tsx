"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settings.store";
import { Warehouse as WarehouseIcon, Plus, Search, MapPin, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function WarehousesPage() {
  const { warehouses, fetchSettings, createWarehouse } = useSettingsStore();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", address: "" });

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createWarehouse(formData);
      toast.success("Warehouse created! 🎉");
      setIsOpen(false);
      setFormData({ name: "", address: "" });
    } catch (err) {
      toast.error("Failed to create warehouse");
    } finally {
      setLoading(false);
    }
  };

  const filtered = warehouses.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#00c853] text-white font-semibold rounded-lg hover:bg-green-600 transition-all active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> NEW
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Warehouses</h1>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            placeholder="Search warehouses..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg outline-none text-sm"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Warehouse Name</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(w => (
              <tr key={w._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><WarehouseIcon size={18} /></div>
                    <div>
                      <p className="font-bold text-gray-900">{w.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12} /> {w.address || "No address"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-green-600 font-medium text-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add Warehouse</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 p-2 border rounded-lg outline-none focus:border-[#00c853]" placeholder="e.g. Main Warehouse" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Address</label>
                <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full mt-1 p-2 border rounded-lg outline-none focus:border-[#00c853]" placeholder="Physical address" />
              </div>
              <button disabled={loading} className="w-full py-3 bg-[#00c853] text-white font-bold rounded-xl hover:bg-green-600 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : "CREATE WAREHOUSE"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}