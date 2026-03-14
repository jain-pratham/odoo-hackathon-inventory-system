"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeliveriesStore } from "@/store/deliveriers.store";
import { ArrowLeft, CheckCircle2, Loader2, Package, MapPin, Calendar, AlertCircle, Ban, SearchCheck } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

export default function DeliveryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { validateDelivery, loading: storeLoading } = useDeliveriesStore();
  
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleAction = async (action: 'validate' | 'check' | 'cancel') => {
    setActionLoading(true);
    try {
      if (action === 'validate') {
        await validateDelivery(id as string);
        toast.success("Delivery Confirmed! Stock decreased.");
      } else if (action === 'check') {
        await axios.post(`/api/deliveries/${id}/check-availability`);
        toast.success("Availability Checked");
      } else if (action === 'cancel') {
        await axios.put(`/api/deliveries/${id}`, { status: 'Canceled' });
        toast.error("Order Canceled");
      }
      fetchDetail();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-[#00c853]" /></div>;

  const status = delivery.status;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* Breadcrumbs & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><ArrowLeft size={24} /></button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{delivery.deliveryNo}</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className={`h-2 w-2 rounded-full ${status === 'Done' ? 'bg-green-500' : 'bg-amber-500'}`} />
               <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">{status}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {status !== 'Done' && status !== 'Canceled' && (
            <>
              <button onClick={() => handleAction('cancel')} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Ban size={20} /></button>
              
              <button 
                onClick={() => handleAction('check')}
                disabled={actionLoading}
                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <SearchCheck size={18} />}
                CHECK AVAILABILITY
              </button>

              <button 
                onClick={() => handleAction('validate')}
                disabled={actionLoading || status !== 'Ready'}
                className={`flex items-center gap-2 px-8 py-3 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 ${status === 'Ready' ? 'bg-[#00c853] shadow-green-200 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                VALIDATE
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Items Table */}
          <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Package className="text-[#00c853]" /> Picking List</h3>
            <table className="w-full">
              <thead className="text-xs font-bold text-gray-400 uppercase border-b">
                <tr>
                  <th className="text-left pb-4">Product</th>
                  <th className="text-right pb-4">Demand</th>
                  <th className="text-right pb-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {delivery.items.map((item: any, i: number) => (
                  <tr key={i} className="group">
                    <td className="py-5">
                      <p className="font-bold text-gray-900">{item.productId?.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{item.productId?.sku}</p>
                    </td>
                    <td className="text-right font-black text-gray-700">{item.quantity} {item.productId?.unit}</td>
                    <td className="text-right">
                       <span className={`text-[10px] font-bold px-2 py-1 rounded ${status === 'Ready' || status === 'Done' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                         {status === 'Ready' || status === 'Done' ? 'AVAILABLE' : 'CHECKING...'}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-[#1a1a1a] text-white rounded-[2rem] p-8 shadow-xl">
             <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Logistics Info</h4>
             <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center"><MapPin className="text-[#00c853]" /></div>
                  <div>
                    <p className="text-gray-400 text-[10px] font-bold uppercase">Source Location</p>
                    <p className="font-bold">{delivery.items[0]?.warehouseId?.name || "Main WH"}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center"><Calendar className="text-[#00c853]" /></div>
                  <div>
                    <p className="text-gray-400 text-[10px] font-bold uppercase">Delivery Date</p>
                    <p className="font-bold">{new Date(delivery.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-8">
             <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold uppercase text-[10px] tracking-widest"><AlertCircle size={14} /> Note</div>
             <p className="text-amber-900 text-sm font-medium italic">"{delivery.note || "No specific instructions provided for this shipment."}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}