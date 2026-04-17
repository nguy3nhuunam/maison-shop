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

export async function PUT(request, { params }) {
  try {
    requireAdmin(request);
    const existing = await getProductById(params.id);

    if (!existing) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    const payload = await request.json();
    const product = await updateProduct(params.id, payload);

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
    await deleteProduct(params.id);
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
