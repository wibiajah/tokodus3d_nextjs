// app/api/proxy/calculation/route.ts
// Proxy untuk Laravel /api/3d/calculation/save

import { NextRequest, NextResponse } from "next/server";

const LARAVEL    = process.env.LARAVEL_INTERNAL_URL ?? process.env.NEXT_PUBLIC_LARAVEL_URL ?? "";
const API_SECRET = process.env.API_SECRET ?? "";

export async function POST(req: NextRequest) {
  const customerId = req.headers.get("X-Customer-Id");
  if (!customerId) {
    return NextResponse.json({ status: 401, message: "Sesi tidak valid", data: null }, { status: 401 });
  }

  try {
    const body = await req.json();
    const res = await fetch(`${LARAVEL}/api/3d/calculation/save`, {
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
    console.error("[proxy/calculation] error:", err);
    return NextResponse.json({ status: 500, message: "Proxy error", data: null }, { status: 500 });
  }
}