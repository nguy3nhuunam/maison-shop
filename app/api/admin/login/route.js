import { NextResponse } from "next/server";
import { signAdminToken, validateAdminCredentials } from "@/lib/auth";

export async function POST(request) {
  const { username, password } = await request.json();

  if (!validateAdminCredentials(username, password)) {
    return NextResponse.json(
      { message: "Sai tai khoan hoac mat khau." },
      { status: 401 },
    );
  }

  return NextResponse.json({ token: signAdminToken() });
}
