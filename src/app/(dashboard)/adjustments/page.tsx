"use client";

import { useEffect, useState } from "react";
import { useAdjustmentsStore } from "@/store/adjustments.store";
import { useRouter } from "next/navigation";
import { Plus, Search, ArrowRight } from "lucide-react";

export default function AdjustmentsPage() {
  const router = useRouter();
  const { adjustments, fetchAdjustments } = useAdjustmentsStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => { fetchAdjustments(); }, [fetchAdjustments]);

  const filtered = adjustments.filter(a => {
    const matchesSearch =
      a.adjustmentNo.toLowerCase().includes(search.toLowerCase()) ||
      a.reason?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" ? true : a.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/adjustments/new")}
            className="bg-[#00c853] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-600 transition-all shadow-md active:scale-95"
          >
            <Plus size={20} /> NEW ADJUSTMENT
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Stock Adjustments</h1>
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            placeholder="Search by ID or Reason..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:border-[#00c853] outline-none"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium outline-none focus:border-[#00c853]"
        >
          <option value="All">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Waiting">Waiting</option>
          <option value="Ready">Ready</option>
          <option value="Done">Done</option>
          <option value="Canceled">Canceled</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm font-semibold">
            <tr>
              <th className="px-6 py-4">Adjustment No</th>
              <th className="px-6 py-4">Reason</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((a) => (
              <tr 
                key={a._id} 
                className="hover:bg-gray-50 transition-colors group cursor-pointer"
                onClick={() => router.push(`/adjustments/${a._id}`)}
              >
                <td className="px-6 py-4 font-bold text-gray-900">{a.adjustmentNo}</td>
                <td className="px-6 py-4 text-gray-600 italic">{a.reason || "Manual Count"}</td>
                <td className="px-6 py-4 text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    a.status === "Done" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}>
                    {a.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <ArrowRight className="inline text-gray-300 group-hover:text-[#00c853]" size={18} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
