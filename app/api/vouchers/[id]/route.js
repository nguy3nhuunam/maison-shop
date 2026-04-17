import { NextResponse } from "next/server";
import {
  deleteVoucher,
  getVoucherById,
  updateVoucher,
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
    const existing = await getVoucherById(params.id);

    if (!existing) {
      return NextResponse.json({ message: "VOUCHER_NOT_FOUND" }, { status: 404 });
    }

    const payload = await request.json();
    const voucher = await updateVoucher(params.id, payload);
    return NextResponse.json({ voucher });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    return NextResponse.json({ message: error.message || "VOUCHER_UPDATE_FAILED" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    requireAdmin(request);
    await deleteVoucher(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    return NextResponse.json({ message: error.message || "VOUCHER_DELETE_FAILED" }, { status: 500 });
  }
}
