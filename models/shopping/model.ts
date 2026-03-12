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
export default function createShoppingBoxModel(params: BoxParams): DesignModel {
  const { size, flute = "F" } = params;
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
  const backBottomLLines: Lines[] = [];
  const backBottomRLines: Lines[] = [];
  const rightTopFLines: Lines[] = []; // F dan S dalam animasi itu apa 1 sisi flaps ? ? jadikan 1 tanpa dipisah F atau S
  const rightFLines: Lines[] = []; // jadi 1 tapi bagian yg bawah dan atas memiliki animasi sendiri! -> sebaiknya dipisah
  const rightBottomFLines: Lines[] = []; // tapi sisi kanan dan kiri yang setengah itu apa melakukan gerakan animasi yang sama?
  const rightTopSLines: Lines[] = []; // jadikan 1 saja(top, center, bottom)
  const rightSLines: Lines[] = [];
  const rightBottomSLines: Lines[] = [];
  const frontTopLines: Lines[] = [];
  const frontLines: Lines[] = [];
  const frontBottomLines: Lines[] = [];
  const frontBottomLLines: Lines[] = [];
  const frontBottomRLines: Lines[] = [];
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
  const fixedLinesFold1 = [createPoint(xd, ydtop), createPoint(xdf, ydtop)];
  const fixedLinesFold2 = [createPoint(xdf, ydtop), createPoint(xdf, ydttop)];
  const fixedLinesFold3 = [createPoint(xdf, ydttop), createPoint(xd, ydttop)];
  fixedLines.push(createPath(fixedLinesCut, "cut"));
  fixedLines.push(createPath(fixedLinesFold1, "fold"));
  fixedLines.push(createPath(fixedLinesFold2, "fold"));
  fixedLines.push(createPath(fixedLinesFold3));
  const fixedBottomLinesCut = [
    createPoint(xd, ydttop),
    createPoint(xd, yttophwf),
    createPoint(xdf, ydttophwf),
  ];
  const fixedBottomLinesFold = [
    createPoint(xdf, ydttophwf),
    createPoint(xdf, ydttop),
    createPoint(xd, ydttop),
  ];
  fixedBottomLines.push(createPath(fixedBottomLinesCut, "cut"));
  fixedBottomLines.push(createPath(fixedBottomLinesFold, "fold"));
  const backTopLinesCut = [createPoint(xdf, yd), createPoint(xdfl, yd)];
  const backTopLinesFold = [
    createPoint(xdfl, yd),
    createPoint(xdfl, ydtop),
    createPoint(xdf, ydtop),
  ];
  const backTopLinesT = [
    createPoint(xdf, ydtop),
    createPoint(xdf, yd),
    createPoint(xdfl, yd),
  ];
  backTopLines.push(createPath(backTopLinesCut, "cut"));
  backTopLines.push(createPath(backTopLinesFold, "fold"));
  backTopLines.push(createPath(backTopLinesT));
  const backLinesFold = [
    createPoint(xdfl, ydtop),
    createPoint(xdfl, ydttop),
    createPoint(xdf, ydttop),
  ];
  const backLinesT = [
    createPoint(xdf, ydttop),
    createPoint(xdf, ydtop),
    createPoint(xdfl, ydtop),
  ];
  backLines.push(createPath(backLinesFold, "fold"));
  backLines.push(createPath(backLinesT));
  // const backBottomLinesCut = [
  //   createPoint(xdf, ydttophwf),
  //   createPoint(xdfl, ydttophwf),
  // ];
  // const backBottomLinesFold1 = [
  //   createPoint(xdfl, ydttop),
  //   createPoint(xdfl, ydttophwf),
  // ];
  // const backBottomLinesFold2 = [
  //   createPoint(xdf, ydttophwf),
  //   createPoint(xdf, ydttop),
  // ];
  // backBottomLines.push(createPath(backBottomLinesCut, "cut"));
  // backBottomLines.push(createPath(backBottomLinesFold1, "fold"));
  // backBottomLines.push(createPath(backBottomLinesFold2));
  const backBottomLLinesCut = [
    createPoint(xdf, ydttophwf),
    createPoint(xdf + hw + fixed, ydttophwf),
  ];
  const backBottomLLinesT = [
    createPoint(xdf + hw + fixed, ydttophwf),
    createPoint(xdf, ydttop),
    createPoint(xdf, ydttophwf),
  ];
  backBottomLLines.push(createPath(backBottomLLinesCut, "cut"));
  backBottomLLines.push(createPath(backBottomLLinesT));
  const backBottomLinesCut = [
    createPoint(xdf + hw + fixed, ydttophwf),
    createPoint(xdfl - (hw + fixed), ydttophwf),
  ];
  const backBottomLinesT = [
    createPoint(xdfl - (hw + fixed), ydttophwf),
    createPoint(xdfl, ydttop),
    createPoint(xdf, ydttop),
    createPoint(xdf + (hw + fixed), ydttophwf),
  ];
  backBottomLines.push(createPath(backBottomLinesCut, "cut"));
  backBottomLines.push(createPath(backBottomLinesT));
  const backBottomRLinesCut = [
    createPoint(xdfl - (hw + fixed), ydttophwf),
    createPoint(xdfl, ydttophwf),
  ];
  const backBottomRLinesFold = [
    createPoint(xdfl, ydttop),
    createPoint(xdfl, ydttophwf), 
  ];
  const backBottomRLinesT = [
    createPoint(xdfl, ydttop),
    createPoint(xdfl - (hw + fixed), ydttophwf),
  ];
  backBottomRLines.push(createPath(backBottomRLinesCut, "cut"));
  backBottomRLines.push(createPath(backBottomRLinesFold, "fold"));
  backBottomRLines.push(createPath(backBottomRLinesT));
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
  ];
  const rightTopFLinesFold2 = [
    createPoint(xdflhw, ydtop),
    createPoint(xdfl, ydtop),
  ];
  const rightTopFLinesT = [createPoint(xdfl, ydtop), createPoint(xdfl, yd)];
  rightTopFLines.push(createPath(rightTopFLinesCut, "cut"));
  rightTopFLines.push(createPath(rightTopFLinesFold1, "fold"));
  rightTopFLines.push(createPath(rightTopFLinesFold2, "fold"));
  rightTopFLines.push(createPath(rightTopFLinesT));
  const rightFLinesFold1 = [
    createPoint(xdflhw, ydtop),
    createPoint(xdflhw, ydttop),
  ];
  const rightFLinesFold2 = [
    createPoint(xdflhw, ydttop),
    createPoint(xdfl, ydttop),
  ];
  const rightFLinesT = [
    createPoint(xdfl, ydttop),
    createPoint(xdfl, ydtop),
  ];
  rightFLines.push(createPath(rightFLinesFold1, "fold"));
  rightFLines.push(createPath(rightFLinesFold2, "fold"));
  rightFLines.push(createPath(rightFLinesT));
  const rightBottomFLinesCut = [
    createPoint(xdfl, ydttophwf),
    createPoint(xdflhw, ydttophwf),
  ];
  const rightBottomFLinesFold = [
    createPoint(xdflhw, ydttophwf),
    createPoint(xdflhw, ydttop),
  ];
  const rightBottomFLinesT = [
    createPoint(xdflhw, ydttop),
    createPoint(xdfl, ydttop),
    createPoint(xdfl, ydttophwf),
  ];
  rightBottomFLines.push(createPath(rightBottomFLinesCut, "cut"));
  rightBottomFLines.push(createPath(rightBottomFLinesFold, "fold"));
  rightBottomFLines.push(createPath(rightBottomFLinesT));
  const rightTopSLinesCut = [createPoint(xdflhw, yd), createPoint(xdflw, yd)];
  const rightTopSLinesFold = [
    createPoint(xdflw, yd),
    createPoint(xdflw, ydtop),
    createPoint(xdflhw, ydtop),
  ];
  const rightTopSLinesT = [
    createPoint(xdflhw, ydtop),
    createPoint(xdflhw, yd),
  ];
  rightTopSLines.push(createPath(rightTopSLinesCut, "cut"));
  rightTopSLines.push(createPath(rightTopSLinesFold, "fold"));
  rightTopSLines.push(createPath(rightTopSLinesT));
  const rightSLinesFold = [
    createPoint(xdflw, ydtop),
    createPoint(xdflw, ydttop),
    createPoint(xdflhw, ydttop),
  ];
  const rightSLinesT1 = [
    createPoint(xdflhw, ydttop),
    createPoint(xdflhw, ydtop),
  ];
  const rightSLinesT2 = [
    createPoint(xdflhw, ydtop),
    createPoint(xdflw, ydtop),
  ];
  rightSLines.push(createPath(rightSLinesFold, "fold"));
  rightSLines.push(createPath(rightSLinesT1));
  rightSLines.push(createPath(rightSLinesT2));
  const rightBottomSLinesCut = [
    createPoint(xdflhw, ydttophwf),
    createPoint(xdflw, ydttophwf),
  ];
  const rightBottomSLinesFold = [
    createPoint(xdflw, ydttophwf),
    createPoint(xdflw, ydttop),
  ];
  const rightBottomSLinesT1 = [
    createPoint(xdflw, ydttop),
    createPoint(xdflhw, ydttop),
  ];
  const rightBottomSLinesT2 = [
    createPoint(xdflhw, ydttop),
    createPoint(xdflhw, ydttophwf),
  ];
  rightBottomSLines.push(createPath(rightBottomSLinesCut, "cut"));
  rightBottomSLines.push(createPath(rightBottomSLinesFold, "fold"));
  rightBottomSLines.push(createPath(rightBottomSLinesT1));
  rightBottomSLines.push(createPath(rightBottomSLinesT2));
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
  const frontLinesFold = [
    createPoint(xdfw2l, ydtop),
    createPoint(xdfw2l, ydttop),
    createPoint(xdflw, ydttop),
  ];
  const frontLinesT = [
    createPoint(xdflw, ydttop),
    createPoint(xdflw, ydtop),
  ];
  frontLines.push(createPath(frontLinesFold, "fold"));
  frontLines.push(createPath(frontLinesT));
  // const frontBottomLinesCut = [
  //   createPoint(xdflw, ydttophwf),
  //   createPoint(xdfw2l, ydttophwf),
  // ];
  // const frontBottomLinesFold1 = [
  //   createPoint(xdfw2l, ydttop),
  //   createPoint(xdfw2l, ydttophwf),
  // ];
  // const frontBottomLinesFold2 = [
  //   createPoint(xdflw, ydttophwf),
  //   createPoint(xdflw, ydttop),
  // ];
  // frontBottomLines.push(createPath(frontBottomLinesCut, "cut"));
  // frontBottomLines.push(createPath(frontBottomLinesFold1, "fold"));
  // frontBottomLines.push(createPath(frontBottomLinesFold2));
  const frontBottomLLinesCut = [
    createPoint(xdflw, ydttophwf),
    createPoint(xdflw + hw + fixed, ydttophwf),
  ];
  const frontBottomLLinesT = [
    createPoint(xdflw + hw + fixed, ydttophwf),
    createPoint(xdflw, ydttop),
    createPoint(xdflw, ydttophwf),
  ];
  frontBottomLLines.push(createPath(frontBottomLLinesCut, "cut"));
  frontBottomLLines.push(createPath(frontBottomLLinesT));
  const frontBottomLinesCut = [
    createPoint(xdflw + hw + fixed, ydttophwf),
    createPoint(xdfw2l - (hw + fixed), ydttophwf),
  ];
  const frontBottomLinesT = [
    createPoint(xdfw2l - (hw + fixed), ydttophwf),
    createPoint(xdfw2l, ydttop),
    createPoint(xdflw, ydttop),
    createPoint(xdflw + (hw + fixed), ydttophwf),
  ];
  frontBottomLines.push(createPath(frontBottomLinesCut, "cut"));
  frontBottomLines.push(createPath(frontBottomLinesT));
  const frontBottomRLinesCut = [
    createPoint(xdfw2l - (hw + fixed), ydttophwf),
    createPoint(xdfw2l, ydttophwf),
  ];
  const frontBottomRLinesFold = [
    createPoint(xdfw2l, ydttop),
    createPoint(xdfw2l, ydttophwf),
  ];
  const frontBottomRLinesT = [
    createPoint(xdfw2l, ydttop),
    createPoint(xdfw2l - (hw + fixed), ydttophwf),
  ];
  frontBottomRLines.push(createPath(frontBottomRLinesCut, "cut"));
  frontBottomRLines.push(createPath(frontBottomRLinesFold, "fold"));
  frontBottomRLines.push(createPath(frontBottomRLinesT));
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
  ];
  const leftTopFLinesFold2 = [
    createPoint(xdfwhw2l, ydtop),
    createPoint(xdfw2l, ydtop),
  ];
  const leftTopFLinesT = [
    createPoint(xdfw2l, ydtop),
    createPoint(xdfw2l, yd),
  ];
  leftTopFLines.push(createPath(leftTopFLinesCut, "cut"));
  leftTopFLines.push(createPath(leftTopFLinesFold1, "fold"));
  leftTopFLines.push(createPath(leftTopFLinesFold2, "fold"));
  leftTopFLines.push(createPath(leftTopFLinesT));
  const leftFLinesFold1 = [
    createPoint(xdfwhw2l, ydtop),
    createPoint(xdfwhw2l, ydttop),
  ];
  const leftFLinesFold2 = [
    createPoint(xdfwhw2l, ydttop),
    createPoint(xdfw2l, ydttop),
  ];
  const leftFLinesT = [
    createPoint(xdfw2l, ydttop),
    createPoint(xdfw2l, ydtop),
    createPoint(xdfwhw2l, ydtop),
  ];
  leftFLines.push(createPath(leftFLinesFold1, "fold"));
  leftFLines.push(createPath(leftFLinesFold2, "fold"));
  leftFLines.push(createPath(leftFLinesT));
  const leftBottomFLinesCut = [
    createPoint(xdfw2l, ydttophwf),
    createPoint(xdfwhw2l, ydttophwf),
  ];
  const leftBottomFLinesT = [
    createPoint(xdfw2l, ydttophwf),
    createPoint(xdfw2l, ydttop),
    createPoint(xdfwhw2l, ydttop),
  ];
  const leftBottomFLinesFold = [
    createPoint(xdfwhw2l, ydttop),
    createPoint(xdfwhw2l, ydttophwf),
  ];
  leftBottomFLines.push(createPath(leftBottomFLinesCut, "cut"));
  leftBottomFLines.push(createPath(leftBottomFLinesT));
  leftBottomFLines.push(createPath(leftBottomFLinesFold, "fold"));
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
  const leftSLinesFold = [
    createPoint(xdf2lw, ydttop),
    createPoint(xdfwhw2l, ydttop),
  ];
  const leftSLinesT1 = [
    createPoint(xdfwhw2l, ydttop),
    createPoint(xdfwhw2l, ydtop),
  ];
  const leftSLinesT2 = [
    createPoint(xdfwhw2l, ydtop),
    createPoint(xdf2lw, ydtop),
  ];
  leftSLines.push(createPath(leftSLinesCut, "cut"));
  leftSLines.push(createPath(leftSLinesFold, "fold"));
  leftSLines.push(createPath(leftSLinesT1));
  leftSLines.push(createPath(leftSLinesT2));
  const leftBottomSLinesCut = [
    createPoint(xdf2lw, ydttop),
    createPoint(xdf2lw, ydttophwf),
    createPoint(xdfwhw2l, ydttophwf),
  ];
  const leftBottomSLinesT1 = [
    createPoint(xdfwhw2l, ydttophwf),
    createPoint(xdfwhw2l, ydttop),
  ];
  const leftBottomSLinesT2 = [
    createPoint(xdfwhw2l, ydttop),
    createPoint(xdf2lw, ydttop),
  ];
  leftBottomSLines.push(createPath(leftBottomSLinesCut, "cut"));
  leftBottomSLines.push(createPath(leftBottomSLinesT1));
  leftBottomSLines.push(createPath(leftBottomSLinesT2));
  const redlines1 = [createPoint(xd, ydttopmf), createPoint(xdhw2f, ydttophwf)];
  redLines.push(createPath(redlines1, "fold", 0.5, "red"));
  const redlines2 = [
    createPoint(xdlmhw, ydttophwf),
    createPoint(xdflhw, ydttopmhw),
  ];
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
  const redlines5 = [
    createPoint(xdfwhw2l, ydttopmhw),
    createPoint(xdf2lw, ydttop),
  ];
  redLines.push(createPath(redlines5, "fold", 0.5, "red"));

  function getDieline() {
    lines.push(...fixedTopLines);
    lines.push(...fixedLines);
    lines.push(...fixedBottomLines);
    lines.push(...backTopLines);
    lines.push(...backLines);
    lines.push(...backBottomLLines);
    lines.push(...backBottomLines);
    lines.push(...backBottomRLines);
    lines.push(...rightTopFLines);
    lines.push(...rightFLines);
    lines.push(...rightBottomFLines);
    lines.push(...rightTopSLines);
    lines.push(...rightSLines);
    lines.push(...rightBottomSLines);
    lines.push(...frontTopLines);
    lines.push(...frontLines);
    lines.push(...frontBottomLLines);
    lines.push(...frontBottomLines);
    lines.push(...frontBottomRLines);
    lines.push(...leftTopFLines);
    lines.push(...leftFLines);
    lines.push(...leftBottomFLines);
    lines.push(...leftTopSLines);
    lines.push(...leftSLines);
    lines.push(...leftBottomSLines);
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
          u: length * 0.38,
          v: 0,
          ru: length * 0.63,
          rv: 0,
        },
        {
          label: "Lebar",
          value: width,
          length: width,
          x: xdfl,
          y: ydtop + height * 0.3,
          u: width * 0.25,
          v: 0,
          ru: width * 0.8,
          rv: 0,
        },
        {
          label: "Tinggi",
          value: height,
          length: height,
          x: xdflhw + length * 0.5,
          y: ydtop,
          u: -length * 0.1,
          v: height * 0.47,
          ru: height * 0.1,
          rv: height * 0.47,
          vertical: true,
        },
      ],
    };
  }
  function getClipPath() {
    return boundary;
  }
  function getShapes() {
    const nFixedTop = [
      ...fixedTopLinesCut,
      ...fixedTopLinesFold,
    ];
    const nFixed = [
      ...fixedLinesCut,
      ...fixedLinesFold1,
      ...fixedLinesFold2,
      ...fixedLinesFold3,
    ];
    const nFixedBottom = [
      ...fixedBottomLinesCut,
      ...fixedBottomLinesFold,
    ];
    const nBackTop = [
      ...backTopLinesCut,
      ...backTopLinesFold,
      ...backTopLinesT,
    ];
    const nBack = [
      ...backLinesFold,
      ...backLinesT,
    ];
    const nBackBottom = [
      ...backBottomLinesCut,
      ...backBottomLinesT,
    ];
    const nBackBottomL = [
      ...backBottomLLinesCut,
      ...backBottomLLinesT,
    ];
    const nBackBottomR = [
      ...backBottomRLinesCut,
      ...backBottomRLinesFold,
      ...backBottomRLinesT,
    ];
    const nRightTop = [
      ...rightTopFLinesCut,
      ...rightTopSLinesCut,
      ...rightTopSLinesFold,
      ...rightTopFLinesFold2,
      ...rightTopFLinesT,
    ];
    const nRight = [
      ...rightSLinesFold,
      ...rightFLinesFold2,
      ...rightFLinesT,
      ...rightSLinesT2,
    ];
    const nRightBottom = [
      ...rightBottomFLinesCut,
      ...rightBottomSLinesCut,
      ...rightBottomSLinesFold,
      ...rightBottomSLinesT1,
      ...rightBottomFLinesT,
    ];
    const nFrontTop = [
      ...frontTopLinesCut,
      ...frontTopLinesFold1,
      ...frontTopLinesFold2,
    ];
    const nFront = [
      ...frontLinesFold,
      ...frontLinesT,
    ];
    const nFrontBottom = [
      ...frontBottomLinesCut,
      ...frontBottomLinesT,
    ];
    const nFrontBottomL = [
      ...frontBottomLLinesCut,
      ...frontBottomLLinesT,
    ];
    const nFrontBottomR = [
      ...frontBottomRLinesCut,
      ...frontBottomRLinesFold,
      ...frontBottomRLinesT,
    ];
     const nLeftTop = [
      ...leftTopFLinesCut,
      ...leftTopSLinesCut,
      ...leftTopSLinesFold1,
      ...leftTopFLinesFold2,
      ...leftTopFLinesT,
    ];
    const nLeft = [
      ...leftSLinesFold,
      ...leftFLinesFold2,
      ...leftFLinesT,
      ...leftSLinesT2,
    ];
    const nLeftBottom = [
      ...leftBottomSLinesT2,
      ...leftBottomSLinesCut,
      ...leftBottomFLinesCut,
      ...leftBottomFLinesT,
    ];
    return {
      fixed_top: nFixedTop,
      fixed: nFixed,
      fixed_bottom: nFixedBottom,
      back_top: nBackTop,
      back: nBack,
      back_bottom: nBackBottom,
      back_bottom_l: nBackBottomL,
      back_bottom_r: nBackBottomR,
      right_top: nRightTop,
      right: nRight,
      right_bottom: nRightBottom,
      front_top: nFrontTop,
      front: nFront,
      front_bottom: nFrontBottom,
      front_bottom_l: nFrontBottomL,
      front_bottom_r: nFrontBottomR,
      left_top: nLeftTop,
      left: nLeft,
      left_bottom: nLeftBottom,
    };
  }
  function getExportAreas(): ExportArea[] {
    const areas: ExportArea[] = [];
    const refs = getShapes();
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
      areas.push({
        id,
        ...calcBounds(lines, id),
      });
    });
    return areas;
  }
  // min dan max dari kardus
  function getImageAreas() {
    return {
      x: 0,
      y: 0,
      width: xddf2lw,
      height: yddttophwf,
    };
  }
  function getHoles() {
    return [...backArcs,...frontArcs];
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
