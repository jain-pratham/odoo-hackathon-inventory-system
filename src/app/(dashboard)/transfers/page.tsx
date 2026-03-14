"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeftRight, LayoutGrid, LayoutList, Plus, Search } from "lucide-react";
import { useTransfersStore } from "@/store/transfers.store";

export default function TransfersPage() {
  const router = useRouter();
  const { transfers, loading, error, fetchTransfers } = useTransfersStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    void fetchTransfers();
  }, [fetchTransfers]);

  const filteredTransfers = transfers.filter((transfer) => {
    const matchesSearch =
      transfer.transferNo.toLowerCase().includes(search.toLowerCase()) ||
      transfer.reference?.toLowerCase().includes(search.toLowerCase()) ||
      false;
    const matchesStatus =
      statusFilter === "All" ? true : transfer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/transfers/new")}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 font-bold text-white transition-all hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Transfers</h1>
            <p className="text-sm font-medium text-gray-500">
              Move stock between warehouses and locations.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search transfer no or reference..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-green-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-green-500"
          >
            <option value="All">All statuses</option>
            <option value="Draft">Draft</option>
            <option value="Waiting">Waiting</option>
            <option value="Ready">Ready</option>
            <option value="Done">Done</option>
            <option value="Canceled">Canceled</option>
          </select>

          <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1">
            <button className="rounded-lg bg-green-50 p-1.5 text-green-700">
              <LayoutList className="h-4 w-4" />
            </button>
            <button className="rounded-lg p-1.5 text-gray-400">
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-6 py-4">Transfer</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && filteredTransfers.length === 0 ? (
              [...Array(5)].map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-6 bg-gray-50/60"></td>
                </tr>
              ))
            ) : filteredTransfers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-sm font-medium text-gray-400">
                  No transfers found.
                </td>
              </tr>
            ) : (
              filteredTransfers.map((transfer) => (
                <tr
                  key={transfer._id}
                  onClick={() => router.push(`/transfers/${transfer._id}`)}
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-green-50 p-2 text-green-600">
                        <ArrowLeftRight className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{transfer.transferNo}</p>
                        <p className="text-xs text-gray-500">{transfer.reference || "Internal move"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">
                    {transfer.items.length} item{transfer.items.length === 1 ? "" : "s"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(transfer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-700">
                      {transfer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ArrowRight className="inline h-4 w-4 text-gray-300" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
