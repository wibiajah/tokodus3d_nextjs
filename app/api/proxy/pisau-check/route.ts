// app/api/proxy/pisau-check/route.ts
// Server-side proxy untuk Laravel GET /api/3d/CheckPisauPond
// X-Api-Secret ditambahkan di server

import { NextRequest, NextResponse } from "next/server";

const LARAVEL    = process.env.LARAVEL_INTERNAL_URL ?? process.env.NEXT_PUBLIC_LARAVEL_URL ?? "";
const API_SECRET = process.env.API_SECRET ?? "";

export async function GET(req: NextRequest) {
  // Forward semua query params (box_model_id, panjang_cm, lebar_cm, tinggi_cm)
  const params = req.nextUrl.searchParams.toString();

  try {
    const res = await fetch(`${LARAVEL}/api/3d/CheckPisauPond?${params}`, {
      headers: {
        "X-Api-Secret": API_SECRET,
        "Accept":       "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (err) {
    console.error("[proxy/pisau-check] error:", err);
    return NextResponse.json(
      { status: 500, message: "Proxy error", data: null },
      { status: 500 }
    );
  }
}