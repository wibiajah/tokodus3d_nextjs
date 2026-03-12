import { useMemo } from "react";
import * as THREE from "three";
export const fluteWallOptions = {//pilihan single sama double
  // face: "Singleface",
  single: "Single Wall",
  double: "Double Wall",//shipping saja yg bisa ini
  // triple: "Triple Wall",
} as const;// double wall jadi CB
export const flutePresets = {//A & F dihapus
  // A: { key: "A", val: 4.8, multiplier: 0.16, la: 10, lb: 10, z: 2.4, ax: 0.25 },
  B: { key: "B", val: 3.2, multiplier: 0.25, la: 10, lb: 10, z: 6, ax: 0.25 },
  C: { key: "C", val: 4, multiplier: 0.2, la: 10, lb: 8, z: 6, ax: 0.25 },
  E: { key: "E", val: 1.6, multiplier: 0.5, la: 10, lb: 8, z: 11, ax: 0.27 },
  CB: { key: "CB", val: 7.2, multiplier: 0.2, la: 10, lb: 8, z: 6, ax: 0.25 },
  // F: { key: "F", val: 0.8, multiplier: 1, la: 10, lb: 8, z: 17, ax: 0.75 },
} as const;
export const wallPresets = {
  single: {
    r: 1,
    ry: 10.6,
    rx: 42.5,
    points: { a: 49, aa: 57, b: 0, ab: 0, c: 0, ac: 0 },
  },
  double: {
    r: 2,
    ry: 8.8,
    rx: 32,
    points: { a: 45, aa: 53, b: 79, ab: 88, c: 0, ac: 0 },
  },
  triple: {
    r: 3,
    ry: 9,
    rx: 38,
    points: { a: 53, aa: 61, b: 91, ab: 104, c: 150, ac: 159 },
  },
  face: {
    r: 1,
    ry: 9,
    rx: 37,
    points: { a: 50, aa: 0, b: 0, ab: 0, c: 0, ac: 0 },
  },
} as const;
export function useFluteWallConfig(fluteKey: string, wall: string) {
  return useMemo(() => {
    const flute =
      flutePresets[fluteKey as keyof typeof flutePresets] ?? flutePresets.E;
    const wallBase =
      wallPresets[wall as keyof typeof wallPresets] ?? wallPresets.single;
    const ry = wallBase.ry * flute.multiplier;
    const rx = wallBase.rx * flute.multiplier;
    return {
      fw: wallBase.r,
      fwy:ry,
      fwx:rx,
      fwa: wallBase.points.a ?? 0,
      fwb: wallBase.points.b ?? 0,
      fwc: wallBase.points.c ?? 0,
      aa: wallBase.points.aa ?? 0,
      ab: wallBase.points.ab ?? 0,
      ac: wallBase.points.ac ?? 0,
      la: flute.la ?? 0,
      lb: flute.lb ?? 0,
      fwz: flute.z ?? 0,
      ax: flute.ax ?? 0,
    };
  }, [fluteKey, wall]);
}
export function make3LinesTexture(
  a: number,
  b: number,
  c: number,
  aa: number,
  ab: number,
  ac: number,
  la: number,
  lb: number
) {
  const canvas = document.createElement("canvas");
  const w = 50;
  const h = 60 * 3;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#3a2a17";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#d4a46aff";
  ctx.lineWidth = la;
  // garis 1 (kiri)
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.lineTo(w, 5);
  ctx.stroke();
  ctx.lineWidth = lb;
  // garis 2 (tengah)
  ctx.beginPath();
  ctx.moveTo(0, a);
  ctx.lineTo(w, a);
  ctx.stroke();
  // garis 3 (kanan)
  ctx.beginPath();
  ctx.moveTo(0, aa);
  ctx.lineTo(w, aa);
  ctx.stroke();
  // garis 4 (tengah)
  ctx.beginPath();
  ctx.moveTo(0, b);
  ctx.lineTo(w, b);
  ctx.stroke();
  // garis 5 (kanan)
  ctx.beginPath();
  ctx.moveTo(0, ab);
  ctx.lineTo(w, ab);
  ctx.stroke();
  // garis 6 (tengah)
  ctx.beginPath();
  ctx.moveTo(0, c);
  ctx.lineTo(w, c);
  ctx.stroke();
  ctx.lineWidth = la;
  // garis 7 (kanan)
  ctx.beginPath();
  ctx.moveTo(0, ac);
  ctx.lineTo(w, ac);
  ctx.stroke();
  return new THREE.CanvasTexture(canvas);
}