"use client";
import { SWRConfig } from "swr";

// ─────────────────────────────────────────────────────────────
//  SWR Global Config
//
//  FIX 429: SWR default revalidateOnFocus=true — setiap user
//  balik ke tab, semua hooks re-fetch sekaligus → throttle hit.
//
//  revalidateOnFocus: false   → tidak re-fetch saat focus tab
//  revalidateOnReconnect: false → tidak re-fetch saat reconnect
//  dedupingInterval: 60000    → request yang sama di-dedup 60 detik
// ─────────────────────────────────────────────────────────────
export default function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus:     false,
        revalidateOnReconnect: false,
        dedupingInterval:      60_000,  // 60 detik
        errorRetryCount:       2,       // max 2x retry kalau error
        errorRetryInterval:    5_000,   // retry setelah 5 detik
      }}
    >
      {children}
    </SWRConfig>
  );
}