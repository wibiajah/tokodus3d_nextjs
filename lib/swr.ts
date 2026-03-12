"use client";
import useSWR from "swr";
import {
  ModelType,
  ProjectStatus,
  Size,
  useDesignStore,
  type SavedProject,
} from "@/store/design-store";
import { useAuthStore } from "@/store/auth-store";
import { useEffect, useState, useMemo } from "react";

// ─────────────────────────────────────────────────────────────
//  Base URL — langsung ke Laravel
//  Set di .env: NEXT_PUBLIC_LARAVEL_URL=http://localhost:8000
// ─────────────────────────────────────────────────────────────
const L = process.env.NEXT_PUBLIC_LARAVEL_URL;

// Fetcher: unwrap format Laravel { status, message, data }
// Endpoint publik (BoxModels, Flutes, dll) tidak butuh X-Api-Secret
// karena data statis dan throttle sudah cukup sebagai proteksi
export const fetcher = (url: string) =>
  fetch(url, {
    headers: { "Accept": "application/json" },
  })
    .then((res) => {
      // Jangan throw — biarkan SWR handle via error state
      // Komponen masing-masing bertanggung jawab cek null/loading
      if (!res.ok) return null;
      return res.json();
    })
    .then((j) => {
      if (!j) return null;
      if (typeof j === "object" && "status" in j) {
        return j.status === 200 ? j.data : null;
      }
      return j;
    })
    .catch(() => null);

// ─────────────────────────────────────────────────────────────
//  INTERFACES
// ─────────────────────────────────────────────────────────────

export interface Flute {
  id_f: string;
  code: string;
  name: string;
}
export interface Gramasi {
  id: string;
  material_type_id: string;
  gsm: string;
}
export interface LaminasiOption {
  id_lt: string;
  code: string;
  label: string;
  index_harga: string;
}
export interface ServerBoxModel {
  id_bm: string;
  code: string;
  name: string;
  description: string;
  status_bm: string;
  is_shipping_box: string;
  input_mode: "inner" | "outer";
  is_paperbag: string;
}
export interface BoxModel extends ServerBoxModel {
  id: ModelType;
  size: Size;
}
export interface MaterialOption {
  id: string;
  name: string;
  material_type: string;
  is_premium: string;
  dir: string;
}
export interface MinOrderConfig {
  min_cetak: number;
  min_laminasi: number;
  min_premium_white: number;
  min_non_kraft: number;
  min_paperbag: number;
}
export interface PrintingOption {
  id_pt: string;
  code: string;
  label: string;
}
export interface SablonOption {
  id_st: string;
  code: string;
  label: string;
  harga_jual_gt500: string;
  harga_jual_gt100: string;
  qty_minimum: string;
}
export interface TaliOption {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  harga_per_pcs: string;
  status: string;
  updated_at: string | null;
}
export interface PisauPondBatas {
  config_key: string;
  id: string;
  keterangan: string;
  min_lebar_cm: string;
  min_panjang_cm: string;
  min_tinggi_cm: string;
  nilai: null;
  updated_at: string | null;
}
export interface PisauPondResult {
  batas: PisauPondBatas;
  pisau_pond: string;
  reason: string;
}
export interface PisauPondParams {
  box_model_id: string;
  panjang_cm: string | number;
  lebar_cm: string | number;
  tinggi_cm: string | number;
}
export interface CalculatePriceBreakdown {
  biaya_lem: number;
  biaya_produksi: number;
  harga_bahan: number;
  harga_cetak: number;
  harga_laminasi: number;
  harga_pisau: number;
  harga_sablon: number;
}
export interface CalculatePriceDimensi {
  hasil_lebar_mm: number;
  hasil_panjang_mm: number;
  luas_m2: number;
}
export interface CalculatePriceResult {
  breakdown: CalculatePriceBreakdown;
  dimensi: CalculatePriceDimensi;
  harga_modal: number;
  harga_per_pcs: number;
  margin_pct: string;
  rumus: string;
  total: number;
}

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────

const DEFAULT_SIZES: Record<ModelType, Size> = {
  shipping: { length: 20, width: 15, height: 10, depth: 0.3 },
  shopping: { length: 22, width: 8, height: 28, depth: 0.2 },
  mailer: { length: 30.5, width: 20.55, height: 5.05, depth: 0.3 },
};

export function getModelType(serverData: {
  is_shipping_box: string;
  is_paperbag: string;
}): ModelType {
  if (serverData.is_paperbag === "1") return "shopping";
  if (serverData.is_shipping_box === "1") return "shipping";
  return "mailer";
}

