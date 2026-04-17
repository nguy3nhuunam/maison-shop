import { NextResponse } from "next/server";
import {
  createFomoItem,
  getActiveFomoItems,
  getAllFomoItems,
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
  try {
    const includeAll = request.nextUrl.searchParams.get("includeAll") === "true";

    if (includeAll) {
      requireAdmin(request);
      return NextResponse.json({ items: await getAllFomoItems() });
    }

    return NextResponse.json({ items: await getActiveFomoItems() });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to load FOMO items." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    requireAdmin(request);
    const payload = await request.json();
    const item = await createFomoItem(payload);
    return NextResponse.json({ item });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to create FOMO item." },
      { status: 500 },
    );
  }
}
