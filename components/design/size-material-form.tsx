"use client";
import { useDesignStore } from "@/store/design-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Slider } from "@/components/ui/slider";
import { flutePresets } from "./flutewall-config";
import { useModelProtector } from "@/hooks/use-model-protector";
import { ColorPicker } from "../two/facecolor-popover";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  useGramasi,
  MaterialOption,
  useMaterials,
  useMinOrderConfig,
} from "@/lib/swr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// interface MaterialOption {
//   id: string;
//   name: string;
//   dir: string;
// }
// export const materials: MaterialOption[] = [
//   {
//     id: "brown_kraft",
//     name: "Brown Kraft",
//     dir: "/material/brown-kraft.png",
//   },
//   {
//     id: "white_kraft",
//     name: "White Kraft",
//     dir: "/material/white-kraft.png",
//   },
//   {
//     id: "premium_white",
//     name: "Premium White",
//     dir: "/material/premium.png",
//   },
// ];
export function SizeForm() {
  const { protect } = useModelProtector();
  const [warning, setWarning] = useState<string | null>(null);
  const size = useDesignStore((s) => s.size);
  const setSize = useDesignStore((s) => s.setSize);
  const flute = useDesignStore((s) => s.flute); // ⬅️ asumsi sudah ada
  const [tempSize, setTempSize] = useState({
    length: size.length,
    width: size.width,
    height: size.height,
  });
  const handleChange = (key: keyof typeof tempSize, value: number) => {
    setTempSize((prev) => ({ ...prev, [key]: value }));
  };
  const handleApply = () => {
    setSize(tempSize);
  };
  // const handleApply = () => {
  //   const result = protect({
  //     ...tempSize,
  //     depth: size.depth, // kalau depth disimpan di Size
  //   });
  //   // console.log("SizeForm.handleApply result:", result);
  //   if (!result.valid && result.message) {
  //     setWarning(result.message);
  //   } else {
  //     setSize(result.size);
  //     setTempSize({
  //       length: result.size.length,
  //       width: result.size.width,
  //       height: result.size.height,
  //     });
  //     setWarning(null);
  //   }
  // };
  const outerSize = useMemo(() => {
    const preset = flutePresets[flute.key as keyof typeof flutePresets];
    const thicknessCm = preset.val / 10; // mm → cm
    return {
      length: +(tempSize.length + thicknessCm * 2).toFixed(2),
      width: +(tempSize.width + thicknessCm * 2).toFixed(2),
      height: +(tempSize.height + thicknessCm * 2).toFixed(2),
    };
  }, [tempSize, flute.key]);
  return (
    <div className="space-y-4">
      <div className="space-y-4 p-3 rounded-md border border-border/50">
        <h4 className="font-medium text-sm text-muted-foreground">
          Ukuran Dalam Box (cm)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Panjang</Label>
            <Slider
              min={5}
              max={400}
              step={0.1}
              value={[tempSize.length]}
              onValueChange={(v) => handleChange("length", v[0])}
            />
            <Input
              type="number"
              value={tempSize.length}
              onChange={(e) =>
                handleChange("length", Number(e.target.value || 0))
              }
            />
          </div>
          <div>
            <Label>Lebar</Label>
            <Slider
              min={5}
              max={400}
              step={0.1}
              value={[tempSize.width]}
              onValueChange={(v) => handleChange("width", v[0])}
            />
            <Input
              type="number"
              value={tempSize.width}
              onChange={(e) =>
                handleChange("width", Number(e.target.value || 0))
              }
            />
          </div>
          <div>
            <Label>Tinggi</Label>
            <Slider
              min={5}
              max={400}
              step={0.1}
              value={[tempSize.height]}
              onValueChange={(v) => handleChange("height", v[0])}
            />
            <Input
              type="number"
              value={tempSize.height}
              onChange={(e) =>
                handleChange("height", Number(e.target.value || 0))
              }
            />
          </div>
        </div>
        {warning && (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            ⚠️ {warning} — ukuran telah disesuaikan otomatis.
          </div>
        )}
        <div className="flex justify-end">
          <Button size="sm" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </div>
      <div className="space-y-3 p-3 rounded-md border border-dashed bg-muted/30">
        <h4 className="font-medium text-sm text-muted-foreground">
          Ukuran Luar Box (cm)
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label>Panjang</Label>
            <Input value={outerSize.length} disabled />
          </div>
          <div>
            <Label>Lebar</Label>
            <Input value={outerSize.width} disabled />
          </div>
          <div>
            <Label>Tinggi</Label>
            <Input value={outerSize.height} disabled />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Dihitung otomatis dari ukuran dalam + ketebalan flute ({flute.key},{" "}
          {flutePresets[flute.key as keyof typeof flutePresets].val} mm)
        </p>
      </div>
    </div>
  );
}
export function MaterialPicker() {
  const material = useDesignStore((s) => s.material);
  const setMaterial = useDesignStore((s) => s.setMaterial);
  const pw = useDesignStore((s) => s.pw);
  const printing1 = useDesignStore((s) => s.printing1);
  const printing2 = useDesignStore((s) => s.printing2);
  const side = useDesignStore((s) => s.side); // "inner" | "outer"
  const { gramasiList, loading: gramasiLoading } = useGramasi(
    material[side].id,
  );
  const { minOrderConfig } = useMinOrderConfig();
  const materials = useDesignStore((s) => s.materials);
  const quantity = useDesignStore((s) => s.quantity);
  const model = useDesignStore((s) => s.model);
  const gramasi = useDesignStore((s) => s.gramasi);
  const setGramasi = useDesignStore((s) => s.setGramasi);
  const setPW = useDesignStore((s) => s.setPW);
  const innerColor = useDesignStore((s) => s.innerColor);
  const outerColor = useDesignStore((s) => s.outerColor);
  const setInnerColor = useDesignStore((s) => s.setInnerColor);
  const setOuterColor = useDesignStore((s) => s.setOuterColor);
  // Gramasi hardcode untuk Masterbox (shipping) per material id
  const MASTERBOX_GSM: Record<string, string> = {
    "1": "125", // Brown Kraft
    "2": "150", // White Kraft
    "3": "250", // Premium White
  };

  const isShipping = model === "shipping";

  const handleMaterialChange = (m: MaterialOption) => {
    if (model === "shopping") {
      setMaterial("inner", m.id);
      setMaterial("outer", m.id);
    } else {
      setMaterial(side, m.id);
    }
    setPW(side, m.is_premium === "1");

    if (isShipping && MASTERBOX_GSM[m.id]) {
      // Auto-set gramasi inner dan outer sekaligus untuk masterbox
      setGramasi("inner", MASTERBOX_GSM[m.id]);
      setGramasi("outer", MASTERBOX_GSM[m.id]);
    } else {
      setGramasi(side, "");
    }
  };
  const availableMaterials = useMemo(() => {
    if (!minOrderConfig) return materials;
    if (model === "mailer")
      return materials.filter((m) =>
        quantity < minOrderConfig.min_premium_white
          ? m.is_premium !== "1" && [1, 2, 3].includes(parseInt(m.id))
          : [1, 2, 3].includes(parseInt(m.id)),
      );
    if (quantity < minOrderConfig.min_premium_white || model === "shopping")
      return materials.filter((m) => m.is_premium !== "1");
    return materials;
  }, [materials, quantity, minOrderConfig, side, model]);
  useEffect(() => {
    const first = materials[0];
    if (!first) return;
    setMaterial(side, first.id);
  }, []);
  useEffect(() => {
    if (isShipping) return; // Masterbox: gramasi sudah di-set otomatis, skip
    if (gramasiList.length === 0) return;
    const first = gramasiList[0];
    if (!gramasi["inner"]) setGramasi("inner", first.gsm);
    if (!gramasi["outer"]) setGramasi("outer", first.gsm);
  }, [gramasiList, side, material]);
  return (
    <div className="space-y-3">
      {model !== "shopping" && (
        <div className="flex gap-1 text-xs">
          <Button
            variant={side === "outer" ? "default" : "secondary"}
            className={`px-2 py-1 rounded 
             ${side === "outer" ? "" : "cursor-pointer"}`}
            // disabled={side === "outer"}
            onClick={() => {
              if (side !== "outer") useDesignStore.setState({ side: "outer" });
            }}
          >
            Sisi Luar
          </Button>
          <Button
            variant={side === "inner" ? "default" : "secondary"}
            className={`px-2 py-1 rounded 
              ${side === "inner" ? "" : "cursor-pointer"}`}
            // disabled={side === "inner"}
            onClick={() => {
              if (side !== "inner") useDesignStore.setState({ side: "inner" });
            }}
          >
            Sisi Dalam
          </Button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Pilih Material</div>
      </div>
      <div className="grid gap-2">
        {availableMaterials.map((m) => {
          const active = material[side].id === m.id;
          // console.log("active material", material, side, material[side].id, m.id)
          return (
            <Button
              key={m.id}
              variant={active ? "secondary" : "outline"}
              onClick={() => handleMaterialChange(m)}
              className={`flex items-center gap-3 p-3 justify-start text-left transition 
                ${active ? "ring-2 ring-primary bg-accent/70" : ""}
              `}
            >
              <div className="relative h-10 w-16 rounded-sm overflow-hidden border flex-shrink-0">
                <img
                  src={m.dir}
                  alt={m.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{m.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  Deskripsi singkat material.
                </div>
              </div>
            </Button>
          );
        })}
      </div>
      <div>
        <label className="text-sm font-medium">Pilih Gramasi</label>
        {isShipping ? (
          <div className="mt-1 flex h-9 w-full items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
            {gramasi[side] ? `${gramasi[side]} GSM (otomatis)` : "Pilih material terlebih dahulu"}
          </div>
        ) : (
          <Select
            value={gramasi[side]}
            onValueChange={(value) => setGramasi(side, value)}
            disabled={!gramasiList || gramasiList.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Gramasi" />
            </SelectTrigger>
            <SelectContent>
              {gramasiList &&
                gramasiList.map((f) => (
                  <SelectItem key={f.gsm} value={f.gsm}>
                    {f.gsm} GSM
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {((pw[side] &&
        (printing1[side] === "blok" || printing2[side] === "blok")) ||
        (model === "shopping" && material.outer.id !== "20")) && (
        <>
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Pilih Warna</div>
          </div>
          <div className="flex items-center gap-1 transition-colors">
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer rounded px-2 py-1 transition-colors hover:scale-110">
                  <div
                    className="relative w-6 h-6 rounded-full"
                    style={{
                      background:
                        "conic-gradient(from 0deg, red, orange, yellow, green, cyan, blue, magenta, red)",
                    }}
                  >
                    <div
                      className="absolute inset-[2px] rounded-full border-1 border-white"
                      style={{
                        backgroundColor:
                          (side === "inner" ? innerColor : outerColor) ===
                          "transparent"
                            ? "white"
                            : side === "inner"
                              ? innerColor
                              : outerColor,
                        backgroundImage:
                          (side === "inner" ? innerColor : outerColor) ===
                          "transparent"
                            ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)"
                            : "none",
                        backgroundSize:
                          (side === "inner" ? innerColor : outerColor) ===
                          "transparent"
                            ? "8px 8px"
                            : "auto",
                        backgroundPosition:
                          (side === "inner" ? innerColor : outerColor) ===
                          "transparent"
                            ? "0 0, 4px 4px"
                            : "0 0",
                      }}
                    />
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="start">
                <ColorPicker
                  color={side === "inner" ? innerColor : outerColor}
                  updateColor={side === "inner" ? setInnerColor : setOuterColor}
                />
              </PopoverContent>
            </Popover>
            <button
              className={`cursor-pointer mr-2 w-6 h-6 rounded-full border-2 transition-all hover:scale-110 border-gray-300`}
              style={{
                backgroundColor: "transparent",
                backgroundImage:
                  "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)",
                backgroundSize: "8px 8px",
                backgroundPosition: "0 0, 4px 4px",
              }}
              onClick={() => {
                side === "inner"
                  ? setInnerColor("transparent")
                  : setOuterColor("transparent");
              }}
            ></button>
            <button
              className={`cursor-pointer mr-2 w-6 h-6 rounded-full border-2 transition-all hover:scale-110 border-gray-300`}
              style={{
                backgroundColor: "white",
                backgroundImage: "none",
                backgroundSize: "auto",
                backgroundPosition: "0 0",
              }}
              onClick={() => {
                side === "inner"
                  ? setInnerColor("#ffffff")
                  : setOuterColor("#ffffff");
              }}
            ></button>
          </div>
        </>
      )}
    </div>
  );
}