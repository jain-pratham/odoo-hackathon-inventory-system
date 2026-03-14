import Receipt from "@/models/Receipt";
import Delivery from "@/models/Delivery";
import Transfer from "@/models/Transfer";
import Adjustment from "@/models/Adjustment";
import StockBalance from "@/models/StockBalance";
import StockLedger from "@/models/StockLedger";
import "@/models/warehouse.model";
import Product from "@/models/product.model";
import { Types } from "mongoose";
import {
  DashboardFilters,
  DashboardSourceType,
  DashboardStatus,
} from "@/types/dashboard.types";

function toObjectId(value?: string) {
  if (!value) return undefined;
  if (!Types.ObjectId.isValid(value)) {
    throw new Error(`Invalid ObjectId: ${value}`);
  }

  return new Types.ObjectId(value);
}

type GetDashboardInput = DashboardFilters & {
  limit?: number;
};

async function getCategoryProductIds(categoryId?: string) {
  if (!categoryId) return undefined;

  const products = await Product.find({ categoryId: toObjectId(categoryId) })
    .select("_id")
    .lean();

  return products.map((product) => product._id);
}

function getOpenStatusFilter(status?: DashboardStatus | "") {
  return status ? status : { $in: ["Draft", "Waiting", "Ready"] };
}

function shouldIncludeType(
  requestedType: DashboardSourceType | "" | undefined,
  currentType: DashboardSourceType,
) {
  return !requestedType || requestedType === currentType;
}