export function mapServerToBoxModel(server: ServerBoxModel): BoxModel {
  const modelType = getModelType(server);
  return {
    id_bm: server.id_bm,
    id: modelType,
    code: server.code,
    name: server.name,
    description: server.description,
    size: DEFAULT_SIZES[modelType],
    status_bm: server.status_bm,
    is_shipping_box: server.is_shipping_box,
    input_mode: server.input_mode,
    is_paperbag: server.is_paperbag,
  };
}

// Map material id/type → gambar thumbnail
const materialDirMap: Record<string, string> = {
  // by material_type code
  K:  "/material/brown-kraft.png",
  W:  "/material/white-kraft.png",
  D:  "/material/premium.png",
  IV: "/material/ivory.png",      // TODO: ganti dengan foto ivory asli
  AP: "/material/art-paper.png",  // TODO: ganti dengan foto art-paper asli
  KP: "/material/brown-kraft.png",
  DX: "/material/duplex.png",     // TODO: ganti dengan foto duplex asli
  // by numeric id (dari API Laravel)
  "1":  "/material/brown-kraft.png",
  "2":  "/material/white-kraft.png",
  "3":  "/material/premium.png",      // premium.png sudah ada
  "6":  "/material/white-kraft.png",  // TODO: ganti ivory.png setelah foto tersedia
  "7":  "/material/white-kraft.png",  // TODO: ganti art-paper.png setelah foto tersedia
  "20": "/material/brown-kraft.png",  // TODO: ganti kraft.png setelah foto tersedia
  "22": "/material/brown-kraft.png",  // TODO: ganti duplex.png setelah foto tersedia
};

// ─────────────────────────────────────────────────────────────
//  HOOKS — semua langsung ke Laravel /api/3d/...
// ─────────────────────────────────────────────────────────────

export function useFlutes() {
  const { data, error, isLoading } = useSWR(`/api/proxy/static/Flutes`, fetcher);
  return { flutes: (data as Flute[]) ?? [], loading: isLoading, error };
}

export function useGramasi(materialId?: string) {
  const { data, error, isLoading } = useSWR(
    materialId ? `/api/proxy/static/Gramasi?material_type_id=${materialId}` : null,
    fetcher,
  );
  return { gramasiList: (data as Gramasi[]) ?? [], loading: isLoading, error };
}

export function useLaminasiOptions() {
  const { data, error, isLoading } = useSWR(`/api/proxy/static/LaminasiOptions`, fetcher);
  return { laminasiOptions: (data as LaminasiOption[]) ?? [], loading: isLoading, error };
}

export function useBoxModels() {
  const { data, error, isLoading } = useSWR(`/api/proxy/static/BoxModels`, fetcher);
  const boxModels: BoxModel[] = useMemo(() => {
    if (!data) return [];
    return (data as ServerBoxModel[])
      .filter((item) => item.status_bm === "1")
      .map(mapServerToBoxModel);
  }, [data]);
  return { boxModels, loading: isLoading, error };
}

export function useMaterials(modelId?: string) {
  const { data, error, isLoading } = useSWR(
    modelId ? `/api/proxy/static/MaterialOptions?box_model_id=${modelId}` : null,
    fetcher,
  );
  const materialList: MaterialOption[] = useMemo(() => {
    if (!data) return [];
    return (data as Omit<MaterialOption, "dir">[]).map((item) => ({
      ...item,
      dir: materialDirMap[item.id] ?? "/material/brown-kraft.png",
    }));
  }, [data]);
  return { materialList, loading: isLoading, error };
}

export function useMinOrderConfig() {
  const { data, error, isLoading } = useSWR(`/api/proxy/static/MinOrderConfig`, fetcher);
  return {
    minOrderConfig: (data && !Array.isArray(data)) ? (data as MinOrderConfig) : null,
    loading: isLoading,
    error,
  };
}

export function usePrintingOptions() {
  const { data, error, isLoading } = useSWR(`/api/proxy/static/PrintingOptions`, fetcher);
  return { printingOptions: (data as PrintingOption[]) ?? [], loading: isLoading, error };
}

export function useSablonOptions() {
  const { data, error, isLoading } = useSWR(`/api/proxy/static/SablonOptions`, fetcher);
  return { sablonOptions: (data as SablonOption[]) ?? [], loading: isLoading, error };
}

export function useTaliOptions() {
  const { data, error, isLoading } = useSWR(`/api/proxy/static/TaliOptions`, fetcher);
  return { taliOptions: (data as TaliOption[]) ?? [], loading: isLoading, error };
}

// ─────────────────────────────────────────────────────────────
//  PROJECTS — per customer, disimpan di Laravel DB
// ─────────────────────────────────────────────────────────────

