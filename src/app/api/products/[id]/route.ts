import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product.model";
import { getUserFromToken } from "@/lib/auth";
import { getCache, setCache, deleteCacheByPattern } from "@/lib/cache";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const cacheKey = `products:detail:${params.id}`;

  const cached = await getCache(cacheKey);

  if (cached) {
    return NextResponse.json(cached);
  }

  const product = await Product.findById(params.id)
    .populate("categoryId");

  if (!product) {
    return NextResponse.json(
      { message: "Product not found" },
      { status: 404 }
    );
  }

  await setCache(cacheKey, product, 60);

  return NextResponse.json(product);
}



export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  try {
    getUserFromToken(req);

    const body = await req.json();

    const product = await Product.findByIdAndUpdate(
      (await params).id,
      body,
      { new: true }
    );

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


export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  try {
    getUserFromToken(req);

    const product = await Product.findByIdAndDelete((await params).id);

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