import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getRecentActivities } from "@/services/dashboard.service";
import {
  buildDashboardActivitiesCacheKey,
  getCache,
  setCache,
} from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : 20;

    const safeLimit = limit > 0 && limit <= 100 ? limit : 20;
    const cacheKey = buildDashboardActivitiesCacheKey(safeLimit);

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

    const activities = await getRecentActivities({ limit: safeLimit });

    await setCache(cacheKey, activities, 60);

    return NextResponse.json(
      {
        success: true,
        data: activities,
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
        message: error.message || "Failed to fetch dashboard activities.",
      },
      { status: 500 }
    );
  }
}