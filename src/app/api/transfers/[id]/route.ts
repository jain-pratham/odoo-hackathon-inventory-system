import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getTransferById, updateTransfer } from "@/services/transfer.service";
import {
  buildTransferDetailCacheKey,
  getCache,
  setCache,
  invalidateTransferCache,
} from "@/lib/cache";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.headers.get("x-real-ip") || "unknown";
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const cacheKey = buildTransferDetailCacheKey(id);

    const cached = await getCache<any>(cacheKey);
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
    const transfer = await getTransferById(id);

    await setCache(cacheKey, transfer, 60);

    return NextResponse.json(
      {
        success: true,
        data: transfer,
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
        message: error.message || "Failed to fetch transfer.",
      },
      { status: 404 }
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const ip = getClientIp(req);

    const rateLimit = await checkRateLimit({
      key: `ratelimit:transfers:update:${ip}`,
      limit: 30,
      windowSeconds: 60,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many update requests. Please try again later.",
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
    const transfer = await updateTransfer(id, body);

    await invalidateTransferCache(id);

    return NextResponse.json(
      {
        success: true,
        message: "Transfer updated successfully.",
        data: transfer,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update transfer.",
      },
      { status: 400 }
    );
  }
}