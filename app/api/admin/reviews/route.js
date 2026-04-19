import { NextResponse } from "next/server";
import { getBearerToken, isAdminAuthError, verifyAdminToken } from "@/lib/auth";
import { getAllReviews } from "@/lib/db";

function requireAdmin(request) {
  const token = getBearerToken(request);
  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  verifyAdminToken(token);
}

export async function GET(request) {
  try {
    requireAdmin(request);
    const reviews = await getAllReviews();
    return NextResponse.json({ reviews });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to load reviews." },
      { status: 500 },
    );
  }
}
