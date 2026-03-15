import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Stock from "@/models/stock.model";
import { getCache, setCache } from "@/lib/cache";

type RouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  await connectDB();

  const { productId } = await context.params;
  const cacheKey = `stock:product:${productId}`;

  const cached = await getCache(cacheKey);

  if (cached) {
    return NextResponse.json(cached);
  }

  const stock = await Stock.find({
    productId
  }).populate({
    path: "locationId",
    populate: { path: "warehouseId" }
  });

  await setCache(cacheKey, stock, 60);

  return NextResponse.json(stock);
}
