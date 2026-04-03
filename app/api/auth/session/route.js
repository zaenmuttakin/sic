// app/api/auth/session/route.js
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { callAppscript } from "../../../../lib/gas/sic";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const nik = cookieStore.get("nik")?.value;
    const token = cookieStore.get("token")?.value;

    if (!token || !nik) {
      return NextResponse.json({ authenticated: false });
    }

    const result = await callAppscript("verifySession", {
      nik: Number(nik),
      token,
    });

    if (result.success && result.response) {
      return NextResponse.json({
        authenticated: true,
        token: result.response.token,
      });
    } else {
      // Clear invalid session
      cookieStore.delete("token");
      return NextResponse.json({ authenticated: false });
    }
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
