import { NextResponse } from "next/server";
import { deleteTag, updateTag } from "@/lib/db";
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
    const tag = await updateTag(params.id, payload);

    if (!tag) {
      return NextResponse.json({ message: "Tag not found." }, { status: 404 });
    }

    return NextResponse.json({ tag });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to update tag." },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    requireAdmin(request);
    await deleteTag(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to delete tag." },
      { status: 500 },
    );
  }
}
