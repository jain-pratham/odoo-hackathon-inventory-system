import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getRecentActivities } from "@/services/dashboard.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : 20;

    const safeLimit = limit > 0 && limit <= 100 ? limit : 20;

    await connectDB();

    const activities = await getRecentActivities({
      limit: safeLimit,
      sourceType: searchParams.get("sourceType") || "",
      warehouseId: searchParams.get("warehouseId") || undefined,
      locationId: searchParams.get("locationId") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        data: activities,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard activities.",
      },
      { status: 500 }
    );
  }
}
