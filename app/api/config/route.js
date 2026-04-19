import { NextResponse } from "next/server";
import { getBearerToken, isAdminAuthError, verifyAdminToken } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/db";

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
    return NextResponse.json({ settings: await getSettings() });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to load settings." },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    requireAdmin(request);
    const payload = await request.json();
    const settings = await updateSettings({
      currency: payload.currency === "VND" ? "VND" : "TWD",
      messengerUrl: payload.messengerUrl || "https://m.me/yourpage",
      social: {
        facebook: payload.social?.facebook || "",
        instagram: payload.social?.instagram || "",
        tiktok: payload.social?.tiktok || "",
      },
      homepage: payload.homepage,
    });

    return NextResponse.json({ settings });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to update settings." },
      { status: 500 },
    );
  }
}
