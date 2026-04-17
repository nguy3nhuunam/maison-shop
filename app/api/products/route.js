import { NextResponse } from "next/server";
import {
  createProduct,
  getActiveProducts,
  getAllProducts,
} from "@/lib/db";
import { getBearerToken, isAdminAuthError, verifyAdminToken } from "@/lib/auth";

function requireAdmin(request) {
  const token = getBearerToken(request);
  if (!token) {
    throw new Error("UNAUTHORIZED");
  }
  verifyAdminToken(token);
}

export async function GET(request) {
  const includeHidden = request.nextUrl.searchParams.get("includeHidden") === "true";
  const products = includeHidden ? await getAllProducts() : await getActiveProducts();
  return NextResponse.json({ products });
}

export async function POST(request) {
  try {
    requireAdmin(request);
    const payload = await request.json();
    const product = await createProduct(payload);

    return NextResponse.json({ product });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to create product." },
      { status: 500 },
    );
  }
}
