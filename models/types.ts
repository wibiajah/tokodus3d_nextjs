import { Size } from "@/store/design-store";
export type Point = {
  x: number;
  y: number;
};
export type ArcParams = {
  x: number;
  y: number;
  radius: number;
  angle: number;
  rotation: number;
};
export type PathType = "cut" | "fold" | "transparent";
export type Boundary = Point & {
  r?: number;
}
export type BoxParams = {
  size: Size; // mm
  fixed: number; // mm (fixed flap)
  flute?: "A" | "B" | "C" | "E";
};
export type Lines = {
  kind: string;
  points: number[];
  stroke: string;
  strokeWidth: number;
  dash?: number[];
};
export type Arcs = {
  kind: string;
  x: number;
  y: number;
  radius: number;
  angle: number;
  rotation: number;
  stroke: string;
  strokeWidth: number;
  dash?: number[];
};
export type Holes = Lines | Arcs;
export type Shapes = Lines | Arcs | Boundary;
export type ShapeMap = Record<string, Boundary[]>;
export type DimensionItem = {
  label: string; // e.g. "L", "W", "H"
  value: number | string; // e.g. 200, "200 mm"
  length: number; // visual length of dimension line
  x: number;
  y: number;
  u: number;
  v: number;
  ru: number;
  rv: number;
  vertical?: boolean; // vertical stacking offset
};
export type ExportArea = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
export type ImageArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DesignModel = {
  getDieline(): {
    lines: Lines[];
    arcs: Arcs[];
    dimensions: DimensionItem[];
  };
  getClipPath(): Boundary[];
  getExportAreas(): ExportArea[];
  getImageAreas(): ImageArea;
  getHoles(): Holes[];
  getShapes(): ShapeMap;
};