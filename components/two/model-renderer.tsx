"use client";
import React, { useMemo } from "react";
import { Group, Line, Arc, Image, Rect, Shape } from "react-konva";
import { DimensionLegend } from "./dimension-legend";
import { DesignModel } from "@/models/types";
import { Side, useDesignStore } from "@/store/design-store";
import useImage from "use-image";
interface ModelRendererProps {
  model: DesignModel;
  side: Side;
}
// ─────────────────────────────────────────────────────────────
//  textureMap — 2D dieline background texture
//  File tersedia di public/textures/:
//    brown-kraft.png, white-kraft.png, premium-white.png,
//    ivory.png, art-paper.png, kraft.png, duplex.png,
//    carton.png, edge.jpeg, even.png
// ─────────────────────────────────────────────────────────────
export const textureMap: Record<string, string> = {
  // Legacy string keys
  brown_kraft:   "/textures/brown-kraft.png",
  white_kraft:   "/textures/white-kraft.png",
  premium_white: "/textures/premium-white.png",
  // Material type code keys
  K:  "/textures/brown-kraft.png",    // brown kraft
  W:  "/textures/white-kraft.png",    // white kraft
  D:  "/textures/premium-white.png",  // premium white
  IV: "/textures/ivory.png",          // ivory
  AP: "/textures/art-paper.png",      // art paper
  KP: "/textures/kraft.png",          // kraft
  DX: "/textures/duplex.png",         // duplex
  // Numeric ID keys (dari Laravel material_types.id)
  "1":  "/textures/brown-kraft.png",   // brown kraft
  "2":  "/textures/white-kraft.png",   // white kraft
  "3":  "/textures/premium-white.png", // premium white
  "6":  "/textures/ivory.png",         // ivory
  "7":  "/textures/art-paper.png",     // art paper
  "20": "/textures/kraft.png",         // kraft
  "22": "/textures/duplex.png",        // duplex
};
export function ModelRenderer({ model, side }: ModelRendererProps) {
  const dieline = useMemo(() => model.getDieline(), [model]);
  const clip = useMemo(() => model.getClipPath(), [model]);
  const imageAreas = useMemo(() => model.getImageAreas(), [model]);
  const innerColor = useDesignStore((s) => s.innerColor);
  const outerColor = useDesignStore((s) => s.outerColor);
  const material = useDesignStore((s) => s.material);
  const selected = {
    inner: textureMap[material.inner.id] ?? textureMap["brown_kraft"],
    outer: textureMap[material.outer.id] ?? textureMap["brown_kraft"],
  };
  const [imageInner] = useImage(selected.inner);
  const [imageOuter] = useImage(selected.outer);
  return (
    <Group listening={false}>
      {(side === "inner" ? imageInner : imageOuter) && (
        <Group
          name="clip"
          clipFunc={(ctx: any) => {
            const boundary = clip;
            if (!boundary || boundary.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(boundary[0].x, boundary[0].y);
            for (let i = 1; i < boundary.length; i++) {
              const point = boundary[i];
              if (point.r) {
                const next = boundary[i + 1];
                ctx.arcTo(point.x, point.y, next.x, next.y, point.r);
              } else {
                ctx.lineTo(point.x, point.y);
              }
            }
            ctx.closePath();
          }}
        >
          <Image
            image={side === "inner" ? imageInner : imageOuter}
            x={imageAreas.x}
            y={imageAreas.y}
            width={imageAreas.width}
            height={imageAreas.height}
            listening={false}
          />
          <Rect
            x={imageAreas.x}
            y={imageAreas.y}
            width={imageAreas.width}
            height={imageAreas.height}
            fill={side === "inner" ? innerColor : outerColor}
            // globalCompositeOperation="multiply"
            globalCompositeOperation="source-over"
            // globalCompositeOperation="overlay"
            listening={false}
          />
        </Group>
      )}
      <Shape
        sceneFunc={(ctx, shape) => {
          const boundary = clip;
          if (!boundary || boundary.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(boundary[0].x, boundary[0].y);
          for (let i = 1; i < boundary.length; i++) {
            const point = boundary[i];
            if (point.r) {
              const next = boundary[i + 1];
              ctx.arcTo(point.x, point.y, next.x, next.y, point.r);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          }
          ctx.closePath();
          ctx.strokeShape(shape);
        }}
        stroke="black"
        strokeWidth={1}
      />
      {dieline.lines.map((l, i) => (
        <Line
          key={i}
          points={l.points}
          stroke={l.stroke}
          strokeWidth={l.strokeWidth}
          dash={l.dash}
          lineCap="round"
          lineJoin="round"
          listening={false}
        />
      ))}
      {dieline.arcs.map((a, i) => (
        <Arc
          key={i}
          x={a.x}
          y={a.y}
          innerRadius={a.radius || 0}
          outerRadius={a.radius || 0}
          angle={a.angle || 0}
          rotation={a.rotation}
          stroke={a.stroke}
          strokeWidth={a.strokeWidth}
          dash={a.dash}
          listening={false}
        />
      ))}
      {dieline.dimensions && (
        <DimensionLegend dimensions={dieline.dimensions} side={side} />
      )}
    </Group>
  );
}