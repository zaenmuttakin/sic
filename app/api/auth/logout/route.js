// app/api/auth/logout/route.js
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { callAppscript } from "../../../../lib/gas/sic";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const nik = cookieStore.get("nik")?.value;
    const token = cookieStore.get("token")?.value;

    if (token && nik) {
      // Invalidate session on server
      await callAppscript("logout", { nik: Number(nik), token });
    }

    // Clear session cookie
    cookieStore.delete("nik");
    cookieStore.delete("token");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
