"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, ArrowLeftRight, CheckCircle2, Loader2, Ban } from "lucide-react";
import toast from "react-hot-toast";
import { useTransfersStore, Transfer } from "@/store/transfers.store";

export default function TransferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { validateTransfer, cancelTransfer } = useTransfersStore();
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchTransfer = async () => {
      try {
        const res = await axios.get(`/api/transfers/${id}`);
        setTransfer(res.data.data);
      } catch {
        toast.error("Transfer not found");
        router.push("/transfers");
      } finally {
        setLoading(false);
      }
    };

    void fetchTransfer();
  }, [id, router]);

  const refreshDetail = async () => {
    const res = await axios.get(`/api/transfers/${id}`);
    setTransfer(res.data.data);
  };

  const handleValidate = async () => {
    try {
      setActionLoading(true);
      await validateTransfer(id);
      await refreshDetail();
      toast.success("Transfer validated");
    } catch {
      toast.error("Failed to validate transfer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      await cancelTransfer(id);
      await refreshDetail();
      toast.success("Transfer canceled");
    } catch {
      toast.error("Failed to cancel transfer");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !transfer) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 transition-all hover:border-green-500 hover:text-green-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900">{transfer.transferNo}</h1>
            <p className="mt-1 text-sm font-medium text-gray-500">{transfer.reference || "Internal transfer order"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {transfer.status !== "Done" && transfer.status !== "Canceled" && (
            <>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 font-bold text-red-600 transition-all hover:bg-red-50 disabled:opacity-60"
              >
                <Ban className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleValidate}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition-all hover:bg-green-700 disabled:opacity-60"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Validate
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Status</p>
            <p className="mt-2 text-base font-bold text-gray-900">{transfer.status}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Created</p>
            <p className="mt-2 text-base font-bold text-gray-900">{new Date(transfer.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Scheduled</p>
            <p className="mt-2 text-base font-bold text-gray-900">
              {transfer.transferredAt ? new Date(transfer.transferredAt).toLocaleDateString() : "Not set"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Items</p>
            <p className="mt-2 text-base font-bold text-gray-900">{transfer.items.length}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
          <ArrowLeftRight className="h-5 w-5 text-green-600" />
          Transfer Items
        </h2>

        <div className="space-y-4">
          {transfer.items.map((item, index) => (
            <div key={`${transfer._id}-${index}`} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Product</p>
                  <p className="mt-2 font-bold text-gray-900">{item.productId?.name || "Product"}</p>
                  <p className="text-xs text-gray-500">{item.productId?.sku || "SKU unavailable"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">From</p>
                  <p className="mt-2 font-bold text-gray-900">{item.fromWarehouseId?.name || "Warehouse"}</p>
                  <p className="text-xs text-gray-500">{item.fromLocationId?.name || "Any location"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">To</p>
                  <p className="mt-2 font-bold text-gray-900">{item.toWarehouseId?.name || "Warehouse"}</p>
                  <p className="text-xs text-gray-500">{item.toLocationId?.name || "Any location"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Quantity</p>
                  <p className="mt-2 font-bold text-gray-900">{item.quantity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
