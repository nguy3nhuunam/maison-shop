import { NextResponse } from "next/server";
import { deleteFomoItem, updateFomoItem } from "@/lib/db";
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
    const payload = await request.json();
    const item = await updateFomoItem(params.id, payload);

    if (!item) {
      return NextResponse.json({ message: "FOMO item not found." }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to update FOMO item." },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    requireAdmin(request);
    await deleteFomoItem(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to delete FOMO item." },
      { status: 500 },
    );
  }
}
