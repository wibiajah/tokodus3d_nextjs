import { createPoint, createPath, createArc, createCurvePoint } from "../utils";
import {
  BoxParams,
  Lines,
  Arcs,
  ExportArea,
  DesignModel,
  Point,
} from "@/models/types";

/**
 * Gable Box Model
 *
 * Struktur:
 *   - 4 panel body (front, back, left, right)
 *   - 2 panel gable top (miring, bertemu di puncak)
 *   - handle/lock di puncak (berlubang atau flat)
 *   - bottom glue flap (simpel)
 *   - 1 glue flap samping
 *
 * Proporsi gable: 40% dari total height
 *
 * Layout dieline (horizontal):
 *   [glue] | [left] | [front] | [right] | [back]
 *   Dengan gable flap di atas dan bottom flap di bawah tiap panel
 *
 * Parameter:
 *   L = length (panjang/depth box — dimensi front/back)
 *   W = width  (lebar box — dimensi left/right)
 *   H = height (total tinggi box, termasuk gable)
 *   D = depth  (ketebalan material)
 */

export type GableHandle = "hole" | "flat";

export function getGableProportion(h: number) {
  // gable top = 40% dari total height
  const gableH = h * 0.4;
  const bodyH  = h - gableH;
  return { gableH, bodyH };
}

export function getGlueWidth(w: number) {
  return Math.max(w * 0.15, 8); // min 8mm
}

export function getBottomFlap(w: number) {
  return Math.max(w * 0.5, 10); // half width, min 10mm
}

