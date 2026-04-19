import { NextResponse } from "next/server";
import { createTag, getActiveTags, getAllTags } from "@/lib/db";
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
      return NextResponse.json({ tags: await getAllTags() });
    }

    return NextResponse.json({ tags: await getActiveTags() });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to load tags." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    requireAdmin(request);
    const payload = await request.json();
    const tag = await createTag(payload);
    return NextResponse.json({ tag });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to create tag." },
      { status: 500 },
    );
  }
}
