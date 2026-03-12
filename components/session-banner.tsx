"use client";
// components/session-banner.tsx
//
// Listener untuk event "auth:notify" dari use-auth-bridge.
// Tampilkan banner notifikasi tanpa dependency toast apapun.

import { useEffect, useState } from "react";

type NotifyType = "expired" | "invalid" | "network" | null;

const MESSAGES: Record<NonNullable<NotifyType>, { title: string; desc: string }> = {
  expired: {
    title: "Sesi kamu telah berakhir",
    desc: "Silakan kembali ke Tokodus dan klik Desain Sekarang lagi.",
  },
  invalid: {
    title: "Link login tidak valid atau sudah kedaluwarsa",
    desc: "Silakan kembali ke Tokodus dan klik Desain Sekarang lagi.",
  },
  network: {
    title: "Gagal menghubungi server",
    desc: "Periksa koneksi internet kamu, lalu coba lagi.",
  },
};

export default function SessionBanner() {
  const [type, setType] = useState<NotifyType>(null);

  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent).detail as { type: NotifyType };
      setType(detail.type);
      // Auto-dismiss setelah 8 detik
      setTimeout(() => setType(null), 8000);
    }
    window.addEventListener("auth:notify", handler);
    return () => window.removeEventListener("auth:notify", handler);
  }, []);

  if (!type) return null;

  const { title, desc } = MESSAGES[type];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4">
      <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 shadow-lg">
        <span className="mt-0.5 text-red-500">⚠️</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-800">{title}</p>
          <p className="text-xs text-red-600 mt-0.5">{desc}</p>
        </div>
        <button
          onClick={() => setType(null)}
          className="text-red-400 hover:text-red-600 text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}