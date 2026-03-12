import React from "react";
import { Slider } from "../ui/slider";
import { useDesignStore } from "@/store/design-store";
interface Slider3DProps {
  isFooter: boolean;
}
export default function Slider3D({ isFooter }: Slider3DProps) {
  const openClose = useDesignStore((s) => s.openClose);
  const setOpenClose = useDesignStore((s) => s.setOpenClose);
  return (
    <div
      className={
        isFooter
          ? 
          "fixed bottom-24 left-1/2 -translate-x-4/4 z-50 rounded-md border bg-background/90 px-3 py-2 text-xs shadow-sm text-center"
          :
          "absolute left-1/2 bottom-3 z-10 -translate-x-1/2 rounded-md border bg-background/90 px-3 py-2 text-xs shadow-sm text-center"
      }
    >
      {isFooter && <div className="mb-1">{Math.round(openClose * 100)}%</div>}
      <div className="flex items-center gap-2">
        <span className="w-8 text-left text-muted-foreground">Buka</span>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[Math.round(openClose * 100)]}
          onValueChange={(v) => setOpenClose(v[0] / 100)}
          className="w-40"
          aria-label="Open/Close lid"
        />
        <span className="w-8 text-right text-muted-foreground">Tutup</span>
      </div>
    </div>
  );
}
