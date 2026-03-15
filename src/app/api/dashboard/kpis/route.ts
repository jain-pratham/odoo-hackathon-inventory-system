import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getDashboardKpis } from "@/services/dashboard.service";
import {
  DashboardSourceType,
  DashboardStatus,
} from "@/types/dashboard.types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const sourceTypeParam = searchParams.get("sourceType");
    const statusParam = searchParams.get("status");
    const allowedSourceTypes: DashboardSourceType[] = [
      "Receipt",
      "Delivery",
      "Transfer",
      "Adjustment",
    ];
    const allowedStatuses: DashboardStatus[] = [
      "Draft",
      "Waiting",
      "Ready",
      "Done",
      "Canceled",
    ];
    const sourceType =
      sourceTypeParam &&
      allowedSourceTypes.includes(sourceTypeParam as DashboardSourceType)
        ? (sourceTypeParam as DashboardSourceType)
        : "";
    const status =
      statusParam && allowedStatuses.includes(statusParam as DashboardStatus)
        ? (statusParam as DashboardStatus)
        : "";
    const kpis = await getDashboardKpis({
      sourceType,
      status,
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
