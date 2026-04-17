import { NextResponse } from "next/server";
import { getBearerToken, isAdminAuthError, verifyAdminToken } from "@/lib/auth";
import { getGoogleSheetsSettings, updateGoogleSheetsSettings } from "@/lib/db";

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
    return NextResponse.json({
      settings: await getGoogleSheetsSettings(),
    });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to load Google Sheets settings." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    requireAdmin(request);
    const payload = await request.json();
    const settings = await updateGoogleSheetsSettings({
      clientEmail: payload.clientEmail,
      privateKey: payload.privateKey,
      sheetId: payload.sheetId,
      enabled: payload.enabled,
    });

    return NextResponse.json({ settings });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to save Google Sheets settings." },
      { status: 500 },
    );
  }
}
