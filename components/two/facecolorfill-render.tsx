import { Boundary, Point } from "@/models/types";
import {
  GradientColor,
  Side,
  ToolMode,
  useDesignStore,
} from "@/store/design-store";
import React from "react";
import { Shape } from "react-konva";
import { arcToOut } from "./facecolor-hitnhover-render";
import Konva from "konva";
interface FacecolorFillParams {
  main: Konva.Group;
  mode: ToolMode;
  side: Side;
  shapeEntries: [string, Boundary[]][];
}
export default function FacecolorFillRender({
  main,
  mode,
  side,
  shapeEntries,
}: FacecolorFillParams) {
  const faceColors = useDesignStore((s) => s.faceColors);
  const setHoveredShape = useDesignStore((s) => s.setHoveredShape);
  const setActiveShape = useDesignStore((s) => s.setActiveShape);
  const setPickerPosition = useDesignStore((s) => s.setPickerPosition);
  const handleShapeClick = (id: string, evt: any, shapes: Boundary[]) => {
    setActiveShape(id);
    const area = calcBounds(shapes);
    const stage = evt.target.getStage();
    const stageBox = stage.container().getBoundingClientRect();
    // Dapatkan transformasi dari main group
    const transform = main.getAbsoluteTransform();
    // Hitung center point dari shape dalam canvas space
    const centerX = area.x + area.w / 2;
    const centerY = area.y; // gunakan top dari shape
    // Transform ke absolute position (screen space)
    const absolutePos = transform.point({ x: centerX, y: centerY });
    // Konversi ke screen coordinates dengan offset dari stage
    const screenX = stageBox.left + absolutePos.x;
    const screenY = stageBox.top + absolutePos.y;
    setPickerPosition({
      x: screenX,
      y: screenY,
    });
  };
  return (
    <>
      {shapeEntries.map(([id, shapes]) => {
        const face = faceColors.find((f) => f.id === id && f.side === side);
        const drawPath = (ctx: any) => {
          ctx.beginPath();
          ctx.moveTo(shapes[0].x, shapes[0].y);
          for (let i = 1; i < shapes.length; i++) {
            const point = shapes[i];
            if (point.r) {
              const next = shapes[i + 1];
              if (point.r > 0) {
                ctx.arcTo(point.x, point.y, next.x, next.y, point.r);
              } else {
                arcToOut(
                  ctx,
                  point.x,
                  point.y,
                  next.x,
                  next.y,
                  Math.abs(point.r),
                );
              }
            } else {
              ctx.lineTo(point.x, point.y);
            }
          }
          ctx.closePath();
        };
        if (!face || face.type === "solid") {
          const color = (face?.color as string) ?? "transparent";
          return (
            <Shape
              key={id}
              fill={color}
              onMouseEnter={() => setHoveredShape(id)}
              onMouseLeave={() => setHoveredShape(null)}
              onClick={(evt) =>
                mode === "select" && handleShapeClick(id, evt, shapes)
              }
              sceneFunc={(ctx, konvaShape) => {
                drawPath(ctx);
                ctx.fillStrokeShape(konvaShape);
              }}
            />
          );
        }
        const coor = calcBounds(shapes);
        const minX = coor.x;
        const minY = coor.y;
        const maxX = coor.maxX;
        const maxY = coor.maxY;
        const cx = coor.cx;
        const cy = coor.cy;
        const gradientColor = face.color as GradientColor;
        const { angle, stops } = gradientColor;
        // agar gradient memanjang melewati seluruh bounding box shape
        const rad = ((angle - 90) * Math.PI) / 180;
        const dx = Math.cos(rad);
        const dy = Math.sin(rad);
        // Proyeksikan sudut-sudut bounding box ke arah gradient
        // untuk menentukan panjang gradient yang pas
        const corners = [
          { x: minX, y: minY },
          { x: maxX, y: minY },
          { x: maxX, y: maxY },
          { x: minX, y: maxY },
        ];
        const projections = corners.map(
          (p) => (p.x - cx) * dx + (p.y - cy) * dy,
        );
        const projMin = Math.min(...projections);
        const projMax = Math.max(...projections);
        const x1 = cx + dx * projMin;
        const y1 = cy + dy * projMin;
        const x2 = cx + dx * projMax;
        const y2 = cy + dy * projMax;
        return (
          <Shape
            key={id}
            onMouseEnter={() => setHoveredShape(id)}
            onMouseLeave={() => setHoveredShape(null)}
            onClick={(evt) =>
              mode === "select" && handleShapeClick(id, evt, shapes)
            }
            sceneFunc={(ctx) => {
              // Buat linear gradient berdasarkan angle + stops
              const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
              const sorted = [...stops].sort((a, b) => a.position - b.position);
              for (const stop of sorted) {
                gradient.addColorStop(stop.position / 100, stop.color);
              }
              drawPath(ctx);
              ctx.fillStyle = gradient;
              ctx.fill();
            }}
            hitFunc={(ctx, konvaShape) => {
              drawPath(ctx);
              ctx.fillStrokeShape(konvaShape);
            }}
          />
        );
      })}
    </>
  );
}
function calcBounds(points: Point[]) {
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
  const h = maxY - minY;
  const w = maxX - minX;
  return {
    x: minX,
    y: minY,
    maxX,
    maxY,
    w,
    h,
    cx: minX + w / 2,
    cy: minY + h / 2,
  };
}
