import React from "react";
import { useDesignStore } from "@/store/design-store";
export default function VerticalSlider() {
  const qty = useDesignStore((s) => s.quantity);
  const setQty = useDesignStore((s) => s.setQuantity);
  return (
    <div className="flex flex-col items-center w-8">
      <span className="text-[9px] text-muted-foreground font-medium">Qty</span>
      <span className="text-[9px] text-muted-foreground">10k</span>
      <input
        type="range"
        min={50}
        max={10000}
        step={50}
        value={qty}
        onChange={(e) => setQty(Number.parseInt(e.target.value))}
        aria-label="Jumlah pesanan"
        className="h-96 cursor-pointer"
        style={{
          writingMode: "vertical-lr",
          direction: "rtl",
          WebkitAppearance: "slider-vertical",
        }}
      />
      <span className="text-[9px] text-muted-foreground">50</span>
    </div>
  );
}