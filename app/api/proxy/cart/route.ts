// app/api/proxy/cart/route.ts
//
// Server-side proxy untuk Laravel /api/3d/cart (POST addToCart)
// Preview image base64 diforward apa adanya — size limit sudah dijaga di Laravel

import { NextRequest, NextResponse } from "next/server";

const LARAVEL    = process.env.LARAVEL_INTERNAL_URL
                ?? process.env.NEXT_PUBLIC_LARAVEL_URL
                ?? "";
const API_SECRET = process.env.API_SECRET ?? "";

export async function POST(req: NextRequest) {
  const customerId = req.headers.get("X-Customer-Id");

  if (!customerId) {
    return NextResponse.json(
      { status: 401, message: "Sesi tidak valid. Silakan login ulang.", data: null },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const res = await fetch(`${LARAVEL}/api/3d/cart`, {
      method: "POST",
      headers: {
        "X-Api-Secret":  API_SECRET,
        "X-Customer-Id": customerId,
        "Content-Type":  "application/json",
        "Accept":        "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (err) {
    console.error("[proxy/cart POST] error:", err);
    return NextResponse.json(
      { status: 500, message: "Proxy error", data: null },
      { status: 500 }
    );
  }
}