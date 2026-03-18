import { NextRequest, NextResponse } from "next/server";

const LARAVEL = process.env.LARAVEL_INTERNAL_URL ?? process.env.NEXT_PUBLIC_LARAVEL_URL ?? "";
const API_SECRET = process.env.API_SECRET ?? "";

export async function GET(
  req: NextRequest,
  { params }: { params: { endpoint: string } }
) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.toString();
  const url = `${LARAVEL}/api/3d/${params.endpoint}${query ? `?${query}` : ""}`;

  try {
    const res = await fetch(url, {
      headers: {
        "X-Api-Secret": API_SECRET,
        "Accept": "application/json",
      },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`[proxy/public/${params.endpoint}] error:`, err);
    return NextResponse.json({ status: 500, message: "Proxy error", data: null }, { status: 500 });
  }
}