import Konva from "konva";
import { ExportArea } from "./types";
import { Side, TextureItem } from "@/store/design-store";
export interface ExportableModel {
  getExportAreas(): ExportArea[];
}
interface ExportParams {
  drag: Konva.Stage | null;
  model: ExportableModel;
  main: Konva.Group; // root visual group (ModelRenderer + DesignLayer)
  group: Konva.Group;
  width: number;
  height: number;
  side: Side;
  setTexture: (payload: TextureItem) => void;
}
export function exportModelTextures({
  drag,
  model,
  main,
  group,
  width,
  height,
  side,
  setTexture,
}: ExportParams) {
  const stage = group.getStage();
  if (!stage || !drag) return;

  // Pastikan tidak ada transform liar
  const originalTransform = {
    x: main.x(),
    y: main.y(),
    scaleX: main.scaleX(),
    scaleY: main.scaleY(),
    rotation: main.rotation(),
  };

  // Reset transform agar export presisi
  main.position({ x: 0, y: 0 });
  main.scale({ x: side === "inner" ? -1 : 1, y: 1 });
  // main.scale({ x: 1, y: 1 });
  main.rotation(0);
  model.getExportAreas().forEach((area) => {
    // Jika flip (inner side), adjust koordinat X
    const exportX =
      side === "inner"
        ? -(area.x + area.width - width) // Balik koordinat X
        : area.x - width;

    const uri = group.toDataURL({
      x: drag.x() + exportX,
      y: drag.y() + area.y - height,
      width: area.width,
      height: area.height,
      pixelRatio: 2,
      mimeType: "image/png",
    });

    setTexture({
      id: area.id,
      design: uri,
      side,
    });
  });

  // Restore transform
  main.position({ x: originalTransform.x, y: originalTransform.y });
  main.scale({ x: originalTransform.scaleX, y: originalTransform.scaleY });
  main.rotation(originalTransform.rotation);
}
