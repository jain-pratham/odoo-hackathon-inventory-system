import Receipt from "@/models/Receipt";
import Delivery from "@/models/Delivery";
import Transfer from "@/models/Transfer";
import Adjustment from "@/models/Adjustment";
import StockBalance from "@/models/StockBalance";
import StockLedger from "@/models/StockLedger";

export async function getDashboardKpis() {
  const [
    totalReceipts,
    totalDeliveries,
    totalTransfers,
    totalAdjustments,
    totalStockRows,
    totalStockQuantityAgg,
    lowStockRows,
  ] = await Promise.all([
    Receipt.countDocuments({}),
    Delivery.countDocuments({}),
    Transfer.countDocuments({}),
    Adjustment.countDocuments({}),
    StockBalance.countDocuments({}),
    StockBalance.aggregate([
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]),
    StockBalance.countDocuments({ quantity: { $lte: 5 } }),
  ]);

  const totalStockQuantity = totalStockQuantityAgg?.[0]?.totalQuantity || 0;

  return {
    totalReceipts,
    totalDeliveries,
    totalTransfers,
    totalAdjustments,
    totalStockRows,
    totalStockQuantity,
    lowStockRows,
  };
}

type GetRecentActivitiesInput = {
  limit?: number;
};

export async function getRecentActivities(input: GetRecentActivitiesInput = {}) {
  const limit =
    input.limit && input.limit > 0 && input.limit <= 100 ? input.limit : 20;

  return await StockLedger.find({})
    .sort({ movementAt: -1, createdAt: -1 })
    .limit(limit)
    .lean();
}