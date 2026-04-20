import { NextResponse } from "next/server";
import {
  deleteProduct,
  getProductById,
  updateProduct,
} from "@/lib/db";
import { getBearerToken, isAdminAuthError, verifyAdminToken } from "@/lib/auth";

function requireAdmin(request) {
  const token = getBearerToken(request);
  if (!token) {
    throw new Error("UNAUTHORIZED");
  }
  verifyAdminToken(token);
}

async function resolveProductId(params) {
  const resolvedParams = await params;
  const rawId = resolvedParams?.id;
  const productId = Number.parseInt(rawId, 10);

  if (!Number.isInteger(productId) || productId <= 0) {
    return null;
  }

  return productId;
}

export async function PUT(request, { params }) {
  try {
    requireAdmin(request);
    const productId = await resolveProductId(params);

    if (!productId) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    const existing = await getProductById(productId);

    if (!existing) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    const payload = await request.json();
    const product = await updateProduct(productId, payload);

    return NextResponse.json({ product });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to update product." },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    requireAdmin(request);
    const productId = await resolveProductId(params);

    if (!productId) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    await deleteProduct(productId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to delete product." },
      { status: 500 },
    );
  }
}
