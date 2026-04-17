import { NextResponse } from "next/server";
import { validateVoucher } from "@/lib/db";

export async function POST(request) {
  try {
    const payload = await request.json();
    const voucher = await validateVoucher(payload.code);
    return NextResponse.json({ voucher });
  } catch (error) {
    return NextResponse.json({ message: error.message || "VOUCHER_INVALID" }, { status: 400 });
  }
}
