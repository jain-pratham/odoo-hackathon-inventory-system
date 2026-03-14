import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAdjustmentById, updateAdjustment } from "@/services/adjustment.service";
import {
  buildAdjustmentDetailCacheKey,
  getCache,
  setCache,
  invalidateAdjustmentCache,
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
    const cacheKey = buildAdjustmentDetailCacheKey(id);

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
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    await connectDB();
    const adjustment = await getAdjustmentById(id);

    await setCache(cacheKey, adjustment, 60);

    return NextResponse.json(
      {
        success: true,
        data: adjustment,
        cached: false,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch adjustment.",
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
      key: `ratelimit:adjustments:update:${ip}`,
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
    const adjustment = await updateAdjustment(id, body);

    await invalidateAdjustmentCache(id);

    return NextResponse.json(
      {
        success: true,
        message: "Adjustment updated successfully.",
        data: adjustment,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update adjustment.",
      },
      { status: 400 }
    );
  }
}