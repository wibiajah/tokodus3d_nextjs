"use client";
// components/auth-guard.tsx

import { useAuthStore } from "@/store/auth-store";

const LARAVEL = process.env.NEXT_PUBLIC_LARAVEL_URL;

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const customer     = useAuthStore((s) => s.customer);
  const isLoading    = useAuthStore((s) => s.isLoading);
  const isIdentified = useAuthStore((s) => s.isIdentified);

  // Masih loading auth
  if (isLoading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-background gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-[#1F4390] border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Memverifikasi sesi...</p>
      </div>
    );
  }

  // Tidak ada customer setelah loading selesai
  if (!isIdentified) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-background gap-4 px-6 text-center">
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-bold text-[#1F4390]">Anda harus login untuk mengakses halaman ini</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Silakan login melalui halaman Tokodus terlebih dahulu, kemudian klik <strong>Desain Sekarang</strong>.
        </p>
        <a
          href={`${LARAVEL}/login`}
          className="mt-2 px-6 py-2 bg-[#1F4390] text-white rounded-lg text-sm font-medium hover:bg-[#1a3a7a] transition"
        >
          Login Sekarang
        </a>
      </div>
    );
  }

  return <>{children}</>;
}