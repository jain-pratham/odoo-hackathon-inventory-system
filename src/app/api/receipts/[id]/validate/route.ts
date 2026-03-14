import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { validateReceipt } from "@/services/receipt.service";
import { invalidateReceiptCache, invalidateLedgerCache, invalidateDashboardCache } from "@/lib/cache";
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
      key: `ratelimit:receipts:validate:${ip}`,
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

    const receipt = await validateReceipt(id, body.validatedBy);

    // Clear receipt caches
    await invalidateReceiptCache(id);

    // Clear dashboard caches because KPI/activity may change after validation
    await invalidateDashboardCache();
    await invalidateLedgerCache();

    return NextResponse.json(
      {
        success: true,
        message: "Receipt validated successfully.",
        data: receipt,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to validate receipt.",
      },
      { status: 400 }
    );
  }
}