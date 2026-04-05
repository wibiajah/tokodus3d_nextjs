"use client";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, ShoppingCart, Loader2, CheckCircle, AlertCircle, X, ExternalLink } from "lucide-react";
import SideOption from "./side-option";
import { useCalculatePrice, useCalculateWeight, useProjects, useMaterials, useFlutes, useLaminasiOptions, useSablonOptions } from "@/lib/swr";
import { Weight } from "lucide-react";
import { useDesignStore } from "@/store/design-store";
import Slider3D from "./slider-3d";
import { useState, useEffect } from "react";
import { Skeleton } from "../ui/skeleton";

const LARAVEL = process.env.NEXT_PUBLIC_LARAVEL_URL;

function getCustomerId(): string | null {
  try {
    const saved = localStorage.getItem("3d_customer");
    if (!saved) return null;
    return JSON.parse(saved).customer_id?.toString() ?? null;
  } catch {
    return null;
  }
}

type ToastState = {
  show: boolean;
  type: "error" | "loading" | "success";
  message: string;
  url?: string;
};

export function Footer() {
  const { result, loading, error } = useCalculatePrice();
  const { berat, loading: beratLoading } = useCalculateWeight();
  const serverModel = useDesignStore((s) => s.serverModel);
  const { loading: loadingMaterial, error: errorMaterial } = useMaterials(serverModel?.id_bm ?? undefined);
  const { loading: loadingFlutes, error: errorFlutes } = useFlutes();
  const { loading: loadingLaminasi, error: errorLaminasi } = useLaminasiOptions();
  const { loading: loadingSablon, error: errorSablon } = useSablonOptions();

  const isLoadingResources = loadingMaterial || loadingFlutes || loadingLaminasi || loadingSablon;
  const hasResourceError   = !!(errorMaterial || errorFlutes || errorLaminasi || errorSablon);
  const needsMoreInput = !loading && result === null;

  // ambil buildSnapshot dari store untuk kirim ke Laravel
  const buildSnapshot  = useDesignStore((s) => s.buildSnapshot);
  const quantity       = useDesignStore((s) => s.quantity);
  const setQuantity    = useDesignStore((s) => s.setQuantity);
  const mode           = useDesignStore((s) => s.mode);

  // Nama model untuk judul di cart
  function getCartTitle(): string {
    const name = serverModel?.name ?? "";
    if (!name) return "Custom Box Design";
    return `Custom Box Design - ${name}`;
  }

  // Capture canvas 3D → base64 PNG
  function captureCanvas(): string | null {
    try {
      // Set ke mode 3D dulu capture bisa dilakukan dari state saat ini
      const canvas = document.querySelector("#three-canvas canvas") as HTMLCanvasElement
                  ?? document.querySelector("canvas") as HTMLCanvasElement;
      if (!canvas) return null;
      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  }

  const [isFocused, setIsFocused] = useState(false);
  const [toast, setToast]         = useState<ToastState>({ show: false, type: "loading", message: "" });
  const [isAdding, setIsAdding]   = useState(false);
  // Track apakah resource pernah berhasil load semua (untuk deteksi error saat editing)
  const [wasEverReady, setWasEverReady] = useState(false);
  useEffect(() => {
    if (!isLoadingResources && !hasResourceError) {
      setWasEverReady(true);
    }
  }, [isLoadingResources, hasResourceError]);

  async function addToCart() {
    const customerId = getCustomerId();
    if (!customerId) {
      setToast({ show: true, type: "error", message: "Silakan login terlebih dahulu." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
      return;
    }

    // Capture canvas 3D sebelum kirim
    const previewImage = captureCanvas();

    // buildSnapshot().snapshot berisi semua state: model, size, material, qty, pisau, dll
    const saved = buildSnapshot(getCartTitle(), "draft");
    if (!saved) {
      setToast({ show: true, type: "error", message: "Gagal membuat snapshot. Coba lagi." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
      return;
    }

    setIsAdding(true);
    setToast({ show: true, type: "loading", message: "Menambahkan ke keranjang..." });
    try {
      const res = await fetch(`/api/proxy/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Customer-Id": customerId,
                  },
        // kirim snapshot (isi state design) — bukan project object
        body: JSON.stringify({
          name: saved.name,           // "Custom Box Design - Nama Model"
          snapshot: saved.snapshot,
          preview_image: previewImage, // base64 PNG dari canvas 3D
        }),
      });
      const json = await res.json();
      if (json.status === 200) {
        const cartUrl = `${LARAVEL}/customer/cart`;
        setToast({ show: true, type: "success", message: "Berhasil ditambahkan!", url: cartUrl });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
      } else {
        setToast({ show: true, type: "error", message: json.message ?? "Gagal menambahkan ke keranjang." });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
      }
    } catch {
      setToast({ show: true, type: "error", message: "Terjadi kesalahan jaringan. Coba lagi." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <>
      {mode === "2d" ? <SideOption /> : <Slider3D isFooter={true} />}
      {/* Resource loading / error notification bar */}
      {(isLoadingResources || hasResourceError) && (() => {
        // Tentukan resource mana yang sedang loading atau error
        const resources = [
          { label: "Material",  loading: loadingMaterial, error: !!errorMaterial },
          { label: "Flute",     loading: loadingFlutes,   error: !!errorFlutes },
          { label: "Laminasi",  loading: loadingLaminasi, error: !!errorLaminasi },
          { label: "Sablon",    loading: loadingSablon,   error: !!errorSablon },
        ];
        const errorList   = resources.filter(r => r.error).map(r => r.label);
        const loadingList = resources.filter(r => r.loading && !r.error).map(r => r.label);
        // Error saat editing = pernah ready tapi sekarang error
        const isEditingError = wasEverReady && hasResourceError;

        if (hasResourceError) return (
          <div className="w-full px-4 py-2 flex items-center gap-2 text-xs font-medium bg-destructive/10 text-destructive border-t border-destructive/20">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>
              {isEditingError ? "⚠ Data hilang saat editing: " : "Gagal memuat: "}
              <span className="font-semibold">{errorList.join(", ")}</span>
              {" — "}
              <button className="underline font-semibold" onClick={() => window.location.reload()}>refresh halaman</button>
            </span>
          </div>
        );

        return (
          <div className="w-full px-4 py-2 flex items-center gap-2 text-xs font-medium bg-muted text-muted-foreground border-t border-border">
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
            <span>
              Memuat data:{" "}
              <span className="font-medium text-foreground">{loadingList.join(", ")}</span>
              {loadingList.length === 0 && "konfigurasi..."}
            </span>
          </div>
        );
      })()}
      <footer className="fixed bottom-0 left-0 w-full z-40">
        <Card className="rounded-none p-0 m-0 border-x-0 border-b-0 shadow-lg">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 py-4">
            {/* LEFT SECTION */}
            <div className="text-center md:text-left space-y-1">
              <p className="text-muted-foreground text-sm">
                Dilayani dan diproduksi langsung oleh{" "}
                <span className="font-semibold text-foreground">Tokodus</span>
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm flex-wrap">
                <span className="text-muted-foreground">
                  Halaman ini dikembangkan oleh : 
                </span>
                <Link
                  href="https://multigraharadhika.co.id/"
                  target="_blank"
                  className="font-medium text-primary hover:underline"
                >
                  CV Multi Graha Radhika
                </Link>

                {/* Resource status bar — sejajar dengan watermark, hanya saat loading/error */}
                {(isLoadingResources || hasResourceError) && (<>
                <span className="text-muted-foreground/40">|</span>
                <div className="flex items-center gap-2">
                {/* Dot indikator per resource */}
                {[
                  { label: "Model",     loading: false,           error: false },
                  { label: "Material",  loading: loadingMaterial, error: !!errorMaterial },
                  { label: "Flute",     loading: loadingFlutes,   error: !!errorFlutes },
                  { label: "Laminasi",  loading: loadingLaminasi, error: !!errorLaminasi },
                  { label: "Sablon",    loading: loadingSablon,   error: !!errorSablon },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-1" title={
                    r.error   ? `${r.label}: gagal dimuat` :
                    r.loading ? `${r.label}: memuat...` :
                                `${r.label}: siap`
                  }>
                    {r.error ? (
                      <span className="h-2 w-2 rounded-full bg-destructive inline-block" />
                    ) : r.loading ? (
                      <Loader2 className="h-2.5 w-2.5 animate-spin text-muted-foreground" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                    )}
                    <span className={`text-[10px] ${
                      r.error   ? "text-destructive" :
                      r.loading ? "text-muted-foreground" :
                                  "text-muted-foreground"
                    }`}>{r.label}</span>
                  </div>
                ))}

                {/* Status teks keseluruhan */}
                <span className="text-[10px] ml-1">
                  {hasResourceError ? (
                    <span className="text-destructive font-medium">
                      ⚠ Gagal — <button className="underline" onClick={() => window.location.reload()}>refresh</button>
                    </span>
                  ) : isLoadingResources ? (
                    <span className="text-muted-foreground">Memuat...</span>
                  ) : (
                    <span className="text-green-600 font-medium">✓ Siap 100%</span>
                  )}
                </span>
                </div>
                </>)}
              </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-6">
              {/* Qty + Harga per pcs */}
              <div className="text-center md:text-left">
                <div className="text-lg font-semibold">
                  <input
                    type={isFocused ? "number" : "text"}
                    min={50}
                    max={10000}
                    step={50}
                    value={isFocused ? quantity : quantity.toLocaleString("id-ID")}
                    onChange={(e) => setQuantity(Number.parseInt(e.target.value || "0"))}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-20 rounded bg-background px-2 py-1 text-sm text-end hover:border"
                  />
                  <span className="text-sm font-normal">Pcs</span>
                </div>
                {needsMoreInput ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                    <span>Lengkapi konfigurasi untuk melihat harga</span>
                    {error && (
                      <div className="relative group">
                        <button className="inline-flex items-center justify-center h-4 w-4 rounded-full border text-muted-foreground text-[10px] cursor-pointer">
                          i
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-white text-xs text-gray-700 rounded-lg shadow-lg border p-3 hidden group-hover:block z-50 pointer-events-none">
                          <span className="font-semibold block mb-1">Yang perlu dilengkapi:</span>
                          <ul className="space-y-1">
                            {error.map((e, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <span className="text-red-400">•</span> {e}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {loading ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                        <span>Menghitung harga...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="line-through text-muted-foreground">
                          @{result?.harga_per_pcs?.toLocaleString("id-ID") ?? "0"}
                        </span>
                        <span className="font-medium text-foreground">
                          @{result?.harga_per_pcs?.toLocaleString("id-ID") ?? "0"}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="hidden md:block h-10 w-px bg-border" />

              {/* Berat per pcs — hanya untuk Masterbox */}
              {berat !== undefined && (
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Weight className="h-3 w-3" />
                    Berat / pcs
                  </div>
                  {beratLoading ? (
                    <Skeleton className="h-5 w-16 mt-1" />
                  ) : berat ? (
                    <div className="text-sm font-medium">
                      {berat.metode === "fallback_weight_gram" ? (
                        <span className="text-muted-foreground">N/A</span>
                      ) : (
                        <>{berat.berat_gram.toLocaleString("id-ID")} gram</>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic">—</div>
                  )}
                </div>
              )}

              {/* Divider */}
              <div className="hidden md:block h-10 w-px bg-border" />

              {/* Subtotal */}
              <div className="text-center md:text-left">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  Sub-Total
                  <Info className="h-3 w-3 text-teal-600" />
                </div>
                {needsMoreInput ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                    <span>Lengkapi konfigurasi untuk melihat harga</span>
                  </div>
                ) : (
                  <>
                    {loading ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                        <span>Menghitung harga...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="line-through text-sm text-muted-foreground">
                          Rp {result?.total?.toLocaleString("id-ID") ?? "0"}
                        </span>
                        <span className="text-lg font-semibold text-foreground">
                          Rp {result?.total?.toLocaleString("id-ID") ?? "0"}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Button — HANYA + Keranjang, tidak ada Pesan Sekarang */}
              <Button
                onClick={addToCart}
                disabled={isAdding || !!needsMoreInput}
              >
                {isAdding
                  ? <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  : <ShoppingCart className="h-4 w-4 mr-1" />}
                + Keranjang
              </Button>
            </div>
          </CardContent>
        </Card>
      </footer>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-lg border bg-background px-4 py-3 shadow-lg">
          {toast.type === "loading" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          {toast.type === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
          {toast.type === "error"   && <AlertCircle className="h-4 w-4 text-red-500" />}
          <span className="text-sm">{toast.message}</span>
          {toast.url && (
            <a href={toast.url} target="_blank" rel="noopener noreferrer"
              className="ml-1 flex items-center gap-1 text-xs text-primary underline">
              Lihat <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <button onClick={() => setToast((t) => ({ ...t, show: false }))}
            className="ml-2 text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </>
  );
}