// Ambil customer_id dari Zustand store (bukan sessionStorage)
// Zustand store diisi oleh use-auth-bridge setelah whoami berhasil
// Fallback ke localStorage kalau store belum restore (e.g. pertama kali render)
function getCustomerId(): string | null {
  // 1. Dari Zustand store (sumber utama)
  const customer = useAuthStore.getState().customer;
  if (customer?.customer_id) {
    return String(customer.customer_id);
  }
  // 2. Fallback: localStorage (diisi use-auth-bridge)
  try {
    const saved = localStorage.getItem("3d_customer");
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return parsed.customer_id ? String(parsed.customer_id) : null;
  } catch {
    return null;
  }
}

async function persistProjects(
  customerId: string,
  items: SavedProject[]
): Promise<SavedProject[]> {
  // Pakai Next.js proxy — X-Api-Secret ditambahkan server, tidak terekspos ke browser
  await fetch(`/api/proxy/projects`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "X-Customer-Id": customerId,
    },
    body: JSON.stringify({ projects: items }),
  });
  return items;
}

export function useProjects() {
  const customerId = getCustomerId();

  // Pakai Next.js proxy — X-Api-Secret ditambahkan server
  const projectsUrl = customerId ? `/api/proxy/projects` : null;

  // authFetcher: forward X-Customer-Id ke proxy
  const authFetcher = async (url: string) => {
    const id = getCustomerId();
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(id ? { "X-Customer-Id": id } : {}),
      },
    });
    if (!res.ok) return [];
    const j = await res.json();
    return j.status === 200 ? j.data : [];
  };

  const { data, mutate, isLoading } = useSWR<SavedProject[]>(
    projectsUrl,
    authFetcher,
    { fallbackData: [] }
  );

  const buildSnapshot      = useDesignStore((s) => s.buildSnapshot);
  const loadProjectToStore = useDesignStore((s) => s.loadProject);

  async function saveProject(name: string, status: ProjectStatus) {
    if (!customerId) return;
    const project = buildSnapshot(name, status);
    if (!project) return;
    const updated = [project, ...(data ?? [])];
    await mutate(await persistProjects(customerId, updated), {
      optimisticData: updated,
      rollbackOnError: true,
      revalidate: false,
    });
  }

  async function updateProject(id: string, name: string, status: ProjectStatus) {
    if (!customerId) return;
    const snapshot = buildSnapshot(name, status);
    if (!snapshot) return;
    const updated = (data ?? []).map((x) =>
      x.id === id ? { ...snapshot, id, updatedAt: Date.now() } : x
    );
    await mutate(() => persistProjects(customerId, updated), {
      optimisticData: updated,
      rollbackOnError: true,
      revalidate: false,
    });
  }

  async function deleteProject(id: string) {
    if (!customerId) return;
    const updated = (data ?? []).filter((x) => x.id !== id);
    await mutate(await persistProjects(customerId, updated), {
      optimisticData: updated,
      rollbackOnError: true,
      revalidate: false,
    });
  }

  function loadProject(id: string) {
    const found = (data ?? []).find((x) => x.id === id);
    if (!found) return;
    loadProjectToStore(found);
  }

  return {
    projects: (data as SavedProject[]) ?? [],
    isLoading,
    saveProject,
    updateProject,
    deleteProject,
    loadProject,
  };
}

// ─────────────────────────────────────────────────────────────
//  PISAU POND — langsung ke Laravel
// ─────────────────────────────────────────────────────────────

export function useCheckPisauPond() {
  const serverModel = useDesignStore((s) => s.serverModel);
  const size        = useDesignStore((s) => s.size);

  const paramString = useMemo(() => {
    const params = new URLSearchParams({
      box_model_id: String(serverModel.id_bm),
      panjang_cm:   String(size.length),
      lebar_cm:     String(size.width),
      tinggi_cm:    String(size.height),
    });
    return params.toString();
  }, [serverModel, size]);

  const { data, error, isLoading } = useSWR(
    serverModel.id_bm ? `/api/proxy/pisau-check?${paramString}` : null,
    fetcher,
  );

  const setPisau = useDesignStore((s) => s.setPisau);
  useEffect(() => {
    if ((data as PisauPondResult)?.pisau_pond) {
      setPisau((data as PisauPondResult).pisau_pond);
    }
  }, [data, setPisau]);

  return {
    pisauPond: (data as PisauPondResult) ?? null,
    loading: isLoading,
    error,
  };
}

// ─────────────────────────────────────────────────────────────
//  DEBOUNCE
// ─────────────────────────────────────────────────────────────

export function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

// ─────────────────────────────────────────────────────────────
//  CALCULATE PRICE — POST langsung ke Laravel
// ─────────────────────────────────────────────────────────────

