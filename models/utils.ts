import { Point, PathType, ArcParams, Boundary, Lines, Arcs } from "./types";
export const createPoint = (x: number, y: number): Point => ({ x, y });
export const pointsToArray = (points: Point[]): number[] =>
  points.flatMap((p) => [p.x, p.y]);
export const createPath = (
  points: Point[],
  type: PathType = "transparent",
  strokeWidth: number = 0.5,
  color?: string,
) => ({
  kind: "line",
  points: pointsToArray(points),
  stroke: type === "transparent" ? "transparent" : (color ?? "#000"),
  strokeWidth,
  ...(type === "fold" && { dash: [8, 4] }),
});
export const createArc = (
  a: ArcParams,
  type: "cut" | "fold" = "cut",
  strokeWidth: number = 0.5,
  color?: string,
) => ({
  kind: "arc",
  x: a.x,
  y: a.y,
  radius: a.radius,
  angle: a.angle,
  rotation: a.rotation,
  stroke: color ?? "#000",
  strokeWidth,
  ...(type === "fold" && { dash: [8, 4] }),
});
export const createCurvePoint = (
  x: number,
  y: number,
  r: number,
): Boundary => ({ x, y, r });
export function lineToPoints(line: Lines): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < line.points.length; i += 2) {
    pts.push({
      x: line.points[i],
      y: line.points[i + 1],
    });
  }
  return pts;
}
