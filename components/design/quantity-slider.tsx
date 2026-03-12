import React from "react";
interface QuantitySliderProps {
  qty: number;
  setQty: (q: number) => void;
}
export default function QuantitySlider({ qty, setQty }: QuantitySliderProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[9px] text-muted-foreground">Qty</span>
      <input
        type="range"
        min={50}
        max={10000}
        step={50}
        value={qty}
        onChange={(e) => setQty(Number.parseInt(e.target.value))}
        className="w-full"
        aria-label="Jumlah pesanan"
      />
      <input
        type={"number"}
        min={50}
        max={10000}
        step={50}
        value={qty}
        onChange={(e) => setQty(Number.parseInt(e.target.value || "0"))}
        className="w-20 rounded bg-background px-2 py-1 text-sm text-end border"
      />
    </div>
  );
}