// app/api/proxy/static/[endpoint]/route.ts
//
// Proxy generik untuk endpoint data statis Laravel:
// BoxModels, Flutes, MaterialOptions, Gramasi, LaminasiOptions,
// SablonOptions, PrintingOptions, TaliOptions, MinOrderConfig
//
// Browser → GET /api/proxy/static/MinOrderConfig
// Server  → GET {LARAVEL}/api/3d/MinOrderConfig  (+ X-Api-Secret)

import { NextRequest, NextResponse } from "next/server";

const LARAVEL    = process.env.LARAVEL_INTERNAL_URL
                ?? process.env.NEXT_PUBLIC_LARAVEL_URL
                ?? "";
const API_SECRET = process.env.API_SECRET ?? "";

// Whitelist endpoint yang boleh diakses via proxy ini
const ALLOWED = new Set([
  "BoxModels",
  "Flutes",
  "MaterialOptions",
  "Gramasi",
  "LaminasiOptions",
  "SablonOptions",
  "PrintingOptions",
  "TaliOptions",
  "MinOrderConfig",
]);

export async function GET(
  req: NextRequest,
  { params }: { params: { endpoint: string } }
) {
  const { endpoint } = params;

  if (!ALLOWED.has(endpoint)) {
    return NextResponse.json(
      { status: 404, message: "Endpoint tidak dikenal", data: null },
      { status: 404 }
    );
  }

  // Forward query string (misal: material_type_id, box_model_id)
  const qs = req.nextUrl.searchParams.toString();
  const url = `${LARAVEL}/api/3d/${endpoint}${qs ? `?${qs}` : ""}`;

  try {
    const res = await fetch(url, {
      headers: {
        "X-Api-Secret": API_SECRET,
        "Accept":       "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (err) {
    console.error(`[proxy/static/${endpoint}] error:`, err);
    return NextResponse.json(
      { status: 500, message: "Proxy error", data: null },
      { status: 500 }
    );
  }
}