import mongoose, { HydratedDocument, Types } from "mongoose";
import Transfer, { ITransfer } from "@/models/Transfer";
import {
  decreaseStock,
  increaseStock,
} from "@/services/stock-balance.service";
import { createLedgerEntries } from "@/services/stock-ledger.service";

type TransferItemInput = {
  productId: string;
  fromWarehouseId: string;
  fromLocationId?: string | null;
  toWarehouseId: string;
  toLocationId?: string | null;
  quantity: number;
  note?: string;
};

type CreateTransferInput = {
  transferNo: string;
  status?: "Draft" | "Waiting" | "Ready" | "Done" | "Canceled";
  reference?: string;
  note?: string;
  transferredAt?: Date | string;
  createdBy?: string;
  items: TransferItemInput[];
};

type UpdateTransferInput = {
  reference?: string;
  note?: string;
  transferredAt?: Date | string;
  status?: "Draft" | "Waiting" | "Ready" | "Canceled";
  items?: TransferItemInput[];
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

function mapTransferItems(items: TransferItemInput[]) {
  return items.map((item) => ({
    productId: toObjectId(item.productId, "productId")!,
    fromWarehouseId: toObjectId(item.fromWarehouseId, "fromWarehouseId")!,
    fromLocationId: toObjectId(item.fromLocationId, "fromLocationId"),
    toWarehouseId: toObjectId(item.toWarehouseId, "toWarehouseId")!,
    toLocationId: toObjectId(item.toLocationId, "toLocationId"),
    quantity: item.quantity,
    note: item.note,
  }));
}

function validateTransferItems(items: TransferItemInput[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Transfer must contain at least one item.");
  }

  for (const item of items) {
    if (!item.productId) throw new Error("productId is required.");
    if (!item.fromWarehouseId) throw new Error("fromWarehouseId is required.");
    if (!item.toWarehouseId) throw new Error("toWarehouseId is required.");
    if (!item.quantity || item.quantity <= 0) {
      throw new Error("Item quantity must be greater than 0.");
    }

    const sameWarehouse =
      item.fromWarehouseId === item.toWarehouseId &&
      (item.fromLocationId || null) === (item.toLocationId || null);

    if (sameWarehouse) {
      throw new Error(
        "Source and destination cannot be exactly the same for a transfer item."
      );
    }
  }
}

export async function createTransfer(input: CreateTransferInput) {
  if (!input.transferNo?.trim()) {
    throw new Error("transferNo is required.");
  }

  validateTransferItems(input.items);

  const transfer = await Transfer.create({
    transferNo: input.transferNo.trim(),
    status: input.status ?? "Draft",
    reference: input.reference,
    note: input.note,
    transferredAt: input.transferredAt
      ? new Date(input.transferredAt)
      : undefined,
    createdBy: toObjectId(input.createdBy, "createdBy"),
    items: mapTransferItems(input.items),
  });

  return transfer;
}

export async function listTransfers() {
  return await Transfer.find({}).sort({ createdAt: -1 }).lean();
}

export async function getTransferById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid transfer id.");
  }

  const transfer = await Transfer.findById(id)
    .populate("items.productId", "name sku unit")
    .populate("items.fromWarehouseId", "name")
    .populate("items.fromLocationId", "name")
    .populate("items.toWarehouseId", "name")
    .populate("items.toLocationId", "name");

  if (!transfer) {
    throw new Error("Transfer not found.");
  }

  return transfer;
}

export async function updateTransfer(id: string, input: UpdateTransferInput) {
  const transfer = await getTransferById(id);

  if (transfer.status === "Done" || transfer.status === "Canceled") {
    throw new Error("Only non-final transfers can be updated.");
  }

  if (input.items) {
    validateTransferItems(input.items);
    transfer.set("items", mapTransferItems(input.items));
  }

  if (input.reference !== undefined) {
    transfer.reference = input.reference;
  }

  if (input.note !== undefined) {
    transfer.note = input.note;
  }

  if (input.transferredAt !== undefined) {
    transfer.transferredAt = input.transferredAt
      ? new Date(input.transferredAt)
      : undefined;
  }

  if (input.status !== undefined) {
    transfer.status = input.status;
  }

  await transfer.save();
  return transfer;
}

export async function validateTransfer(id: string, validatedBy?: string) {
  const session = await mongoose.startSession();

  try {
    let validatedTransfer: HydratedDocument<ITransfer> | null = null;

    await session.withTransaction(async () => {
      const transfer = await Transfer.findById(id).session(session);

      if (!transfer) {
        throw new Error("Transfer not found.");
      }

      if (transfer.status === "Done") {
        throw new Error("Transfer is already validated.");
      }

      if (transfer.status === "Canceled") {
        throw new Error("Canceled transfer cannot be validated.");
      }

      if (!transfer.items || transfer.items.length === 0) {
        throw new Error("Transfer has no items.");
      }

      const ledgerEntries = [];

      for (const item of transfer.items) {
        const outResult = await decreaseStock({
          productId: item.productId,
          warehouseId: item.fromWarehouseId,
          locationId: item.fromLocationId ?? null,
          quantity: item.quantity,
          session,
        });

        const inResult = await increaseStock({
          productId: item.productId,
          warehouseId: item.toWarehouseId,
          locationId: item.toLocationId ?? null,
          quantity: item.quantity,
          session,
        });

        ledgerEntries.push(
          {
            sourceType: "Transfer" as const,
            sourceId: transfer._id,
            sourceNo: transfer.transferNo,
            productId: item.productId,
            warehouseId: item.fromWarehouseId,
            locationId: item.fromLocationId ?? null,
            direction: "OUT" as const,
            quantity: item.quantity,
            balanceBefore: outResult.before,
            balanceAfter: outResult.after,
            note: item.note || transfer.note,
            movementAt: new Date(),
            createdBy: validatedBy ?? transfer.createdBy?.toString(),
          },
          {
            sourceType: "Transfer" as const,
            sourceId: transfer._id,
            sourceNo: transfer.transferNo,
            productId: item.productId,
            warehouseId: item.toWarehouseId,
            locationId: item.toLocationId ?? null,
            direction: "IN" as const,
            quantity: item.quantity,
            balanceBefore: inResult.before,
            balanceAfter: inResult.after,
            note: item.note || transfer.note,
            movementAt: new Date(),
            createdBy: validatedBy ?? transfer.createdBy?.toString(),
          }
        );
      }

      await createLedgerEntries(ledgerEntries, session);

      transfer.status = "Done";
      transfer.validatedAt = new Date();
      transfer.validatedBy = validatedBy
        ? toObjectId(validatedBy, "validatedBy")
        : transfer.validatedBy;

      await transfer.save({ session });
      validatedTransfer = transfer;
    });

    return validatedTransfer;
  } finally {
    session.endSession();
  }
}
