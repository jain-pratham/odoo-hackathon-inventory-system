"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdjustmentsStore } from "@/store/adjustments.store";
import { ArrowLeft, CheckCircle2, Loader2, ClipboardCheck } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

export default function AdjustmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { validateAdjustment } = useAdjustmentsStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`/api/adjustments/${id}`);
        setData(res.data.data);
      } catch (err) { router.push("/adjustments"); }
      finally { setLoading(false); }
    };
    fetchDetail();
  }, [id, router]);

  const handleValidate = async () => {
    setValidating(true);
    try {
      await validateAdjustment(id as string);
      toast.success("Adjustment validated! Stock ledger updated.");
      router.push("/adjustments");
    } catch (err) {
      toast.error("Failed to validate adjustment.");
    } finally { setValidating(false); }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading details...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={24} /></button>
        <h1 className="text-3xl font-bold text-gray-900">{data.adjustmentNo}</h1>
        <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-gray-100 border text-gray-600 uppercase">
          {data.status}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
        <div className="grid grid-cols-2 gap-8 border-b pb-8">
          <div><p className="text-xs font-bold text-gray-400 uppercase">Reason</p><p className="font-bold">{data.reason || "Inventory Cycle Count"}</p></div>
          <div><p className="text-xs font-bold text-gray-400 uppercase">Reference</p><p className="font-bold">{data.reference || "N/A"}</p></div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ClipboardCheck className="text-[#00c853]" /> Items</h3>
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                <tr><th className="px-6 py-3">Product</th><th className="px-6 py-3 text-right">Counted Quantity</th></tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="px-6 py-4 font-medium text-gray-700">{item.productId}</td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600">{item.countedQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {data.status !== "Done" && (
          <div className="pt-8 border-t flex justify-end">
            <button 
              onClick={handleValidate} 
              disabled={validating}
              className="bg-[#00c853] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {validating ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
              VALIDATE & UPDATE STOCK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}