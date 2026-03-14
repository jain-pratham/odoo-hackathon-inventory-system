"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboard.store";
import OperationCard from "@/components/dashboard/OperationCard";
import { LayoutDashboard, RefreshCcw, Info } from "lucide-react";

export default function DashboardPage() {
  const { data, loading, error, lastUpdated, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    void fetchDashboard();

    const intervalId = window.setInterval(() => {
      void fetchDashboard();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [fetchDashboard]);

  const kpis = data || {
    totalProductsInStock: 0,
    totalUnitsOnHand: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0,
    scheduledTransfers: 0,
    openAdjustments: 0,
    receiptSummary: {
      toReceive: 0,
      late: 0,
      operations: 0,
    },
    deliverySummary: {
      toDeliver: 0,
      late: 0,
      waiting: 0,
      operations: 0,
    },
  };

  // Loading Skeleton State
  if (loading && !data) {
    return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-[220px] bg-gray-100 rounded-[2rem]"></div>
          <div className="h-[220px] bg-gray-100 rounded-[2rem]"></div>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-md text-center border border-red-100">
          <p className="font-bold text-lg mb-2">Failed to load dashboard</p>
          <p className="text-sm opacity-80 mb-4">{error}</p>
          <button onClick={() => fetchDashboard()} className="px-6 py-2 bg-white text-red-600 font-bold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-[#00c853]" />
            Dashboard
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">
            Current operation statistics. Refreshes every 15 seconds.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="hidden sm:inline text-xs font-semibold text-gray-500">
              Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => void fetchDashboard()}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-[#00c853] hover:text-[#00c853] transition-all active:scale-95 shadow-sm"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin text-[#00c853]" : ""}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          Live sync paused: {error}
        </div>
      )}

      <div className="mb-8 max-w-3xl rounded-[2rem] border border-green-100 bg-green-50/70 p-5">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 text-green-600" />
          <div className="space-y-1 text-sm font-medium text-green-900">
            <p><span className="font-bold">Late:</span> scheduled date earlier than today.</p>
            <p><span className="font-bold">Operations:</span> all open receipt or delivery documents.</p>
            <p><span className="font-bold">Waiting:</span> delivery is waiting for stock availability.</p>
          </div>
        </div>
      </div>

      <div className="grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
        <OperationCard
          type="receipt"
          title="Receipt"
          buttonText={`${kpis.receiptSummary.toReceive} to receive`}
          stats={[
            `${kpis.receiptSummary.late} Late`,
            `${kpis.receiptSummary.operations} operations`,
          ]}
          route="/receipts"
        />

        <OperationCard
          type="delivery"
          title="Delivery"
          buttonText={`${kpis.deliverySummary.toDeliver} to deliver`}
          stats={[
            `${kpis.deliverySummary.late} Late`,
            `${kpis.deliverySummary.waiting} waiting`,
            `${kpis.deliverySummary.operations} operations`,
          ]}
          route="/deliveries"
        />
      </div>
    </div>
  );
}
