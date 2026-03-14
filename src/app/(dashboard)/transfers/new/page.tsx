"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowLeftRight, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { useProductsStore } from "@/store/product.store";
import { useSettingsStore } from "@/store/settings.store";
import { useTransfersStore } from "@/store/transfers.store";

export default function NewTransferPage() {
  const router = useRouter();
  const { products, fetchProducts } = useProductsStore();
  const { warehouses, locations, fetchSettings } = useSettingsStore();
  const { createTransfer } = useTransfersStore();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    transferNo: `TRF/${Date.now().toString().slice(-6)}`,
    reference: "",
    note: "",
    productId: "",
    fromWarehouseId: "",
    fromLocationId: "",
    toWarehouseId: "",
    toLocationId: "",
    quantity: 1,
    status: "Ready" as "Draft" | "Waiting" | "Ready",
  });

  useEffect(() => {
    void fetchProducts();
    void fetchSettings();
  }, [fetchProducts, fetchSettings]);

  const sourceLocations = useMemo(
    () =>
      locations.filter(
        (location) =>
          typeof location.warehouseId !== "string" &&
          location.warehouseId?._id === formData.fromWarehouseId,
      ),
    [formData.fromWarehouseId, locations],
  );

  const destinationLocations = useMemo(
    () =>
      locations.filter(
        (location) =>
          typeof location.warehouseId !== "string" &&
          location.warehouseId?._id === formData.toWarehouseId,
      ),
    [formData.toWarehouseId, locations],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.productId || !formData.fromWarehouseId || !formData.toWarehouseId) {
      toast.error("Please complete the product and warehouse fields.");
      return;
    }

    if (formData.fromWarehouseId === formData.toWarehouseId && formData.fromLocationId === formData.toLocationId) {
      toast.error("Source and destination must be different.");
      return;
    }

    try {
      setSaving(true);
      const transfer = await createTransfer({
        transferNo: formData.transferNo,
        reference: formData.reference,
        note: formData.note,
        status: formData.status,
        items: [
          {
            productId: formData.productId,
            fromWarehouseId: formData.fromWarehouseId,
            fromLocationId: formData.fromLocationId || undefined,
            toWarehouseId: formData.toWarehouseId,
            toLocationId: formData.toLocationId || undefined,
            quantity: Number(formData.quantity),
            note: formData.note || undefined,
          },
        ],
      });

      toast.success("Transfer created successfully");
      router.push(`/transfers/${transfer._id}`);
    } catch {
      toast.error("Failed to create transfer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10">
      <div className="mb-10 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 transition-all hover:border-green-500 hover:text-green-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900">New Transfer</h1>
          <p className="text-sm font-medium text-gray-500">
            Schedule an internal stock move between warehouses or locations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 border-b border-gray-100 pb-4 text-lg font-bold text-gray-900">
            <ArrowLeftRight className="h-5 w-5 text-green-600" />
            Transfer Details
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <input
              value={formData.transferNo}
              onChange={(event) => setFormData({ ...formData, transferNo: event.target.value })}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:border-green-500"
              placeholder="Transfer number"
              required
            />
            <input
              value={formData.reference}
              onChange={(event) => setFormData({ ...formData, reference: event.target.value })}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:border-green-500"
              placeholder="Reference"
            />
            <select
              value={formData.productId}
              onChange={(event) => setFormData({ ...formData, productId: event.target.value })}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:border-green-500"
              required
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={formData.quantity}
              onChange={(event) => setFormData({ ...formData, quantity: Number(event.target.value) })}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:border-green-500"
              placeholder="Quantity"
              required
            />

            <select
              value={formData.fromWarehouseId}
              onChange={(event) => setFormData({ ...formData, fromWarehouseId: event.target.value, fromLocationId: "" })}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:border-green-500"
              required
            >
              <option value="">Source warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse._id} value={warehouse._id}>
                  {warehouse.name}
                </option>
              ))}
            </select>

            <select
              value={formData.toWarehouseId}
              onChange={(event) => setFormData({ ...formData, toWarehouseId: event.target.value, toLocationId: "" })}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:border-green-500"
              required
            >
              <option value="">Destination warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse._id} value={warehouse._id}>
                  {warehouse.name}
                </option>
              ))}
            </select>

            <select
              value={formData.fromLocationId}
              onChange={(event) => setFormData({ ...formData, fromLocationId: event.target.value })}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:border-green-500"
            >
              <option value="">Source location (optional)</option>
              {sourceLocations.map((location) => (
                <option key={location._id} value={location._id}>
                  {location.name}
                </option>
              ))}
            </select>

            <select
              value={formData.toLocationId}
              onChange={(event) => setFormData({ ...formData, toLocationId: event.target.value })}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:border-green-500"
            >
              <option value="">Destination location (optional)</option>
              {destinationLocations.map((location) => (
                <option key={location._id} value={location._id}>
                  {location.name}
                </option>
              ))}
            </select>

            <select
              value={formData.status}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  status: event.target.value as "Draft" | "Waiting" | "Ready",
                })
              }
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:border-green-500"
            >
              <option value="Draft">Draft</option>
              <option value="Waiting">Waiting</option>
              <option value="Ready">Ready</option>
            </select>
          </div>

          <textarea
            value={formData.note}
            onChange={(event) => setFormData({ ...formData, note: event.target.value })}
            className="mt-6 min-h-28 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:border-green-500"
            placeholder="Transfer note"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-3.5 font-bold text-white transition-all hover:bg-green-700 disabled:opacity-70"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Create Transfer
          </button>
        </div>
      </form>
    </div>
  );
}
