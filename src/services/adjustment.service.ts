import mongoose, { Types } from "mongoose";
import Adjustment from "@/models/Adjustment";
import { getStockBalance, setStock } from "@/services/stock-balance.service";
import { createLedgerEntries } from "@/services/stock-ledger.service";

type AdjustmentItemInput = {
  productId: string;
  warehouseId: string;
  locationId?: string | null;
  countedQuantity: number;
  note?: string;
};

type CreateAdjustmentInput = {
  adjustmentNo: string;
  status?: "Draft" | "Waiting" | "Ready" | "Done" | "Canceled";
  reference?: string;
  reason?: string;
  note?: string;
  adjustedAt?: Date | string;
  createdBy?: string;
  items: AdjustmentItemInput[];
};

type UpdateAdjustmentInput = {
  reference?: string;
  reason?: string;
  note?: string;
  adjustedAt?: Date | string;
  status?: "Draft" | "Waiting" | "Ready" | "Canceled";
  items?: AdjustmentItemInput[];
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

function mapAdjustmentItems(items: AdjustmentItemInput[]) {
  return items.map((item) => ({
    productId: toObjectId(item.productId, "productId")!,
    warehouseId: toObjectId(item.warehouseId, "warehouseId")!,
    locationId: toObjectId(item.locationId, "locationId"),
    countedQuantity: item.countedQuantity,
    note: item.note,
  }));
}

function validateAdjustmentItems(items: AdjustmentItemInput[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Adjustment must contain at least one item.");
  }

  for (const item of items) {
    if (!item.productId) throw new Error("productId is required.");
    if (!item.warehouseId) throw new Error("warehouseId is required.");
    if (item.countedQuantity < 0) {
      throw new Error("countedQuantity cannot be negative.");
    }
  }
}

export async function createAdjustment(input: CreateAdjustmentInput) {
  if (!input.adjustmentNo?.trim()) {
    throw new Error("adjustmentNo is required.");
  }

  validateAdjustmentItems(input.items);

  const adjustment = await Adjustment.create({
    adjustmentNo: input.adjustmentNo.trim(),
    status: input.status ?? "Draft",
    reference: input.reference,
    reason: input.reason,
    note: input.note,
    adjustedAt: input.adjustedAt ? new Date(input.adjustedAt) : undefined,
    createdBy: toObjectId(input.createdBy, "createdBy"),
    items: mapAdjustmentItems(input.items),
  });

  return adjustment;
}

export async function listAdjustments() {
  return await Adjustment.find({}).sort({ createdAt: -1 }).lean();
}

export async function getAdjustmentById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid adjustment id.");
  }

  const adjustment = await Adjustment.findById(id);

  if (!adjustment) {
    throw new Error("Adjustment not found.");
  }

  return adjustment;
}

export async function updateAdjustment(id: string, input: UpdateAdjustmentInput) {
  const adjustment = await getAdjustmentById(id);

  if (adjustment.status === "Done" || adjustment.status === "Canceled") {
    throw new Error("Only non-final adjustments can be updated.");
  }

  if (input.items) {
    validateAdjustmentItems(input.items);
    adjustment.items = mapAdjustmentItems(input.items) as any;
  }

  if (input.reference !== undefined) {
    adjustment.reference = input.reference;
  }

  if (input.reason !== undefined) {
    adjustment.reason = input.reason;
  }

  if (input.note !== undefined) {
    adjustment.note = input.note;
  }

  if (input.adjustedAt !== undefined) {
    adjustment.adjustedAt = input.adjustedAt
      ? new Date(input.adjustedAt)
      : undefined;
  }

  if (input.status !== undefined) {
    adjustment.status = input.status;
  }

  await adjustment.save();
  return adjustment;
}

export async function validateAdjustment(id: string, validatedBy?: string) {
  const session = await mongoose.startSession();

  try {
    let validatedAdjustment: any = null;

    await session.withTransaction(async () => {
      const adjustment = await Adjustment.findById(id).session(session);

      if (!adjustment) {
        throw new Error("Adjustment not found.");
      }

      if (adjustment.status === "Done") {
        throw new Error("Adjustment is already validated.");
      }

      if (adjustment.status === "Canceled") {
        throw new Error("Canceled adjustment cannot be validated.");
      }

      if (!adjustment.items || adjustment.items.length === 0) {
        throw new Error("Adjustment has no items.");
      }

      const ledgerEntries = [];

      for (const item of adjustment.items) {
        const currentBalance = await getStockBalance({
          productId: item.productId,
          warehouseId: item.warehouseId,
          locationId: item.locationId ?? null,
          session,
        });

        const before = currentBalance.quantity;
        const after = item.countedQuantity;
        const difference = after - before;

        await setStock({
          productId: item.productId,
          warehouseId: item.warehouseId,
          locationId: item.locationId ?? null,
          quantity: after,
          session,
        });

        ledgerEntries.push({
          sourceType: "Adjustment" as const,
          sourceId: adjustment._id,
          sourceNo: adjustment.adjustmentNo,
          productId: item.productId,
          warehouseId: item.warehouseId,
          locationId: item.locationId ?? null,
          direction: "ADJUST" as const,
          quantity: Math.abs(difference),
          balanceBefore: before,
          balanceAfter: after,
          note: item.note || adjustment.note || adjustment.reason,
          movementAt: new Date(),
          createdBy: validatedBy ?? adjustment.createdBy?.toString(),
        });
      }

      await createLedgerEntries(ledgerEntries, session);

      adjustment.status = "Done";
      adjustment.validatedAt = new Date();
      adjustment.validatedBy = validatedBy
        ? toObjectId(validatedBy, "validatedBy")
        : adjustment.validatedBy;

      await adjustment.save({ session });
      validatedAdjustment = adjustment;
    });

    return validatedAdjustment;
  } finally {
    session.endSession();
  }
}