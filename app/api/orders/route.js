import { NextResponse } from "next/server";
import { getBearerToken, isAdminAuthError, verifyAdminToken } from "@/lib/auth";
import {
  createOrder,
  getAllOrders,
  incrementVoucherUsage,
  reserveOrderItems,
  restoreReservedStock,
  validateVoucher,
} from "@/lib/db";
import { isCloudinaryConfigured, uploadDataUri } from "@/lib/cloudinary";
import { appendOrderToSheet } from "@/lib/googleSheets";
import { getOrderPricing } from "@/lib/pricing";

export const runtime = "nodejs";

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
    const orders = await getAllOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to load orders." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const customer = {
      name: payload.name?.trim(),
      phone: payload.phone?.trim(),
      addressText: payload.addressText?.trim() || payload.address?.trim() || "",
      addressImage: payload.addressImage || "",
    };
    const voucherCode = String(payload.voucherCode || "").trim();

    if (!customer.name || !customer.phone || (!customer.addressText && !customer.addressImage)) {
      return NextResponse.json(
        { message: "Missing order information." },
        { status: 400 },
      );
    }

    const reservedItems = await reserveOrderItems(payload.items);
    let voucher = null;

    try {
      voucher = voucherCode ? await validateVoucher(voucherCode) : null;
    } catch (error) {
      await restoreReservedStock(reservedItems);
      return NextResponse.json({ message: error.message || "VOUCHER_INVALID" }, { status: 400 });
    }

    const pricing = getOrderPricing(reservedItems, voucher?.discountPercent || 0);
    let addressImageValue = customer.addressImage;
    if (addressImageValue?.startsWith("data:image/")) {
      try {
        const uploaded = isCloudinaryConfigured()
          ? await uploadDataUri(addressImageValue, { folder: "maison-shop/orders" })
          : null;
        if (uploaded?.url) {
          addressImageValue = uploaded.url;
        }
      } catch {
        // Keep base64 fallback if Cloudinary is unavailable.
      }
    }

    let order = null;

    try {
      order = await createOrder({
        name: customer.name,
        phone: customer.phone,
        addressText: customer.addressText,
        addressImage: addressImageValue,
        items: reservedItems,
        total: pricing.total,
        currency: "TWD",
        voucherCode: voucher?.code || "",
        voucherDiscount: pricing.voucherDiscount,
      });
      if (voucher?.code) {
        await incrementVoucherUsage(voucher.code);
      }
    } catch (error) {
      await restoreReservedStock(reservedItems);
      throw error;
    }

    try {
      await appendOrderToSheet(order);
    } catch (error) {
      console.error("Google Sheets error:", error);
    }

    return NextResponse.json({
      ok: true,
      total: pricing.total,
      voucherCode: voucher?.code || "",
      voucherDiscount: pricing.voucherDiscount,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to submit order." },
      { status: 500 },
    );
  }
}
