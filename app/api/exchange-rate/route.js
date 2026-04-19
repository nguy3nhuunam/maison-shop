import { NextResponse } from "next/server";
import { getDailyExchangeRate } from "@/lib/exchange-rate";

export const runtime = "nodejs";

export async function GET() {
  try {
    const exchangeRate = await getDailyExchangeRate();

    return NextResponse.json(exchangeRate);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to load exchange rate." },
      { status: 500 },
    );
  }
}
