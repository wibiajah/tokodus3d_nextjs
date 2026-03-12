import { getEbyF, getFbyH } from "@/models/mailer/model";
import * as THREE from "three";
/**
 * Membuat geometri hinge(engsel) berbentuk semi silinder(bagian luar)
 * @param r radius silinder
 * @param length panjang silinder
 * @param rad bentuk arc dalam radian, default 90° = Math.PI / 2
 * @param segments jumlah segmen untuk membuat lingkaran
 */
export function hingeGeometry(
  r: number,
  length: number,
  rad = Math.PI / 2,
  segments = 6,
) {
  const geom = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * rad; // 90°
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    // dua titik: start dan end sepanjang length
    vertices.push(x, y, 0);
    vertices.push(x, y, length);
    const u = i / segments;
    uvs.push(u, 0);
    uvs.push(u, 1);
  }
  // buat triangles
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, b, d); // triangle 1
    indices.push(a, d, c); // triangle 2
  }
  geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}
export function MiddleFlap(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(r, 0);
  shape.lineTo(w - r, 0);
  shape.absarc(w, 0, r, Math.PI, (Math.PI * 3) / 2, false);
  shape.lineTo(w, -h + r);
  shape.absarc(w, -h, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(w - r, -h);
  shape.lineTo(r, -h);
  shape.absarc(0, -h, r, 0, Math.PI / 2, false);
  shape.lineTo(0, -r);
  shape.absarc(0, 0, r, (Math.PI * 3) / 2, Math.PI * 2, false);
  shape.lineTo(r, 0);
  return shape;
}
export function MiddleFlapV2(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, -r);
  shape.lineTo(w, -r);
  shape.lineTo(w, -h + r);
  shape.lineTo(0, -h + r);
  shape.lineTo(0, -r);
  return shape;
}
export function Flap(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(r, 0);
  shape.lineTo(w - r, 0);
  shape.lineTo(w - r, -h);
  shape.lineTo(r, -h);
  shape.lineTo(r, 0);
  return shape;
}
export function FlapWithUCrop(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(r, 0);
  shape.lineTo(w - r, 0);
  shape.absarc(w, -h, r, Math.PI * 3, (Math.PI * 3) / 2, false);
  shape.lineTo(w, -h - r);
  shape.lineTo(0, -h - r);
  shape.absarc(0, -h, r, (Math.PI * 3) / 2, 0, false);
  shape.lineTo(r, 0);
  return shape;
}
export function FlapWithUCropR(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(w, 0);
  shape.absarc(w, -r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(w - r, -h - r);
  shape.lineTo(r, -h - r);
  shape.absarc(0, -r, r, 0, Math.PI / 2, false);
  shape.lineTo(0, 0);
  return shape;
}
export function FixedFlap(fx: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, -r * 3);
  shape.lineTo(fx, 0);
  shape.lineTo(fx, -h + 2 * r);
  shape.lineTo(0, -h + 5 * r);
  shape.lineTo(0, -r * 3);
  return shape;
}
export function FixedFlapR(fx: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, -r);
  shape.lineTo(fx, -r * 3);
  shape.lineTo(fx, -h + r * 3);
  shape.lineTo(0, -h + r);
  shape.lineTo(0, -r);
  return shape;
}
// ===================> shopping bag flap shapes
/**
 * Membuat THREE.Shape() persegi panjang dengan 2 lubang bulat
 *
 * contoh: const shape = rectWith2Holes(w, h, n, m, 0.025);
 * @param w panjang x
 * @param h panjang y
 * @param n jarak antar lubang
 * @param m jarak dari y=0 ke posisi lubang
 * @param r radius lubang
 */
export function rectWith2Holes(
  w: number,
  h: number,
  n: number,
  m: number,
  r: number,
): THREE.Shape {
  const shape = rect(w, h);
  const hole1 = new THREE.Path();
  const hole2 = new THREE.Path();
  const holeRadius = r;
  const holeCenterX = w / 2;
  const holeCenterY = -m;
  const hn = n / 2;
  hole1.absarc(
    holeCenterX - hn,
    holeCenterY,
    holeRadius,
    0,
    Math.PI * 2,
    false,
  );
  hole2.absarc(
    holeCenterX + hn,
    holeCenterY,
    holeRadius,
    0,
    Math.PI * 2,
    false,
  );
  shape.holes.push(hole1);
  shape.holes.push(hole2);
  return shape;
}
/**
 * Membuat THREE.Shape() persegi panjang
 * @param w panjang x
 * @param h panjang y
 */
