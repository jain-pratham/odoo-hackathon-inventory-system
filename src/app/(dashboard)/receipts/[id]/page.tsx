"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useReceiptsStore } from "@/store/receipts.store";
import { ArrowLeft, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

export default function ReceiptDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { validateReceipt, loading: storeLoading } = useReceiptsStore();
  
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDetail = async () => {
      try {
        const res = await axios.get(`/api/receipts/${id}`);
        setReceipt(res.data.data);
      } catch (err) {
        toast.error("Could not find receipt.");
        router.push("/receipts");
      } finally {
        setLoading(false);
      }
    };
    getDetail();
  }, [id, router]);

  const handleValidate = async () => {
    try {
      await validateReceipt(id as string);
      toast.success("Stock increased automatically! 📈");
      // Refresh local view
      const res = await axios.get(`/api/receipts/${id}`);
      setReceipt(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Validation failed.");
    }
  };

  if (loading) return <div className="p-10 animate-pulse bg-gray-50 h-screen" />;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-all">
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900">{receipt.receiptNo}</h1>
        <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
          receipt.status === "Done" ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"
        }`}>
          {receipt.status}
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-gray-100 pb-8">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reference</p>
            <p className="text-lg font-semibold text-gray-800">{receipt.reference || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scheduled Date</p>
            <p className="text-lg font-semibold text-gray-800">{new Date(receipt.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Item List */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Operations Details</h3>
          <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-500 border-b border-gray-200 uppercase">
                  <th className="px-6 py-4">Product ID</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4 text-right">Demand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {receipt.items.map((item: any, idx: number) => (
                  <tr key={idx} className="text-sm font-medium text-gray-700">
                    <td className="px-6 py-4 font-mono">{item.productId}</td>
                    <td className="px-6 py-4">WH/Stock</td>
                    <td className="px-6 py-4 text-right font-bold">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Footer */}
        {receipt.status !== "Done" && (
          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button
              onClick={handleValidate}
              disabled={storeLoading}
              className="flex items-center gap-2 px-8 py-3.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {storeLoading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              VALIDATE & INCREASE STOCK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}