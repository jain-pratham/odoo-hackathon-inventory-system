import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product.model";
import { getUserFromToken } from "@/lib/auth";
import { getCache, setCache, deleteCacheByPattern } from "@/lib/cache";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  await connectDB();

  const { id } = await context.params;

  const cacheKey = `products:detail:${id}`;

  const cached = await getCache(cacheKey);

  if (cached) {
    return NextResponse.json(cached);
  }

  const product = await Product.findById(id).populate("categoryId");

  if (!product) {
    return NextResponse.json(
      { message: "Product not found" },
      { status: 404 }
    );
  }

  await setCache(cacheKey, product, 60);

  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  await connectDB();

  try {
    getUserFromToken(req);

    const { id } = await context.params;
    const body = await req.json();

    const product = await Product.findByIdAndUpdate(id, body, { new: true });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    await deleteCacheByPattern("products:*");

    return NextResponse.json({
      message: "Product updated",
      product
    });

  } catch {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  await connectDB();

  try {
    getUserFromToken(req);

    const { id } = await context.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    await deleteCacheByPattern("products:*");

    return NextResponse.json({
      message: "Product deleted"
    });

  } catch {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
}
