"use client";

import { useEffect, useState } from "react";
import { useDeliveriesStore } from "@/store/deliveriers.store";
import { useRouter } from "next/navigation";
import { Plus, Search, LayoutList, LayoutGrid, ArrowRight } from "lucide-react";

export default function DeliveriesPage() {
  
  const router = useRouter();
  const { deliveries, fetchDeliveries, loading } = useDeliveriesStore();
  const [search, setSearch] = useState("");

  useEffect(() => { fetchDeliveries(); }, [fetchDeliveries]);

  const filtered = deliveries.filter(d => 
    d.deliveryNo.toLowerCase().includes(search.toLowerCase()) ||
    d.reference?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header matching Wireframe */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => router.push("/deliveries/new")}
            className="bg-[#00c853] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-green-600 transition-all shadow-md active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> NEW
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Delivery</h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              placeholder="Search reference or contact..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#00c853]"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border">
            <button className="p-1.5 bg-white shadow-sm rounded-md text-[#00c853]"><LayoutList size={16}/></button>
            <button className="p-1.5 text-gray-400"><LayoutGrid size={16}/></button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Reference</th>
              <th className="px-6 py-4">From</th>
              <th className="px-6 py-4">To</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Schedule Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((d) => (
              <tr key={d._id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => router.push(`/deliveries/${d._id}`)}>
                <td className="px-6 py-4 font-bold text-[#00c853]">{d.deliveryNo}</td>
                <td className="px-6 py-4 text-gray-600">WH/Stock1</td>
                <td className="px-6 py-4 text-gray-600">Vendor / Customer</td>
                <td className="px-6 py-4 text-gray-500 italic">Azure Interior</td>
                <td className="px-6 py-4 text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                    d.status === "Ready" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-gray-100 text-gray-600"
                  }`}>
                    {d.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <ArrowRight className="inline text-gray-300 group-hover:text-[#00c853] transition-colors" size={18} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !loading && (
          <div className="py-20 text-center text-gray-400 border-t border-dashed">No delivery orders found.</div>
        )}
      </div>
    </div>
  );
}