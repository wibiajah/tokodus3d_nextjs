import { createPoint, createPath, createArc, createCurvePoint } from "../utils";
import {
  BoxParams,
  Lines,
  Arcs,
  ExportArea,
  DesignModel,
  Point,
} from "@/models/types";
export default function createShippingBoxModel(params: BoxParams): DesignModel {
  const { size, fixed, flute = "F" } = params;
  const sizeScale = 1;
  const length = size.length * sizeScale;
  const width = size.width * sizeScale;
  const height = size.height * sizeScale;
  const depth = size.depth * sizeScale;
  const startX = 0;
  const startY = 0;
  const s = Math.min(length, width);
  const hs = s * 0.5;
  const halfDepth = depth * 0.5;
  const doubleDepth = depth * 2;
  const tripleDepth = depth * 3;
  const quadDepth = doubleDepth * 2;
  const lw = length + width;
  // x
  const xmhd = startX - halfDepth;
  const xmhdmf = xmhd - fixed;
  const xd = startX + depth;
  const xdd = startX + doubleDepth;
  const xl = startX + length;
  const xld = xl + depth;
  const xldd = xl + doubleDepth;
  const xlw = startX + lw;
  const xlwd = xlw + depth;
  const xw2l = xlw + length;
  const xw2ld = xw2l + depth;
  const xw2ldd = xw2l + doubleDepth;
  const xlwdd = xlw + doubleDepth;
  const x2lw = xlw + lw;
  const x2lwd = x2lw + depth;
  const x2lwdd = x2lw + doubleDepth;
  const x2lw3d = x2lw + tripleDepth;
  // y
  const ydd = startY + doubleDepth;
  const yhs = startY + hs;
  const yhsdd = yhs + doubleDepth;
  const yhsd = yhs + depth;
  const yhs3d = yhs + tripleDepth;
  const yhs3dhd = yhs3d + halfDepth;
  const yhs4d = yhs + quadDepth;
  const yhs6d = yhs4d + doubleDepth;
  const yths = startY + height + hs;
  const ythsdd = yths + doubleDepth;
  const ythshd = yths + halfDepth;
  const ythsmdd = yths - doubleDepth;
  const ythsd = yths + depth;
  const yths3d = ythsd + doubleDepth;
  const ytsd = startY + height + s + depth;
  const ytsdd = ytsd + depth;
  const yts4d = startY + height + s + quadDepth;

  const lines: Lines[] = [];
  const arcs: Arcs[] = [];
  const backTopLines: Lines[] = [];
  const backLines: Lines[] = [];
  const backBottomLines: Lines[] = [];
  const rightTopLines: Lines[] = [];
  const rightLines: Lines[] = [];
  const rightBottomLines: Lines[] = [];
  const frontTopLines: Lines[] = [];
  const frontLines: Lines[] = [];
  const frontBottomLines: Lines[] = [];
  const leftTopLines: Lines[] = [];
  const leftLines: Lines[] = [];
  const leftBottomLines: Lines[] = [];
  const fixedFlapLines: Lines[] = [];
  const backArcs: Arcs[] = [];
  const rightTopArcs: Arcs[] = [];
  const rightBottomArcs: Arcs[] = [];
  const frontArcs: Arcs[] = [];
  const leftTopArcs: Arcs[] = [];
  const leftBottomArcs: Arcs[] = [];
  const boundary = [
    createPoint(startX, startY),
    createPoint(x2lwdd, startY),
    createPoint(x2lwdd, yhsd),
    createPoint(x2lw3d, yhsd),
    createPoint(x2lw3d, yths3d),
    createPoint(x2lwdd, yths3d), //5
    createPoint(x2lwdd, yts4d),
    createPoint(startX, yts4d),
    createPoint(startX, yths3d),
    createPoint(xmhd, yths3d),
    createPoint(xmhd, ythshd), //10
    createPoint(xmhdmf, ythsmdd),
    createPoint(xmhdmf, yhs6d),
    createPoint(xmhd, yhs3dhd),
    createPoint(xmhd, yhsd),
    createPoint(startX, yhsd), //15
    createPoint(startX, startY),
  ];
  const backTopLinesCut = [
    createPoint(xdd, yhsdd),
    createPoint(xdd, ydd),
    createPoint(xl, ydd),
    createPoint(xl, yhsdd),
  ];
  backTopLines.push(createPath(backTopLinesCut, "cut"));
  const backTopLinesT = [createPoint(xdd, yhsdd), createPoint(xl, yhsdd)];
  backTopLines.push(createPath(backTopLinesT));
  const backLinesFold1 = [createPoint(xdd, yhsdd), createPoint(xl, yhsdd)];
  backLines.push(createPath(backLinesFold1, "fold"));
  const backLinesT = [createPoint(xld, yhs3d), createPoint(xld, ythsd)];
  backLines.push(createPath(backLinesT));
  const backLinesFold2 = [createPoint(xl, ythsdd), createPoint(xdd, ythsdd)];
  backLines.push(createPath(backLinesFold2, "fold"));
  const backLinesFold3 = [createPoint(xd, ythsd), createPoint(xd, yhs3d)];
  backLines.push(createPath(backLinesFold3, "fold"));
  const backArcsCut = [
    {
      x: xd,
      y: yhsdd,
      radius: depth,
      angle: 90,
      rotation: 0,
    },
    {
      x: xld,
      y: yhsdd,
      radius: depth,
      angle: 90,
      rotation: 90,
    },
    {
      x: xd,
      y: ythsdd,
      radius: depth,
      angle: 90,
      rotation: 270,
    },
    {
      x: xld,
      y: ythsdd,
      radius: depth,
      angle: 90,
      rotation: 180,
    },
  ];
  backArcsCut.forEach((a) => backArcs.push(createArc(a, "cut")));
  const backBottomLinesCut = [
    createPoint(xl, ythsdd),
    createPoint(xl, ytsdd),
    createPoint(xdd, ytsdd),
    createPoint(xdd, ythsdd),
  ];
  backBottomLines.push(createPath(backBottomLinesCut, "cut"));
  const backBottomLinesT = [createPoint(xdd, ythsdd), createPoint(xl, ythsdd)];
  backBottomLines.push(createPath(backBottomLinesT));
  const rightTopLinesCut = [
    createPoint(xldd, yhsdd),
    createPoint(xldd, ydd),
    createPoint(xlw, ydd),
    createPoint(xlw, yhsdd),
  ];
  rightTopLines.push(createPath(rightTopLinesCut, "cut"));
  const rightTopLinesT = [createPoint(xlw, yhs3d), createPoint(xld, yhs3d)];
  rightTopLines.push(createPath(rightTopLinesT));
  const rightLinesFold = [
    createPoint(xlwd, ythsd),
    createPoint(xld, ythsd),
    createPoint(xld, yhs3d),
    createPoint(xlwd, yhs3d),
  ];
  rightLines.push(createPath(rightLinesFold, "fold"));
  const rightLinesT = [createPoint(xlwd, yhs3d), createPoint(xlwd, ythsd)];
  rightLines.push(createPath(rightLinesT));
  const rightTopArcsCut = [
    {
      x: xld,
      y: yhsdd,
      radius: depth,
      angle: 90,
      rotation: 0,
    },
    {
      x: xlwd,
      y: yhsdd,
      radius: depth,
      angle: 90,
      rotation: 90,
    },
  ];
  rightTopArcsCut.forEach((a) => rightTopArcs.push(createArc(a, "cut")));
  const rightBottomArcsCut = [
    {
      x: xld,
      y: ythsdd,
      radius: depth,
      angle: 90,
      rotation: 270,
    },
    {
      x: xlwd,
      y: ythsdd,
      radius: depth,
      angle: 90,
      rotation: 180,
    },
  ];
  rightBottomArcsCut.forEach((a) => rightBottomArcs.push(createArc(a, "cut")));
  const rightBottomLinesCut = [
    createPoint(xlw, ythsdd),
    createPoint(xlw, ytsdd),
    createPoint(xldd, ytsdd),
    createPoint(xldd, ythsdd),
  ];
  rightBottomLines.push(createPath(rightBottomLinesCut, "cut"));
  const rightBottomLinesT = [createPoint(xld, ythsd), createPoint(xlw, ythsd)];
  rightBottomLines.push(createPath(rightBottomLinesT));
  const frontTopLinesCut = [
    createPoint(xlwdd, yhsdd),
    createPoint(xlwdd, ydd),
    createPoint(xw2l, ydd),
    createPoint(xw2l, yhsdd),
  ];
  frontTopLines.push(createPath(frontTopLinesCut, "cut"));
  const frontTopLinesT = [createPoint(xlwdd, yhsdd), createPoint(xw2l, yhsdd)];
  frontTopLines.push(createPath(frontTopLinesT));
  const frontLinesFold1 = [createPoint(xlwdd, yhsdd), createPoint(xw2l, yhsdd)];
  frontLines.push(createPath(frontLinesFold1, "fold"));
  const frontLinesFold2 = [
    createPoint(xw2l, ythsdd),
    createPoint(xlwdd, ythsdd),
  ];
  frontLines.push(createPath(frontLinesFold2, "fold"));
  const frontLinesFold3 = [createPoint(xlwd, ythsd), createPoint(xlwd, yhs3d)];
  frontLines.push(createPath(frontLinesFold3, "fold"));
  const frontLinesT = [createPoint(xw2ld, yhs3d), createPoint(xw2ld, ythsd)];
  frontLines.push(createPath(frontLinesT));
  const frontArcsCut = [
    {
      x: xlwd,
      y: yhsdd,
      radius: depth,
      angle: 90,
      rotation: 0,
    },
    {
      x: xw2ld,
      y: yhsdd,
      radius: depth,
      angle: 90,
      rotation: 90,
    },
    {
      x: xlwd,
      y: ythsdd,
      radius: depth,
      angle: 90,
      rotation: 270,
    },
    {
      x: xw2ld,
      y: ythsdd,
      radius: depth,
      angle: 90,
      rotation: 180,
    },
  ];
  frontArcsCut.forEach((a) => frontArcs.push(createArc(a, "cut")));
  const frontBottomLinesCut = [
    createPoint(xw2l, ythsdd),
    createPoint(xw2l, ytsdd),
    createPoint(xlwdd, ytsdd),
    createPoint(xlwdd, ythsdd),
  ];
  frontBottomLines.push(createPath(frontBottomLinesCut, "cut"));
  const frontBottomLinesT = [
    createPoint(xlwdd, ythsdd),
    createPoint(xw2l, ythsdd),
  ];
  frontBottomLines.push(createPath(frontBottomLinesT));
  const leftTopLinesCut = [
    createPoint(xw2ldd, yhsdd),
    createPoint(xw2ldd, ydd),
    createPoint(x2lw, ydd),
    createPoint(x2lw, yhs3d),
  ];
  leftTopLines.push(createPath(leftTopLinesCut, "cut"));
  const leftTopLinesT = [createPoint(xw2ld, yhs3d), createPoint(x2lw, yhs3d)];
  leftTopLines.push(createPath(leftTopLinesT));
  const leftLinesFold = [
    createPoint(x2lwd, yhs3d),
    createPoint(xw2ld, yhs3d),
    createPoint(xw2ld, ythsd),
    createPoint(x2lwd, ythsd),
  ];
  leftLines.push(createPath(leftLinesFold, "fold"));
  const leftLinesCut = [createPoint(x2lwd, yhs3d), createPoint(x2lwd, ythsd)];
  leftLines.push(createPath(leftLinesCut, "cut"));
  const leftTopArcsCut = [
    {
      x: xw2ld,
      y: yhsdd,
      radius: depth,
      angle: 90,
      rotation: 0,
    },
  ];
  leftTopArcsCut.forEach((a) => leftTopArcs.push(createArc(a, "cut")));
  const leftBottomArcsCut = [
    {
      x: xw2ld,
      y: ythsdd,
      radius: depth,
      angle: 90,
      rotation: 270,
    },
  ];
  leftBottomArcsCut.forEach((a) => leftBottomArcs.push(createArc(a, "cut")));
  const leftBottomLinesCut = [
    createPoint(x2lw, ythsd),
    createPoint(x2lw, ytsdd),
    createPoint(xw2ldd, ytsdd),
    createPoint(xw2ldd, ythsdd),
  ];
  leftBottomLines.push(createPath(leftBottomLinesCut, "cut"));
  const leftBottomLinesT = [
    createPoint(xw2ld, ythsd),
    createPoint(x2lwd, ythsd),
  ];
  leftBottomLines.push(createPath(leftBottomLinesT));
  const fixedFlapLinesCut = [
    createPoint(xd, ythsd),
    createPoint(xmhdmf, ythsmdd),
    createPoint(xmhdmf, yhs6d),
    createPoint(xd, yhs3d),
  ];
  fixedFlapLines.push(createPath(fixedFlapLinesCut, "cut"));
  const fixedFlapLinesT = [createPoint(xd, yhs3d), createPoint(xd, ythsd)];
  fixedFlapLines.push(createPath(fixedFlapLinesT));
  function getDieline() {
    lines.push(...backTopLines);
    lines.push(...backLines);
    lines.push(...backBottomLines);
    lines.push(...rightTopLines);
    lines.push(...rightLines);
    lines.push(...rightBottomLines);
    lines.push(...frontTopLines);
    lines.push(...frontLines);
    lines.push(...frontBottomLines);
    lines.push(...leftTopLines);
    lines.push(...leftLines);
    lines.push(...leftBottomLines);
    lines.push(...fixedFlapLines);
    arcs.push(...backArcs);
    arcs.push(...rightTopArcs);
    arcs.push(...rightBottomArcs);
    arcs.push(...frontArcs);
    arcs.push(...leftTopArcs);
    arcs.push(...leftBottomArcs);
    return {
      lines,
      arcs,
      dimensions: [
        {
          label: "Panjang",
          value: length,
          length,
          x: depth,
          y: yhsdd + height * 0.8,
          u: length * 0.35,
          v: 0,
          ru: length * 0.65,
          rv: 0,
        },
        {
          label: "Lebar",
          value: width,
          length: width,
          x: xld,
          y: yhsdd + height * 0.3,
          u: width * 0.3,
          v: 0,
          ru: width * 0.7,
          rv: 0,
        },
        {
          label: "Tinggi",
          value: height,
          length: height,
          x: xlwd + length * 0.5,
          y: yhsdd,
          u: -height * 0.3,
          v: height * 0.4,
          ru: height * 0.3,
          rv: height * 0.4,
          vertical: true,
        },
      ],
    };
  }
  function getClipPath() {
    return boundary;
  }
  function getShapes() {
    const nBackTop = [...backTopLinesCut, ...backTopLinesT];
    const nBack = [
      ...backLinesFold1,
      createCurvePoint(xld, yhsdd, -depth),
      ...backLinesT,
      createCurvePoint(xld, ythsdd, -depth),
      ...backLinesFold2,
      createCurvePoint(xd, ythsdd, -depth),
      ...backLinesFold3,
      createCurvePoint(xd, yhsdd, -depth),
      createPoint(xdd, yhsdd),
    ];
    const nBackBottom = [...backBottomLinesCut, ...backBottomLinesT];
    const nRightTop = [
      ...rightTopLinesCut,
      createCurvePoint(xlwd, yhsdd, -depth),
      ...rightTopLinesT,
      createCurvePoint(xld, yhsdd, -depth),
      createPoint(xldd, yhsdd),
    ];
    const nRight = [...rightLinesFold, ...rightLinesT];
    const nRightBottom = [
      ...rightBottomLinesCut,
      createCurvePoint(xld, ythsdd, -depth),
      ...rightBottomLinesT,
      createCurvePoint(xlwd, ythsdd, -depth),
      createPoint(xlw, ythsdd),
    ];
    const nFrontTop = [...frontTopLinesCut, ...frontTopLinesT];
    const nFront = [
      ...frontLinesFold1,
      createCurvePoint(xw2ld, yhsdd, -depth),
      ...frontLinesT,
      createCurvePoint(xw2ld, ythsdd, -depth),
      ...frontLinesFold2,
      createCurvePoint(xlwd, ythsdd, -depth),
      ...frontLinesFold3,
      createCurvePoint(xlwd, yhsdd, -depth),
      createPoint(xlwdd, yhsdd),
    ];
    const nFrontBottom = [...frontBottomLinesCut, ...frontBottomLinesT];
    const nLeftTop = [
      ...leftTopLinesCut,
      createCurvePoint(x2lwd, yhsdd, -depth),
      ...leftTopLinesT,
      createCurvePoint(xw2ld, yhsdd, -depth),
      createPoint(xw2ldd, yhsdd),
    ];
    const nLeft = [...leftLinesFold, ...leftLinesCut];
    const nLeftBottom = [
      ...leftBottomLinesCut,
      createCurvePoint(xw2ld, ythsdd, -depth),
      ...leftBottomLinesT,
      createCurvePoint(x2lwd, ythsdd, -depth),
      createPoint(x2lw, ythsdd),
    ];
    const nFixedFlap = [...fixedFlapLinesCut, ...fixedFlapLinesT];
    return {
      back_top: nBackTop,
      back: nBack,
      back_bottom: nBackBottom,
      right_top: nRightTop,
      right: nRight,
      right_bottom: nRightBottom,
      front_top: nFrontTop,
      front: nFront,
      front_bottom: nFrontBottom,
      left_top: nLeftTop,
      left: nLeft,
      left_bottom: nLeftBottom,
      fixed: nFixedFlap,
    };
  }
  function getExportAreas(): ExportArea[] {
    const areas: ExportArea[] = [];
    const refs = getShapes();
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
      const add =
        id === "left_top" ||
        id === "left_bottom" ||
        id === "right_top" ||
        id === "right_bottom"
          ? depth
          : 0;
      return {
        x: minX,
        y: minY,
        width: maxX - minX + add,
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
      x: startX -fixed - depth,
      y: startY,
      width: x2lw3d + fixed + depth,
      height: yts4d,
    };
  }
  function getHoles() {
    return [];
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
