// app/api/auth/login/route.js
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { callAppscript } from "../../../../lib/gas/sic";

export async function POST(request) {
  try {
    const { nik, pass } = await request.json();

    if (!nik || !pass) {
      return NextResponse.json(
        { error: "Nik and password are required" },
        { status: 400 }
      );
    }

    const result = await callAppscript("login", {
      nik,
      pass,
    });

    if (result.success && result.response) {
      // Set session cookie
      const cookieStore = await cookies();
      cookieStore.set("token", result.response.token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
      cookieStore.set("nik", nik, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      return NextResponse.json({
        success: true,
        nik: nik,
        token: result.response.token,
      });
    } else {
      return NextResponse.json(
        { success: false, response: result.response || "Login failed" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
