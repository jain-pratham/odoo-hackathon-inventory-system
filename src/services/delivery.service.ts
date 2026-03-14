import mongoose, { Types } from "mongoose";
import Delivery from "@/models/Delivery";
import { decreaseStock, getStockBalance } from "@/services/stock-balance.service";
import { createLedgerEntries } from "@/services/stock-ledger.service";

type DeliveryItemInput = {
  productId: string;
  warehouseId: string;
  locationId?: string | null;
  quantity: number;
  note?: string;
};

type CreateDeliveryInput = {
  deliveryNo: string;
  status?: "Draft" | "Waiting" | "Ready" | "Done" | "Canceled";
  reference?: string;
  note?: string;
  deliveredAt?: Date | string;
  createdBy?: string;
  items: DeliveryItemInput[];
};

type UpdateDeliveryInput = {
  reference?: string;
  note?: string;
  deliveredAt?: Date | string;
  status?: "Draft" | "Waiting" | "Ready" | "Canceled";
  items?: DeliveryItemInput[];
};

function toObjectId(id: string | Types.ObjectId | null | undefined) {
  if (!id) return null;
  return new Types.ObjectId(id);
}

function mapDeliveryItems(items: DeliveryItemInput[]) {
  return items.map((item) => ({
    productId: toObjectId(item.productId)!,
    warehouseId: toObjectId(item.warehouseId)!,
    locationId: toObjectId(item.locationId),
    quantity: item.quantity,
    note: item.note,
  }));
}

function validateDeliveryItems(items: DeliveryItemInput[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Delivery must contain at least one item.");
  }

  for (const item of items) {
    if (!item.productId) throw new Error("productId is required.");
    if (!item.warehouseId) throw new Error("warehouseId is required.");
    if (!item.quantity || item.quantity <= 0) {
      throw new Error("Item quantity must be greater than 0.");
    }
  }
}

export async function createDelivery(input: CreateDeliveryInput) {
  if (!input.deliveryNo?.trim()) {
    throw new Error("deliveryNo is required.");
  }

  validateDeliveryItems(input.items);

  const delivery = await Delivery.create({
    deliveryNo: input.deliveryNo.trim(),
    status: input.status ?? "Draft",
    reference: input.reference,
    note: input.note,
    deliveredAt: input.deliveredAt ? new Date(input.deliveredAt) : undefined,
    createdBy: toObjectId(input.createdBy),
    items: mapDeliveryItems(input.items),
  });

  return delivery;
}

export async function listDeliveries() {
  return await Delivery.find({}).sort({ createdAt: -1 }).lean();
}

export async function getDeliveryById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid delivery id.");
  }

  const delivery = await Delivery.findById(id);

  if (!delivery) {
    throw new Error("Delivery not found.");
  }

  return delivery;
}

export async function updateDelivery(id: string, input: UpdateDeliveryInput) {
  const delivery = await getDeliveryById(id);

  if (delivery.status === "Done" || delivery.status === "Canceled") {
    throw new Error("Only non-final deliveries can be updated.");
  }

  if (input.items) {
    validateDeliveryItems(input.items);
    delivery.items = mapDeliveryItems(input.items) as any;
  }

  if (input.reference !== undefined) {
    delivery.reference = input.reference;
  }

  if (input.note !== undefined) {
    delivery.note = input.note;
  }

  if (input.deliveredAt !== undefined) {
    delivery.deliveredAt = input.deliveredAt
      ? new Date(input.deliveredAt)
      : undefined;
  }

  if (input.status !== undefined) {
    delivery.status = input.status;
  }

  await delivery.save();
  return delivery;
}
export async function checkAvailability(id: string) {
  const delivery = await Delivery.findById(id);
  if (!delivery) throw new Error("Delivery not found");
  if (delivery.status === "Done" || delivery.status === "Canceled") {
    throw new Error("Cannot check availability on a finalized order.");
  }

  let allAvailable = true;

  for (const item of delivery.items) {
    const stock = await getStockBalance({
      productId: item.productId,
      warehouseId: item.warehouseId,
      locationId: item.locationId || null,
    });

    if (stock.quantity < item.quantity) {
      allAvailable = false;
      break;
    }
  }

  delivery.status = allAvailable ? "Ready" : "Waiting";
  await delivery.save();
  return delivery;
}
export async function validateDelivery(id: string, validatedBy?: string) {
  const session = await mongoose.startSession();

  try {
    let validatedDelivery: any = null;

    await session.withTransaction(async () => {
      const delivery = await Delivery.findById(id).session(session);

      if (!delivery) {
        throw new Error("Delivery not found.");
      }

      if (delivery.status === "Done") {
        throw new Error("Delivery is already validated.");
      }

      if (delivery.status === "Canceled") {
        throw new Error("Canceled delivery cannot be validated.");
      }

      if (!delivery.items || delivery.items.length === 0) {
        throw new Error("Delivery has no items.");
      }

      const ledgerEntries = [];

      for (const item of delivery.items) {
        const stockResult = await decreaseStock({
          productId: item.productId,
          warehouseId: item.warehouseId,
          locationId: item.locationId ?? null,
          quantity: item.quantity,
          session,
        });

        ledgerEntries.push({
          sourceType: "Delivery" as const,
          sourceId: delivery._id,
          sourceNo: delivery.deliveryNo,
          productId: item.productId,
          warehouseId: item.warehouseId,
          locationId: item.locationId ?? null,
          direction: "OUT" as const,
          quantity: item.quantity,
          balanceBefore: stockResult.before,
          balanceAfter: stockResult.after,
          note: item.note || delivery.note,
          movementAt: new Date(),
          createdBy: validatedBy ?? delivery.createdBy?.toString(),
        });
      }

      await createLedgerEntries(ledgerEntries, session);

      delivery.status = "Done";
      delivery.validatedAt = new Date();
      delivery.validatedBy = validatedBy ? toObjectId(validatedBy) : delivery.validatedBy;

      await delivery.save({ session });
      validatedDelivery = delivery;
    });

    return validatedDelivery;
  } finally {
    session.endSession();
  }
}