"use client";
import React, { useState, useMemo } from "react";
import { Text, Rect } from "react-konva";
import type { TextItem } from "@/store/design-store";

export interface CanvasTextItemProps {
  el: TextItem;
  mode: "select" | "pan";
  flip: number;
  dielineGuides?: { x: number[]; y: number[] };
  setGuides?: (g: { x: number[]; y: number[] }) => void;
  onSelect: (id: string) => void;
  onDblClick: (id: string) => void;
  updateText: (id: string, patch: Partial<TextItem>) => void;
}

/**
 * Komponen teks yang bisa di-drag, transform, dan punya efek hover border.
 */
const CanvasTextItem: React.FC<CanvasTextItemProps> = ({
  el,
  mode,
  flip,
  dielineGuides,
  setGuides,
  onSelect,
  onDblClick,
  updateText,
}) => {
  const [hovered, setHovered] = useState(false);

  // Hitung ukuran text (tanpa render duplikat ke layar)
  const { width, height } = useMemo(
    () => measureText(el),
    [el.text, el.font, el.fontSize],
  );

  return (
    <>
      {/* Border hover */}
      {hovered && mode === "select" && (
        <Rect
          x={el.x}
          y={el.y}
          width={width}
          height={height}
          stroke="dodgerblue"
          strokeWidth={1}
          dash={[4, 2]}
          scaleX={flip}
        />
      )}

      <Text
        {...el}
        fill={el.color}
        fontFamily={el.font}
        draggable={mode === "select" && el.draggable}
        scaleX={flip >= 0 ? 1 : -1}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => mode === "select" && onSelect(el.id)}
        onDblClick={() => onDblClick(el.id)}
        // onDragMove={(e) => {
        //   setHovered(false);
        //   const node = e.target;
        //   const box = node.getClientRect();
        //   const centerX = box.x + box.width / 2;
        //   const centerY = box.y + box.height / 2;
        //   const edges = {
        //     left: box.x,
        //     right: box.x + box.width,
        //     top: box.y,
        //     bottom: box.y + box.height,
        //   };

        //   const threshold = 3;
        //   const nearX = dielineGuides.x.find(
        //     (gx) =>
        //       Math.abs(gx - edges.left) < threshold ||
        //       Math.abs(gx - edges.right) < threshold ||
        //       Math.abs(gx - centerX) < threshold
        //   );
        //   const nearY = dielineGuides.y.find(
        //     (gy) =>
        //       Math.abs(gy - edges.top) < threshold ||
        //       Math.abs(gy - edges.bottom) < threshold ||
        //       Math.abs(gy - centerY) < threshold
        //   );

        //   setGuides({
        //     x: nearX ? [nearX] : [],
        //     y: nearY ? [nearY] : [],
        //   });
        // }}
        onDragEnd={(e) => {
          updateText(el.id, { x: e.target.x(), y: e.target.y() });
          // setGuides({ x: [], y: [] });
        }}
        onTransformEnd={(e) => {
          const node = e.target as any;
          // const scaleX = node.scaleX();
          // const scaleY = node.scaleY();
          // node.scaleX(1);
          // node.scaleY(1);
          // updateText(el.id, {
          //   x: node.x(),
          //   y: node.y(),
          //   rotation: node.rotation(),
          //   fontSize: Math.round(node.fontSize() * scaleY),
          //   width: Math.round(width * scaleX),
          //   height: Math.round(height * scaleY),
          // });
          updateText(el.id, {
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            fontSize: Math.round(
              node.fontSize() * node.scaleY() * (flip >= 0 ? 1 : -1),
            ),
            width: Math.round(width * node.scaleX()),
            height: Math.round(height * node.scaleY() * (flip >= 0 ? 1 : -1)),
          });
          node.scaleX(1);
          node.scaleY(flip >= 0 ? 1 : -1);
          // console.log(
          //   "x:",
          //   node.x(),
          //   "y:",
          //   node.y(),
          //   "fontSize:",
          //   Math.round(node.fontSize() * scaleY),
          //   "width:",
          //   Math.round(width * scaleX),
          //   "height:",
          //   Math.round(height * scaleY),
          //   "flip:",
          //   flip >= 0 ? 1 : -1,
          //   "after:",
          //   "fontSize:",
          //   Math.round(node.fontSize() * scaleY * (flip >= 0 ? 1 : -1)),
          //   "width:",
          //   Math.round(width * scaleX),
          //   "height:",
          //   Math.round(height * scaleY * (flip >= 0 ? 1 : -1)),
          //   "node scale:",
          //   node.scaleX(),
          //   node.scaleY(flip >= 0 ? 1 : -1),
          // );
        }}
      />
    </>
  );
};

export default CanvasTextItem;

// Helper untuk menghitung bounding box text menggunakan Canvas API browser
function measureText(el: TextItem) {
  if (typeof window === "undefined") {
    // SSR fallback
    return { width: el.fontSize * el.text.length * 0.6, height: el.fontSize * 1.2 };
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return { width: 100, height: el.fontSize };
  ctx.font = `${el.fontSize}px ${el.font ?? "sans-serif"}`;
  const metrics = ctx.measureText(el.text);
  const width  = metrics.width * 1.1;
  const height = el.fontSize * 1.2;
  return { width, height };
}