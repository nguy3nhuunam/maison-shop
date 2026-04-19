import { NextResponse } from "next/server";
import { getBearerToken, isAdminAuthError, verifyAdminToken } from "@/lib/auth";
import { deleteProductReview, updateProductReview } from "@/lib/db";

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
    const payload = await request.json();
    const review = await updateProductReview(params.id, {
      status: payload.status,
      verifiedBuyer: payload.verifiedBuyer,
    });

    if (!review) {
      return NextResponse.json({ message: "Review not found." }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to update review." },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    requireAdmin(request);
    const result = await deleteProductReview(params.id);

    if (!result.deletedCount) {
      return NextResponse.json({ message: "Review not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to delete review." },
      { status: 500 },
    );
  }
}
