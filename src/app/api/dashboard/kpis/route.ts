import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getDashboardKpis } from "@/services/dashboard.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const kpis = await getDashboardKpis({
      sourceType: searchParams.get("sourceType") || "",
      status: searchParams.get("status") || "",
      warehouseId: searchParams.get("warehouseId") || undefined,
      locationId: searchParams.get("locationId") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        data: kpis,
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
            : "Failed to fetch dashboard KPIs.",
      },
      { status: 500 }
    );
  }
}
