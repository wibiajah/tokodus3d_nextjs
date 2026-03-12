import { createPoint, createPath, createArc } from "../utils";
import {
  BoxParams,
  Lines,
  Arcs,
  ExportArea,
  DesignModel,
} from "@/models/types";
const rules = [
  { max: 20, fixed: 10 },
  { max: 60, fixed: 15 },
  { max: 90, fixed: 20 },
  { max: 120, fixed: 25 },
];
export function getFixedByWidth(w: number, three: boolean = false): number {
  const nw = three ? w * 100 : w;
  for (const r of rules) {
    if (nw <= r.max) return three ? r.fixed / 100 : r.fixed;
  }
  return three
    ? rules[rules.length - 1].fixed / 100
    : rules[rules.length - 1].fixed;
}
export function getBetweenByLength(
  length: number,
  three: boolean = false,
): number {
  const nl = three ? length * 100 : length;
  if (nl >= 300) return three ? 1.5 : 150;
  return three ? nl / 200 : Math.round(nl / 2);
}
export default function createShoeBoxModel(params: BoxParams): DesignModel {
  const { size, flute = "F" } = params;
  // console.log("Creating box model with params:", params);
  const sizeScale = 1;
  const length = size.length * sizeScale;
  const width = size.width * sizeScale;
  const height = size.height * sizeScale;
  const depth = size.depth * sizeScale;
  const fixed = getFixedByWidth(width);
  const b = getBetweenByLength(length);
  const hb = b * 0.5;
  const r = 2.5;
  const top = 40; // mm
  const htop = top * 0.5;
  const startX = 0;
  const startY = 0;
  const hw = width * 0.5;
  const qw = hw * 0.5;
  const hl = length * 0.5;
  const lw = length + width;
  const dd = depth * 2;
  // x
  const xd = startX + depth;
  const xdf = xd + fixed;
  const xf = startX + fixed;
  const xdfhlmhb = xdf + hl - hb;
  const xdfhlhb = xdf + hl + hb;
  const xdflwhlmhb = xdfhlmhb + lw;
  const xdflwhlhb = xdfhlhb + lw;
  const xdfl = xdf + length;
  const xdlmhw = xd + length - hw;
  const xdflhw = xdfl + hw;
  const xdhw2f = xdf + hw + fixed;
  const xdflw = xdflhw + hw;
  const xdlwhw2f = xdflw + fixed + hw;
  const xdfw2l = xdflw + length;
  const xdw2lmhw = xdfw2l - fixed - hw;
  const xdfwhw2l = xdfw2l + hw;
  const xdf2lw = xdfwhw2l + hw;
  const xddf2lw = xdf2lw + depth;
  // y
  const yd = startY + depth;
  const ydd = yd + depth;
  const ydhtop = yd + htop;
  const ydtophtop = ydhtop + top;
  const ytop = startY + top;
  const ydtop = yd + top;
  const yttop = ytop + height;
  const ydttop = ydtop + height;
  const ydttopmhw = ydttop - hw;
  const ydttopmf = ydttop - fixed;
  const yttophwf = yttop + hw + fixed;
  const ydttophwf = yttophwf + depth;
  const yddttophwf = ydttophwf + depth;

  const lines: Lines[] = [];
  const arcs: Arcs[] = [];
  const fixedTopLines: Lines[] = [];
  const fixedLines: Lines[] = [];
  const fixedBottomLines: Lines[] = [];
  const backTopLines: Lines[] = [];
  const backLines: Lines[] = [];
  const backBottomLines: Lines[] = [];
  const rightTopFLines: Lines[] = []; // F dan S dalam animasi itu apa 1 sisi flaps ? ? jadikan 1 tanpa dipisah F atau S
  const rightFLines: Lines[] = []; // jadi 1 tapi bagian yg bawah dan atas memiliki animasi sendiri! -> sebaiknya dipisah
  const rightBottomFLines: Lines[] = []; // tapi sisi kanan dan kiri yang setengah itu apa melakukan gerakan animasi yang sama?
  const rightTopSLines: Lines[] = []; // jadikan 1 saja(top, center, bottom)
  const rightSLines: Lines[] = [];
  const rightBottomSLines: Lines[] = [];
  const frontTopLines: Lines[] = [];
  const frontLines: Lines[] = [];
  const frontBottomLines: Lines[] = [];
  const leftTopFLines: Lines[] = [];
  const leftFLines: Lines[] = [];
  const leftBottomFLines: Lines[] = [];
  const leftTopSLines: Lines[] = [];
  const leftSLines: Lines[] = [];
  const leftBottomSLines: Lines[] = [];
  const redLines: Lines[] = [];
  const backArcs: Arcs[] = [];
  const frontArcs: Arcs[] = [];
  const boundary = [
    createPoint(startX, yd), //top left
    createPoint(xf, startY),
    createPoint(xddf2lw, startY), //top right
    createPoint(xddf2lw, yddttophwf), //bottom right
    createPoint(xf, yddttophwf), //bottom left
    createPoint(startX, ydttophwf),
    createPoint(startX, yd),
  ];
  const fixedTopLinesCut = [
    createPoint(xd, ydtop),
    createPoint(xd, ydd),
    createPoint(xdf, yd),
  ];
  const fixedTopLinesFold = [
    createPoint(xdf, yd),
    createPoint(xdf, ydtop),
    createPoint(xd, ydtop),
  ];
  fixedTopLines.push(createPath(fixedTopLinesCut, "cut"));
  fixedTopLines.push(createPath(fixedTopLinesFold, "fold"));
  const fixedLinesCut = [createPoint(xd, ydtop), createPoint(xd, ydttop)];
  const fixedLinesFold1 = [createPoint(xdf, ydtop), createPoint(xdf, ydttop)];
  const fixedLinesFold2 = [createPoint(xd, ydtop), createPoint(xdf, ydtop)];
  const fixedLinesFold3 = [createPoint(xdf, ydttop), createPoint(xd, ydttop)];
  fixedLines.push(createPath(fixedLinesCut, "cut"));
  fixedLines.push(createPath(fixedLinesFold1, "fold"));
  fixedLines.push(createPath(fixedLinesFold2));
  fixedLines.push(createPath(fixedLinesFold3));
  const fixedBottomLinesCut = [
    createPoint(xd, ydttop),
    createPoint(xd, yttophwf),
    createPoint(xdf, ydttophwf),
  ];
  const fixedBottomLinesFold = [
    createPoint(xd, ydttop),
    createPoint(xdf, ydttop),
    createPoint(xdf, ydttophwf),
  ];
  fixedBottomLines.push(createPath(fixedBottomLinesCut, "cut"));
  fixedBottomLines.push(createPath(fixedBottomLinesFold, "fold"));
  const backTopLinesCut = [createPoint(xdf, yd), createPoint(xdfl, yd)];
  const backTopLinesFold1 = [
    createPoint(xdfl, yd),
    createPoint(xdfl, ydtop),
    createPoint(xdf, ydtop),
  ];
  const backTopLinesFold2 = [
    createPoint(xdfl, yd),
    createPoint(xdfl, ydtop),
    createPoint(xdf, ydtop),
  ];
  backTopLines.push(createPath(backTopLinesCut, "cut"));
  backTopLines.push(createPath(backTopLinesFold1, "fold"));
  backTopLines.push(createPath(backTopLinesFold2));
  const backLinesFold1 = [
    createPoint(xdfl, ydtop),
    createPoint(xdfl, ydttop),
    createPoint(xdf, ydttop),
  ];
  const backLinesFold2 = [
    createPoint(xdfl, ydtop),
    createPoint(xdf, ydttop),
    createPoint(xdf, ydtop),
  ];
  backLines.push(createPath(backLinesFold1, "fold"));
  backLines.push(createPath(backLinesFold2));
  const backBottomLinesCut = [
    createPoint(xdf, ydttophwf),
    createPoint(xdfl, ydttophwf),
  ];
  const backBottomLinesFold1 = [
    createPoint(xdfl, ydttop),
    createPoint(xdfl, ydttophwf),
  ];
  const backBottomLinesFold2 = [
    createPoint(xdf, ydttophwf),
    createPoint(xdf, ydttop),
  ];
  backBottomLines.push(createPath(backBottomLinesCut, "cut"));
  backBottomLines.push(createPath(backBottomLinesFold1, "fold"));
  backBottomLines.push(createPath(backBottomLinesFold2));
  const backArcsCut = [
    {
      x: xdfhlmhb,
      y: ydhtop,
      radius: r,
      angle: 360,
      rotation: 0,
    },
    {
      x: xdfhlhb,
      y: ydhtop,
      radius: r,
      angle: 360,
      rotation: 0,
    },
    {
      x: xdfhlmhb,
      y: ydtophtop,
      radius: r,
      angle: 360,
      rotation: 0,
    },
    {
      x: xdfhlhb,
      y: ydtophtop,
      radius: r,
      angle: 360,
      rotation: 0,
    },
  ];
  backArcsCut.forEach((a) => backArcs.push(createArc(a, "cut")));
  const rightTopFLinesCut = [createPoint(xdfl, yd), createPoint(xdflhw, yd)];
  const rightTopFLinesFold1 = [
    createPoint(xdflhw, yd),
    createPoint(xdflhw, ydtop),
    createPoint(xdfl, ydtop),
  ];
  const rightTopFLinesFold2 = [createPoint(xdfl, ydtop), createPoint(xdfl, yd)];
  rightTopFLines.push(createPath(rightTopFLinesCut, "cut"));
  rightTopFLines.push(createPath(rightTopFLinesFold1, "fold"));
  rightTopFLines.push(createPath(rightTopFLinesFold2));
  const rightFLinesFold1 = [
    createPoint(xdflhw, ydtop),
    createPoint(xdflhw, ydttop),
    createPoint(xdfl, ydttop),
  ];
  const rightFLinesFold2 = [
    createPoint(xdfl, ydttop),
    createPoint(xdfl, ydtop),
  ];
  rightFLines.push(createPath(rightFLinesFold1, "fold"));
  rightFLines.push(createPath(rightFLinesFold2));
  const rightBottomFLinesCut = [
    createPoint(xdfl, ydttophwf),
    createPoint(xdflhw, ydttophwf),
  ];
  const rightBottomFLinesFold1 = [
    createPoint(xdflhw, ydttop),
    createPoint(xdflhw, ydttophwf),
  ];
  const rightBottomFLinesFold2 = [
    createPoint(xdfl, ydttop),
    createPoint(xdfl, ydttophwf),
  ];
  rightBottomFLines.push(createPath(rightBottomFLinesCut, "cut"));
  rightBottomFLines.push(createPath(rightBottomFLinesFold1, "fold"));
  rightBottomFLines.push(createPath(rightBottomFLinesFold2));
  const rightTopSLinesCut = [createPoint(xdflhw, yd), createPoint(xdflw, yd)];
  const rightTopSLinesFold1 = [
    createPoint(xdflw, yd),
    createPoint(xdflw, ydtop),
    createPoint(xdflhw, ydtop),
  ];
  const rightTopSLinesFold2 = [
    createPoint(xdflhw, ydtop),
    createPoint(xdflhw, yd),
  ];
  rightTopSLines.push(createPath(rightTopSLinesCut, "cut"));
  rightTopSLines.push(createPath(rightTopSLinesFold1, "fold"));
  rightTopSLines.push(createPath(rightTopSLinesFold2));
  const rightSLinesFold1 = [
    createPoint(xdflw, ydtop),
    createPoint(xdflw, ydttop),
    createPoint(xdflhw, ydttop),
  ];
  const rightSLinesFold2 = [
    createPoint(xdflhw, ydttop),
    createPoint(xdflhw, ydtop),
  ];
  rightSLines.push(createPath(rightSLinesFold1, "fold"));
  rightSLines.push(createPath(rightSLinesFold2));
  const rightBottomSLinesCut = [
    createPoint(xdflhw, ydttophwf),
    createPoint(xdflw, ydttophwf),
  ];
  const rightBottomSLinesFold1 = [
    createPoint(xdflw, ydttop),
    createPoint(xdflw, ydttophwf),
  ];
  const rightBottomSLinesFold2 = [
    createPoint(xdflhw, ydttop),
    createPoint(xdflhw, ydttophwf),
  ];
  rightBottomSLines.push(createPath(rightBottomSLinesCut, "cut"));
  rightBottomSLines.push(createPath(rightBottomSLinesFold1, "fold"));
  rightBottomSLines.push(createPath(rightBottomSLinesFold2));
  const frontTopLinesCut = [createPoint(xdflw, yd), createPoint(xdfw2l, yd)];
  const frontTopLinesFold1 = [
    createPoint(xdfw2l, yd),
    createPoint(xdfw2l, ydtop),
    createPoint(xdflw, ydtop),
  ];
  const frontTopLinesFold2 = [
    createPoint(xdflw, ydtop),
    createPoint(xdflw, yd),
  ];
  frontTopLines.push(createPath(frontTopLinesCut, "cut"));
  frontTopLines.push(createPath(frontTopLinesFold1, "fold"));
  frontTopLines.push(createPath(frontTopLinesFold2));
  const frontLinesFold1 = [
    createPoint(xdfw2l, ydtop),
    createPoint(xdfw2l, ydttop),
    createPoint(xdflw, ydttop),
  ];
  const frontLinesFold2 = [
    createPoint(xdflw, ydttop),
    createPoint(xdflw, ydtop),
  ];
  frontLines.push(createPath(frontLinesFold1, "fold"));
  frontLines.push(createPath(frontLinesFold2));
  const frontBottomLinesCut = [
    createPoint(xdflw, ydttophwf),
    createPoint(xdfw2l, ydttophwf),
  ];
  const frontBottomLinesFold1 = [
    createPoint(xdfw2l, ydttop),
    createPoint(xdfw2l, ydttophwf),
  ];
  const frontBottomLinesFold2 = [
    createPoint(xdflw, ydttophwf),
    createPoint(xdflw, ydttop),
  ];
  frontBottomLines.push(createPath(frontBottomLinesCut, "cut"));
  frontBottomLines.push(createPath(frontBottomLinesFold1, "fold"));
  frontBottomLines.push(createPath(frontBottomLinesFold2));
  const frontArcsCut = [
    {
      x: xdflwhlmhb,
      y: ydhtop,
      radius: r,
      angle: 360,
      rotation: 0,
    },
    {
      x: xdflwhlhb,
      y: ydhtop,
      radius: r,
      angle: 360,
      rotation: 0,
    },
    {
      x: xdflwhlmhb,
      y: ydtophtop,
      radius: r,
      angle: 360,
      rotation: 0,
    },
    {
      x: xdflwhlhb,
      y: ydtophtop,
      radius: r,
      angle: 360,
      rotation: 0,
    },
  ];
  frontArcsCut.forEach((a) => frontArcs.push(createArc(a, "cut")));
  const leftTopFLinesCut = [createPoint(xdfw2l, yd), createPoint(xdfwhw2l, yd)];
  const leftTopFLinesFold1 = [
    createPoint(xdfwhw2l, yd),
    createPoint(xdfwhw2l, ydtop),
    createPoint(xdfw2l, ydtop),
  ];
  const leftTopFLinesFold2 = [
    createPoint(xdfw2l, ydtop),
    createPoint(xdfw2l, yd),
  ];
  leftTopFLines.push(createPath(leftTopFLinesCut, "cut"));
  leftTopFLines.push(createPath(leftTopFLinesFold1, "fold"));
  leftTopFLines.push(createPath(leftTopFLinesFold2));
  const leftFLinesFold1 = [
    createPoint(xdfwhw2l, ydtop),
    createPoint(xdfwhw2l, ydttop),
    createPoint(xdfw2l, ydttop),
  ];
  const leftFLinesFold2 = [
    createPoint(xdfw2l, ydttop),
    createPoint(xdfw2l, ydtop),
  ];
  leftFLines.push(createPath(leftFLinesFold1, "fold"));
  leftFLines.push(createPath(leftFLinesFold2));
  const leftBottomFLinesCut = [
    createPoint(xdfw2l, ydttophwf),
    createPoint(xdfwhw2l, ydttophwf),
  ];
  const leftBottomFLinesFold1 = [
    createPoint(xdfwhw2l, ydttop),
    createPoint(xdfwhw2l, ydttophwf),
  ];
  const leftBottomFLinesFold2 = [
    createPoint(xdfw2l, ydttop),
    createPoint(xdfw2l, ydttophwf),
  ];
  leftBottomFLines.push(createPath(leftBottomFLinesCut, "cut"));
  leftBottomFLines.push(createPath(leftBottomFLinesFold1, "fold"));
  leftBottomFLines.push(createPath(leftBottomFLinesFold2));
  const leftTopSLinesCut = [
    createPoint(xdfwhw2l, yd),
    createPoint(xdf2lw, yd),
    createPoint(xdf2lw, ydtop),
  ];
  const leftTopSLinesFold1 = [
    createPoint(xdf2lw, ydtop),
    createPoint(xdfwhw2l, ydtop),
  ];
  const leftTopSLinesFold2 = [
    createPoint(xdfwhw2l, ydtop),
    createPoint(xdfwhw2l, yd),
  ];
  leftTopSLines.push(createPath(leftTopSLinesCut, "cut"));
  leftTopSLines.push(createPath(leftTopSLinesFold1, "fold"));
  leftTopSLines.push(createPath(leftTopSLinesFold2));
  const leftSLinesCut = [
    createPoint(xdf2lw, ydtop),
    createPoint(xdf2lw, ydttop),
  ];
  const leftSLinesFold1 = [
    createPoint(xdf2lw, ydttop),
    createPoint(xdfwhw2l, ydttop),
  ];
  const leftSLinesFold2 = [
    createPoint(xdfwhw2l, ydttop),
    createPoint(xdfwhw2l, ydtop),
  ];
  leftSLines.push(createPath(leftSLinesCut, "cut"));
  leftSLines.push(createPath(leftSLinesFold1, "fold"));
  leftSLines.push(createPath(leftSLinesFold2));
  const leftBottomSLinesCut = [
    createPoint(xdf2lw, ydttop),
    createPoint(xdf2lw, ydttophwf),
    createPoint(xdfwhw2l, ydttophwf),
  ];
  const leftBottomSLinesFold2 = [
    createPoint(xdfwhw2l, ydttophwf),
    createPoint(xdfwhw2l, ydttophwf),
  ];
  leftBottomSLines.push(createPath(leftBottomSLinesCut, "cut"));
  leftBottomSLines.push(createPath(leftBottomSLinesFold2));
  const redlines1 = [
    createPoint(xd, ydttopmf),
    createPoint(xdhw2f, ydttophwf),
  ];
  redLines.push(createPath(redlines1, "fold", 0.5, "red"));
  const redlines2 = [createPoint(xdlmhw, ydttophwf), createPoint(xdflhw, ydttopmhw)];
  redLines.push(createPath(redlines2, "fold", 0.5, "red"));
  const redlines3 = [
    createPoint(xdflhw, ydttopmhw),
    createPoint(xdlwhw2f, ydttophwf),
  ];
  redLines.push(createPath(redlines3, "fold", 0.5, "red"));
  const redlines4 = [
    createPoint(xdw2lmhw, ydttophwf),
    createPoint(xdfwhw2l, ydttopmhw),
  ];
  redLines.push(createPath(redlines4, "fold", 0.5, "red"));
  const redlines5 = [createPoint(xdfwhw2l, ydttopmhw), createPoint(xdf2lw, ydttop)];
  redLines.push(createPath(redlines5, "fold", 0.5, "red"));

  function getDieline() {
    lines.push(...fixedTopLines);
    lines.push(...fixedLines);
    lines.push(...fixedBottomLines);
    lines.push(...backTopLines);
    lines.push(...backLines);
    lines.push(...backBottomLines);
    lines.push(...rightTopFLines);
    lines.push(...rightFLines);
    lines.push(...rightBottomFLines);
    lines.push(...rightTopSLines);
    lines.push(...rightSLines);
    lines.push(...rightBottomSLines);
    lines.push(...frontTopLines);
    lines.push(...frontLines);
    lines.push(...frontBottomLines);
    lines.push(...leftTopFLines);
    lines.push(...leftFLines);
    lines.push(...leftBottomFLines);
    lines.push(...leftTopSLines);
    lines.push(...leftSLines);
    lines.push(...leftBottomSLines);
    arcs.push(...backArcs);
    arcs.push(...frontArcs);
    lines.push(...redLines);
    return {
      lines,
      arcs,
      dimensions: [
        {
          label: "Panjang",
          value: length,
          length,
          x: xdf,
          y: ydtop + height * 0.8,
          u:length*0.35,
          v:length*0.35,
          ru:length*0.35,
          rv:length*0.35,
        },
        {
          label: "Lebar",
          value: width,
          length: width,
          x: xdfl,
          y: ydtop + height * 0.3,
          u:length*0.35,
          v:length*0.35,
          ru:length*0.35,
          rv:length*0.35,
        },
        {
          label: "Tinggi",
          value: height,
          length: height,
          x: xdflhw + length * 0.5,
          y: ydtop,
          u:length*0.35,
          v:length*0.35,
          ru:length*0.35,
          rv:length*0.35,
          vertical: true,
        },
      ],
    };
  }
  function getClipPath() {
    return boundary;
  }
  function getExportAreas(): ExportArea[] {
    const areas: ExportArea[] = [];
    const refs = {
      fixed_top: fixedTopLines,
      fixed: fixedLines,
      fixed_bottom: fixedBottomLines,
      back_top: backTopLines,
      back: backLines,
      back_bottom: backBottomLines,
      right_top: [...rightTopFLines, ...rightTopSLines],
      right: [...rightFLines, ...rightSLines],
      right_bottom: [...rightBottomFLines, ...rightBottomSLines],
      front_top: frontTopLines,
      front: frontLines,
      front_bottom: frontBottomLines,
      left_top: [...leftTopFLines, ...leftTopSLines],
      left: [...leftFLines, ...leftSLines],
      left_bottom: [...leftBottomFLines, ...leftBottomSLines],
    };
    type Point = { x: number; y: number };
    function lineToPoints(line: Lines): Point[] {
      const pts: Point[] = [];
      for (let i = 0; i < line.points.length; i += 2) {
        pts.push({
          x: line.points[i],
          y: line.points[i + 1],
        });
      }
      return pts;
    }
    function calcBounds(points: Point[], id: string) {
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      points.forEach((p) => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      });
      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };
    }
    Object.entries(refs).forEach(([id, lines]) => {
      if (!lines || lines.length === 0) return;
      const points = lines.flatMap(lineToPoints);
      if (points.length === 0) return;
      areas.push({
        id,
        ...calcBounds(points, id),
      });
    });
    return areas;
  }
  // min dan max dari kardus
  function getImageAreas() {
    return {
      x: 0,
      y: 0,
      width: fixed + 2 * (length + width + depth),
      height: fixed + height + width + dd,
    };
  }
  function getHoles() {
    return [];
  }
   function getShapes() {
    return {};
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
