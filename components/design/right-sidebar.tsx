"use client";
import { useDesignStore, WallType } from "@/store/design-store";
import { useEffect, useMemo, useState } from "react";
import ThreePreview from "../three/preview";
import { Separator } from "../ui/separator";
import { flutePresets, fluteWallOptions } from "./flutewall-config";
import {
  useLaminasiOptions,
  useMaterials,
  useTaliOptions,
  useSablonOptions,
  useFlutes,
  useMinOrderConfig,
  usePrintingOptions,
  useCalculatePrice,
} from "@/lib/swr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import QuantitySlider from "./quantity-slider";
export default function RightSidebar() {
  const { minOrderConfig, loading: loadingMinOrder } = useMinOrderConfig();
  const { printingOptions } = usePrintingOptions();
  // const { result } = useCalculatePrice();
  const { materialList } = useMaterials();
  const { flutes } = useFlutes();
  const { sablonOptions } = useSablonOptions();
  const { laminasiOptions } = useLaminasiOptions();
  const { taliOptions } = useTaliOptions();
  const tali = useDesignStore((s) => s.tali);
  const setTali = useDesignStore((s) => s.setTali);
  const laminasi = useDesignStore((s) => s.laminasi);
  const setLaminasi = useDesignStore((s) => s.setLaminasi);
  const sablon = useDesignStore((s) => s.sablon);
  const setSablon = useDesignStore((s) => s.setSablon);
  const images = useDesignStore((s) => s.images);
  const pw = useDesignStore((s) => s.pw);
  const mode = useDesignStore((s) => s.mode);
  const model = useDesignStore((s) => s.model);
  const material = useDesignStore((s) => s.material);
  const size = useDesignStore((s) => s.size);
  const side = useDesignStore((s) => s.side);
  const qty = useDesignStore((s) => s.quantity);
  const setQty = useDesignStore((s) => s.setQuantity);
  // const price = useDesignStore((s) => s.price);
  const flute = useDesignStore((s) => s.flute);
  const setFlute = useDesignStore((s) => s.setFlute);
  const fluteWall = useDesignStore((s) => s.fluteWall);
  const setFluteWall = useDesignStore((s) => s.setFluteWall);
  const finishing = useDesignStore((s) => s.finishing);
  const setFinishing = useDesignStore((s) => s.setFinishing);
  const printing1 = useDesignStore((s) => s.printing1);
  const setPrinting1 = useDesignStore((s) => s.setPrinting1);
  const printing2 = useDesignStore((s) => s.printing2);
  const setPrinting2 = useDesignStore((s) => s.setPrinting2);
  const jmlwarna1 = useDesignStore((s) => s.jmlwarna1);
  const setJmlWarna1 = useDesignStore((s) => s.setJmlWarna1);
  const jmlwarna2 = useDesignStore((s) => s.jmlwarna2);
  const setJmlWarna2 = useDesignStore((s) => s.setJmlWarna2);
  const sisicetak1 = useDesignStore((s) => s.sisicetak1);
  const setSisiCetak1 = useDesignStore((s) => s.setSisiCetak1);
  const sisicetak2 = useDesignStore((s) => s.sisicetak2);
  const setSisiCetak2 = useDesignStore((s) => s.setSisiCetak2);
  const sablonWarna = useDesignStore((s) => s.sablonWarna);
  const setSablonWarna = useDesignStore((s) => s.setSablonWarna);
  const sablonSisi = useDesignStore((s) => s.sablonSisi);
  const setSablonSisi = useDesignStore((s) => s.setSablonSisi);
  const laminasiSisi = useDesignStore((s) => s.laminasiSisi);
  const setLaminasiSisi = useDesignStore((s) => s.setLaminasiSisi);
  /**
   *  {
      "id_pt": "1",
      "code": "none",
      "label": "Tanpa Cetakan"
    },
    {
      "id_pt": "2",
      "code": "blok",
      "label": "Cetak Blok"
    },// jumlah < 1000
    {
      "id_pt": "3",
      "code": "tulisan",
      "label": "Cetak Tulisan"
    },//banyak tulisan logo kecil aman dengan jumlah > 1000
    {
      "id_pt": "4",
      "code": "separasi",
      "label": "Cetak Separasi (Full Color)"
    }
   */
  const isDisabled = images.length === 0;
  useEffect(() => {
    if (images.length === 0 && finishing !== "") {
      setFinishing("");
    }
  }, [images.length, finishing, setFinishing]);
  const [speed, setSpeed] = useState<"reguler" | "express" | "urgent">(
    "reguler",
  );
  const estimateText = useMemo(() => {
    const daysRange =
      speed === "reguler" ? [7, 9] : speed === "express" ? [5, 7] : [3, 5];
    function addBusinessDays(date: Date, days: number) {
      const d = new Date(date);
      let added = 0;
      while (added < days) {
        d.setDate(d.getDate() + 1);
        const day = d.getDay();
        if (day !== 0 && day !== 6) added++;
      }
      return d;
    }
    const now = new Date();
    const start = addBusinessDays(now, daysRange[0]);
    const end = addBusinessDays(now, daysRange[1]);
    const fmt = (d: Date) =>
      d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    return `${fmt(start)} - ${fmt(end)} (Estimasi Selesai)`;
  }, [speed]);
  const modelLabel: Record<string, string> = {
    shipping: "Shipping Box",
    shopping: "Shopping Box",
    mailer: "Mailer Box",
    tuckend: "Tuck End Box",
    sleeve: "Sleeve Box",
  };
  const title = modelLabel[model] ?? model;
  const innerMaterial = materialList.find((m) => m.id === material.inner.id);
  const outerMaterial = materialList.find((m) => m.id === material.outer.id);
  const availableWalls = useMemo(() => {
    return Object.entries(fluteWallOptions).filter(([value]) =>
      model === "shipping" ? true : value !== "double",
    );
  }, [model]);
  const availableFlutes = useMemo(() => {
    if (fluteWall === "double")
      return Object.values(flutePresets).filter((f) => f.key === "CB");
    if (model === "shipping")
      return Object.values(flutePresets).filter((f) => {
        if (qty < 500) {
          return f.key === "B";
        } else {
          // qty >= 500: hanya B dan C, apapun materialnya
          return f.key === "B" || f.key === "C";
        }
      });
    return Object.values(flutePresets).filter((f) =>
      model === "mailer" || pw.inner || pw.outer
        ? f.key !== "CB" && f.key !== "C"
        : f.key !== "CB",
    );
  }, [model, fluteWall, pw, qty]);
  useEffect(() => {
    if (model !== "shipping") {
      setFluteWall("single");
      // reset flute ke default non-CB jika sebelumnya CB
      if (flute.key === "CB")
        setFlute({ key: flutePresets.B.key, val: flutePresets.B.val });
    }
    // shipping: biarkan user pilih sendiri single/double
  }, [model]);

  // Auto-set flute ke CB saat double wall dipilih
  // Auto-reset ke B saat kembali ke single wall
  useEffect(() => {
    if (fluteWall === "double" && flute.key !== "CB") {
      setFlute({ key: flutePresets.CB.key, val: flutePresets.CB.val });
    }
    if (fluteWall === "single" && flute.key === "CB") {
      setFlute({ key: flutePresets.B.key, val: flutePresets.B.val });
    }
  }, [fluteWall]);

  // Auto-set flute ke CB saat double wall dipilih
  // Auto-reset ke B saat kembali ke single wall
  useEffect(() => {
    if (fluteWall === "double" && flute.key !== "CB") {
      setFlute({ key: flutePresets.CB.key, val: flutePresets.CB.val });
    }
    if (fluteWall === "single" && flute.key === "CB") {
      setFlute({ key: flutePresets.B.key, val: flutePresets.B.val });
    }
  }, [fluteWall]);

  // Auto-set flute ke CB saat double wall dipilih
  useEffect(() => {
    if (fluteWall === "double" && flute.key !== "CB") {
      setFlute({ key: flutePresets.CB.key, val: flutePresets.CB.val });
    }
    // Auto-reset ke B saat kembali ke single wall dari double wall
    if (fluteWall === "single" && flute.key === "CB") {
      setFlute({ key: flutePresets.B.key, val: flutePresets.B.val });
    }
  }, [fluteWall]);
  useEffect(() => {
    if (pw.inner && pw.outer) {
      setSisiCetak1("2");
      setSisiCetak2("2");
    }
  }, [pw]);
  // Guard setelah semua hooks — aman karena tidak ada hook setelah ini
  if (loadingMinOrder || !minOrderConfig) return (
    <div className="flex h-full items-center justify-center p-8 text-sm text-muted-foreground">
      Memuat konfigurasi...
    </div>
  );

  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-4">
      <section className="mt-auto space-y-2">
        {(() => {
          const warnings: string[] = [];
          if (
            qty < minOrderConfig.min_non_kraft &&
            !["1", "2", "20"].includes(material.inner.id) &&
            !["1", "2", "20"].includes(material.outer.id)
          )
            warnings.push(
              `Material non-kraft tersedia mulai ${minOrderConfig.min_non_kraft.toLocaleString("id-ID")} pcs.`,
            );
          if (
            qty < minOrderConfig.min_premium_white &&
            (["3"].includes(material.inner.id) ||
              ["3"].includes(material.inner.id))
          )
            warnings.push(
              `Premium White tersedia mulai ${minOrderConfig.min_premium_white.toLocaleString("id-ID")} pcs.`,
            );
          if (qty < minOrderConfig.min_cetak)
            warnings.push(
              `Cetakan tersedia mulai ${minOrderConfig.min_cetak.toLocaleString("id-ID")} pcs.`,
            );
          if (qty < minOrderConfig.min_laminasi)
            warnings.push(
              `Laminasi tersedia mulai ${minOrderConfig.min_laminasi.toLocaleString("id-ID")} pcs.`,
            );
          if (qty < minOrderConfig.min_paperbag && model === "shopping")
            warnings.push(
              `Paper bag tersedia mulai ${minOrderConfig.min_paperbag.toLocaleString("id-ID")} pcs.`,
            );

          if (warnings.length === 0) return null;

          return (
            <div className="rounded-lg border bg-muted px-3 py-2.5 font-mono text-[10px] font-medium leading-relaxed text-muted-foreground space-y-0.5">
              {warnings.map((w, i) => (
                <div key={i}>⚡ {w}</div>
              ))}
            </div>
          );
        })()}
        <QuantitySlider qty={qty} setQty={setQty} />
      </section>
      {/* Summary */}
      <section className="rounded-md border border-border bg-card p-3">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-semibold">{title}</h3>
          <a href="#" className="text-xs text-emerald-600 hover:underline">
            Pelajari lebih lanjut
          </a>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {innerMaterial?.name || "Brown Kraft"}
          {" / "}
          {outerMaterial?.name || "Brown Kraft"}
          {" | "}
          {size.length} x {size.width} x {size.height} Cm
        </p>
      </section>
      {/* 3d preview */}
      {mode === "2d" && (
        <section>
          <div className="container mx-auto h-64 w-full rounded-md border border-border bg-card p-2">
            <ThreePreview />
          </div>
        </section>
      )}
      <section className="rounded-md border border-border bg-card p-3">
        {model === "shopping" && (
          <>
            <div>
              <label className="text-sm font-medium">Tali</label>
              <Select
                value={tali?.id ?? ""}
                onValueChange={(value) => {
                  const selectedTali = taliOptions.find((t) => t.id === value);
                  if (selectedTali) setTali(selectedTali);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tali" />
                </SelectTrigger>
                <SelectContent>
                  {taliOptions &&
                    taliOptions.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nama}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Separator className="my-3" />
          </>
        )}
        {
          // model !== "shopping" ||
          qty > minOrderConfig.min_laminasi && (
            <>
              <div className="space-y-3">
                {!pw.inner && !pw.outer && model !== "shopping" && (
                  <div className="rounded-lg border bg-muted px-3 py-2.5 font-mono text-[10px] font-medium leading-relaxed text-muted-foreground">
                    ⚠ Laminasi hanya tersedia jika minimal salah satu sisi
                    menggunakan material Premium White.
                  </div>
                )}
                <div
                  className={
                    !pw.inner && !pw.outer && model !== "shopping"
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                >
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Laminasi</span>
                    <div className="relative ml-3 inline-flex group">
                      <span
                        aria-label="Info"
                        className="inline-flex text-muted-foreground text-center items-center justify-center h-5 w-5 rounded-full border cursor-pointer"
                      >
                        i
                      </span>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-white text-xs text-gray-700 rounded-lg shadow-lg border p-3 hidden group-hover:block z-50 pointer-events-none">
                        <span className="font-bold">Doff</span> — Permukaan
                        matte. Elegan dan premium.
                        <br />
                        <br />
                        <span className="font-bold">Glossy</span> — Mengkilap.
                        Warna lebih cerah dan vivid.
                        <br />
                        <br />
                        <span className="font-bold">UV</span> — Glossy ekstra
                        tebal dan keras. Tahan air.
                        <br />
                        <br />
                        <span className="font-bold">WB Glossy/Doff</span> —
                        Water-based, ramah lingkungan.
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 mr-2">
                    {/* Jenis - 3/4 */}
                    <div className="col-span-3 space-y-1">
                      <div className="flex items-center gap-1">
                        <Label className="text-xs">Jenis</Label>
                      </div>
                      <Select
                        value={laminasi?.code ?? ""}
                        onValueChange={(value) => {
                          const selectedLaminasi = laminasiOptions.find(
                            (l) => l.code === value,
                          );
                          if (selectedLaminasi) setLaminasi(selectedLaminasi);
                        }}
                        disabled={
                          !pw.inner && !pw.outer && model !== "shopping"
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Tanpa Laminasi" />
                        </SelectTrigger>
                        <SelectContent>
                          {laminasiOptions?.map((l) => (
                            <SelectItem
                              key={l.code}
                              value={l.code}
                              className="text-xs"
                            >
                              {l.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 space-y-1">
                      <Label className="text-xs">Sisi</Label>
                      <Select
                        defaultValue="1"
                        onValueChange={(value) => setLaminasiSisi(value)}
                        disabled={
                          !laminasi ||
                          laminasi.code === "" ||
                          (!pw.inner && !pw.outer && model !== "shopping")
                        }
                      >
                        <SelectTrigger className="h-8 text-xs px-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1" className="text-xs">
                            Luar Saja
                          </SelectItem>
                          {pw.inner && (
                            <SelectItem value="1_in" className="text-xs">
                              Dalam Saja
                            </SelectItem>
                          )}
                          {pw.inner && pw.outer && (
                            <SelectItem value="2" className="text-xs">
                              Luar &amp; Dalam
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              <Separator className="my-3" />
            </>
          )
        }
        {
          // model !== "shopping" &&
          <>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Sablon</Label>
                <Select
                  value={sablon?.code ?? "none"}
                  onValueChange={(value) => {
                    const selectedSablon = sablonOptions.find(
                      (s) => s.code === value,
                    );
                    if (selectedSablon) setSablon(selectedSablon);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Pilih Sablon" />
                  </SelectTrigger>
                  <SelectContent>
                    {sablonOptions?.map((s) => (
                      <SelectItem
                        key={s.code}
                        value={s.code}
                        className="text-xs"
                      >
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {sablon && sablon.code !== "none" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="sablon-warna" className="text-xs">
                      Jml Warna
                    </Label>
                    <Input
                      id="sablon-warna"
                      type="number"
                      defaultValue={1}
                      min={1}
                      max={6}
                      className="h-8 text-xs"
                      onInput={(e) =>
                        setSablonWarna(Number(e.currentTarget.value))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="sablon-sisi" className="text-xs">
                      Jumlah Sisi
                    </Label>
                    <Select
                      onValueChange={(value) => setSablonSisi(value)}
                      defaultValue="1"
                    >
                      <SelectTrigger id="sablon-sisi" className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1" className="text-xs">
                          1 Sisi
                        </SelectItem>
                        <SelectItem value="2" className="text-xs">
                          2 Sisi
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            <Separator className="my-3" />
          </>
        }
        {model !== "shopping" && (
          <>
            <div className="mb-2 flex items-center gap-1">
              <span className="text-sm">Flute (Ketebalan Gelombang)</span>
              <span
                aria-label="Info"
                className="ml-3 inline-flex text-muted-foreground text-center items-center justify-center h-5 w-5 rounded-full border cursor-pointer"
              >
                i
              </span>
            </div>
            <div className="mb-2 flex items-center gap-1 text-xs">
              {availableWalls.map(([value, label]) => (
                <label key={value} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="fluteWall"
                    value={value}
                    checked={fluteWall === value}
                    onChange={() => setFluteWall(value as WallType)}
                  />
                  {label}
                </label>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="mb-2 flex items-center gap-1">
              <span className="text-sm">Jenis Flute</span>
              <span
                aria-label="Info"
                className="ml-3 inline-flex text-muted-foreground text-center items-center justify-center h-5 w-5 rounded-full border cursor-pointer"
              >
                i
              </span>
            </div>
            <div className="mb-2 flex items-center gap-4 text-sm">
              {Object.values(availableFlutes).map((f) => (
                <label key={f.key} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="flute"
                    value={f.key}
                    checked={flute.key === f.key}
                    onChange={() => setFlute({ key: f.key, val: f.val })}
                  />
                  {flutes.find((x) => x.code === f.key)?.name}
                </label>
              ))}
            </div>
            <Separator className="my-3" />
          </>
        )}
        {!pw.inner && !pw.outer && model !== "shopping" ? (
          <>
            <div className="rounded-lg border bg-muted px-3 py-2.5 font-mono text-[10px] font-medium leading-relaxed text-muted-foreground">
              ⚠ Opsi Cetak hanya tersedia jika minimal salah satu sisi
              menggunakan material Premium White.
            </div>
          </>
        ) : (
          <>
            <div className="mb-2 flex items-center gap-1">
              <span className="text-sm">Cetakan</span>
              <div className="relative ml-3 inline-flex group">
                <span
                  aria-label="Info"
                  className="ml-3 inline-flex text-muted-foreground text-center items-center justify-center h-5 w-5 rounded-full border cursor-pointer"
                >
                  i
                </span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/4 mb-2 w-72 bg-white text-sm text-gray-700 rounded-lg shadow-lg border border-gray-200 p-3 hidden group-hover:block z-50 pointer-events-none">
                  <b>Blok</b> — Cetakan dengan 1 warna solid. Cocok jika warna
                  dasar box sudah berwarna dan logo/teks berwarna putih.
                  <br />
                  <br />
                  <b>Tulisan</b> — Cetak teks/logo dengan warna tertentu, bisa
                  multi-warna.
                  <br />
                  <br />
                  <b>Separasi</b> — Cetak foto/gradasi warna penuh (CMYK). Biaya
                  fixed, tidak dihitung per warna.
                </div>
              </div>
            </div>
            {qty >= minOrderConfig.min_cetak ? (
              <div className="pt-0 space-y-4">
                <div className="space-y-3">
                  <p className="text-sm font-semibold">Cetakan 1</p>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-3 space-y-1">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="cetak1-code" className="text-xs">
                          Jenis
                        </Label>
                      </div>
                      <Select
                        value={printing1[side]}
                        onValueChange={(value) => {
                          const selectedP = printingOptions.find(
                            (t) => t.code === value,
                          );
                          if (selectedP) setPrinting1(side, selectedP.code);
                        }}
                        defaultValue="none"
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue
                            placeholder="Cetak 1"
                            className="whitespace-normal break-words"
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {printingOptions?.map((p) => (
                            <SelectItem
                              key={p.code}
                              value={p.code}
                              className="text-xs whitespace-normal"
                            >
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 space-y-1">
                      <Label htmlFor="cetak1-warna" className="text-xs">
                        Jml Warna
                      </Label>
                      <Input
                        id="cetak1-warna"
                        type="number"
                        defaultValue={1}
                        min={1}
                        max={6}
                        disabled
                        className="h-8 text-xs px-1 text-center"
                        onInput={(e) =>
                          setJmlWarna1(Number(e.currentTarget.value))
                        }
                      />
                    </div>
                  </div>
                  {(pw.inner || pw.outer || model === "shopping") && (
                    <div className="space-y-1">
                      <Label htmlFor="cetak1-sisi" className="text-xs">
                        Sisi Cetak
                      </Label>
                      <Select
                        onValueChange={(value) => setSisiCetak1(value)}
                        defaultValue="1"
                      >
                        <SelectTrigger id="cetak1-sisi" className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {!(pw.inner && pw.outer) && (
                            <SelectItem value="1">Luar Saja</SelectItem>
                          )}
                          {!(pw.inner && pw.outer) && model !== "shopping" && (
                            <SelectItem value="1_in">Dalam Saja</SelectItem>
                          )}
                          {model !== "shopping" &&(<SelectItem value="2">Luar &amp; Dalam</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                {model !== "shopping" && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <p className="text-sm font-semibold">
                        Cetakan 2{" "}
                        <span className="text-muted-foreground text-[10px] font-normal">
                          — kombinasi opsional
                        </span>
                      </p>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-3 space-y-1">
                          <div className="flex items-center gap-1">
                            <Label htmlFor="cetak2-code" className="text-xs">
                              Jenis
                            </Label>
                          </div>
                          <Select
                            value={printing2[side]}
                            onValueChange={(value) => {
                              const selectedP = printingOptions.find(
                                (t) => t.code === value,
                              );
                              if (selectedP) setPrinting2(side, selectedP.code);
                            }}
                            defaultValue="none"
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue
                                placeholder="Cetak 2"
                                className="whitespace-normal break-words"
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {printingOptions?.map((p) => (
                                <SelectItem
                                  key={p.code}
                                  value={p.code}
                                  className="text-xs whitespace-normal"
                                >
                                  {p.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1 space-y-1">
                          <Label htmlFor="cetak2-warna" className="text-xs">
                            Jml Warna
                          </Label>
                          <Input
                            id="cetak2-warna"
                            type="number"
                            defaultValue={1}
                            min={1}
                            max={6}
                            disabled
                            className="h-8 text-xs px-2 text-center"
                            onInput={(e) =>
                              setJmlWarna2(Number(e.currentTarget.value))
                            }
                          />
                        </div>
                      </div>
                      {(pw.inner || pw.outer) && (
                        <div className="space-y-1">
                          <Label htmlFor="cetak2-sisi" className="text-xs">
                            Sisi Cetak
                          </Label>
                          <Select
                            onValueChange={(value) => setSisiCetak2(value)}
                            defaultValue="1"
                          >
                            <SelectTrigger
                              id="cetak2-sisi"
                              className="h-8 text-xs"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {!(pw.inner && pw.outer) && (
                                <SelectItem value="1">Luar Saja</SelectItem>
                              )}
                              {!(pw.inner && pw.outer) && (
                                <SelectItem value="1_in">Dalam Saja</SelectItem>
                              )}
                              <SelectItem value="2">
                                Luar &amp; Dalam
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-800">
                <span>⚡</span>
                <span>
                  {`Cetakan tersedia mulai ${minOrderConfig.min_cetak.toLocaleString("id-ID")} pcs. Gunakan sablon untuk qty di bawahnya.`}
                </span>
              </div>
            )}
          </>
        )}
        {/* <div className="mb-1 text-sm">
          Kecepatan Produksi{" "}
          <span className="font-medium">
            {speed === "reguler"
              ? "Reguler (7-9 hari kerja)"
              : speed === "express"
                ? "Express (5-7 hari kerja)"
                : "Urgent (3-5 hari kerja)"}
          </span>
        </div>
        <div className="mb-2 flex items-center gap-4 text-sm">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="speed"
              value="reguler"
              checked={speed === "reguler"}
              onChange={() => setSpeed("reguler")}
            />
            Reguler
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="speed"
              value="express"
              checked={speed === "express"}
              onChange={() => setSpeed("express")}
            />
            Express
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="speed"
              value="urgent"
              checked={speed === "urgent"}
              onChange={() => setSpeed("urgent")}
            />
            Urgent
          </label>
        </div>
        <div className="text-[13px] font-medium text-red-600">
          {estimateText}
        </div> */}
      </section>
    </div>
  );
}