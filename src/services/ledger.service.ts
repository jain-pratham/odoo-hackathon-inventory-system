import { Types } from "mongoose";
import StockLedger from "@/models/StockLedger";

type ListLedgerInput = {
  productId?: string;
  warehouseId?: string;
  locationId?: string;
  sourceType?: "Receipt" | "Delivery" | "Transfer" | "Adjustment";
  sourceId?: string;
  limit?: number;
};

function toObjectId(
  id: string | Types.ObjectId | null | undefined,
  fieldName = "id"
) {
  if (!id) return null;

  if (id instanceof Types.ObjectId) {
    return id;
  }

  if (!Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${fieldName}. Must be a valid Mongo ObjectId.`);
  }

  return new Types.ObjectId(id);
}

export async function listLedgerEntries(input: ListLedgerInput = {}) {
  const query: Record<string, any> = {};

  if (input.productId) {
    query.productId = toObjectId(input.productId, "productId");
  }

  if (input.warehouseId) {
    query.warehouseId = toObjectId(input.warehouseId, "warehouseId");
  }

  if (input.locationId) {
    query.locationId = toObjectId(input.locationId, "locationId");
  }

  if (input.sourceType) {
    query.sourceType = input.sourceType;
  }

  if (input.sourceId) {
    query.sourceId = toObjectId(input.sourceId, "sourceId");
  }

  const limit =
    input.limit && input.limit > 0 && input.limit <= 200 ? input.limit : 50;

  return await StockLedger.find(query)
    .sort({ movementAt: -1, createdAt: -1 })
    .limit(limit)
    .populate("productId", "name sku")
    .populate("warehouseId", "name")
    .lean();
}