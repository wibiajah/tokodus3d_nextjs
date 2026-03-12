import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import React from "react";
import { Printing, useDesignStore, type ImageItem } from "@/store/design-store";
import Konva from "konva";

export interface CanvasImageItemProps {
  el: ImageItem;
  mode: "select" | "pan";
  flip: number;
  printing: Printing;
  setSelectedId: (id: string) => void;
  updateImage: (id: string, patch: Partial<CanvasImageItemProps["el"]>) => void;
  dielineGuides: { x: number[]; y: number[] };
  setGuides: (g: { x: number[]; y: number[] }) => void;
}

export const CanvasImageItem: React.FC<CanvasImageItemProps> = ({
  el,
  mode,
  flip,
  printing,
  setSelectedId,
  updateImage,
  dielineGuides,
  setGuides,
}) => {
  const [img] = useImage(el.dataUrl);
  const imageRef = React.useRef<Konva.Image>(null);
  // Jika visible: false, jangan render sama sekali
  if (el.visible === false) return null;
  React.useEffect(() => {
    const node = imageRef.current;
    if (!node) return;
    node.cache();
    node.getLayer()?.batchDraw();
  }, [printing, img]);
  return (
    <KonvaImage
      ref={imageRef}
      key={el.id}
      id={el.id}
      image={img}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      draggable={mode === "select"}
      scaleX={flip}
      filters={printing === "eco" ? [Konva.Filters.Grayscale] : []}
      onClick={() => mode === "select" && setSelectedId(el.id)}
      onDragMove={(e) => {
        const node = e.target;
        const box = node.getClientRect();
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        const edges = {
          left: box.x,
          right: box.x + box.width,
          top: box.y,
          bottom: box.y + box.height,
        };

        const threshold = 3;

        const nearX = dielineGuides.x.find(
          (gx) =>
            Math.abs(gx - edges.left) < threshold ||
            Math.abs(gx - edges.right) < threshold ||
            Math.abs(gx - centerX) < threshold
        );
        const nearY = dielineGuides.y.find(
          (gy) =>
            Math.abs(gy - edges.top) < threshold ||
            Math.abs(gy - edges.bottom) < threshold ||
            Math.abs(gy - centerY) < threshold
        );

        setGuides({
          x: nearX ? [nearX] : [],
          y: nearY ? [nearY] : [],
        });
      }}
      onDragEnd={(e) => {
        updateImage(el.id, { x: e.target.x(), y: e.target.y() });
        setGuides({ x: [], y: [] });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        updateImage(el.id, {
          x: node.x(),
          y: node.y(),
          width: node.width() * node.scaleX(),
          height: node.height() * node.scaleY(),
        });
        node.scaleX(1);
        node.scaleY(1);
      }}
    />
  );
};

export default CanvasImageItem;
