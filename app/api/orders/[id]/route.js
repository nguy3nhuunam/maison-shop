import { NextResponse } from "next/server";
import { getBearerToken, isAdminAuthError, verifyAdminToken } from "@/lib/auth";
import { deleteOrder } from "@/lib/db";

function requireAdmin(request) {
  const token = getBearerToken(request);
  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  verifyAdminToken(token);
}

function parseOrderId(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function DELETE(request, { params }) {
  try {
    requireAdmin(request);

    const resolvedParams = await Promise.resolve(params);
    const orderId = parseOrderId(resolvedParams?.id);
    if (!orderId) {
      return NextResponse.json({ message: "Invalid order id." }, { status: 400 });
    }

    const result = await deleteOrder(orderId);
    if (!result.deletedCount) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, id: orderId });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to delete order." },
      { status: 500 },
    );
  }
}