export function rect(w: number, h: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(w, 0);
  shape.lineTo(w, -h);
  shape.lineTo(0, -h);
  shape.lineTo(0, 0);
  return shape;
}
/**
 * Membuat THREE.Shape() trapesium, optional 1 lubang
 *
 * contoh: const shape = trapezoid(w, h, t, y);
 * @param w panjang x
 * @param h panjang y
 * @param t minus panjang y
 * @param y 1 = atas, 0 = bawah
 */
export function trapezoid(
  w: number,
  h: number,
  t: number,
  y: number,
): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, y ? -t : 0);
  shape.lineTo(w, 0);
  shape.lineTo(w, -h);
  shape.lineTo(0, y ? -h : -h + t);
  shape.lineTo(0, y ? -t : 0);
  return shape;
}
export function isoscelesTrz(w: number, h: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(w, 0);
  shape.lineTo(w - h, -h);
  shape.lineTo(h, -h);
  shape.lineTo(0, 0);
  return shape;
}
export function triangle(w: number, h: number, y: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0); // kiri bawah
  shape.lineTo(w, 0); // kanan bawah
  shape.lineTo(w / 2, y ? h : -h); // puncak segitiga
  shape.lineTo(0, 0); // tutup shape
  return shape;
}
export function fixedMailer(f: number, h: number, t: number): THREE.Shape {
  const e = getEbyF(f);
  const ht = t / 2;
  const shape = new THREE.Shape();
  shape.moveTo(0, -e);
  shape.lineTo(f - ht, 0);
  shape.lineTo(f, -t);
  shape.lineTo(f, -h + t);
  shape.lineTo(f - ht, -h);
  shape.moveTo(0, -h + e);
  shape.lineTo(0, -e);
  // const nh = h + t;
  // shape.moveTo(0, -e);
  // shape.lineTo(f - ht, 0);
  // shape.lineTo(f, -t);
  // shape.lineTo(f, -nh + t);
  // shape.lineTo(f - ht, -nh);
  // shape.moveTo(0, -nh + e);
  // shape.lineTo(0, -e);
  return shape;
}
export function quarterRoundTMailer(w: number, h: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(h, 0);
  shape.lineTo(w, 0);
  shape.lineTo(w, -h);
  shape.lineTo(0, -h);
  shape.absarc(h, -h, h, Math.PI, Math.PI / 2, true);
  shape.lineTo(h, 0);
  return shape;
}
export function quarterRoundBMailer(w: number, h: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(w, 0);
  shape.lineTo(w, -h);
  shape.lineTo(h, -h);
  shape.absarc(h, 0, h, -Math.PI / 2, Math.PI, true);
  shape.lineTo(0, 0);
  return shape;
}
export function frontMailer(w: number, h: number, t: number): THREE.Shape {
  const qd = t / 4;
  const shape = new THREE.Shape();
  shape.moveTo(0, -qd);
  shape.lineTo(w - qd, -qd);
  shape.lineTo(w, 0);
  shape.lineTo(w, -h);
  shape.lineTo(w - qd, -h + qd);
  shape.lineTo(0, -h + qd);
  shape.lineTo(0, -qd);
  return shape;
}
export function backMailer(w: number, h: number, t: number): THREE.Shape {
  const n = h < 1.2 ? 1 : h < 3.5 ? 2 : 3;
  const tqd = (3 * t) / 4;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(w, 0);
  if (n === 1) {
    shape.lineTo(w, -h / 3);
    shape.lineTo(w - tqd, -h / 3);
    shape.lineTo(w - tqd, (-h * 2) / 3);
    shape.lineTo(w, (-h * 2) / 3);
  } else if (n === 2) {
    shape.lineTo(w, -h / 5);
    shape.lineTo(w - tqd, -h / 5);
    shape.lineTo(w - tqd, (-h * 2) / 5);
    shape.lineTo(w, (-h * 2) / 5);
    shape.lineTo(w, (-h * 3) / 5);
    shape.lineTo(w - tqd, (-h * 3) / 5);
    shape.lineTo(w - tqd, (-h * 4) / 5);
    shape.lineTo(w, (-h * 4) / 5);
  } else {
    shape.lineTo(w, -h / 7);
    shape.lineTo(w - tqd, -h / 7);
    shape.lineTo(w - tqd, (-h * 2) / 7);
    shape.lineTo(w, (-h * 2) / 7);
    shape.lineTo(w, (-h * 3) / 7);
    shape.lineTo(w - tqd, (-h * 3) / 7);
    shape.lineTo(w - tqd, (-h * 4) / 7);
    shape.lineTo(w, (-h * 4) / 7);
    shape.lineTo(w, (-h * 5) / 7);
    shape.lineTo(w - tqd, (-h * 5) / 7);
    shape.lineTo(w - tqd, (-h * 6) / 7);
    shape.lineTo(w, (-h * 6) / 7);
  }
  shape.lineTo(w, -h);
  shape.lineTo(0, -h);
  shape.lineTo(0, 0);
  return shape;
}
export function extraFMailer(w: number, h: number): THREE.Shape {
  const f = getFbyH(w, true);
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(w, 0);
  shape.absarc(w, -h / 2, f / 2, Math.PI / 2, -Math.PI / 2);
  shape.lineTo(w, -h);
  shape.lineTo(0, -h);
  shape.lineTo(0, 0);
  return shape;
}
export function bridgeTMailer(w: number, h: number, t: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(w, -t / 2);
  shape.lineTo(w, -h);
  shape.lineTo(0, -h);
  shape.lineTo(0, 0);
  return shape;
}
export function bridgeBMailer(w: number, h: number, t: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(w, 0);
  shape.lineTo(w, -h + t / 2);
  shape.lineTo(0, -h);
  shape.lineTo(0, 0);
  return shape;
}
export function extraSMailer(w: number, h: number, t: number): THREE.Shape {
  const n = h < 1.2 ? 1 : h < 3.5 ? 2 : 3;
  const tqd = (3 * t) / 4;
  const qd = t / 4;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(w, 0);
  if (n === 1) {
    shape.lineTo(w, -h / 3);
    shape.lineTo(w + tqd, -h / 3 - qd);
    shape.lineTo(w + tqd, (-h * 2) / 3 + qd);
    shape.lineTo(w, (-h * 2) / 3);
  } else if (n === 2) {
    shape.lineTo(w, -h / 5);
    shape.lineTo(w + tqd, -h / 5 - qd);
    shape.lineTo(w + tqd, (-h * 2) / 5 + qd);
    shape.lineTo(w, (-h * 2) / 5);
    shape.lineTo(w, (-h * 3) / 5);
    shape.lineTo(w + tqd, (-h * 3) / 5 - qd);
    shape.lineTo(w + tqd, (-h * 4) / 5 + qd);
    shape.lineTo(w, (-h * 4) / 5);
  } else {
    shape.lineTo(w, -h / 7);
    shape.lineTo(w + tqd, -h / 7 - qd);
    shape.lineTo(w + tqd, (-h * 2) / 7 + qd);
    shape.lineTo(w, (-h * 2) / 7);
    shape.lineTo(w, (-h * 3) / 7);
    shape.lineTo(w + tqd, (-h * 3) / 7 - qd);
    shape.lineTo(w + tqd, (-h * 4) / 7 + qd);
    shape.lineTo(w, (-h * 4) / 7);
    shape.lineTo(w, (-h * 5) / 7);
    shape.lineTo(w + tqd, (-h * 5) / 7 - qd);
    shape.lineTo(w + tqd, (-h * 6) / 7 + qd);
    shape.lineTo(w, (-h * 6) / 7);
  }
  shape.lineTo(w, -h);
  shape.lineTo(0, -h);
  shape.lineTo(0, 0);
  return shape;
}
