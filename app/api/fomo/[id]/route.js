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

function parseFomoId(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function PUT(request, { params }) {
  try {
    requireAdmin(request);
    const resolvedParams = await Promise.resolve(params);
    const itemId = parseFomoId(resolvedParams?.id);
    if (!itemId) {
      return NextResponse.json({ message: "Invalid FOMO item id." }, { status: 400 });
    }

    const payload = await request.json();
    const item = await updateFomoItem(itemId, payload);

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
    const resolvedParams = await Promise.resolve(params);
    const itemId = parseFomoId(resolvedParams?.id);
    if (!itemId) {
      return NextResponse.json({ message: "Invalid FOMO item id." }, { status: 400 });
    }

    const result = await deleteFomoItem(itemId);
    if (!result.deletedCount) {
      return NextResponse.json({ message: "FOMO item not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, id: itemId });
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
