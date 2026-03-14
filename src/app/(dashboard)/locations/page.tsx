"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settings.store";
import { MapPin, Plus, Search, X, Loader2, Warehouse as WarehouseIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function LocationsPage() {
  const { locations, warehouses, fetchSettings, createLocation } = useSettingsStore();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", warehouseId: "" });

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createLocation(formData);
      toast.success("Location created! 📍");
      setIsOpen(false);
      setFormData({ name: "", warehouseId: "" });
    } catch (err) {
      toast.error("Failed to create location");
    } finally {
      setLoading(false);
    }
  };

  const filtered = locations.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#00c853] text-white font-semibold rounded-lg active:scale-95">
            <Plus size={18} strokeWidth={3} /> NEW
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input placeholder="Search locations..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg outline-none text-sm" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Warehouse</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(l => (
              <tr key={l._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-2 font-bold text-gray-900"><MapPin size={16} className="text-blue-500" /> {l.name}</td>
                <td className="px-6 py-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium">{(l.warehouseId as any)?.name || "Default"}</span></td>
                <td className="px-6 py-4 text-right font-medium text-gray-400 text-sm hover:text-green-600 cursor-pointer">Edit</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Location Creation */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
            <button onClick={() => setIsOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add Storage Location</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Location Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 p-2 border rounded-lg focus:border-[#00c853] outline-none" placeholder="e.g. Shelf A1" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Warehouse</label>
                <select required value={formData.warehouseId} onChange={e => setFormData({...formData, warehouseId: e.target.value})} className="w-full mt-1 p-2 border rounded-lg outline-none bg-white">
                  <option value="">Select a warehouse</option>
                  {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
              </div>
              <button disabled={loading} className="w-full py-3 bg-[#00c853] text-white font-bold rounded-xl hover:bg-green-600 flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : "CREATE LOCATION"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}