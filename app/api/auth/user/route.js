// app/api/auth/user/route.js
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { callAppscript } from "../../../../lib/gas/sic";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const nik = cookieStore.get("nik")?.value;
    const token = cookieStore.get("token")?.value;

    if (!token || !nik) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const result = await callAppscript("getUser", { nik: Number(nik) });

    if (result.success && result.response) {
      return NextResponse.json({
        user: result.response,
      });
    } else {
      return NextResponse.json(
        { success: false, response: result.error || "Failed to get user data" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Get user data error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
