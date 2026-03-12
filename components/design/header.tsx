"use client";
import Link from "next/link";
import { ShoppingCart, Search, User } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

const LARAVEL = process.env.NEXT_PUBLIC_LARAVEL_URL ?? "";


export default function Header() {
  const customer  = useAuthStore((s) => s.customer);
  const isLoading = useAuthStore((s) => s.isLoading);

  return (
    <header
      className="w-full text-white"
      style={{
        backgroundColor: "#1f4390",
        fontFamily: "'Ubuntu', sans-serif",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
      }}
    >
      <div
        className="flex items-center justify-between gap-6"
        style={{ padding: "0.85rem 4rem" }}
      >

        {/* LEFT: Logo */}
        <Link
          href={LARAVEL || "/"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center flex-shrink-0"
        >
          <img
            src="/logo.webp"
            alt="Tokodus"
            className="h-9 w-auto object-contain transition-transform duration-300 hover:scale-105"
          />
        </Link>

        {/* RIGHT: Search + Cart + Profile */}
        <div className="flex items-center gap-1 flex-shrink-0">

          {/* Search */}
          <Link
            href={`${LARAVEL}/search`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10
                       transition-colors duration-150"
            title="Cari"
          >
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </Link>

          {/* Cart */}
          <Link
            href={`${LARAVEL}/customer/cart`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10
                       transition-colors duration-150"
            title="Keranjang"
          >
            <ShoppingCart className="h-5 w-5" strokeWidth={1.75} />
          </Link>

          {/* Profile: pure info */}
          {isLoading ? (
            <div className="flex items-center gap-2 ml-1 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-white/20" />
              <div className="h-3.5 w-16 rounded bg-white/20 hidden sm:block" />
            </div>
          ) : customer ? (
            <div className="flex items-center gap-2 ml-1">
              {customer.foto_profil ? (
                <img
                  src={`${LARAVEL}/storage/${customer.foto_profil}`}
                  alt={customer.name}
                  className="h-8 w-8 rounded-full object-cover border-2 border-white/50 flex-shrink-0"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center
                                justify-center border-2 border-white/40 flex-shrink-0">
                  <User className="h-4 w-4 text-white/80" />
                </div>
              )}
              <span
                className="hidden sm:inline text-white"
                style={{
                  fontFamily: "'Ubuntu', sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 400,
                }}
              >
                {customer.name}
              </span>
            </div>
          ) : (
            <div className="flex items-center ml-1">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center
                              justify-center border-2 border-white/20 flex-shrink-0">
                <User className="h-4 w-4 text-white/60" />
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}