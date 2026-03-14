import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { createTransfer, listTransfers } from "@/services/transfer.service";
import {
  buildTransferListCacheKey,
  getCache,
  setCache,
  invalidateTransferCache,
} from "@/lib/cache";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.headers.get("x-real-ip") || "unknown";
}

export async function GET() {
  try {
    const cacheKey = buildTransferListCacheKey();

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
    const transfers = await listTransfers();

    await setCache(cacheKey, transfers, 60);

    return NextResponse.json(
      {
        success: true,
        data: transfers,
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
        message: error.message || "Failed to fetch transfers.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    const rateLimit = await checkRateLimit({
      key: `ratelimit:transfers:create:${ip}`,
      limit: 20,
      windowSeconds: 60,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many create requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter),
          },
        }
      );
    }

    await connectDB();

    const body = await req.json();
    const transfer = await createTransfer(body);

    await invalidateTransferCache(transfer._id.toString());

    return NextResponse.json(
      {
        success: true,
        message: "Transfer created successfully.",
        data: transfer,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create transfer.",
      },
      { status: 400 }
    );
  }
}