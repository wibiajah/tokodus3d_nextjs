import { useMemo } from "react";
import * as THREE from "three";
export const fluteWallOptions = {
  face: "Singleface",
  single: "Single Wall",
  double: "Double Wall",
  triple: "Triple Wall",
} as const;
export const flutePresets = {
  A: { key: "A", val: 4.8, multiplier: 0.16, la: 10, lb: 10, z: 2.4, ax: 0.25 },
  B: { key: "B", val: 3.2, multiplier: 0.25, la: 10, lb: 10, z: 6, ax: 0.25 },
  C: { key: "C", val: 4, multiplier: 0.2, la: 10, lb: 8, z: 6, ax: 0.25 },
  E: { key: "E", val: 1.6, multiplier: 0.5, la: 10, lb: 8, z: 11, ax: 0.27 },
  F: { key: "F", val: 0.8, multiplier: 1, la: 10, lb: 8, z: 17, ax: 0.75 },
} as const;
// nilai yang mempengaruhi a, aa, b, ab, c, ac
// adalah val, multiplier, z, ax, w
// perlu menentukan start dan end dari point
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
      flutePresets[fluteKey as keyof typeof flutePresets] ?? flutePresets.F;
    const wallBase =
      wallPresets[wall as keyof typeof wallPresets] ?? wallPresets.single;
    const ry = wallBase.ry * flute.multiplier;
    const rx = wallBase.rx * flute.multiplier;
    return {
      fw: wallBase.r,
      fwy: ry,
      fwx: rx,
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
// export function useFluteWallConfig(fluteKey: string, wall: string) {
//   return useMemo(() => {
//     const flute =
//       flutePresets[fluteKey as keyof typeof flutePresets] ?? flutePresets.F;
//     const wallBase =
//       wallPresets[wall as keyof typeof wallPresets] ?? wallPresets.single;
//     const ry = wallBase.ry * flute.multiplier;
//     const rx = wallBase.rx * flute.multiplier;
//     return {
//       fw: wallBase.r,
//       fwy:ry,
//       fwx:rx,
//       fwa: wallBase.points.a ?? 0,
//       fwb: wallBase.points.b ?? 0,
//       fwc: wallBase.points.c ?? 0,
//       aa: wallBase.points.aa ?? 0,
//       ab: wallBase.points.ab ?? 0,
//       ac: wallBase.points.ac ?? 0,
//       la: flute.la ?? 0,
//       lb: flute.lb ?? 0,
//       fwz: flute.z ?? 0,
//       ax: flute.ax ?? 0,
//     };
//   }, [fluteKey, wall]);
// }
// export function useFluteWallConfig(fluteKey: string, wall: string) {
//   return useMemo(() => {
//     const flute =
//       flutePresets[fluteKey as keyof typeof flutePresets] ?? flutePresets.F;
//     const wallBase =
//       wallPresets[wall as keyof typeof wallPresets] ?? wallPresets.single;

//     const h = 180; // tinggi canvas make3LinesTexture
//     const segment = h / flute.z;

//     // hitung posisi garis berbasis z
//     const a = segment * 0.3;
//     const aa = segment * 1;
//     const b = segment * 1.5;
//     const ab = segment * 2;
//     const c = segment * 2.5;
//     const ac = segment * 3;

//     // tentukan garis berdasarkan jenis wall
//     let points;
//     if (wallBase.r === 1) {
//       // single
//       points = { fwa: a, fwb: b, fwc: c, aa: 0, ab: 0, ac: 0 };
//     } else if (wallBase.r === 2) {
//       // double
//       points = { fwa: a, aa, fwb: b, ab: 0, fwc: 0, ac: 0 };
//     } else if (wallBase.r === 3) {
//       // triple
//       points = { fwa: a, aa, fwb: b, ab, fwc: c, ac };
//     } else {
//       // face
//       points = { fwa: a, fwb: b, c: 0, aa: 0, ab: 0, ac: 0, fwc: 0 };
//     }

//     const ry = wallBase.ry * flute.multiplier;
//     const rx = wallBase.rx * flute.multiplier;

//     return {
//       fw: wallBase.r,
//       fwy: ry,
//       fwx: rx,

//       ...points, // otomatis mengisi a, b, c, aa, ab, ac

//       la: flute.la,
//       lb: flute.lb,
//       fwz: flute.z,
//       ax: flute.ax,
//     };
//   }, [fluteKey, wall]);
// }

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

export function makeFluteTexture(fluteKey: string, wall: string) {
  const canvas = document.createElement("canvas");
  const flute =
    flutePresets[fluteKey as keyof typeof flutePresets] ?? flutePresets.F;
  const wallBase =
    wallPresets[wall as keyof typeof wallPresets] ?? wallPresets.single;
  const ry = wallBase.ry * flute.multiplier;
  const z = flute.z;
  const val = flute.val;
  const multiplier = flute.multiplier;
  const ax = flute.ax;
  const la = flute.la;
  const lb = flute.lb;
  const w = 50 * 2;
  const h = 60 * 3;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  // background karton
  ctx.fillStyle = "#3a2a17";
  ctx.fillRect(0, 0, w, h);
  //---------------------------------------------
  // ① MENGGAMBAR GELombang SINUS (inti flute)
  //---------------------------------------------
  ctx.strokeStyle = "#d4a46aff";
  ctx.lineWidth = 5;

  // const amplitude = val * multiplier * 4; // tinggi gelombang
  // const freq = z * 0.1; // frekuensi gelombang
  // const amplitude = 20; // tinggi gelombang
  // const freq = 20/w; // frekuensi gelombang

  // ctx.beginPath();
  // for (let x = 0; x < w; x++) {
  //   const px = (x / w) * (Math.PI * 2 * freq);
  //   const y = h * 0.5 + Math.sin(px + ax * Math.PI * 2) * amplitude;

  //   if (x === 0) ctx.moveTo(x, y);
  //   else ctx.lineTo(x, y);
  // }
  // ctx.stroke();

  // // Draw Fluting (The continuous wave) for 'wave' type
  // ctx.beginPath();
  // // for (let x = 0; x <= w; x++) {
  // for (let x = 0; x <= w; x += 0.1) {
  //   // Sine wave with phase shift
  //   const y = 30 + amplitude * Math.sin(x * freq + Math.PI * 2);
  //   if (x === 0) {
  //     ctx.moveTo(x, y);
  //   } else {
  //     ctx.lineTo(x, y);
  //   }
  // }
  // ctx.stroke();

  const amplitude = 25; // tinggi gelombang
  const wavelength = w; // panjang satu gelombang (dalam pixel)
  const freq = (Math.PI * 2) / wavelength; // frekuensi yang benar
  const centerY = 30; // posisi tengah vertikal

  ctx.lineCap = "round"; // membuat ujung garis membulat
  ctx.lineJoin = "round"; // membuat sudut sambungan membulat
  ctx.beginPath();
  // Gunakan step yang sangat kecil untuk hasil smooth
  for (let x = 0; x <= w; x += 0.25) {
    const y = centerY + amplitude * Math.sin(x * freq);
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
  ctx.beginPath();
  // Gunakan step yang sangat kecil untuk hasil smooth
  for (let x = 0; x <= w; x += 0.25) {
    const y2 = 90 + amplitude * Math.sin(x * freq * 1.25);
    if (x === 0) {
      ctx.moveTo(x, y2);
    } else {
      ctx.lineTo(x, y2);
    }
  }
  ctx.stroke();

  // --- FluTe Wave (Gelombang) -----------------------------------------
  // ctx.beginPath();

  // const cycles = z*10;                           // banyaknya gelombang
  // const freq = (Math.PI * 2 * cycles) / w;    // frekuensi ideal
  // const amplitude = val * multiplier * 0.5*10;   // tinggi gelombang
  // const baseline = 30;                        // posisi Y dasar gelombang
  // const phase = ax * Math.PI * 2;             // geser pola

  // for (let x = 0; x <= w; x++) {
  //   const y =
  //     baseline +
  //     amplitude * Math.sin(x * freq + phase);

  //   if (x === 0) ctx.moveTo(x, y);
  //   else ctx.lineTo(x, y);
  // }

  // ctx.lineWidth = 2;
  // ctx.strokeStyle = "#d4a46a";
  // ctx.stroke();

  ctx.lineWidth = la;
  // garis 1 (kiri)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.stroke();
  // garis 3 (kanan)
  ctx.beginPath();
  ctx.moveTo(0, 60);
  ctx.lineTo(w, 60);
  ctx.stroke();
  // garis 5 (kanan)
  ctx.beginPath();
  ctx.moveTo(0, 120);
  ctx.lineTo(w, 120);
  ctx.stroke();
  // garis 7 (kanan)
  ctx.beginPath();
  ctx.moveTo(0, 180);
  ctx.lineTo(w, 180);
  ctx.stroke();
  return new THREE.CanvasTexture(canvas);
}
