"use client";

import { useEffect, useState } from "react";
import { useLedgerStore } from "@/store/ledger.store";
import { useSettingsStore } from "@/store/settings.store";
import { History, Search, ArrowUpRight, ArrowDownLeft, RefreshCcw } from "lucide-react";

export default function MoveHistoryPage() {
  const { entries, fetchLedger, loading } = useLedgerStore();
  const { warehouses, locations, fetchSettings } = useSettingsStore();
  const [search, setSearch] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [locationId, setLocationId] = useState("");

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    void fetchLedger({
      sourceType,
      warehouseId,
      locationId,
      limit: 100,
    });
  }, [fetchLedger, locationId, sourceType, warehouseId]);

  const filteredEntries = entries.filter((entry) =>
    entry.sourceNo.toLowerCase().includes(search.toLowerCase()) ||
    entry.productId?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <History className="text-[#00c853]" />
            Move History
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Audit trail for all inventory movements and stock adjustments.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search reference or product..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853] transition-all"
            />
          </div>
          <select
            value={sourceType}
            onChange={(event) => setSourceType(event.target.value)}
            className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none focus:border-green-500"
          >
            <option value="">All types</option>
            <option value="Receipt">Receipts</option>
            <option value="Delivery">Deliveries</option>
            <option value="Transfer">Transfers</option>
            <option value="Adjustment">Adjustments</option>
          </select>
          <select
            value={warehouseId}
            onChange={(event) => {
              setWarehouseId(event.target.value);
              setLocationId("");
            }}
            className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none focus:border-green-500"
          >
            <option value="">All warehouses</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse._id} value={warehouse._id}>
                {warehouse.name}
              </option>
            ))}
          </select>
          <select
            value={locationId}
            onChange={(event) => setLocationId(event.target.value)}
            className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none focus:border-green-500"
          >
            <option value="">All locations</option>
            {locations
              .filter((location) =>
                warehouseId
                  ? typeof location.warehouseId !== "string" &&
                    location.warehouseId?._id === warehouseId
                  : true,
              )
              .map((location) => (
                <option key={location._id} value={location._id}>
                  {location.name}
                </option>
              ))}
          </select>
          <button 
            onClick={() => void fetchLedger({ sourceType, warehouseId, locationId, limit: 100 })}
            className="p-2.5 text-gray-500 hover:text-[#00c853] bg-white border border-gray-200 rounded-lg transition-colors"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Warehouse</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-right">Quantity</th>
                <th className="px-6 py-4 text-right">New Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && entries.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-6 bg-gray-50/30"></td>
                  </tr>
                ))
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-gray-400 text-sm italic">
                    No movement records found.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">
                      {new Date(entry.movementAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-sm">
                      {entry.sourceNo}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800 text-sm">{entry.productId?.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{entry.productId?.sku}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {entry.warehouseId?.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold border ${
                        entry.sourceType === 'Receipt' ? 'bg-green-50 text-green-700 border-green-100' :
                        entry.sourceType === 'Delivery' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {entry.sourceType.toUpperCase()}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold text-sm ${
                      entry.direction === 'IN' ? 'text-[#00c853]' : 
                      entry.direction === 'OUT' ? 'text-red-500' : 'text-amber-600'
                    }`}>
                      <div className="flex items-center justify-end gap-1">
                        {entry.direction === 'IN' ? <ArrowDownLeft size={14}/> : <ArrowUpRight size={14}/>}
                        {entry.direction === 'OUT' ? '-' : '+'}{entry.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {entry.balanceAfter}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
