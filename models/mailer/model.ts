import { createPoint, createPath, createArc, createCurvePoint } from "../utils";
import {
  BoxParams,
  Lines,
  Arcs,
  ExportArea,
  DesignModel,
  Boundary,
} from "@/models/types";
const rules = [
  { max: 20, fixed: 10 },
  { max: 40, fixed: 20 },
  { max: 60, fixed: 30 },
  { max: 80, fixed: 40 },
];
export function getFbyH(h: number, three: boolean = false) {
  const nh = three ? h * 100 : h;
  for (const r of rules) {
    if (nh <= r.max) return three ? r.fixed / 100 : r.fixed;
  }
  return three
    ? rules[rules.length - 1].fixed / 100
    : rules[rules.length - 1].fixed;
}
export function getEbyF(f: number) {
  return f * (Math.sin(Math.PI / 6) / Math.sin(Math.PI / 3));
}
export function getDynamicDimension(
  l: number,
  d: number,
  otl: number,
  ofl: number,
  osl: number,
  xdf2wt: number,
  xdft2w: number,
  yt: number,
  ydtotl: number,
  ydt2otl: number,
  x3df3t2wmqd: number,
  xddf3t2w: number,
  xdf3t2w: number,
  xddf3t2wmqd: number,
  hf: number,
) {
  let boundary;
  let extra;
  let hole;
  // scala 2d
  const ydt = yt + d;
  const hd = d / 2;
  const qd = hd / 2;
  const fh = [
    [
      createPoint(xdf2wt - hd, ydt + l / 2 - hf),
      createPoint(xdf2wt - hd, ydtotl),
      createPoint(xdf2wt + qd, ydtotl),
      createPoint(xdf2wt + qd, ydt2otl),
      createPoint(xdf2wt - hd, ydt2otl),
      createPoint(xdf2wt - hd, ydt + l / 2 + hf),
    ],
  ];
  if (l < 120) {
    // 1hole;otl+dd
    boundary = [
      createPoint(xddf3t2w, yt + otl + hd + qd),
      createPoint(x3df3t2wmqd, ydtotl),
      createPoint(x3df3t2wmqd, ydt2otl + hd),
      createPoint(xddf3t2w, ydt2otl + hd + qd),
    ];
    extra = [
      createPoint(xdf3t2w, ydtotl + qd),
      createPoint(xddf3t2wmqd, ydtotl + hd),
      createPoint(xddf3t2wmqd, ydt2otl),
      createPoint(xdf3t2w, ydt2otl + qd),
    ];
    hole = [
      [
        createPoint(xdft2w - hd, ydtotl),
        createPoint(xdft2w - d - qd, ydtotl),
        createPoint(xdft2w - d - qd, ydt2otl),
        createPoint(xdft2w - hd, ydt2otl),
        createPoint(xdft2w - hd, ydtotl),
      ],
      ...fh,
    ];
  } else if (l < 350) {
    // 2hole;ofl
    const ytofl = yt + ofl;
    const ydtofl = ytofl + d;
    const ydt2ofl = ydtofl + ofl;
    const ydt3ofl = ydt2ofl + ofl;
    const ydt4ofl = ydt3ofl + ofl;
    boundary = [
      createPoint(xddf3t2w, ytofl + hd + qd),
      createPoint(x3df3t2wmqd, ydtofl),
      createPoint(x3df3t2wmqd, ydt2ofl + hd),
      createPoint(xddf3t2w, ydt2ofl + hd + qd),
      createPoint(xddf3t2w, ydt3ofl + qd),
      createPoint(x3df3t2wmqd, ydt3ofl + hd),
      createPoint(x3df3t2wmqd, ydt4ofl),
      createPoint(xddf3t2w, ydt4ofl + qd),
    ];
    extra = [
      createPoint(xdf3t2w, ydtofl + qd),
      createPoint(xddf3t2wmqd, ydtofl + hd),
      createPoint(xddf3t2wmqd, ydt2ofl),
      createPoint(xdf3t2w, ydt2ofl + qd),
      createPoint(xdf3t2w, ydt3ofl + hd + qd),
      createPoint(xddf3t2wmqd, ydt3ofl + d),
      createPoint(xddf3t2wmqd, ydt4ofl + hd - d),
      createPoint(xdf3t2w, ydt4ofl + hd + qd - d),
    ];
    hole = [
      [
        createPoint(xdft2w - hd, ydtofl),
        createPoint(xdft2w - d - qd, ydtofl),
        createPoint(xdft2w - d - qd, ydt2ofl),
        createPoint(xdft2w - hd, ydt2ofl),
        createPoint(xdft2w - hd, ydtofl),
      ],
      [
        createPoint(xdft2w - hd, ydt3ofl),
        createPoint(xdft2w - d - qd, ydt3ofl),
        createPoint(xdft2w - d - qd, ydt4ofl),
        createPoint(xdft2w - hd, ydt4ofl),
        createPoint(xdft2w - hd, ydt3ofl),
      ],
      ...fh,
    ];
  } else {
    // 3hole;osl
    const ytosl = yt + osl;
    const ydtosl = ytosl + d;
    const ydt2osl = ydtosl + osl;
    const ydt3osl = ydt2osl + osl;
    const ydt4osl = ydt3osl + osl;
    const ydt5osl = ydt4osl + osl;
    const ydt6osl = ydt5osl + osl;
    boundary = [
      createPoint(xddf3t2w, ytosl + hd + qd),
      createPoint(x3df3t2wmqd, ydtosl),
      createPoint(x3df3t2wmqd, ydt2osl + hd),
      createPoint(xddf3t2w, ydt2osl + hd + qd),
      createPoint(xddf3t2w, ydt3osl + qd),
      createPoint(x3df3t2wmqd, ydt3osl + hd),
      createPoint(x3df3t2wmqd, ydt4osl),
      createPoint(xddf3t2w, ydt4osl + qd),
      createPoint(xddf3t2w, ydt5osl + qd),
      createPoint(x3df3t2wmqd, ydt5osl + hd),
      createPoint(x3df3t2wmqd, ydt6osl),
      createPoint(xddf3t2w, ydt6osl + qd),
    ];
    extra = [
      createPoint(xdf3t2w, ydtosl + qd),
      createPoint(xddf3t2wmqd, ydtosl + hd),
      createPoint(xddf3t2wmqd, ydt2osl),
      createPoint(xdf3t2w, ydt2osl + qd),
      createPoint(xdf3t2w, ydt3osl + hd + qd),
      createPoint(xddf3t2wmqd, ydt3osl + d),
      createPoint(xddf3t2wmqd, ydt4osl + hd - d),
      createPoint(xdf3t2w, ydt4osl + hd + qd - d),
      createPoint(xdf3t2w, ydt5osl + hd + qd),
      createPoint(xddf3t2wmqd, ydt5osl + d),
      createPoint(xddf3t2wmqd, ydt6osl + hd - d),
      createPoint(xdf3t2w, ydt6osl + hd + qd - d),
    ];
    hole = [
      [
        createPoint(xdft2w - hd, ydtosl),
        createPoint(xdft2w - d - qd, ydtosl),
        createPoint(xdft2w - d - qd, ydt2osl),
        createPoint(xdft2w - hd, ydt2osl),
        createPoint(xdft2w - hd, ydtosl),
      ],
      [
        createPoint(xdft2w - hd, ydt3osl),
        createPoint(xdft2w - d - qd, ydt3osl),
        createPoint(xdft2w - d - qd, ydt4osl),
        createPoint(xdft2w - hd, ydt4osl),
        createPoint(xdft2w - hd, ydt3osl),
      ],
      [
        createPoint(xdft2w - hd, ydt5osl),
        createPoint(xdft2w - d - qd, ydt5osl),
        createPoint(xdft2w - d - qd, ydt6osl),
        createPoint(xdft2w - hd, ydt6osl),
        createPoint(xdft2w - hd, ydt5osl),
      ],
      ...fh,
    ];
  }
  return { boundary, extra, hole };
}
export default function createMailerBoxModel(params: BoxParams): DesignModel {
  const { size, flute = "F" } = params;
  const sizeScale = 1;
  const length = size.length * sizeScale;
  const width = size.width * sizeScale;
  const height = size.height * sizeScale;
  const depth = size.depth * sizeScale;
  const startX = 0;
  const startY = 0;
  const hd = depth / 2;
  const qd = hd / 2;
  const hl = length / 2;
  const otl = length / 3;
  const ofl = length / 5;
  const osl = length / 7;
  const f = getFbyH(height);
  const hf = f / 2;
  const e = getEbyF(f);
  // x
  const xd = startX + depth;
  const xf = startX + f;
  const xdf = xf + depth;
  const xddf = xdf + depth;
  const xfhd = xf + hd;
  const xdfw = xdf + width;
  const xdfwmhd = xdfw - hd;
  const xdfwmhdqd = xdfwmhd - qd;
  const xdfwt = xdfw + height;
  const xdfwtmhd = xdfw + height - hd;
  const xdfwtmqd = xdfwt - qd;
  const xdft2w = xdfwt + width;
  const xdft2wmhd = xdft2w - hd;
  const xdft2wmhdqd = xdft2wmhd - qd;
  const xdft = xdf + height;
  const xddft = xdft + depth;
  const xddf2wt = xdft2w + height + depth;
  const xddf2wtmqd = xddf2wt - qd;
  const xdf2wt = xddf2wt - depth;
  const xdf2wtmhd = xdf2wt - hd;
  const xdf2wtmd = xdf2wt - depth;
  const xdf2wtqd = xdf2wt + qd;
  const xdf3t2w = xdf2wt + height;
  const xddf3t2w = xddf2wt + height;
  const xddf3t2wmqd = xddf3t2w - qd;
  const x3df3t2w = xddf3t2w + depth;
  const x3df3t2wmqd = x3df3t2w - qd;
  // y
  const yd = startY + depth;
  const yt = startY + height;
  const ythd = yt + hd;
  const ydthd = ythd + depth;
  const yqd = startY + qd;
  const ydqd = yqd + depth;
  const ytqd = yt + qd;
  const ydtqd = ytqd + depth;
  const ydt = yt + depth;
  const ydtl = ydt + length;
  const yddlt = ydtl + depth;
  const yddl2t = yddlt + height;
  const yddl2tmqd = yddl2t - qd;
  const ydl2t = yddl2t - depth;
  const ydl2tmqd = ydl2t - qd;
  const ydtmqd = ydt - qd;
  const ydthl = ydt + hl;
  const yddtl = ydtl + depth;
  const ytlqd = ydtl + qd - depth;
  const ydtlmqd = ydtl - qd;
  const yddtlmqd = ydtl + depth - qd;
  const ydtlqd = ydtl + qd;
  const ytotl = yt + otl;
  const ytotlqd = ytotl + qd;
  const ydtotlqd = ytotlqd + depth;
  const yddtotlqd = ydtotlqd + depth;
  const ydtotl = ytotl + depth;
  const ytotle = ytotl + e;
  const ytotleqd = ytotle + qd;
  const ydtotleqd = ytotleqd + depth;
  const ydtotle = ytotle + depth;
  const ydet2otl = ydtotle + otl;
  const ydt2otl = ydet2otl - e;
  const yt2otlqd = ydt2otl - depth + qd;
  const yddt2otlqd = ydt2otl + depth + qd;
  const ydt2otlqd = yddt2otlqd - depth;
  const yddt2otlqdme = yddt2otlqd - e;
  const ydt2otlqdme = yddt2otlqdme - depth;

  const dynamic = getDynamicDimension(
    length,
    depth,
    otl,
    ofl,
    osl,
    xdf2wt,
    xdft2w,
    yt,
    ydtotl,
    ydt2otl,
    x3df3t2wmqd,
    xddf3t2w,
    xdf3t2w,
    xddf3t2wmqd,
    hf,
  );

  const lines: Lines[] = [];
  const arcs: Arcs[] = [];
  const fixedLines: Lines[] = [];
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
  const extraLines: Lines[] = [];
  const bridgeTLines: Lines[] = [];
  const bridgeBLines: Lines[] = [];
  const holeLines: Lines[] = [];
  const backArcs: Arcs[] = [];
  const frontArcs: Arcs[] = [];
  const holeArcs: Arcs[] = [];
  const boundary = [
    createPoint(startX, ytotleqd), //most left n top
    createPoint(xf, ytotlqd),
    createPoint(xf, ytqd),
    createPoint(xdf, ytqd), //menjorok sedikit
    createCurvePoint(xdf, yqd, height), //bikin lengkungan 1/4?
    createPoint(xdft, yqd),
    createPoint(xdfwmhdqd, yqd),
    createPoint(xdfwmhdqd, startY),
    createPoint(xdf2wt, startY), //top right
    createPoint(xdf2wt, yt),
    createPoint(xddf2wtmqd, ythd),
    createPoint(xddf3t2w, ythd), // down
    ...dynamic.boundary,
    createPoint(xddf3t2w, ydtlqd), // to left
    createPoint(xddf2wtmqd, ydtlqd),
    createPoint(xdf2wt, yddtl), //down
    createPoint(xdf2wt, yddl2t), //to left; bottom right
    createPoint(xdfwmhdqd, yddl2t), //to left
    createPoint(xdfwmhdqd, yddl2tmqd), //to left
    createPoint(xdft, yddl2tmqd), //to left
    createCurvePoint(xdf, yddl2tmqd, height), //lengkungan
    createPoint(xdf, yddtlmqd), //menjorok sedikit
    createPoint(xf, yddtlmqd), //bottom left
    createPoint(xf, yddt2otlqd),
    createPoint(startX, yddt2otlqdme),
    createPoint(startX, ytotleqd),
  ];
  const fixedLinesCut = [
    createPoint(xdf, yddtotlqd),
    createPoint(xfhd, ydtotlqd),
    createPoint(xd, ydtotleqd),
    createPoint(xd, ydt2otlqdme),
    createPoint(xfhd, ydt2otlqd),
    createPoint(xdf, yt2otlqd),
  ];
  const fixedLinesFold = [
    createPoint(xdf, yddtotlqd),
    createPoint(xdf, yt2otlqd),
  ];
  fixedLines.push(createPath(fixedLinesCut, "cut"));
  fixedLines.push(createPath(fixedLinesFold, "fold"));
  const frontTopLinesCut = [
    createPoint(xddft, ydqd),
    createPoint(xdfwmhdqd, ydqd),
    createPoint(xdfwmhdqd, ydtqd),
  ];
  const frontTopLinesFold = [
    createPoint(xdfwmhdqd, ydtqd),
    createPoint(xddf, ydtqd),
  ];
  frontTopLines.push(createPath(frontTopLinesCut, "cut"));
  frontTopLines.push(createPath(frontTopLinesFold, "fold"));
  const frontLinesCut1 = [
    createPoint(xddf, ydtqd),
    createPoint(xdf, ydtqd),
    createPoint(xdf, yddtotlqd),
  ];
  const frontLinesT1 = [
    createPoint(xdf, yddtotlqd),
    createPoint(xdf, yt2otlqd),
  ];
  const frontLinesCut2 = [
    createPoint(xdf, yt2otlqd),
    createPoint(xdf, ydtlmqd),
    createPoint(xddf, ydtlmqd),
  ];
  const frontLinesFold1 = [
    createPoint(xddf, ydtlmqd),
    createPoint(xdfwmhdqd, ydtlmqd),
  ];
  const frontLinesCut3 = [
    createPoint(xdfwmhdqd, ydtlmqd),
    createPoint(xdfwmhd, ydtl),
  ];
  const frontLinesFold2 = [
    createPoint(xdfwmhd, ydtl),
    createPoint(xdfwmhd, ydt),
  ];
  const frontLinesCut4 = [
    createPoint(xdfwmhd, ydt),
    createPoint(xdfwmhdqd, ydtqd),
  ];
  const frontLinesT2 = [
    createPoint(xdfwmhdqd, ydtqd),
    createPoint(xddf, ydtqd),
  ];
  frontLines.push(createPath(frontLinesCut1, "cut"));
  frontLines.push(createPath(frontLinesT1));
  frontLines.push(createPath(frontLinesCut2, "cut"));
  frontLines.push(createPath(frontLinesFold1, "fold"));
  frontLines.push(createPath(frontLinesCut3, "cut"));
  frontLines.push(createPath(frontLinesFold2, "fold"));
  frontLines.push(createPath(frontLinesCut4, "cut"));
  frontLines.push(createPath(frontLinesT2));
  const frontBottomLinesCut = [
    createPoint(xddft, ydl2tmqd),
    createPoint(xdfwmhdqd, ydl2tmqd),
    createPoint(xdfwmhdqd, ydtlmqd),
  ];
  const frontBottomLinesFold = [
    createPoint(xdfwmhdqd, ydtlmqd),
    createPoint(xddf, ydtlmqd),
  ];
  frontBottomLines.push(createPath(frontBottomLinesCut, "cut"));
  frontBottomLines.push(createPath(frontBottomLinesFold));
  const frontArcsCut = [
    {
      x: xddft,
      y: ydtqd,
      radius: height,
      angle: 90,
      rotation: 180,
    },
    {
      x: xddft,
      y: ydtlmqd,
      radius: height,
      angle: 90,
      rotation: 90,
    },
  ];
  frontArcsCut.forEach((a) => frontArcs.push(createArc(a, "cut")));
  const rightTopLinesCut = [
    createPoint(xdfwtmqd, yd),
    createPoint(xdfw, yd),
    createPoint(xdfw, ydtmqd),
    createPoint(xdfwtmqd, ydtmqd),
  ];
  const rightTopLinesFold = [
    createPoint(xdfwtmqd, yd),
    createPoint(xdfwtmqd, ydtmqd),
  ];
  rightTopLines.push(createPath(rightTopLinesCut, "cut"));
  rightTopLines.push(createPath(rightTopLinesFold, "fold"));
  const rightLinesCut1 = [
    createPoint(xdfwmhd, ydt),
    createPoint(xdfwtmhd, ydt),
  ];
  const rightLinesFold = [
    createPoint(xdfwtmhd, ydt),
    createPoint(xdfwtmhd, ydtl),
  ];
  const rightLinesCut2 = [
    createPoint(xdfwtmhd, ydtl),
    createPoint(xdfwmhd, ydtl),
  ];
  const rightLinesT = [createPoint(xdfwmhd, ydtl), createPoint(xdfwmhd, ydt)];
  rightLines.push(createPath(rightLinesCut1, "cut"));
  rightLines.push(createPath(rightLinesFold, "fold"));
  rightLines.push(createPath(rightLinesCut2, "cut"));
  rightLines.push(createPath(rightLinesT));
  const rightBottomLinesCut = [
    createPoint(xdfwtmqd, ydtlqd),
    createPoint(xdfw, ydtlqd),
    createPoint(xdfw, ydl2t),
    createPoint(xdfwtmqd, ydl2t),
  ];
  const rightBottomLinesFold = [
    createPoint(xdfwtmqd, ydtlqd),
    createPoint(xdfwtmqd, ydl2t),
  ];
  rightBottomLines.push(createPath(rightBottomLinesCut, "cut"));
  rightBottomLines.push(createPath(rightBottomLinesFold, "fold"));
  const backTopLinesCut1 = [
    createPoint(xdft2wmhdqd, yd),
    createPoint(xdfwtmqd, yd),
  ];
  const backTopLinesT = [
    createPoint(xdfwtmqd, yd),
    createPoint(xdfwtmqd, ydtmqd),
  ];
  const backTopLinesCut2 = [
    createPoint(xdfwtmqd, ydtmqd),
    createPoint(xdfwtmqd, ydt),
  ];
  const backTopLinesFold1 = [
    createPoint(xdfwtmqd, ydt),
    createPoint(xdft2wmhdqd, ydt),
  ];
  const backTopLinesCut3 = [
    createPoint(xdft2wmhdqd, ydt),
    createPoint(xdft2wmhdqd, ydtmqd),
  ];
  const backTopLinesFold2 = [
    createPoint(xdft2wmhdqd, ydtmqd),
    createPoint(xdft2wmhdqd, yd),
  ];
  backTopLines.push(createPath(backTopLinesCut1, "cut"));
  backTopLines.push(createPath(backTopLinesT));
  backTopLines.push(createPath(backTopLinesCut2, "cut"));
  backTopLines.push(createPath(backTopLinesFold1, "fold"));
  backTopLines.push(createPath(backTopLinesCut3, "cut"));
  backTopLines.push(createPath(backTopLinesFold2, "fold"));
  const backLinesCut1 = [
    createPoint(xdft2wmhd, ydt),
    createPoint(xdft2wmhdqd, ydt),
  ];
  const backLinesT1 = [
    createPoint(xdft2wmhdqd, ydt),
    createPoint(xdfwtmqd, ydt),
  ];
  const backLinesCut2 = [
    createPoint(xdfwtmqd, ydt),
    createPoint(xdfwtmhd, ydt),
  ];
  const backLinesT2 = [
    createPoint(xdfwtmhd, ydt),
    createPoint(xdfwtmhd, ydtl),
  ];
  const backLinesCut3 = [
    createPoint(xdfwtmhd, ydtl),
    createPoint(xdfwtmqd, ydtl),
  ];
  const backLinesFold1 = [
    createPoint(xdfwtmqd, ydtl),
    createPoint(xdft2wmhdqd, ydtl),
  ];
  const backLinesCut4 = [
    createPoint(xdft2wmhdqd, ydtl),
    createPoint(xdft2wmhd, ydtl),
  ];
  const backLinesFold2 = [
    createPoint(xdft2wmhd, ydtl),
    createPoint(xdft2wmhd, ydt),
  ];
  backLines.push(createPath(backLinesCut1, "cut"));
  backLines.push(createPath(backLinesT1));
  backLines.push(createPath(backLinesCut2, "cut"));
  backLines.push(createPath(backLinesT2));
  backLines.push(createPath(backLinesCut3, "cut"));
  backLines.push(createPath(backLinesFold1, "fold"));
  backLines.push(createPath(backLinesCut4, "cut"));
  backLines.push(createPath(backLinesFold2, "fold"));
  const backBottomLinesT1 = [
    createPoint(xdft2wmhdqd, ydtl),
    createPoint(xdfwtmqd, ydtl),
  ];
  const backBottomLinesCut1 = [
    createPoint(xdfwtmqd, ydtl),
    createPoint(xdfwtmqd, ydtlqd),
  ];
  const backBottomLinesT2 = [
    createPoint(xdfwtmqd, ydtlqd),
    createPoint(xdfwtmqd, ydl2t),
  ];
  const backBottomLinesCut2 = [
    createPoint(xdfwtmqd, ydl2t),
    createPoint(xdft2wmhdqd, ydl2t),
  ];
  const backBottomLinesFold = [
    createPoint(xdft2wmhdqd, ydl2t),
    createPoint(xdft2wmhdqd, ydtlqd),
  ];
  const backBottomLinesCut3 = [
    createPoint(xdft2wmhdqd, ydtlqd),
    createPoint(xdft2wmhdqd, ydtl),
  ];
  backBottomLines.push(createPath(backBottomLinesT1));
  backBottomLines.push(createPath(backBottomLinesCut1, "cut"));
  backBottomLines.push(createPath(backBottomLinesT2));
  backBottomLines.push(createPath(backBottomLinesCut2, "cut"));
  backBottomLines.push(createPath(backBottomLinesFold, "fold"));
  backBottomLines.push(createPath(backBottomLinesCut3, "cut"));
  const leftTopLinesCut = [
    createPoint(xdft2wmhdqd, yd),
    createPoint(xdf2wtmd, yd),
    createPoint(xdf2wtmd, ydtmqd),
    createPoint(xdft2wmhdqd, ydtmqd),
  ];
  const leftTopLinesT = [
    createPoint(xdft2wmhdqd, yd),
    createPoint(xdft2wmhdqd, ydtmqd),
  ];
  leftTopLines.push(createPath(leftTopLinesCut, "cut"));
  leftTopLines.push(createPath(leftTopLinesT));
  const leftLinesCut1 = [
    createPoint(xdf2wtmhd, ydt),
    createPoint(xdft2wmhd, ydt),
  ];
  const leftLinesT1 = [
    createPoint(xdft2wmhd, ydt),
    createPoint(xdft2wmhd, ydtl),
  ];
  const leftLinesCut2 = [
    createPoint(xdft2wmhd, ydtl),
    createPoint(xdf2wtmhd, ydtl),
  ];
  const leftLinesFold1 = [
    createPoint(xdf2wtmhd, ydtl),
    createPoint(xdf2wtmhd, ydt2otl),
  ];
  const leftLinesT2 = [
    createPoint(xdf2wtmhd, ydt2otl),
    createPoint(xdf2wtmhd, ydtotl),
  ];
  const leftLinesFold2 = [
    createPoint(xdf2wtmhd, ydtotl),
    createPoint(xdf2wtmhd, ydt),
  ];
  leftLines.push(createPath(leftLinesCut1, "cut"));
  leftLines.push(createPath(leftLinesT1));
  leftLines.push(createPath(leftLinesCut2, "cut"));
  leftLines.push(createPath(leftLinesFold1, "fold"));
  leftLines.push(createPath(leftLinesT2));
  leftLines.push(createPath(leftLinesFold2, "fold"));
  const leftBottomLinesCut = [
    createPoint(xdft2wmhdqd, ydtlqd),
    createPoint(xdf2wtmd, ydtlqd),
    createPoint(xdf2wtmd, ydl2t),
    createPoint(xdft2wmhdqd, ydl2t),
  ];
  const leftBottomLinesT = [
    createPoint(xdft2wmhdqd, ydtlqd),
    createPoint(xdft2wmhdqd, ydl2t),
  ];
  leftBottomLines.push(createPath(leftBottomLinesCut, "cut"));
  leftBottomLines.push(createPath(leftBottomLinesT));
  const bridgeTLinesCut = [
    createPoint(xdf2wtmhd, ydt),
    createPoint(xdf2wtqd, ydthd),
  ];
  const bridgeTLinesT = [
    createPoint(xdf2wtqd, ydthd),
    createPoint(xdf2wtqd, ydtotl),
    createPoint(xdf2wtmhd, ydtotl),
    createPoint(xdf2wtmhd, ydt),
  ];
  const bridgeBLinesCut = [
    createPoint(xdf2wtqd, ytlqd),
    createPoint(xdf2wtmhd, ydtl),
  ];
  const bridgeBLinesT = [
    createPoint(xdf2wtmhd, ydtl),
    createPoint(xdf2wtmhd, ydt2otl),
    createPoint(xdf2wtqd, ydt2otl),
    createPoint(xdf2wtqd, ytlqd),
  ];
  bridgeTLines.push(createPath(bridgeTLinesCut, "cut"));
  bridgeTLines.push(createPath(bridgeTLinesT));
  bridgeBLines.push(createPath(bridgeBLinesCut, "cut"));
  bridgeBLines.push(createPath(bridgeBLinesT));
  const extraLinesCut = [
    createPoint(xdf2wtqd, ydthd),
    createPoint(xdf3t2w, ydthd),
    ...dynamic.extra,
    createPoint(xdf3t2w, ytlqd),
    createPoint(xdf2wtqd, ytlqd),
  ];
  const extraLinesFold = [
    createPoint(xdf2wtqd, ytlqd),
    createPoint(xdf2wtqd, ydthd),
  ];
  extraLines.push(createPath(extraLinesCut, "cut"));
  extraLines.push(createPath(extraLinesFold, "fold"));
  dynamic.hole.forEach((h) => {
    holeLines.push(createPath(h, "cut", 1, "red"));
  });
  const holeArcsCut = [
    {
      x: xdf2wtmhd,
      y: ydthl,
      radius: hf,
      angle: 180,
      rotation: 90,
    },
  ];
  const holeA: Boundary[] = [createCurvePoint(xdf2wtmhd, ydthl, hf)];
  holeArcsCut.forEach((a) => holeArcs.push(createArc(a, "cut", 1, "red")));
  function getDieline() {
    lines.push(...fixedLines);
    lines.push(...frontTopLines);
    lines.push(...frontLines);
    lines.push(...frontBottomLines);
    lines.push(...rightTopLines);
    lines.push(...rightLines);
    lines.push(...rightBottomLines);
    lines.push(...backTopLines);
    lines.push(...backLines);
    lines.push(...backBottomLines);
    lines.push(...leftTopLines);
    lines.push(...leftLines);
    lines.push(...leftBottomLines);
    lines.push(...bridgeTLines);
    lines.push(...bridgeBLines);
    lines.push(...extraLines);
    arcs.push(...frontArcs);
    arcs.push(...backArcs);
    return {
      lines,
      arcs,
      dimensions: [
        {
          label: "Panjang",
          value: length,
          length,
          x: xdfwt + width * 0.2,
          y: ydt,
          u: -length * 0.1,
          v: length * 0.47,
          ru: length * 0.1,
          rv: length * 0.47,
          vertical: true,
        },
        {
          label: "Lebar",
          value: width,
          length: width,
          x: xdfwtmhd,
          y: ydt + length * 0.1,
          u: width * 0.32,
          v: 0,
          ru: width * 0.67,
          rv: 0,
        },
        {
          label: "Tinggi",
          value: height,
          length: height,
          x: xdft2wmhd,
          y: ydt + length * 0.85,
          u: height * 0.15,
          v: 0,
          ru: height * 0.8,
          rv: 0,
        },
      ],
    };
  }
  function getClipPath() {
    return boundary;
  }
  function getShapes() {
    const nFixed = [...fixedLinesCut, ...fixedLinesFold];
    const nFrontTop = [
      ...frontTopLinesCut,
      ...frontTopLinesFold,
      createCurvePoint(xddf, ydqd, height),
      createPoint(xddft, ydqd),
    ];
    const nFront = [
      ...frontLinesCut1,
      ...frontLinesT1,
      ...frontLinesCut2,
      ...frontLinesFold1,
      ...frontLinesCut3,
      ...frontLinesFold2,
      ...frontLinesCut4,
      ...frontLinesT2,
    ];
    const nFrontBottom = [
      ...frontBottomLinesCut,
      ...frontBottomLinesFold,
      createCurvePoint(xddft, ydtlmqd, -height),
      createPoint(xddft, ydl2tmqd),
    ];
    const nRightTop = [...rightTopLinesCut, ...rightTopLinesFold];
    const nRight = [
      ...rightLinesCut1,
      ...rightLinesFold,
      ...rightLinesCut2,
      ...rightLinesT,
    ];
    const nRightBottom = [...rightBottomLinesCut, ...rightBottomLinesFold];
    const nBackTop = [
      ...backTopLinesCut1,
      ...backTopLinesT,
      ...backTopLinesCut2,
      ...backTopLinesFold1,
      ...backTopLinesCut3,
      ...backTopLinesFold2,
    ];
    const nBack = [
      ...backLinesCut1,
      ...backLinesT1,
      ...backLinesCut2,
      ...backLinesT2,
      ...backLinesCut3,
      ...backLinesFold1,
      ...backLinesCut4,
      ...backLinesFold2,
    ];
    const nBackBottom = [
      ...backBottomLinesT1,
      ...backBottomLinesCut1,
      ...backBottomLinesT2,
      ...backBottomLinesCut2,
      ...backBottomLinesFold,
      ...backBottomLinesCut3,
    ];
    const nLeftTop = [...leftTopLinesCut, ...leftTopLinesT];
    const nLeft = [
      ...leftLinesCut1,
      ...leftLinesT1,
      ...leftLinesCut2,
      ...leftLinesFold1,
      ...leftLinesT2,
      ...leftLinesFold2,
    ];
    const nLeftBottom = [...leftBottomLinesCut, ...leftBottomLinesT];
    const nBridgeT = [...bridgeTLinesCut, ...bridgeTLinesT];
    const nBridgeB = [...bridgeBLinesCut, ...bridgeBLinesT];
    const nExtra = [...extraLinesCut, ...extraLinesFold];
    return {
      fixed: nFixed,
      front_top: nFrontTop,
      front: nFront,
      front_bottom: nFrontBottom,
      right_top: nRightTop,
      right: nRight,
      right_bottom: nRightBottom,
      back_top: nBackTop,
      back: nBack,
      back_bottom: nBackBottom,
      left_top: nLeftTop,
      left: nLeft,
      left_bottom: nLeftBottom,
      bridge_top: nBridgeT,
      bridge_bottom: nBridgeB,
      extra: nExtra,
    };
  }
  function getExportAreas(): ExportArea[] {
    const areas: ExportArea[] = [];
    const refs = getShapes();
    type Point = { x: number; y: number };
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
      const is = id === "front_top" || id === "front_bottom";
      const a = is ? -depth : 0;
      const b = is ? depth * 1.25 : 0;
      const c = id === "fixed" ? -qd : 0;// not sure about this
      return {
        x: minX + a,
        y: minY + c,
        width: maxX - minX + b,
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
      width: x3df3t2wmqd,
      height: yddl2t,
    };
  }
  function getHoles() {
    return [...holeLines, ...holeArcs];
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
