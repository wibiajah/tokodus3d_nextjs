const createPoint = (x: number, y: number) => ({ x, y });

const pointsToArray = (points: { x: number; y: number }[]) =>
  points.flatMap((p) => [p.x, p.y]);

const createPath = (
  points: { x: number; y: number }[],
  type: "cut" | "fold" | "transparent" = "transparent"
) => ({
  kind: "line",
  points: pointsToArray(points),
  stroke: type === "transparent" ? "transparent" : "#000",
  strokeWidth: type === "cut" ? 0.5 : 0.5,
  ...(type === "fold" && { dash: [8, 4] }),
});

const createArc = (
  a: {
    x: number;
    y: number;
    radius: number;
    angle: number;
    rotation: number;
  },
  type: "cut" | "fold" = "cut"
) => ({
  kind: "arc",
  x: a.x,
  y: a.y,
  radius: a.radius,
  angle: a.angle,
  rotation: a.rotation,
  stroke: type === "cut" ? "#000" : "#000",
  strokeWidth: type === "cut" ? 0.5 : 0.5,
  ...(type === "fold" && { dash: [8, 4] }),
});

const generateDieline = (
  boxDimensions: {
    length: number;
    width: number;
    height: number;
    depth: number;
  },
  startX: number,
  startY: number,
  fixed: number,
  scale: number
) => {
  const { length, width, height, depth } = boxDimensions;
  const s = Math.min(length, width);
  const hs = s * 0.5;
  const halfDepth = depth * 0.5;
  const doubleDepth = depth * 2;
  const tripleDepth = depth * 3;
  const quadDepth = doubleDepth * 2;
  const lw = length + width;
  // x
  const xmhd = startX - halfDepth;
  const xmd = startX - depth;
  const xmhdmf = xmhd - fixed;
  const xd = startX + depth;
  const xdhd = xd + halfDepth;
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

  type Lines = {
    kind: string;
    points: number[];
    stroke: string;
    strokeWidth: number;
    dash?: number[];
  };
  type Arcs = {
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

  const paths: Lines[] = [];
  // const arcs: Arcs[] = [];

  // Outer boundary - build clockwise from top-left
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
  paths.push(createPath(boundary, "cut"));

  // === DIMENSION LINES FOR LABELS ===
  const lengthLine = {
    start: createPoint(xd, yhsd + hs),
    end: createPoint(xld, yhsd + hs),
    value: length,
    label: "Panjang",
  };

  const widthLine = {
    start: createPoint(xld, yhs + height / 2),
    end: createPoint(xlwd, yhs + height / 2),
    value: width,
    label: "Lebar",
  };

  const heightLine = {
    start: createPoint(xldd / 2, yhsdd),
    end: createPoint(xldd / 2, ythsdd),
    value: height,
    label: "Tinggi",
  };

  const dimensions = { lengthLine, widthLine, heightLine };


  const backTopLinesCut = [
    createPoint(xdd, yhsdd),
    createPoint(xdd, ydd),
    createPoint(xl, ydd),
    createPoint(xl, yhsdd),
  ];
  backTopLines.push(createPath(backTopLinesCut, "cut"));
  const backTopLinesFold = [[xdd, yhsdd, xl, yhsdd]];
  backTopLinesFold.forEach(([x1, y1, x2, y2]) =>
    backTopLines.push(createPath([createPoint(x1, y1), createPoint(x2, y2)]))
  );
  const backLinesFold = [
    [xdd, yhsdd, xl, yhsdd],
    // [xld, yhs3d, xld, ythsd],
    [xdd, ythsdd, xl, ythsdd],
    [xd, yhs3d, xd, ythsd],
  ];
  backLinesFold.forEach(([x1, y1, x2, y2]) =>
    backLines.push(
      createPath([createPoint(x1, y1), createPoint(x2, y2)], "fold")
    )
  );
  [[xld, yhs3d, xld, ythsd]].forEach(([x1, y1, x2, y2]) =>
    backLines.push(createPath([createPoint(x1, y1), createPoint(x2, y2)]))
  );
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
  const backBottomLinesFold = [[xdd, ythsdd, xl, ythsdd]];
  backBottomLinesFold.forEach(([x1, y1, x2, y2]) =>
    backBottomLines.push(createPath([createPoint(x1, y1), createPoint(x2, y2)]))
  );
  const rightTopLinesCut = [
    createPoint(xldd, yhsdd),
    createPoint(xldd, ydd),
    createPoint(xlw, ydd),
    createPoint(xlw, yhsdd),
  ];
  rightTopLines.push(createPath(rightTopLinesCut, "cut"));
  const rightTopLinesFold = [[xld, yhs3d, xlw, yhs3d]];
  rightTopLinesFold.forEach(([x1, y1, x2, y2]) =>
    rightTopLines.push(createPath([createPoint(x1, y1), createPoint(x2, y2)]))
  );
  const rightLinesFold = [
    [xld, yhs3d, xlw, yhs3d],
    // [xlwd, yhs3d, xlwd, ythsd],
    [xld, ythsd, xlw, ythsd],
    [xld, yhs3d, xld, ythsd],
  ];
  rightLinesFold.forEach(([x1, y1, x2, y2]) =>
    rightLines.push(
      createPath([createPoint(x1, y1), createPoint(x2, y2)], "fold")
    )
  );
  [[xlwd, yhs3d, xlwd, ythsd]].forEach(([x1, y1, x2, y2]) =>
    rightLines.push(createPath([createPoint(x1, y1), createPoint(x2, y2)]))
);
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
  const rightBottomLinesFold = [[xld, ythsd, xlw, ythsd]];
  rightBottomLinesFold.forEach(([x1, y1, x2, y2]) =>
    rightBottomLines.push(
      createPath([createPoint(x1, y1), createPoint(x2, y2)])
    )
  );
  const frontTopLinesCut = [
    createPoint(xlwdd, yhsdd),
    createPoint(xlwdd, ydd),
    createPoint(xw2l, ydd),
    createPoint(xw2l, yhsdd),
  ];
  frontTopLines.push(createPath(frontTopLinesCut, "cut"));
  const frontTopLinesFold = [[xlwdd, yhsdd, xw2l, yhsdd]];
  frontTopLinesFold.forEach(([x1, y1, x2, y2]) =>
    frontTopLines.push(createPath([createPoint(x1, y1), createPoint(x2, y2)]))
  );
  const frontLinesFold = [
    [xlwdd, yhsdd, xw2l, yhsdd],
    // [xw2ld, yhs3d, xw2ld, ythsd],
    [xlwdd, ythsdd, xw2l, ythsdd],
    [xlwd, yhs3d, xlwd, ythsd],
  ];
  frontLinesFold.forEach(([x1, y1, x2, y2]) =>
    frontLines.push(
      createPath([createPoint(x1, y1), createPoint(x2, y2)], "fold")
    )
  );
  [[xw2ld, yhs3d, xw2ld, ythsd]].forEach(([x1, y1, x2, y2]) =>
    frontLines.push(createPath([createPoint(x1, y1), createPoint(x2, y2)]))
);
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
  const frontBottomLinesFold = [[xlwdd, ythsdd, xw2l, ythsdd]];
  frontBottomLinesFold.forEach(([x1, y1, x2, y2]) =>
    frontBottomLines.push(
      createPath([createPoint(x1, y1), createPoint(x2, y2)])
    )
  );
  const leftTopLinesCut = [
    createPoint(xw2ldd, yhsdd),
    createPoint(xw2ldd, ydd),
    createPoint(x2lw, ydd),
    createPoint(x2lw, yhs3d),
  ];
  leftTopLines.push(createPath(leftTopLinesCut, "cut"));
  const leftTopLinesFold = [[xw2ld, yhs3d, x2lw, yhs3d]];
  leftTopLinesFold.forEach(([x1, y1, x2, y2]) =>
    leftTopLines.push(createPath([createPoint(x1, y1), createPoint(x2, y2)]))
  );
  const leftLinesFold = [
    [xw2ld, yhs3d, x2lwd, yhs3d],
    // [x2lwd, yhs3d, x2lwd, ythsd],
    [xw2ld, ythsd, x2lwd, ythsd],
    [xw2ld, yhs3d, xw2ld, ythsd],
  ];
  leftLinesFold.forEach(([x1, y1, x2, y2]) =>
    leftLines.push(
      createPath([createPoint(x1, y1), createPoint(x2, y2)], "fold")
    )
  );
  [[x2lwd, yhs3d, x2lwd, ythsd]].forEach(([x1, y1, x2, y2]) =>
    leftLines.push(createPath([createPoint(x1, y1), createPoint(x2, y2)],"cut"))
);
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
  const leftBottomLinesFold = [[xw2ld, ythsd, x2lw, ythsd]];
  leftBottomLinesFold.forEach(([x1, y1, x2, y2]) =>
    leftBottomLines.push(createPath([createPoint(x1, y1), createPoint(x2, y2)]))
  );

  // kurang yang fixed flap
  const fixedFlapLinesCut = [
    createPoint(xd, ythsd),
    createPoint(xmhdmf, ythsmdd),
    createPoint(xmhdmf, yhs6d),
    createPoint(xd, yhs3d),
  ];
  fixedFlapLines.push(createPath(fixedFlapLinesCut, "cut"));
  const fixedFlapLinesFold = [[xd, yhs3d, xd, ythsd]];
  fixedFlapLinesFold.forEach(([x1, y1, x2, y2]) =>
    fixedFlapLines.push(createPath([createPoint(x1, y1), createPoint(x2, y2)]))
  );

  return {
    path: paths,
    // arc: arcs,
    boundary: boundary.flatMap((p) => [p.x, p.y]),
    dimensions,
    backTopLines,
    backLines,
    backArcs,
    backBottomLines,
    rightTopLines,
    rightTopArcs,
    rightLines,
    rightBottomArcs,
    rightBottomLines,
    frontTopLines,
    frontLines,
    frontArcs,
    frontBottomLines,
    leftTopLines,
    leftTopArcs,
    leftLines,
    leftBottomArcs,
    leftBottomLines,
    fixedFlapLines,
  };
};

export default generateDieline;
