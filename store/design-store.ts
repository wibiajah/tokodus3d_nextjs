"use client";
import {
  LaminasiOption,
  MaterialOption,
  PisauPondParams,
  SablonOption,
  ServerBoxModel,
  TaliOption,
} from "@/lib/swr";
import { Point } from "@/models/types";
import { create } from "zustand";
export type Mode = "2d" | "3d";
export type Finishing = "glossy" | "doff" | "";
export type ColorType = "solid" | "gradient";
export type ToolMode = "select" | "pan";
export type ModelType = "shipping" | "shopping" | "mailer";
// | "shoe"
// | "tuckend"
// | "sleeve"
export type Side = "outer" | "inner";
export type WallType = "face" | "single" | "double" | "triple";
export type Panel =
  | "model"
  | "size"
  | "material"
  | "upload"
  | "text"
  | "project";
export type ColorStop = { id: string; color: string; position: number };
export type GradientColor = {
  angle: number;
  stops: ColorStop[];
};
export type FluteType = {
  key: string;
  val: number;
};
export type MaterialSide = {
  id: string;
};
export type MaterialType = {
  inner: MaterialSide;
  outer: MaterialSide;
};
export type MaterialPW = {
  inner: boolean;
  outer: boolean;
};
export type GramasiId = {
  inner: string;
  outer: string;
};
export type Printing = {
  inner: string;
  outer: string;
};
export type Size = {
  length: number;
  width: number;
  height: number;
  depth: number;
};
export type ModelParams = {
  size: Size;
  fixed: number;
  flute: FluteType;
};
export type TextureItem = {
  id: string;
  design: string;
  side: Side;
};
export type ShapeFacecolor = {
  id: string;
  type: ColorType;
  color: string | GradientColor;
  side: Side;
};
export type ListImageItem = {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
};
export type ImageItem = {
  id: string;
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  side: Side;
};
export type TextItem = {
  id: string;
  text: string;
  x: number;
  y: number;
  rotation: number;
  fontSize: number;
  color: string;
  font: string;
  width: number;
  height: number;
  draggable: boolean;
  side: Side;
};
export type ProjectStatus = "draft";
export type SavedProject = {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;
  snapshot: {
    mode: Mode;
    pisau: string;
    tali: TaliOption;
    serverModel: ServerBoxModel;
    innerColor: string;
    outerColor: string;
    sablon: SablonOption;
    sablonWarna: number;
    sablonSisi: string;
    laminasi: LaminasiOption;
    laminasiSisi: string;
    printing1: Printing;
    printing2: Printing;
    jmlwarna1: number;
    jmlwarna2: number;
    sisicetak1: string;
    sisicetak2: string;
    quantity: number;
    price: number;
    model: ModelType;
    size: Size;
    material: MaterialType;
    images: ImageItem[];
    texts: TextItem[];
    openClose: number;
  };
};
type State = {
  // core
  mode: Mode;
  innerColor: string;
  outerColor: string;
  faceColors: ShapeFacecolor[];
  finishing: Finishing;
  printing1: Printing;
  printing2: Printing;
  jmlwarna1: number;
  jmlwarna2: number;
  sisicetak1: string;
  sisicetak2: string;
  quantity: number;
  price: number;
  side: Side;
  pickerPosition: Point;
  pisau: string;

  // new: configuration
  model: ModelType;
  serverModel: ServerBoxModel;
  size: Size;
  material: MaterialType;
  flute: FluteType;
  fluteWall: WallType;
  modelParams: ModelParams;
  tali: TaliOption;
  laminasi: LaminasiOption;
  laminasiSisi: string;
  sablon: SablonOption;
  sablonWarna: number;
  sablonSisi: string;
  materials: MaterialOption[];
  pw: MaterialPW;
  gramasi: GramasiId;

  startX: number;
  startY: number;
  fixedFlap: number;
  // dieline content
  textures: TextureItem[];
  listImages: ListImageItem[];
  images: ImageItem[];
  texts: TextItem[];
  selectedId: string | null;
  activeShape: string | null;
  hoveredShape: string | null;
  openClose: number; // 0..1
  activePanel: Panel;
  isVisible: boolean;
  // 3D
  // texture
  inner: string | null;
  outer: string | null;
  // projects
  project: SavedProject | null;

  // setters
  setMode: (m: Mode) => void;
  setFaceColors: (s: ShapeFacecolor) => void;
  setInnerColor: (c: string) => void;
  setOuterColor: (c: string) => void;
  setFinishing: (f: Finishing) => void;
  setPrinting1: (side: Side, p: string) => void;
  setPrinting2: (side: Side, p: string) => void;
  setJmlWarna1: (j: number) => void;
  setJmlWarna2: (j: number) => void;
  setSisiCetak1: (s: string) => void;
  setSisiCetak2: (s: string) => void;
  setQuantity: (q: number) => void;
  setSide: (s: Side) => void;
  setPickerPosition: (p: Point) => void;
  setEmptyFaceColors: () => void;
  setPisau: (p: string) => void;

  setModel: (m: ModelType) => void;
  setServerModel: (m: ServerBoxModel) => void;
  setSize: (partial: Partial<Size>) => void;
  setMaterial: (side: Side, id: string) => void;
  setFlute: (f: FluteType) => void;
  setFluteWall: (wall: WallType) => void;
  setTali: (t: TaliOption) => void;
  setLaminasi: (l: LaminasiOption) => void;
  setLaminasiSisi: (l: string) => void;
  setSablon: (s: SablonOption) => void;
  setSablonWarna: (s: number) => void;
  setSablonSisi: (s: string) => void;
  setMaterials: (m: MaterialOption[]) => void;
  setPW: (s: Side, p: boolean) => void;
  setGramasi: (s: Side, g: string) => void;

  setModelParams: (p: ModelParams) => void;

  setTexture: (t: TextureItem) => void;

  addImage2List: (i: Omit<ListImageItem, "id">) => void;
  removeImageFromList: (id: string) => void;
  insertImageFromList: (
    listId: string,
    side: Side,
    x?: number,
    y?: number,
  ) => void;
  loadListImagesFromStorage: () => void;

  addImage: (i: Omit<ImageItem, "id">) => void;
  removeImage: (id: string) => void;
  loadImagesFromStorage: () => void;
  updateImage: (id: string, patch: Partial<ImageItem>) => void;

  addText: (t: Omit<TextItem, "id">) => void;
  removeText: (id: string) => void;
  updateText: (id: string, patch: Partial<TextItem>) => void;
  setSelectedId: (id: string | null) => void;
  setActiveShape: (id: string | null) => void;
  setHoveredShape: (id: string | null) => void;

  setOpenClose: (v: number) => void;

  setActivePanel: (p: Panel) => void;
  setIsVisible: (i: boolean) => void;

  setInner: (i: string | null) => void;
  setOuter: (i: string | null) => void;
  pisauParams: () => PisauPondParams;
  buildSnapshot: (name: string, status: ProjectStatus) => SavedProject | null;
  loadProject: (project: SavedProject) => void;
  setProject: (p: SavedProject | null) => void;
  reset: () => void;
};

