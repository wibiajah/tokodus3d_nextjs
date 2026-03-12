// app/api/proxy/auth/check-session/route.ts
//
// Server-side proxy untuk Laravel /api/3d/auth/check-session
// Browser mengirim X-Customer-Id + X-Login-At → server forward ke Laravel
// X-Api-Secret ditambahkan di server, tidak pernah sampai ke browser

import { NextRequest, NextResponse } from "next/server";

const LARAVEL    = process.env.LARAVEL_INTERNAL_URL
                ?? process.env.NEXT_PUBLIC_LARAVEL_URL
                ?? "";
const API_SECRET = process.env.API_SECRET ?? "";

export async function GET(req: NextRequest) {
  const customerId = req.headers.get("X-Customer-Id");
  const loginAt    = req.headers.get("X-Login-At");

  if (!customerId) {
    return NextResponse.json(
      { status: 401, message: "Customer ID tidak ada", data: null },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`${LARAVEL}/api/3d/auth/check-session`, {
      headers: {
        "X-Api-Secret":  API_SECRET,
        "X-Customer-Id": customerId,
        "X-Login-At":    loginAt ?? "0",
        "Accept":        "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (err) {
    console.error("[proxy/auth/check-session] error:", err);
    return NextResponse.json(
      { status: 500, message: "Proxy error", data: null },
      { status: 500 }
    );
  }
}