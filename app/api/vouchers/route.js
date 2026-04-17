import { NextResponse } from "next/server";
import {
  createVoucher,
  getAllVouchers,
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
    requireAdmin(request);
    return NextResponse.json({ vouchers: await getAllVouchers() });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    return NextResponse.json({ message: error.message || "VOUCHERS_LOAD_FAILED" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    requireAdmin(request);
    const payload = await request.json();
    const voucher = await createVoucher(payload);
    return NextResponse.json({ voucher });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    return NextResponse.json({ message: error.message || "VOUCHER_CREATE_FAILED" }, { status: 500 });
  }
}