export const useDesignStore = create<State>((set, get) => ({
  // core
  mode: "2d",
  // mode: "3d",
  innerColor: "transparent",
  outerColor: "transparent",
  faceColors: [],
  finishing: "",
  printing1: { inner: "none", outer: "none" },
  printing2: { inner: "none", outer: "none" },
  jmlwarna1: 1,
  jmlwarna2: 1,
  sisicetak1: "1",
  sisicetak2: "1",
  quantity: 300,
  price: 0,
  side: "outer",
  pickerPosition: { x: 0, y: 0 },
  pisau: "none",

  // new: configuration
  model: "shipping",
  serverModel: {
    id_bm: "10",
    code: "535360",
    name: "Shipping Box / Masterbox",
    description:
      "Box pengiriman paket standar (seperti dus indomie). Mendukung input ukuran dalam maupun luar.",
    status_bm: "1",
    is_shipping_box: "1",
    input_mode: "inner",
    is_paperbag: "0",
  },
  // model: "shopping",
  size: { length: 20, width: 15, height: 10, depth: 0.3 },
  material: {
    inner: { id: "1" },
    outer: { id: "1" },
  },
  flute: { key: "E", val: 1.6 },
  // fluteWall: "single",
  fluteWall: "double",
  tali: {
      "id": "10",
      "kode": "tanpa_tali",
      "nama": "Tanpa Tali",
      "deskripsi": "Paperbag tanpa tali (lipatan atas / diecut hole).",
      "harga_per_pcs": "0.00",
      "status": "1",
      "updated_at": null
    },
  laminasi: {
    id_lt: "1",
    code: "none",
    label: "Tanpa Laminasi",
    index_harga: "0.0000",
  },
  laminasiSisi: "1",
  sablon: {
    id_st: "1",
    code: "none",
    label: "Tanpa Sablonan",
    harga_jual_gt500: "0.00",
    harga_jual_gt100: "0.00",
    qty_minimum: "0",
  },
  sablonWarna: 1,
  sablonSisi: "1",
  materials: [],
  pw: { inner: false, outer: false },
  gramasi: { inner: "125", outer: "125" },

  modelParams: {
    // seumpama sudah dikali 10
    size: { length: 200, width: 150, height: 100, depth: 3 },
    fixed: 20,
    flute: { key: "F", val: 0.8 },
  },

  startX: 80,
  startY: 80,
  fixedFlap: 20,
  // dieline content
  textures: [],
  listImages: [],
  images: [],
  texts: [],
  selectedId: null,
  activeShape: null,
  hoveredShape: null,

  openClose: 1,
  activePanel: "model",
  isVisible: false,
  // 3D
  // material
  inner: null,
  outer: null,
  project: null,

  // setters
  setMode: (m) => set({ mode: m }),
  setInnerColor: (c) => set({ innerColor: c }),
  setOuterColor: (c) => set({ outerColor: c }),
  setFinishing: (f) => {
    set({ finishing: f });
  },
  setPrinting1: (side: Side, p: string) => {
    set((prev) => ({
      printing1: {
        ...prev.printing1,
        [side]: p,
      },
    }));
    // const { quantity } = get();
    // set({ price: calcPrice(quantity, p) });
  },
  setPrinting2: (side: Side, p: string) => {
    set((prev) => ({
      printing2: {
        ...prev.printing2,
        [side]: p,
      },
    }));
    // const { quantity } = get();
    // set({ price: calcPrice(quantity, p) });
  },
  setJmlWarna1: (j) => set({ jmlwarna1: j }),
  setJmlWarna2: (j) => set({ jmlwarna2: j }),
  setSisiCetak1: (s) => set({ sisicetak1: s }),
  setSisiCetak2: (s) => set({ sisicetak2: s }),
  setQuantity: (q) => {
    // const { printing } = get();
    set({ quantity: q
      // , price: calcPrice(q, printing) 
    });
  },
  setSide: (s) => set({ side: s }),
  setPickerPosition: (p) => set({ pickerPosition: p }),
  setPisau: (p) => set({ pisau: p }),

  setModel: (m) => set({ model: m }),
  setServerModel: (m) => set({ serverModel: m }),
  setSize: (partial) => set((prev) => ({ size: { ...prev.size, ...partial } })),
  setMaterial: (side: Side, id: string) =>
    set((prev) => ({
      material: {
        ...prev.material,
        [side]: { id },
      },
    })),
  setFlute: (f) => set({ flute: f }),
  setFluteWall: (w) => set({ fluteWall: w }),
  setTali: (t) => set({ tali: t }),
  setLaminasi: (l) => set({ laminasi: l }),
  setLaminasiSisi: (l) => set({ laminasiSisi: l }),
  setSablon: (s) => set({ sablon: s }),
  setSablonWarna: (s) => set({ sablonWarna: s }),
  setSablonSisi: (s) => set({ sablonSisi: s }),
  setMaterials: (m) => set({ materials: m }),
  setPW: (side: Side, p: boolean) =>
    set((prev) => ({
      pw: {
        ...prev.pw,
        [side]: p,
      },
    })),
  setGramasi: (side: Side, g: string) =>
    set((prev) => ({
      gramasi: {
        ...prev.gramasi,
        [side]: g,
      },
    })),

  setModelParams: (p) => set({ modelParams: p }),

  setTexture: (item) =>
    set((prev) => ({
      ...prev,
      textures: [
        ...prev.textures.filter(
          (tx) => !(tx.id === item.id && tx.side === item.side),
        ),
        item,
      ],
    })),
  setFaceColors: (item) =>
    set((prev) => ({
      ...prev,
      faceColors: [
        ...prev.faceColors.filter(
          (fc) => !(fc.id === item.id && fc.side === item.side),
        ),
        item,
      ],
    })),
  setEmptyFaceColors: () =>
    set(() => ({
      faceColors: [],
    })),

  addImage2List: (i) => {
    const newItem: ListImageItem = { id: genId(), ...i };
    const updated = [...get().listImages, newItem];
    set({ listImages: updated });
    localStorage.setItem("listImages", JSON.stringify(updated));
  },

  removeImageFromList: (id) => {
    const updated = get().listImages.filter((x) => x.id !== id);
    set({ listImages: updated });
    localStorage.setItem("listImages", JSON.stringify(updated));
  },

  insertImageFromList: (listId, side, x = 250, y = 150) => {
    const src = get().listImages.find((x) => x.id === listId);
    if (!src) return;

    const newImage: ImageItem = {
      id: genId(),
      dataUrl: src.dataUrl,
      x,
      y,
      width: src.width,
      height: src.height,
      visible: true,
      side,
    };

    const updated = [...get().images, newImage];
    set({ images: updated });
    localStorage.setItem("images", JSON.stringify(updated));
  },

  loadListImagesFromStorage: () => {
    try {
      const raw = localStorage.getItem("listImages");
      if (raw) set({ listImages: JSON.parse(raw) });
    } catch (e) {
      console.error("Failed to load list of images from localStorage:", e);
    }
  },

  addImage: (i) => {
    const newImage: ImageItem = { id: genId(), ...i };
    const updated = [...get().images, newImage];
    set({ images: updated });
    localStorage.setItem("images", JSON.stringify(updated));
  },
  removeImage: (id) => {
    const updated = get().images.filter((img) => img.id !== id);
    set({ images: updated });
    localStorage.setItem("images", JSON.stringify(updated));
  },
  updateImage: (id, patch) => {
    const updated = get().images.map((x) =>
      x.id === id ? { ...x, ...patch } : x,
    );
    set({ images: updated });
    localStorage.setItem("images", JSON.stringify(updated));
  },
  loadImagesFromStorage: () => {
    try {
      const raw = localStorage.getItem("images");
      if (raw) set({ images: JSON.parse(raw) });
    } catch (e) {
      console.error("Failed to load images from localStorage:", e);
    }
  },

  addText: (t) =>
    set((prev) => ({
      texts: [...prev.texts, { ...t, id: genId() }],
    })),
  removeText: (id) =>
    set((prev) => ({
      texts: prev.texts.filter((x) => x.id !== id),
    })),
  updateText: (id, patch) =>
    set((prev) => ({
      texts: prev.texts.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    })),
  setSelectedId: (id) => set({ selectedId: id }),
  setActiveShape: (id) => set({ activeShape: id }),
  setHoveredShape: (id) => set({ hoveredShape: id }),

  setOpenClose: (v) => set({ openClose: clamp01(v) }),

  setActivePanel: (p) => set({ activePanel: p }),

  // projects
  pisauParams: (): PisauPondParams => {
    const st = get();
    return {
      box_model_id: st.serverModel.id_bm,
      panjang_cm: st.size.length,
      lebar_cm: st.size.width,
      tinggi_cm: st.size.height,
    };
  },
  buildSnapshot: (name: string, status: ProjectStatus): SavedProject | null => {
    if (typeof window === "undefined") return null;
    const st = get();
    return {
      id: genId(),
      name,
      status,
      createdAt: Date.now(),
      updatedAt: 0,
      snapshot: {
        mode: st.mode,
        pisau: st.pisau,
        tali: st.tali,
        serverModel: st.serverModel,
        innerColor: st.innerColor,
        outerColor: st.outerColor,
        laminasi: st.laminasi,
        laminasiSisi: st.laminasiSisi,
        sablon: st.sablon,
        sablonWarna: st.sablonWarna,
        sablonSisi: st.sablonSisi,
        printing1: st.printing1,
        printing2: st.printing2,
        jmlwarna1: st.jmlwarna1,
        jmlwarna2: st.jmlwarna2,
        sisicetak1: st.sisicetak1,
        sisicetak2: st.sisicetak2,
        // FIX: field wajib untuk server recalc
        gramasi: st.gramasi,
        flute: st.flute,
        fluteWall: st.fluteWall,
        side: st.side,
        quantity: st.quantity,
        price: st.price,
        model: st.model,
        size: st.size,
        material: {
          inner: { ...st.material.inner },
          outer: { ...st.material.outer },
        },
        images: st.images,
        texts: st.texts,
        openClose: st.openClose,
      },
    };
  },
  loadProject: (project: SavedProject) => {
    const s = project.snapshot;
    set({
      mode: s.mode,
      pisau: s.pisau,
      tali: s.tali,
      serverModel: s.serverModel,
      innerColor: s.innerColor,
      outerColor: s.outerColor,
      laminasi: s.laminasi,
      laminasiSisi: s.laminasiSisi,
      sablon: s.sablon,
      sablonWarna: s.sablonWarna,
      sablonSisi: s.sablonSisi,
      printing1: s.printing1,
      printing2: s.printing2,
      jmlwarna1: s.jmlwarna1,
      jmlwarna2: s.jmlwarna2,
      sisicetak1: s.sisicetak1,
      sisicetak2: s.sisicetak2,
      quantity: s.quantity,
      price: s.price,
      model: s.model,
      size: s.size,
      material: s.material as MaterialType,
      images: s.images,
      texts: s.texts,
      openClose: s.openClose,
    });
  },
  setProject: (p) => set({ project: p }),
  reset: () => set({
    project: null,
    mode: "2d",
    model: "shipping",
    size: { length: 20, width: 15, height: 10, depth: 0.3 },
    material: { inner: { id: "1" }, outer: { id: "1" } },
    flute: { key: "E", val: 1.6 },
    fluteWall: "double",
    laminasi: { id_lt: "1", code: "none", label: "Tanpa Laminasi", index_harga: "0.0000" },
    laminasiSisi: "1",
    sablon: { id_st: "1", code: "none", label: "Tanpa Sablonan", harga_jual_gt500: "0.00", harga_jual_gt100: "0.00", qty_minimum: "0" },
    sablonWarna: 1,
    sablonSisi: "1",
    quantity: 100,
    price: 0,
    images: [],
    texts: [],
    pisau: "none",
    openClose: 1,
  }),
  setIsVisible: (i) => set({ isVisible: i }),
  setInner: (i) => set({ inner: i }),
  setOuter: (o) => set({ outer: o }),
}));
// function calcPrice(qty: number, printing: Printing) {
//   const base = printing === "premium" ? 5500 : 3500;
//   const discount =
//     qty >= 1000
//       ? 0.35
//       : qty >= 700
//         ? 0.25
//         : qty >= 500
//           ? 0.18
//           : qty >= 300
//             ? 0.1
//             : 0;
//   const unit = Math.round(base * (1 - discount));
//   return unit * qty;
// }
function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}
function genId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return (crypto as any).randomUUID();
  return "id-" + Math.random().toString(36).slice(2);
}