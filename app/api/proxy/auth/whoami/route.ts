// app/api/proxy/auth/whoami/route.ts
//
// Server-side proxy untuk Laravel /api/3d/auth/whoami
// X-Api-Secret TIDAK pernah keluar ke browser — disimpan di env server-only
//
// Browser  → GET /api/proxy/auth/whoami?t=xxx
// Server   → GET {LARAVEL}/api/3d/auth/whoami?t=xxx  (+ X-Api-Secret header)

import { NextRequest, NextResponse } from "next/server";

// LARAVEL_INTERNAL_URL: URL internal Laravel (server ↔ server, bisa pakai IP private)
// Fallback ke NEXT_PUBLIC_LARAVEL_URL kalau belum di-set
const LARAVEL    = process.env.LARAVEL_INTERNAL_URL
                ?? process.env.NEXT_PUBLIC_LARAVEL_URL
                ?? "";

// API_SECRET: TANPA prefix NEXT_PUBLIC_ — tidak akan pernah masuk ke browser bundle
const API_SECRET = process.env.API_SECRET ?? "";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t");

  if (!token) {
    return NextResponse.json(
      { status: 401, message: "Token tidak ada", data: null },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(
      `${LARAVEL}/api/3d/auth/whoami?t=${encodeURIComponent(token)}`,
      {
        headers: {
          "X-Api-Secret": API_SECRET,
          "Accept":       "application/json",
        },
        cache: "no-store", // token one-time — selalu fresh
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (err) {
    console.error("[proxy/auth/whoami] error:", err);
    return NextResponse.json(
      { status: 500, message: "Proxy error", data: null },
      { status: 500 }
    );
  }
}