import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product.model";
import { getUserFromToken } from "@/lib/auth";
import { getCache, setCache, deleteCacheByPattern } from "@/lib/cache";
import { NextRequest } from "next/server";
import categoryModel from "@/models/category.model";

const PRODUCTS_LIST_KEY = "products:list";

export async function POST(req: NextRequest) {
  await connectDB();

  // 1. Authenticate FIRST
  try {
    getUserFromToken(req);
  } catch (error) {
    return NextResponse.json(
      { message: "Unauthorized: Invalid or missing token" },
      { status: 401 }
    );
  }

  // 2. Perform Database Operations
  try {
    const body = await req.json();

    const product = await Product.create({
      name: body.name,
      sku: body.sku,
      // Pass null if categoryId is an empty string to prevent Mongoose CastErrors
      categoryId: body.categoryId ? body.categoryId : null, 
      unit: body.unit,
      reorderLevel: body.reorderLevel
    });

    // Clear products cache
    await deleteCacheByPattern("products:*");

    return NextResponse.json(
      { message: "Product created", product },
      { status: 201 } // 201 Created
    );

  } catch (error: any) {
    // 🚨 THIS WILL PRINT THE REAL ERROR IN YOUR VS CODE TERMINAL
    console.error("PRODUCT CREATE ERROR:", error); 
    
    return NextResponse.json(
      { message: error.message || "Failed to create product" },
      { status: 400 } // 400 Bad Request
    );
  }
}

export async function GET() {
  await connectDB();

  // Check Redis cache first
  const cached = await getCache(PRODUCTS_LIST_KEY);

  if (cached) {
    return NextResponse.json(cached);
  }

  // Fetch from DB
  const products = await Product.find().populate("categoryId");

  // Store in Redis
  await setCache(PRODUCTS_LIST_KEY, products, 60);

  return NextResponse.json(products);
}