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
import { getDailyExchangeRate } from "@/lib/exchange-rate";
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

function convertAmountForOrder(value, currency, rate) {
  const numericValue = Number(value || 0);
  return currency === "VND" ? Math.round(numericValue * rate) : numericValue;
}

function convertReservedItemsForOrder(items, currency, rate) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    ...item,
    price: convertAmountForOrder(item.price, currency, rate),
  }));
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
    const currency = payload.currency === "VND" ? "VND" : "TWD";
    const language = payload.language === "zh" ? "zh" : payload.language === "vi" ? "vi" : "unknown";
    const channel = String(payload.channel || "storefront").trim() || "storefront";

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
    const rateData = currency === "VND" ? await getDailyExchangeRate() : { rate: 1 };
    const appliedRate = Number(rateData?.rate || 1);
    const orderItems = convertReservedItemsForOrder(reservedItems, currency, appliedRate);
    const orderTotal = convertAmountForOrder(pricing.total, currency, appliedRate);
    const orderVoucherDiscount = convertAmountForOrder(pricing.voucherDiscount, currency, appliedRate);
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
        items: orderItems,
        total: orderTotal,
        currency,
        baseTotal: pricing.total,
        baseCurrency: "TWD",
        language,
        channel,
        voucherCode: voucher?.code || "",
        voucherDiscount: orderVoucherDiscount,
        baseVoucherDiscount: pricing.voucherDiscount,
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
      total: orderTotal,
      voucherCode: voucher?.code || "",
      voucherDiscount: orderVoucherDiscount,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to submit order." },
      { status: 500 },
    );
  }
}
