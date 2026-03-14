"use client";

import { useEffect, useState } from "react";
import { useReceiptsStore } from "@/store/receipts.store";
import ReceiptsTable from "@/components/receipts/ReceiptsTable";
import { Plus, Search, LayoutList, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReceiptsPage() {
  const { receipts, fetchReceipts, loading, error } = useReceiptsStore();
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  // Hackathon tip: Simple frontend filtering!
  const filteredReceipts = receipts.filter(
    (r) =>
      r.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.reference &&
        r.reference.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header matching your Excalidraw sketch */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/receipts/new")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-sm shadow-green-600/20 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            NEW
          </button>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Receipts
          </h1>
        </div>

        {/* Search & Toggles from your sketch */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search receipts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
            />
          </div>

          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1">
            <button className="p-1.5 bg-green-50 text-green-700 rounded-lg shadow-sm">
              <LayoutList className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition-colors">
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* States */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        // Premium Skeleton Loader
        <div className="space-y-4 animate-pulse mt-8">
          <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
          <div className="h-16 bg-gray-100 rounded-xl w-full"></div>
          <div className="h-16 bg-gray-50 rounded-xl w-full"></div>
        </div>
      ) : filteredReceipts.length === 0 ? (
        // Empty State
        <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-500 font-medium">No receipts found.</p>
        </div>
      ) : (
        // Data Table
        <ReceiptsTable receipts={filteredReceipts} />
      )}
    </div>
  );
}
