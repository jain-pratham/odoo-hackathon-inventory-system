"use client";

import { Receipt } from "@/store/receipts.store";
import { ArrowRight, MapPin, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReceiptsTableProps {
  receipts: Receipt[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Done":
      return "bg-green-100 text-green-800 border-green-200";
    case "Ready":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Waiting":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Draft":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "Canceled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function ReceiptsTable({ receipts }: ReceiptsTableProps) {
  const router = useRouter();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200 text-sm font-semibold text-gray-600">
              <th className="px-6 py-4">Reference</th>
              <th className="px-6 py-4">Destination</th>
              <th className="px-6 py-4">Contact / Note</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {receipts.map((receipt: any) => (
              <tr 
                key={receipt._id} 
                onClick={() => router.push(`/receipts/${receipt._id}`)}
                className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
              >
                <td className="px-6 py-4 font-bold text-gray-900">
                  {receipt.receiptNo}
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {/* Accessing populated warehouse name from your Mongoose schema */}
                    {receipt.items?.[0]?.warehouseId?.name || "Main Warehouse"}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-500 italic text-sm">
                    <User className="h-3 w-3" />
                    {receipt.reference || receipt.note || "No reference"}
                  </div>
                </td>
                
                <td className="px-6 py-4 text-gray-600 text-sm">
                  {new Date(receipt.createdAt).toLocaleDateString()}
                </td>
                
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadge(receipt.status)}`}>
                    {receipt.status}
                  </span>
                </td>
                
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-gray-400 group-hover:text-green-600 group-hover:bg-green-50 rounded-lg transition-all">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}