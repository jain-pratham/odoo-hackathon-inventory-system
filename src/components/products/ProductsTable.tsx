"use client";

import { useProductsStore } from "@/store/product.store";
import { Edit2, Trash2, Tag, Hash, Box } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface ProductsTableProps {
  products: any[];
}

export default function ProductsTable({ products }: ProductsTableProps) {
  const { deleteProduct } = useProductsStore();

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProduct(id);
        toast.success(`${name} deleted successfully!`);
      } catch (error: any) {
        toast.error("Failed to delete product.");
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider font-bold text-gray-500">
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Unit</th>
              <th className="px-6 py-4 text-center">Reorder Level</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                
                {/* Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Box size={16} className="text-gray-400" />
                    <div className="font-semibold text-gray-900">{product.name}</div>
                  </div>
                </td>
                
                {/* Category (Safely checking object vs string) */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md">
                    <Tag size={12} />
                    {typeof product.categoryId === 'object' && product.categoryId !== null
                      ? product.categoryId.name
                      : "Uncategorized"}
                  </span>
                </td>

                {/* SKU */}
                <td className="px-6 py-4 text-gray-600 font-mono text-sm uppercase">
                  <div className="flex items-center gap-1">
                    <Hash size={14} className="text-gray-300" />
                    {product.sku}
                  </div>
                </td>
                
                {/* Unit */}
                <td className="px-6 py-4 text-gray-500 text-sm italic">
                  {product.unit || "pcs"}
                </td>
                
                {/* Reorder Level */}
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-bold">
                    {product.reorderLevel || 0}
                  </span>
                </td>
                
                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    
                    <button 
                      onClick={() => handleDelete(product._id, product.name)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}