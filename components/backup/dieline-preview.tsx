"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Canvas,
  Rect,
  Line,
  Textbox,
  FabricImage,
  Point,
  type CanvasEvents,
  FabricObject,
  FabricObjectProps,
  ObjectEvents,
  SerializedObjectProps,
} from "fabric";
import {
  RotateCcw,
  RotateCw,
  MousePointer,
  Hand,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDesignStore } from "@/store/design-store";

type Mode = "select" | "pan" | "rotate";

export default function DielinePreview() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasInstance = useRef<Canvas | null>(null);
  const [mode, setMode] = useState<Mode>("select");
  const [side, setSide] = useState<"outer" | "inner">("outer");
  const isDragging = useRef(false);
  const lastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const boxColor = useDesignStore((s) => s.boxColor);
  const size = useDesignStore((s) => s.size);
  const canvasWidth = 800;
  const canvasHeight = 600;
  const dielineData = generateDieline(size, canvasWidth, canvasHeight);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new Canvas(canvasRef.current, {
      backgroundColor: "#f8f9fa",
      selection: true,
      preserveObjectStacking: true,
    });
    canvasInstance.current = canvas;

    // helper to normalize pointer/touch/mouse events to { x, y }
    const getClientXY = (e: any) => {
      if (!e) return { x: 0, y: 0 };
      // Mouse/Pointer events
      if ("clientX" in e && "clientY" in e) {
        return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
      }
      // Touch events
      if (e.touches && e.touches[0]) {
        return {
          x: (e.touches[0] as Touch).clientX - 100,
          y: (e.touches[0] as Touch).clientY,
        };
      }
      return { x: 0, y: 0 };
    };

    // Bersihkan dulu
    canvas.clear();

    // Tambah garis
    dielineData?.lines?.forEach((l) => {
      const line = new Line([l.x1, l.y1, l.x2, l.y2], {
        stroke: "#333",
        strokeWidth: 1,
        selectable: false,
      });
      canvas.add(line);
    });

    // Tambah persegi
    dielineData?.rects?.forEach((r) => {
      const rect = new Rect({
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
        fill: "rgba(0,0,0,0)",
        stroke: "#007bff",
        strokeWidth: 1.5,
        selectable: false,
      });
      canvas.add(rect);
    });

    // Tambah teks
    dielineData?.texts?.forEach((t) => {
      const text = new Textbox(t.text, {
        left: t.left,
        top: t.top,
        fontSize: 14,
        fill: "#111",
        fontWeight: "bold",
        selectable: false,
      });
      canvas.add(text);
    });

    // Tambah gambar (asinkron)
    dielineData?.images?.forEach((imgData) => {
      (FabricImage as any).fromURL(imgData.url, (img: any) => {
        img.set({
          left: imgData.left,
          top: imgData.top,
          scaleX: imgData.scale ?? 1,
          scaleY: imgData.scale ?? 1,
          selectable: false,
        });
        canvas.add(img);
        canvas.requestRenderAll();
      });
    });
    // Zoom scroll
    canvas.on("mouse:wheel", (opt) => {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.min(Math.max(zoom, 0.5), 5);
      canvas.zoomToPoint(new Point(opt.e.offsetX, opt.e.offsetY), zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // Pan mode (drag canvas)
    canvas.on("mouse:down", (opt) => {
      if (mode === "pan") {
        opt.e.preventDefault();
        isDragging.current = true;
        const pos = getClientXY(opt.e);
        lastPos.current = { x: pos.x, y: pos.y };
        canvas.setCursor("grabbing");
      }
    });

    canvas.on("mouse:move", (opt) => {
      if (isDragging.current && mode === "pan") {
        const vpt = canvas.viewportTransform!;
        const pos = getClientXY(opt.e);
        vpt[4] += pos.x - lastPos.current.x;
        vpt[5] += pos.y - lastPos.current.y;
        canvas.requestRenderAll();
        lastPos.current = { x: pos.x, y: pos.y };
      }
    });

    canvas.on("mouse:up", () => {
      isDragging.current = false;
      canvas.setCursor(mode === "pan" ? "grab" : "default");
    });

    canvas.set({ enableRetinaScaling: false });
    canvas.renderAll();

    return () => {
      void canvas.dispose();
    };
  }, [dielineData, mode]);

  const zoomIn = () => {
    const canvas = canvasInstance.current;
    if (!canvas) return;
    const zoom = canvas.getZoom() * 1.1;
    canvas.zoomToPoint(new Point(400, 300), Math.min(zoom, 5));
  };
  const zoomOut = () => {
    const canvas = canvasInstance.current;
    if (!canvas) return;
    const zoom = canvas.getZoom() / 1.1;
    canvas.zoomToPoint(new Point(400, 300), Math.max(zoom, 0.5));
  };

  // 🔄 Rotate view
  const rotate = (dir: "cw" | "ccw") => {
    const canvas = canvasInstance.current;
    if (!canvas) return;
    const angle = dir === "cw" ? 5 : -5;
    canvas.getObjects().forEach((obj) => {
      obj.rotate((obj.angle || 0) + angle);
    });
    canvas.requestRenderAll();
  };

  // 🎨 Ganti sisi
  const toggleSide = () => {
    setSide(side === "outer" ? "inner" : "outer");
  };

  // 🔘 Mode handler
  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    const canvas = canvasInstance.current;
    if (!canvas) return;
    canvas.selection = newMode === "select";
    if (newMode === "pan") {
      // Nonaktifkan area seleksi dan seleksi objek
      canvas.selection = false;
      canvas.forEachObject((obj) => (obj.selectable = false));
      canvas.setCursor("grab");
    } else if (newMode === "select") {
      // Aktifkan kembali seleksi objek
      canvas.selection = true;
      canvas.forEachObject((obj) => (obj.selectable = true));
      canvas.setCursor("default");
    }
  };

  return (
    <div className="relative w-full h-full flex justify-center items-center">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className=""
      />

      {/* Panel kanan */}
      <div className="absolute right-4 top-12 flex flex-col gap-2">
        <Button
          variant={mode === "select" ? "default" : "outline"}
          size="icon"
          onClick={() => switchMode("select")}
        >
          <MousePointer size={18} />
        </Button>
        <Button
          variant={mode === "pan" ? "default" : "outline"}
          size="icon"
          onClick={() => switchMode("pan")}
        >
          <Hand size={18} />
        </Button>
        <Button variant="outline" size="icon" onClick={() => rotate("ccw")}>
          <RotateCcw size={18} />
        </Button>
        <Button variant="outline" size="icon" onClick={() => rotate("cw")}>
          <RotateCw size={18} />
        </Button>
        <Button variant="outline" size="icon" onClick={zoomIn}>
          <ZoomIn size={18} />
        </Button>
        <Button variant="outline" size="icon" onClick={zoomOut}>
          <ZoomOut size={18} />
        </Button>
      </div>

      {/* Tombol bawah tengah */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <Button onClick={toggleSide} className="px-6">
          {side === "outer" ? "Tampilkan Sisi Dalam" : "Tampilkan Sisi Luar"}
        </Button>
      </div>
    </div>
  );
}