export default function createGableBoxModel(
  params: BoxParams,
  handle: GableHandle = "hole",
): DesignModel {
  const { size } = params;
  const L = size.length; // panjang (front/back panel width)
  const W = size.width;  // lebar (left/right panel width)
  const H = size.height; // total height
  const D = size.depth;  // material thickness

  const { gableH, bodyH } = getGableProportion(H);
  const glueW   = getGlueWidth(W);
  const bottomF = getBottomFlap(W); // tinggi bottom flap

  // handle dimensions
  const handleW  = L * 0.4;
  const handleH  = gableH * 0.35;
  const holeR    = handleH * 0.35;

  // ── X koordinat (horizontal, panel demi panel) ──
  // urutan: glue | left(W) | front(L) | right(W) | back(L)
  const x0 = 0;
  const x1 = x0 + glueW;    // lipat glue-left
  const x2 = x1 + W;        // lipat left-front
  const x3 = x2 + L;        // lipat front-right
  const x4 = x3 + W;        // lipat right-back
  const x5 = x4 + L;        // tepi kanan

  // ── Y koordinat (vertikal) ──
  // dari atas ke bawah: gable | body | bottom flap
  const y0 = 0;              // puncak gable
  const y1 = y0 + gableH;   // lipat gable-body
  const y2 = y1 + bodyH;    // lipat body-bottom
  const y3 = y2 + bottomF;  // tepi bawah

  // tengah horizontal tiap panel (untuk handle)
  const frontMidX  = x2 + L / 2;
  const backMidX   = x4 + L / 2;

  // ── arrays ──
  const lines: Lines[] = [];
  const arcs:  Arcs[]  = [];

  // ════════════════════════════════════════
  //  FOLD LINES — vertikal (panel boundaries)
  // ════════════════════════════════════════
  [x1, x2, x3, x4].forEach((xv) => {
    lines.push(createPath([createPoint(xv, y0), createPoint(xv, y3)], "fold"));
  });

  // ════════════════════════════════════════
  //  FOLD LINES — horizontal (gable & bottom)
  // ════════════════════════════════════════
  // lipat gable-body (y1)
  lines.push(createPath([createPoint(x0, y1), createPoint(x5, y1)], "fold"));
  // lipat body-bottom (y2)
  lines.push(createPath([createPoint(x0, y2), createPoint(x5, y2)], "fold"));

  // ════════════════════════════════════════
  //  GABLE TOP — diagonal fold lines
  //  Front & back panel: lipatan diagonal dari pojok bawah gable
  //  ke titik puncak tengah panel
  // ════════════════════════════════════════

  // Front panel diagonal folds
  lines.push(createPath([
    createPoint(x2,       y1),
    createPoint(frontMidX, y0),
  ], "fold"));
  lines.push(createPath([
    createPoint(x3,       y1),
    createPoint(frontMidX, y0),
  ], "fold"));

  // Back panel diagonal folds
  lines.push(createPath([
    createPoint(x4,      y1),
    createPoint(backMidX, y0),
  ], "fold"));
  lines.push(createPath([
    createPoint(x5,      y1),
    createPoint(backMidX, y0),
  ], "fold"));

  // Glue panel diagonal (mirror left panel)
  lines.push(createPath([
    createPoint(x0, y1),
    createPoint(x1 - glueW / 2 + glueW / 2, y0), // puncak glue panel
  ], "fold"));

  // Left panel diagonal folds
  const leftMidX = x1 + W / 2;
  lines.push(createPath([createPoint(x1, y1), createPoint(leftMidX, y0)], "fold"));
  lines.push(createPath([createPoint(x2, y1), createPoint(leftMidX, y0)], "fold"));

  // Right panel diagonal folds
  const rightMidX = x3 + W / 2;
  lines.push(createPath([createPoint(x3, y1), createPoint(rightMidX, y0)], "fold"));
  lines.push(createPath([createPoint(x4, y1), createPoint(rightMidX, y0)], "fold"));

  // ════════════════════════════════════════
  //  HANDLE CUTOUT (front & back panel)
  // ════════════════════════════════════════
  const handleY0 = y0 + gableH * 0.1;
  const handleY1 = handleY0 + handleH;

  if (handle === "hole") {
    // lubang oval di puncak front panel
    arcs.push({
      kind: "arc",
      x: frontMidX,
      y: handleY0 + handleH / 2,
      radius: holeR,
      angle: 360,
      rotation: 0,
      stroke: "#000",
      strokeWidth: 0.5,
    });
    arcs.push({
      kind: "arc",
      x: backMidX,
      y: handleY0 + handleH / 2,
      radius: holeR,
      angle: 360,
      rotation: 0,
      stroke: "#000",
      strokeWidth: 0.5,
    });
  } else {
    // flat lock: cut line horizontal di puncak
    lines.push(createPath([
      createPoint(frontMidX - handleW / 2, handleY1),
      createPoint(frontMidX + handleW / 2, handleY1),
    ], "cut"));
    lines.push(createPath([
      createPoint(backMidX - handleW / 2, handleY1),
      createPoint(backMidX + handleW / 2, handleY1),
    ], "cut"));
  }

  // ════════════════════════════════════════
  //  BOUNDARY (outer cut line)
  // ════════════════════════════════════════
  // outline keseluruhan dieline
  const boundary = [
    // mulai pojok kiri atas (puncak gable glue panel)
    createPoint(x0, y0),
    createPoint(x5, y0),
    createPoint(x5, y3),
    createPoint(x0, y3),
    createPoint(x0, y0),
  ];
  lines.push(createPath(boundary, "cut"));

  // ── getShapes ──
  function getShapes() {
    // Front panel (gable bagian atas + body + bottom flap)
    const frontGable = [
      createPoint(x2, y0),
      createPoint(x3, y0),
      createPoint(x3, y1),
      createPoint(x2, y1),
    ];
    const frontBody = [
      createPoint(x2, y1),
      createPoint(x3, y1),
      createPoint(x3, y2),
      createPoint(x2, y2),
    ];
    const frontBottom = [
      createPoint(x2, y2),
      createPoint(x3, y2),
      createPoint(x3, y3),
      createPoint(x2, y3),
    ];

    // Back panel
    const backGable = [
      createPoint(x4, y0),
      createPoint(x5, y0),
      createPoint(x5, y1),
      createPoint(x4, y1),
    ];
    const backBody = [
      createPoint(x4, y1),
      createPoint(x5, y1),
      createPoint(x5, y2),
      createPoint(x4, y2),
    ];
    const backBottom = [
      createPoint(x4, y2),
      createPoint(x5, y2),
      createPoint(x5, y3),
      createPoint(x4, y3),
    ];

    // Left panel
    const leftGable = [
      createPoint(x1, y0),
      createPoint(x2, y0),
      createPoint(x2, y1),
      createPoint(x1, y1),
    ];
    const leftBody = [
      createPoint(x1, y1),
      createPoint(x2, y1),
      createPoint(x2, y2),
      createPoint(x1, y2),
    ];

    // Right panel
    const rightGable = [
      createPoint(x3, y0),
      createPoint(x4, y0),
      createPoint(x4, y1),
      createPoint(x3, y1),
    ];
    const rightBody = [
      createPoint(x3, y1),
      createPoint(x4, y1),
      createPoint(x4, y2),
      createPoint(x3, y2),
    ];

    // Glue flap
    const gluePanel = [
      createPoint(x0, y0),
      createPoint(x1, y0),
      createPoint(x1, y2),
      createPoint(x0, y2),
    ];

    return {
      front_gable:  frontGable,
      front:        frontBody,
      front_bottom: frontBottom,
      back_gable:   backGable,
      back:         backBody,
      back_bottom:  backBottom,
      left_gable:   leftGable,
      left:         leftBody,
      right_gable:  rightGable,
      right:        rightBody,
      glue:         gluePanel,
    };
  }

  function getDieline() {
    return {
      lines,
      arcs,
      dimensions: [
        {
          label: "Panjang",
          value: L,
          length: L,
          x: x2,
          y: y1 + bodyH * 0.5,
          u: L * 0.3,
          v: 0,
          ru: L * 0.7,
          rv: 0,
        },
        {
          label: "Lebar",
          value: W,
          length: W,
          x: x1,
          y: y1 + bodyH * 0.5,
          u: W * 0.3,
          v: 0,
          ru: W * 0.7,
          rv: 0,
        },
        {
          label: "Tinggi",
          value: H,
          length: H,
          x: x3 + W * 0.5,
          y: y0,
          u: 0,
          v: H * 0.4,
          ru: 0,
          rv: H * 0.6,
          vertical: true,
        },
      ],
    };
  }

  function getClipPath() {
    return [
      createPoint(x0, y0),
      createPoint(x5, y0),
      createPoint(x5, y3),
      createPoint(x0, y3),
    ];
  }

  function getExportAreas(): ExportArea[] {
    const shapes = getShapes();
    function calcBounds(points: Point[]) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      points.forEach((p) => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      });
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    return Object.entries(shapes).map(([id, pts]) => ({
      id,
      ...calcBounds(pts),
    }));
  }

  function getImageAreas() {
    return {
      x: x0,
      y: y0,
      width: x5,
      height: y3,
    };
  }

  function getHoles() {
    return [] as Lines[];
  }

  return {
    getDieline,
    getClipPath,
    getExportAreas,
    getImageAreas,
    getHoles,
    getShapes,
  };
}