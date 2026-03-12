// app/api/proxy/calculate/route.ts
// Server-side proxy untuk Laravel /api/3d/CalculatePrice
// X-Api-Secret ditambahkan di server — tidak pernah sampai ke browser

import { NextRequest, NextResponse } from "next/server";

const LARAVEL    = process.env.LARAVEL_INTERNAL_URL ?? process.env.NEXT_PUBLIC_LARAVEL_URL ?? "";
const API_SECRET = process.env.API_SECRET ?? "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${LARAVEL}/api/3d/CalculatePrice`, {
      method: "POST",
      headers: {
        "X-Api-Secret": API_SECRET,
        "Content-Type": "application/json",
        "Accept":       "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (err) {
    console.error("[proxy/calculate] error:", err);
    return NextResponse.json(
      { status: 500, message: "Proxy error", data: null },
      { status: 500 }
    );
  }
}