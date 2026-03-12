// ─────────────────────────────────────────────────────────────
//  lib/api.ts
//
//  DUA jalur fetch:
//
//  1. PUBLIC  → langsung ke Laravel (data statis: BoxModels, Flutes, dll)
//               Tidak butuh secret — throttle longgar di Laravel
//
//  2. AUTH    → via Next.js Route Handler (/api/proxy/*)
//               X-Api-Secret ditambahkan DI SERVER, tidak pernah ke browser
//               Dipakai untuk: cart, pisau/save, calculation/save
//
//  whoami, check-session, projects → sudah punya proxy sendiri di swr.ts
//  dan use-auth-bridge.ts
// ─────────────────────────────────────────────────────────────

function getBase(): string {
  const base = process.env.NEXT_PUBLIC_LARAVEL_URL;
  if (!base) throw new Error("NEXT_PUBLIC_LARAVEL_URL is not set");
  return base;
}

// ─────────────────────────────────────────────────────────────
//  Ambil customer_id dari Zustand store (getState — tidak butuh hook)
//  Fallback ke localStorage kalau store belum terisi (misal setelah refresh)
// ─────────────────────────────────────────────────────────────
function getCustomerIdFromStore(): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAuthStore } = require("@/store/auth-store");
    const customer = useAuthStore.getState().customer;
    if (customer?.customer_id) return String(customer.customer_id);
  } catch { /* SSR atau store belum init */ }

  try {
    const saved = localStorage.getItem("3d_customer");
    if (saved) {
      const customer = JSON.parse(saved);
      if (customer?.customer_id) return String(customer.customer_id);
    }
  } catch { /* localStorage tidak tersedia (SSR) */ }

  return null;
}

// Header untuk request via proxy (tidak perlu X-Api-Secret — ditambahkan server)
function getProxyHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const customerId = getCustomerIdFromStore();
  if (customerId) headers["X-Customer-Id"] = customerId;
  return headers;
}

/** GET /api/3d/{endpoint} — PUBLIC, langsung ke Laravel (data statis) */
export default async function api(endpoint: string) {
  const r = await fetch(`${getBase()}/api/3d/${endpoint}`, {
    headers: { "Accept": "application/json" },
  });
  if (!r.ok) {
    console.error(`Laravel API error: ${r.status} for "${endpoint}"`);
    return [];
  }
  const j = await r.json();
  return j.status === 200 ? j.data : [];
}

/** POST via proxy (auth endpoints: cart, pisau/save, calculation/save) */
export async function apiPost<T = unknown>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T | null> {
  // Mapping endpoint Laravel → route proxy Next.js
  const proxyMap: Record<string, string> = {
    "cart":              "/api/proxy/cart",
    "pisau/save":        "/api/proxy/pisau",
    "calculation/save":  "/api/proxy/calculation",
  };

  const proxyPath = proxyMap[endpoint];
  const url = proxyPath ?? `${getBase()}/api/3d/${endpoint}`;
  const headers = proxyPath
    ? getProxyHeaders()
    : { "Content-Type": "application/json", "Accept": "application/json" };

  const r = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    console.error(`API error: ${r.status} for POST "${endpoint}"`);
    return null;
  }
  const j = await r.json();
  return j.status === 200 ? j.data : null;
}

/** GET auth endpoint via proxy */
export async function apiGet<T = unknown>(endpoint: string): Promise<T | null> {
  const r = await fetch(`/api/proxy/${endpoint}`, {
    headers: getProxyHeaders(),
  });
  if (!r.ok) {
    console.error(`API error: ${r.status} for GET "${endpoint}"`);
    return null;
  }
  const j = await r.json();
  return j.status === 200 ? (j.data as T) : null;
}

/** Expose base URL untuk dipakai di swr.ts */
export function laravelUrl(): string {
  return getBase();
}