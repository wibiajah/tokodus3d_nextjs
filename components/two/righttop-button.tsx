import React from "react";
import { Button } from "../ui/button";
import { Hand, MousePointer, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { ToolMode } from "@/store/design-store";
interface RighttopButtonParams {
  mode: ToolMode;
  switchMode: (newMode: ToolMode) => void;
  rotate: (dir: "cw" | "ccw") => void;
  zoomIn: () => void;
  zoomOut: () => void;
}
export default function RighttopButton({
  mode,
  switchMode,
  rotate,
  zoomIn,
  zoomOut,
}: RighttopButtonParams) {
  return (
    <div className="absolute right-4 top-12 flex flex-col gap-2 z-50">
      <Button
        variant={mode === "select" ? "default" : "outline"}
        size="icon"
        onClick={() => switchMode("select")}
        title="Select Mode (V)"
      >
        <MousePointer size={18} />
      </Button>
      <Button
        variant={mode === "pan" ? "default" : "outline"}
        size="icon"
        onClick={() => switchMode("pan")}
        title="Pan Mode (H)"
      >
        <Hand size={18} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => rotate("cw")}
        title="Rotate Right"
      >
        <RotateCw size={18} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={zoomIn}
        title="Zoom In (Ctrl +)"
      >
        <ZoomIn size={18} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={zoomOut}
        title="Zoom Out (Ctrl -)"
      >
        <ZoomOut size={18} />
      </Button>
    </div>
  );
}
