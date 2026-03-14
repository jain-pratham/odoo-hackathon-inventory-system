import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getDeliveryById, updateDelivery } from "@/services/delivery.service";
import {
  buildDeliveryDetailCacheKey,
  getCache,
  setCache,
  invalidateDeliveryCache,
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
    const cacheKey = buildDeliveryDetailCacheKey(id);

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
    const delivery = await getDeliveryById(id);

    await setCache(cacheKey, delivery, 60);

    return NextResponse.json(
      {
        success: true,
        data: delivery,
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
        message: error.message || "Failed to fetch delivery.",
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
      key: `ratelimit:deliveries:update:${ip}`,
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
    const delivery = await updateDelivery(id, body);

    await invalidateDeliveryCache(id);

    return NextResponse.json(
      {
        success: true,
        message: "Delivery updated successfully.",
        data: delivery,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update delivery.",
      },
      { status: 400 }
    );
  }
}