export async function getDashboardKpis(filters: DashboardFilters = {}) {
  const warehouseObjectId = toObjectId(filters.warehouseId);
  const locationObjectId = toObjectId(filters.locationId);
  const categoryProductIds = await getCategoryProductIds(filters.categoryId);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  if (filters.categoryId && categoryProductIds && categoryProductIds.length === 0) {
    return {
      totalProductsInStock: 0,
      totalUnitsOnHand: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      pendingReceipts: 0,
      pendingDeliveries: 0,
      scheduledTransfers: 0,
      openAdjustments: 0,
      receiptSummary: {
        toReceive: 0,
        late: 0,
        operations: 0,
      },
      deliverySummary: {
        toDeliver: 0,
        late: 0,
        waiting: 0,
        operations: 0,
      },
    };
  }

  const stockPipeline: Record<string, unknown>[] = [];
  const stockMatch: Record<string, unknown> = {};

  if (warehouseObjectId) {
    stockMatch.warehouseId = warehouseObjectId;
  }

  if (locationObjectId) {
    stockMatch.locationId = locationObjectId;
  }

  if (Object.keys(stockMatch).length > 0) {
    stockPipeline.push({ $match: stockMatch });
  }

  stockPipeline.push(
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
  );

  if (filters.categoryId) {
    stockPipeline.push({
      $match: { "product.categoryId": toObjectId(filters.categoryId) },
    });
  }

  const receiptOpenQuery = {
    status: getOpenStatusFilter(filters.status),
    ...(warehouseObjectId ? { "items.warehouseId": warehouseObjectId } : {}),
    ...(locationObjectId ? { "items.locationId": locationObjectId } : {}),
    ...(categoryProductIds?.length
      ? { "items.productId": { $in: categoryProductIds } }
      : {}),
  };

  const deliveryOpenQuery = {
    status: getOpenStatusFilter(filters.status),
    ...(warehouseObjectId ? { "items.warehouseId": warehouseObjectId } : {}),
    ...(locationObjectId ? { "items.locationId": locationObjectId } : {}),
    ...(categoryProductIds?.length
      ? { "items.productId": { $in: categoryProductIds } }
      : {}),
  };

  const [stockSummaryAgg, totalProductsAgg, pendingReceipts, pendingDeliveries, scheduledTransfers, openAdjustments, openReceipts, openDeliveries] =
    await Promise.all([
      StockBalance.aggregate([
        ...stockPipeline,
        {
          $group: {
            _id: null,
            totalUnitsOnHand: { $sum: "$quantity" },
            lowStockItems: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ["$quantity", 0] },
                      { $gt: ["$product.reorderLevel", 0] },
                      { $lte: ["$quantity", "$product.reorderLevel"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            outOfStockItems: {
              $sum: {
                $cond: [{ $lte: ["$quantity", 0] }, 1, 0],
              },
            },
          },
        },
      ]),
      StockBalance.aggregate([
        ...stockPipeline,
        { $match: { quantity: { $gt: 0 } } },
        { $group: { _id: "$productId" } },
        { $count: "count" },
      ]),
      shouldIncludeType(filters.sourceType, "Receipt")
        ? Receipt.countDocuments(receiptOpenQuery)
        : Promise.resolve(0),
      shouldIncludeType(filters.sourceType, "Delivery")
        ? Delivery.countDocuments(deliveryOpenQuery)
        : Promise.resolve(0),
      shouldIncludeType(filters.sourceType, "Transfer")
        ? Transfer.countDocuments({
            status: getOpenStatusFilter(filters.status),
            ...(categoryProductIds?.length
              ? { "items.productId": { $in: categoryProductIds } }
              : {}),
            ...((warehouseObjectId || locationObjectId)
              ? {
                  $or: [
                    ...(warehouseObjectId
                      ? [{ "items.fromWarehouseId": warehouseObjectId }, { "items.toWarehouseId": warehouseObjectId }]
                      : []),
                    ...(locationObjectId
                      ? [{ "items.fromLocationId": locationObjectId }, { "items.toLocationId": locationObjectId }]
                      : []),
                  ],
                }
              : {}),
          })
        : Promise.resolve(0),
      shouldIncludeType(filters.sourceType, "Adjustment")
        ? Adjustment.countDocuments({
            status: getOpenStatusFilter(filters.status),
            ...(warehouseObjectId ? { "items.warehouseId": warehouseObjectId } : {}),
            ...(locationObjectId ? { "items.locationId": locationObjectId } : {}),
            ...(categoryProductIds?.length
              ? { "items.productId": { $in: categoryProductIds } }
              : {}),
          })
        : Promise.resolve(0),
      shouldIncludeType(filters.sourceType, "Receipt")
        ? Receipt.find(receiptOpenQuery)
            .select("status receivedAt createdAt")
            .lean()
        : Promise.resolve([]),
      shouldIncludeType(filters.sourceType, "Delivery")
        ? Delivery.find(deliveryOpenQuery)
            .select("status deliveredAt createdAt")
            .lean()
        : Promise.resolve([]),
    ]);

  const stockSummary = stockSummaryAgg[0] || {
    totalUnitsOnHand: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
  };

  const receiptSummary = {
    toReceive: openReceipts.length,
    late: openReceipts.filter((receipt) => {
      const scheduleDate = receipt.receivedAt || receipt.createdAt;
      return new Date(scheduleDate) < todayStart;
    }).length,
    operations: openReceipts.length,
  };

  const deliverySummary = {
    toDeliver: openDeliveries.filter((delivery) => delivery.status === "Ready").length,
    late: openDeliveries.filter((delivery) => {
      const scheduleDate = delivery.deliveredAt || delivery.createdAt;
      return new Date(scheduleDate) < todayStart;
    }).length,
    waiting: openDeliveries.filter((delivery) => delivery.status === "Waiting").length,
    operations: openDeliveries.length,
  };

  return {
    totalProductsInStock: totalProductsAgg[0]?.count || 0,
    totalUnitsOnHand: stockSummary.totalUnitsOnHand || 0,
    lowStockItems: stockSummary.lowStockItems || 0,
    outOfStockItems: stockSummary.outOfStockItems || 0,
    pendingReceipts,
    pendingDeliveries,
    scheduledTransfers,
    openAdjustments,
    receiptSummary,
    deliverySummary,
  };
}

export async function getRecentActivities(input: GetDashboardInput = {}) {
  const limit =
    input.limit && input.limit > 0 && input.limit <= 100 ? input.limit : 20;

  const categoryProductIds = await getCategoryProductIds(input.categoryId);
  if (input.categoryId && categoryProductIds && categoryProductIds.length === 0) {
    return [];
  }
  const query: Record<string, unknown> = {};

  if (input.sourceType) {
    query.sourceType = input.sourceType;
  }

  if (input.warehouseId) {
    query.warehouseId = toObjectId(input.warehouseId);
  }

  if (input.locationId) {
    query.locationId = toObjectId(input.locationId);
  }

  if (categoryProductIds?.length) {
    query.productId = { $in: categoryProductIds };
  }

  return await StockLedger.find(query)
    .sort({ movementAt: -1, createdAt: -1 })
    .limit(limit)
    .populate("productId", "name sku")
    .populate("warehouseId", "name")
    .lean();
}