function generateDieline(
  size: { length: number; width: number; height: number; depth: number },
  canvasWidth = 800,
  canvasHeight = 600
) {
  const { length, width, height, depth } = size;

  // Total ukuran lembaran dieline (4 panel + 1 flap)
  const totalWidth = length * 2 + width * 2 + depth;
  const totalHeight = height + width * 2;

  // Offset agar dieline di tengah canvas
  const offsetX = (canvasWidth - totalWidth) / 2;
  const offsetY = (canvasHeight - totalHeight) / 2;

  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const rects: { left: number; top: number; width: number; height: number }[] =
    [];
  const texts: { text: string; left: number; top: number }[] = [];

  // Persegi utama dieline
  rects.push({
    left: offsetX,
    top: offsetY,
    width: totalWidth,
    height: totalHeight,
  });

  // Garis vertikal antar panel (4 sisi + flap)
  let x = offsetX;
  const panels = [width, length, width, length, depth];
  for (let i = 0; i <= panels.length; i++) {
    lines.push({
      x1: x,
      y1: offsetY,
      x2: x,
      y2: offsetY + totalHeight,
    });
    if (i < panels.length) x += panels[i];
  }

  // Garis horizontal lipatan (atas & bawah)
  lines.push({
    x1: offsetX,
    y1: offsetY + width,
    x2: offsetX + totalWidth,
    y2: offsetY + width,
  });
  lines.push({
    x1: offsetX,
    y1: offsetY + width + height,
    x2: offsetX + totalWidth,
    y2: offsetY + width + height,
  });

  // Label sisi
  const labels = ["Samping", "Depan", "Samping", "Belakang"];
  let labelX = offsetX + width / 2;
  labels.forEach((label, i) => {
    texts.push({
      text: label,
      left: labelX + (i % 2 === 0 ? 0 : length / 2),
      top: offsetY + width + height / 2 - 8,
    });
    labelX += i % 2 === 0 ? width : length;
  });

  return { lines, rects, texts };
}
