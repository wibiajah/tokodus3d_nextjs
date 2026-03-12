"use client";

import React, { useMemo, useRef, useState } from "react";
import { Group, Line, Transformer } from "react-konva";
import Konva from "konva";
import CanvasTextItem from "../canvas/text-render";
import CanvasImageItem from "../canvas/image-render";
import { Side, useDesignStore } from "@/store/design-store";
import { DesignModel } from "@/models/shipping/model";

export type DesignMode = "select" | "pan";

interface DesignLayerProps {
  model: DesignModel;
  texts: any[];
  images: any[];
  mode?: DesignMode;
  flipX: number;
  side: Side;
  width: number;
  height: number;
  onSelect: (id: string) => void;
  onDblClick: (id: string) => void;
}

export function DesignLayer({
  model,
  texts,
  images,
  mode = "select",
  flipX,
  side,
  width,
  height,
  onSelect,
  onDblClick,
}: DesignLayerProps) {
  // const transformerRef = useRef<Konva.Transformer>(null);
  // const [selectedNode, setSelectedNode] = useState<Konva.Node | null>(null);
  const printing = useDesignStore((s) => s.printing);
  const updateText = useDesignStore((s) => s.updateText);
  const updateImage = useDesignStore((s) => s.updateImage);
  // const attachTransformer = (node: Konva.Node | null) => {
  //   setSelectedNode(node);
  //   if (node && transformerRef.current) {
  //     transformerRef.current.nodes([node]);
  //     transformerRef.current.getLayer()?.batchDraw();
  //   }
  // };

  const dieline = useMemo(() => model.getDieline(), [model]);
  const dielineGuides = React.useMemo(() => {
    const xs: number[] = [];
    const ys: number[] = [];
    dieline.lines.forEach((p: any) => {
      for (let i = 0; i < p.points.length; i += 2) {
        xs.push(p.points[i]);
        ys.push(p.points[i + 1]);
      }
    });
    return {
      x: Array.from(new Set(xs)),
      y: Array.from(new Set(ys)),
    };
  }, [dieline]);
  const [guides, setGuides] = useState<{ x: number[]; y: number[] }>({
    x: [],
    y: [],
  });

  // const handleSelect = (
  //   node: Konva.Node | null,
  //   payload: { type: "text" | "image"; id: string | number }
  // ) => {
  //   if (mode !== "select") return;
  //   attachTransformer(node);
  //   onSelect?.(payload);
  // };
  return (
    <>
      {guides.x.map((x) => (
        <Line
          key={`x-${x}`}
          points={[x, 0, x, height]}
          stroke="red"
          dash={[4, 4]}
          strokeWidth={1}
          listening={false}
        />
      ))}
      {guides.y.map((y) => (
        <Line
          key={`y-${y}`}
          points={[0, y, width, y]}
          stroke="red"
          dash={[4, 4]}
          strokeWidth={1}
          listening={false}
        />
      ))}
      <Group>
        {/* ===== Text Items ===== */}
        {texts
          .filter((el) => el.side === side)
          .map((el) => (
            <CanvasTextItem
              key={el.id}
              el={el}
              mode={mode}
              flip={flipX}
              dielineGuides={dielineGuides}
              setGuides={setGuides}
              onSelect={onSelect}
              onDblClick={onDblClick}
              updateText={updateText}
            />
          ))}

        {/* ===== Image Items ===== */}
        {images
          .filter((el) => el.side === side && el.visible !== false) // hanya tampilkan yang visible
          .map((el) => (
            <CanvasImageItem
              key={el.id}
              el={el}
              mode={mode}
              flip={flipX}
              printing={printing}
              setSelectedId={onSelect}
              updateImage={updateImage}
              dielineGuides={dielineGuides}
              setGuides={setGuides}
            />
          ))}

        {/* ===== Transformer ===== */}
        {/* {mode === "select" && (
          <Transformer
            ref={transformerRef}
            rotateEnabled
            flipEnabled={false}
            keepRatio={false}
            boundBoxFunc={(oldBox, newBox) => {
              // prevent negative scale
              if (newBox.width < 5 || newBox.height < 5) return oldBox;
              return newBox;
            }}
          />
        )} */}
      </Group>
    </>
  );
}
