"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeliveriesStore } from "@/store/deliveriers.store"; // Fixed typo
import { ArrowLeft, CheckCircle2, Loader2, Package, MapPin, Calendar, SearchCheck, Ban, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

export default function DeliveryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // Ensure checkAvailability and cancelDelivery are in your store!
  const { validateDelivery, checkAvailability, cancelDelivery } = useDeliveriesStore();
  
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await axios.get(`/api/deliveries/${id}`);
      setDelivery(res.data.data);
    } catch (err) {
      toast.error("Delivery order not found.");
      router.push("/deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchDetail(); }, [id]);

  const handleAction = async (actionFn: () => Promise<any>, successMessage: string) => {
    setIsProcessing(true);
    try {
      await actionFn();
      toast.success(successMessage);
      await fetchDetail(); // Refresh the UI with new status
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !delivery) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-[#00c853]" />
    </div>
  );

  const status = delivery.status;
  const canValidate = status === "Ready";

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <ArrowLeft className="text-gray-600" size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{delivery.deliveryNo}</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className={`h-2.5 w-2.5 rounded-full ${status === 'Done' ? 'bg-green-500' : status === 'Canceled' ? 'bg-red-500' : 'bg-amber-500'}`} />
               <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{status}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Action Buttons: Only show if order is active */}
          {status !== "Done" && status !== "Canceled" && (
            <>
              <button 
                onClick={() => handleAction(() => cancelDelivery(id as string), "Order Canceled")}
                disabled={isProcessing}
                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                title="Cancel Delivery"
              >
                <Ban size={20} />
              </button>
              
              <button 
                onClick={() => handleAction(() => checkAvailability(id as string), "Stock Checked")}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <SearchCheck size={18} />}
                {status === "Waiting" ? "RE-CHECK STOCK" : "CHECK STOCK"}
              </button>

              <button 
                onClick={() => handleAction(() => validateDelivery(id as string), "Delivery Validated!")}
                disabled={isProcessing || !canValidate}
                className={`flex items-center gap-2 px-8 py-3 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 ${
                  canValidate ? 'bg-[#00c853] hover:bg-green-600 shadow-green-200' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 size={18} />
                VALIDATE
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Items Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="h-6 w-6 text-[#00c853]" /> 
              Items for Dispatch
            </h3>
            
            <div className="overflow-hidden border border-gray-100 rounded-2xl">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4 text-right">Demand</th>
                    <th className="px-6 py-4 text-right">Availability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {delivery.items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-6 py-5">
                        <p className="font-bold text-gray-900">{item.productId?.name}</p>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{item.productId?.sku}</p>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-gray-700 text-lg">
                        {item.quantity} <span className="text-xs text-gray-400 font-bold">{item.productId?.unit || 'pcs'}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <span className={`px-2.5 py-1 rounded text-[10px] font-black tracking-wider ${
                           status === 'Ready' || status === 'Done' ? 'bg-green-50 text-green-600' : 
                           status === 'Canceled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                         }`}>
                           {status === 'Ready' || status === 'Done' ? 'RESERVED' : status === 'Canceled' ? 'CANCELED' : 'PENDING'}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-gray-900 text-white border border-gray-800 rounded-[2rem] p-8 shadow-xl">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Logistics Details</h4>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-center">
                <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-[#00c853]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Source WH</p>
                  <p className="font-bold text-sm">
                    {delivery.items[0]?.warehouseId?.name || "Main Warehouse"}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-[#00c853]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Scheduled For</p>
                  <p className="font-bold text-sm">
                    {delivery.deliveredAt ? new Date(delivery.deliveredAt).toLocaleDateString() : new Date(delivery.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100/50">
            <div className="flex items-center gap-2 mb-3 text-amber-800 font-black uppercase text-[10px] tracking-widest">
              <AlertTriangle size={14} /> Shipping Notes / Ref
            </div>
            <p className="text-sm font-medium text-amber-900/80 italic leading-relaxed">
              "{delivery.note || delivery.reference || "No specific instructions provided for this shipment."}"
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}