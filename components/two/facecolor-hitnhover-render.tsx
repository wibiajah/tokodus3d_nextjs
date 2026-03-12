import { Boundary } from "@/models/types";
import { useDesignStore } from "@/store/design-store";
import React from "react";
import { Shape } from "react-konva";
interface FacecolorHitnhoverParams {
  shapeEntries: [string, Boundary[]][];
}
export default function FacecolorHitnhoverRender({
  shapeEntries,
}: FacecolorHitnhoverParams) {
  const activeShape = useDesignStore((s) => s.activeShape);
  const hoveredShape = useDesignStore((s) => s.hoveredShape);
  return (
    <>
      {shapeEntries.map(([id, shapes]) => {
        const isActive = activeShape === id;
        const isHovered = hoveredShape === id;
        return (
          <Shape
            key={id}
            // stroke={"#2563eb"}
            stroke={isActive ? "#2563eb" : isHovered ? "#3b82f6" : undefined}
            strokeWidth={isActive ? 2 : isHovered ? 1 : 0}
            // strokeWidth={1}
            shadowColor={isActive ? "#2563eb" : undefined}
            shadowBlur={isActive ? 4 : 0}
            sceneFunc={(ctx, konvaShape) => {
              if (!shapes || shapes.length < 2) return;
              ctx.beginPath();
              ctx.moveTo(shapes[0].x, shapes[0].y);
              for (let i = 1; i < shapes.length; i++) {
                const point = shapes[i];
                if (point.r) {
                  const next = shapes[i + 1];
                  if(point.r > 0){
                    ctx.arcTo(point.x, point.y, next.x, next.y, point.r);
                  } else {// arc menghadap keluar jika minus
                    arcToOut(ctx ,point.x, point.y, next.x, next.y, Math.abs(point.r));
                  }
                } else {
                  ctx.lineTo(point.x, point.y);
                }
              }
              ctx.closePath();
              ctx.fillStrokeShape(konvaShape);
            }}
          />
        );
      })}
    </>
  );
}
/**
 * digambar searah jarum jam untuk arc menghadap ke luar
 * cek selisih dari titik sekarang dan selanjutnya
 * 1. operasikan dengan r dulu baru dicek dengan selisih
 * lalu memenuhi kriteria yg mana
 */
export function arcToOut(
  ctx: any,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r: number,
) {
  const topright = y1 + r; //y+r
  const bottomright = x1 - r; //x-r
  const bottomleft = y1 - r; //y-r
  const topleft = x1 + r; //x+r
  let startAngle = 0;
  let endAngle = 0;
  if (topright === y2) {
    startAngle = Math.PI;
    endAngle = Math.PI * 0.5;
  } else if (bottomright === x2) {
    startAngle = Math.PI * 1.5;
    endAngle = Math.PI;
  } else if (bottomleft === y2) {
    endAngle = Math.PI * 1.5;
  } else if (topleft === x2) {
    startAngle = Math.PI * 0.5;
  } else {
    return;
  }
  ctx.arc(x1, y1, r, startAngle, endAngle, true);
}
