import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { listLedgerEntries } from "@/services/ledger.service";
import { getCache, setCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

function buildLedgerCacheKey(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const productId = searchParams.get("productId") || "";
  const warehouseId = searchParams.get("warehouseId") || "";
  const locationId = searchParams.get("locationId") || "";
  const sourceType = searchParams.get("sourceType") || "";
  const sourceId = searchParams.get("sourceId") || "";
  const limit = searchParams.get("limit") || "50";

  return `ledger:list:product=${productId}:warehouse=${warehouseId}:location=${locationId}:sourceType=${sourceType}:sourceId=${sourceId}:limit=${limit}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const productId = searchParams.get("productId") || undefined;
    const warehouseId = searchParams.get("warehouseId") || undefined;
    const locationId = searchParams.get("locationId") || undefined;
    const sourceType = searchParams.get("sourceType") as
      | "Receipt"
      | "Delivery"
      | "Transfer"
      | "Adjustment"
      | null;
    const sourceId = searchParams.get("sourceId") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : 50;

    const cacheKey = buildLedgerCacheKey(req);

    const cached = await getCache<any[]>(cacheKey);
    if (cached) {
      return NextResponse.json(
        {
          success: true,
          data: cached,
          cached: true,
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    await connectDB();

    const entries = await listLedgerEntries({
      productId,
      warehouseId,
      locationId,
      sourceType: sourceType || undefined,
      sourceId,
      limit,
    });

    await setCache(cacheKey, entries, 60);

    return NextResponse.json(
      {
        success: true,
        data: entries,
        cached: false,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch ledger entries.",
      },
      { status: 400 }
    );
  }
}