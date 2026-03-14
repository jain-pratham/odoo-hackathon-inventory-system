import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { validateDelivery } from "@/services/delivery.service";
import { invalidateDeliveryCache, invalidateDashboardCache, invalidateLedgerCache } from "@/lib/cache";
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

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const ip = getClientIp(req);

    const rateLimit = await checkRateLimit({
      key: `ratelimit:deliveries:validate:${ip}`,
      limit: 10,
      windowSeconds: 60,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many validate requests. Please try again later.",
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

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const delivery = await validateDelivery(id, body.validatedBy);

    await invalidateDeliveryCache(id);
    await invalidateLedgerCache();
    await invalidateDashboardCache();

    return NextResponse.json(
      {
        success: true,
        message: "Delivery validated successfully.",
        data: delivery,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to validate delivery.",
      },
      { status: 400 }
    );
  }
}