export function useCalculatePrice() {
  const s              = useDesignStore((s) => s);
  const isShopping     = s.model === "shopping";
  const { pisauPond }       = useCheckPisauPond();
  const { minOrderConfig }  = useMinOrderConfig();
  const debouncedQty   = useDebounce(s.quantity, 600);

  // Validasi input — dari versi baru (lebih lengkap dari versi lama)
  const errors: string[] = [];
  if (!s.serverModel.id_bm)  errors.push("Model belum dipilih");
  if (!s.material.outer.id)  errors.push("Material luar belum dipilih");
  if (!s.gramasi.outer)       errors.push("Gramasi luar belum dipilih");
  if (!s.gramasi.inner)       errors.push("Gramasi dalam belum dipilih");
  if (!s.quantity)            errors.push("Jumlah belum diisi");
  if (isShopping && minOrderConfig && s.quantity < minOrderConfig.min_paperbag)
    errors.push(`Jumlah Paperbag minimal ${minOrderConfig.min_paperbag.toLocaleString("id-ID")} pcs`);
  if (isShopping && !s.material.inner.id)
    errors.push("Material dalam belum dipilih");
  if (isShopping && !s.gramasi.inner)
    errors.push("Gramasi dalam belum dipilih");
  if (
    minOrderConfig &&
    !["1", "2", "20"].includes(s.material.outer.id) &&
    !["1", "2", "20"].includes(s.material.inner.id) &&
    s.quantity < minOrderConfig.min_non_kraft
  )
    errors.push(`Material non-kraft tersedia mulai ${minOrderConfig.min_non_kraft.toLocaleString("id-ID")} pcs`);

  const hasRequiredInput = errors.length === 0;

  const payload =
    hasRequiredInput && pisauPond
      ? {
          box_model_id:      s.serverModel.id_bm,
          panjang_cm:        s.size.length,
          lebar_cm:          s.size.width,
          tinggi_cm:         s.size.height,
          outer_material_id: s.material.outer.id,
          tali_kode:         s.tali?.kode,
          outer_gsm:         s.gramasi.outer,
          inner_material_id: isShopping ? s.material.outer.id : s.material.inner.id,
          inner_gsm:         isShopping ? s.gramasi.outer : s.gramasi.inner,
          flute_code:        s.flute.key,
          wall_type:         s.fluteWall,
          cetak_1_code:      s.printing1[s.side],
          cetak_1_warna:     s.jmlwarna1,
          cetak_1_sisi:      Number(s.sisicetak1),
          cetak_2_code:      s.printing2[s.side],
          cetak_2_warna:     s.jmlwarna2,
          cetak_2_sisi:      Number(s.sisicetak2),
          sablon_code:       s.sablon.code,
          sablon_warna:      s.sablonWarna,
          sablon_sisi:       Number(s.sablonSisi),
          laminasi_code:     s.laminasi.code,
          laminasi_sisi:     Number(s.laminasiSisi),
          laminasi_sisi_raw: s.laminasiSisi,
          pisau_pond:        pisauPond.pisau_pond,
          qty:               debouncedQty,
        }
      : null;

  const { data, error, isLoading } = useSWR(
    payload ? JSON.stringify(payload) : null,
    () =>
      fetch(`/api/proxy/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((r) => r.json())
        .then((j) => (j.status === 200 ? j.data : null)),
  );

  if (!hasRequiredInput) {
    return { result: null, loading: false, error: errors };
  }

  return {
    result: (data as CalculatePriceResult) ?? null,
    loading: isLoading,
    error,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  useCalculateWeight
//  Hitung estimasi berat per pcs untuk Masterbox (shipping model)
//  Hanya aktif kalau model === "shipping" dan data dimensi + gramasi lengkap
// ─────────────────────────────────────────────────────────────────────────────
type CalculateWeightResult = {
  berat_gram:  number;
  metode:      string;   // "kalkulasi_rumus" | "fallback_weight_gram"
  keterangan?: string;   // ada isi kalau pakai fallback
};

export function useCalculateWeight() {
  const s          = useDesignStore((s) => s);
  const isShipping = s.model === "shipping";

  // Payload hanya dikirim kalau shipping + data lengkap
  const payload =
    isShipping &&
    s.serverModel.id_bm &&
    s.size.length &&
    s.size.width  &&
    s.size.height &&
    s.gramasi.outer &&
    s.flute.key &&
    s.fluteWall
      ? {
          panjang_cm:   s.size.length,
          lebar_cm:     s.size.width,
          tinggi_cm:    s.size.height,
          outer_gsm:    s.gramasi.outer,
          flute_code:   s.flute.key,
          wall_type:    s.fluteWall,
          box_model_id: s.serverModel.id_bm,
        }
      : null;

  const { data, isLoading } = useSWR(
    payload ? `weight:${JSON.stringify(payload)}` : null,
    () =>
      fetch(`/api/proxy/weight`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      })
        .then((r) => r.json())
        .then((j) => (j.status === 200 ? (j.data as CalculateWeightResult) : null)),
    { revalidateOnFocus: false }
  );

  return {
    berat:   (data ?? null) as CalculateWeightResult | null,
    loading: isLoading,
  };
}