import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getDashboardKpis } from "@/services/dashboard.service";
import {
  buildDashboardKpisCacheKey,
  getCache,
  setCache,
} from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cacheKey = buildDashboardKpisCacheKey();

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

    const kpis = await getDashboardKpis();

    await setCache(cacheKey, kpis, 60);

    return NextResponse.json(
      {
        success: true,
        data: kpis,
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
        message: error.message || "Failed to fetch dashboard KPIs.",
      },
      { status: 500 }
    );
  }
}