import { HexColorPicker } from "react-colorful";
import {
  ColorStop,
  ColorType,
  GradientColor,
  Side,
  useDesignStore,
} from "@/store/design-store";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pipette, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
export function uid() {
  return Math.random().toString(36).slice(2, 8);
}
export function buildGradientCSS(stops: ColorStop[], angle: number, isLinear: boolean = false) {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const parts = sorted.map((s) => `${s.color} ${s.position}%`).join(", ");
  return `linear-gradient(${angle}deg, ${parts})`;
}
export function buildGradientCSSFlat(stops: ColorStop[]): string {
  return buildGradientCSS(stops, 90); // 90deg = kiri ke kanan, representasi natural 0–100%
}
function GradientStopSlider({
  stops,
  activeId,
  onSelect,
  onMove,
  onAdd,
  gradientCSS,
}: {
  stops: ColorStop[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, position: number) => void;
  onAdd: (position: number) => void;
  gradientCSS: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const posFromEvent = (e: React.MouseEvent | MouseEvent) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    return Math.min(
      100,
      Math.max(0, ((e.clientX - rect.left) / rect.width) * 100),
    );
  };
  const handleTrackClick = (e: React.MouseEvent) => {
    // Don't fire when clicking on a stop handle
    if ((e.target as HTMLElement).dataset.stopHandle) return;
    onAdd(posFromEvent(e));
  };

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(id);

    const onMove_ = (mv: MouseEvent) => onMove(id, posFromEvent(mv));
    const onUp = () => {
      window.removeEventListener("mousemove", onMove_);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove_);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      ref={trackRef}
      className="relative h-6 rounded-md cursor-crosshair select-none"
      style={{ background: gradientCSS }}
      onClick={handleTrackClick}
    >
      <div className="absolute inset-0 rounded-md ring-1 ring-black/10 pointer-events-none" />
      {stops.map((stop) => (
        <div
          key={stop.id}
          data-stop-handle="true"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 cursor-grab active:cursor-grabbing shadow-md transition-shadow",
            activeId === stop.id
              ? "border-blue-500 ring-2 ring-blue-300 ring-offset-1 z-10"
              : "border-white z-0",
          )}
          style={{
            left: `calc(${stop.position}% - 8px)`,
            backgroundColor: stop.color,
          }}
          onMouseDown={(e) => handleMouseDown(stop.id, e)}
        />
      ))}
    </div>
  );
}
function AngleControl({
  angle,
  onChange,
}: {
  angle: number;
  onChange: (a: number) => void;
}) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const angleFromEvent = (e: MouseEvent | React.MouseEvent) => {
    if (!wheelRef.current) return 0;
    const rect = wheelRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rad = Math.atan2(e.clientY - cy, e.clientX - cx);
    let deg = Math.round((rad * 180) / Math.PI) + 90;
    if (deg < 0) deg += 360;
    return deg % 360;
  };
  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    onChange(angleFromEvent(e));
    const onMove = (mv: MouseEvent) => onChange(angleFromEvent(mv));
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
  const indicatorRad = ((angle - 90) * Math.PI) / 180;
  const r = 10;
  const ix = 16 + r * Math.cos(indicatorRad);
  const iy = 16 + r * Math.sin(indicatorRad);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-10">Angle</span>
      <div
        ref={wheelRef}
        onMouseDown={startDrag}
        className={cn(
          "relative w-8 h-8 rounded-full border-2 border-gray-200 cursor-pointer flex-shrink-0",
          dragging && "border-blue-400",
        )}
        style={{
          background:
            "conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
          boxShadow: "inset 0 0 0 4px white",
        }}
      >
        <div
          className="absolute w-2 h-2 rounded-full bg-gray-800 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: ix, top: iy }}
        />
      </div>
      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
        <Input
          type="number"
          min={0}
          max={360}
          value={angle}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) onChange(((v % 360) + 360) % 360);
          }}
          className="w-20 border-0 text-sm text-center focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
        />
        <span className="text-xs text-gray-400 pr-2">°</span>
      </div>
    </div>
  );
}
interface FacecolorPopoverParams {
  side: Side;
}
export default function FacecolorPopover({ side }: FacecolorPopoverParams) {
  const [tab, setTab] = useState<ColorType>("solid");
  const faceColors = useDesignStore((s) => s.faceColors);
  const setFaceColors = useDesignStore((s) => s.setFaceColors);
  const activeShape = useDesignStore((s) => s.activeShape);
  const setActiveShape = useDesignStore((s) => s.setActiveShape);
  const pickerPosition = useDesignStore((s) => s.pickerPosition);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const recommendedColors = [
    "transparent",
    "#CDAD85",
    "#201B15",
    "#D9CEBF",
    "#786B5A",
    "#6C583A",
    "#644A39",
    "#997245",
  ];
  const currentColor = faceColors.find(
    (s) => s.id === activeShape && s.side === side,
  );
  const defaultGradient: GradientColor = {
    angle: 90,
    stops: [
      { id: uid(), color: "#79e900", position: 0 },
      { id: uid(), color: "#4a90e2", position: 100 },
    ],
  };
  const gradient: GradientColor =
    (faceColors
      .filter((s) => s.type === "gradient")
      .find((s) => s.id === activeShape && s.side === side)
      ?.color as GradientColor) || defaultGradient;
  const solidColor =
    (faceColors
      .filter((s) => s.type === "solid")
      .find((s) => s.id === activeShape && s.side === side)?.color as string) ||
    "transparent";
  const setSolidColor = (hex: string) => {
    if (!activeShape) return;
    setFaceColors({
      id: activeShape,
      type: "solid",
      color: hex,
      side,
    });
  };
  const [activeStopId, setActiveStopId] = useState<string | null>(
    gradient.stops[0]?.id ?? null,
  );
  const activeStop = gradient.stops.find((s) => s.id === activeStopId) ?? null;
  const updateGradient = useCallback(
    (patch: Partial<GradientColor>) => {
      if (!activeShape) return;
      setFaceColors({
        id: activeShape,
        type: "gradient",
        color: { ...gradient, ...patch } as GradientColor,
        side,
      });
    },
    [gradient, activeShape, setFaceColors, side],
  );
  const updateStop = (id: string, patch: Partial<ColorStop>) => {
    updateGradient({
      stops: gradient.stops.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  };
  const addStop = (position: number) => {
    // Interpolate color at that position from existing stops
    const sorted = [...gradient.stops].sort((a, b) => a.position - b.position);
    let color = sorted[0]?.color ?? "#000000";
    for (let i = 0; i < sorted.length - 1; i++) {
      if (
        position >= sorted[i].position &&
        position <= sorted[i + 1].position
      ) {
        color = sorted[i].color; // simple: use left stop color
        break;
      }
    }
    const id = uid();
    const newStop: ColorStop = { id, color, position: Math.round(position) };
    updateGradient({ stops: [...gradient.stops, newStop] });
    setActiveStopId(id);
  };
  const removeStop = (id: string) => {
    if (gradient.stops.length <= 2) return;
    const remaining = gradient.stops.filter((s) => s.id !== id);
    updateGradient({ stops: remaining });
    setActiveStopId(remaining[0]?.id ?? null);
  };

  const gradientCSS = buildGradientCSS(gradient.stops, gradient.angle);
  const flatGradientCSS = buildGradientCSSFlat(gradient.stops);
  const handleTabChange = (t: string) => {
    setTab(t as ColorType);
    if (t === "solid") {
      setSolidColor(solidColor);
    } else {
      updateGradient(defaultGradient);
      setActiveStopId(defaultGradient.stops[0].id);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isInsidePopover =
        target.closest("[data-radix-popper-content-wrapper]") !== null;
      const isInsideTrigger = pickerRef.current?.contains(target);
      if (!isInsideTrigger && !isInsidePopover) {
        setActiveShape(null);
        setIsPopoverOpen(false);
      }
    };
    if (activeShape) {
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeShape]);
  const handleOpenChange = (open: boolean) => {
    setIsPopoverOpen(open);
    if (!open) {
      setActiveShape(null);
    }
  };
  return (
    <>
      {activeShape && (
        <div
          ref={pickerRef}
          className="absolute bg-white rounded-lg shadow-lg p-1 border border-gray-200"
          style={{
            left: `${pickerPosition.x}px`,
            top: `${pickerPosition.y}px`,
            transform: "translate(-50%, -100%)",
            zIndex: 1000,
          }}
        >
          <Popover open={isPopoverOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 rounded px-2 py-1 transition-colors">
                <div
                  className="relative w-6 h-6 rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, red, orange, yellow, green, cyan, blue, magenta, red)",
                  }}
                >
                  <div
                    className="absolute inset-[2px] rounded-full border-1 border-white"
                    style={
                      currentColor?.type === "gradient"
                        ? {
                            background: gradientCSS,
                          }
                        : solidColor === "transparent"
                          ? {
                              backgroundColor: "white",
                              backgroundImage:
                                "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)",
                              backgroundSize: "8px 8px",
                              backgroundPosition: "0 0, 4px 4px",
                            }
                          : {
                              backgroundColor: solidColor,
                            }
                    }
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Face color
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="start">
              <Tabs
                value={tab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="w-full mb-3 h-8 bg-gray-100 rounded-lg p-0.5">
                  <TabsTrigger
                    value="solid"
                    className="flex-1 h-7 text-xs rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    Solid
                  </TabsTrigger>
                  <TabsTrigger
                    value="gradient"
                    className="flex-1 h-7 text-xs rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    Gradient
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="solid" className="space-y-3 mt-0">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Recommend
                    </h3>
                    <div className="flex gap-2">
                      {recommendedColors.map((color, index) => (
                        <button
                          key={index}
                          className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 ${
                            solidColor === color
                              ? "border-purple-500 ring-2 ring-purple-200"
                              : "border-gray-300"
                          }`}
                          style={{
                            backgroundColor:
                              color === "transparent" ? "white" : color,
                            backgroundImage:
                              color === "transparent"
                                ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)"
                                : "none",
                            backgroundSize:
                              color === "transparent" ? "8px 8px" : "auto",
                            backgroundPosition:
                              color === "transparent" ? "0 0, 4px 4px" : "0 0",
                          }}
                          onClick={() => {
                            if (activeShape) {
                              setSolidColor(color);
                            }
                          }}
                        ></button>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-gray-200 my-4"></div>
                  <ColorPicker color={solidColor} updateColor={setSolidColor} />
                </TabsContent>
                <TabsContent value="gradient" className="space-y-3 mt-0">
                  <GradientStopSlider
                    stops={gradient.stops}
                    activeId={activeStopId}
                    onSelect={setActiveStopId}
                    onMove={(id, pos) =>
                      updateStop(id, { position: Math.round(pos) })
                    }
                    onAdd={addStop}
                    gradientCSS={flatGradientCSS}
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {gradient.stops.length} stop
                      {gradient.stops.length !== 1 ? "s" : ""}
                      {activeStop ? ` · ${activeStop.position}%` : ""}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        title="Remove selected stop"
                        disabled={!activeStopId || gradient.stops.length <= 2}
                        onClick={() => activeStopId && removeStop(activeStopId)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        title="Add stop at midpoint"
                        onClick={() => addStop(50)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <AngleControl
                    angle={gradient.angle}
                    onChange={(a) => updateGradient({ angle: a })}
                  />
                  {activeStop && (
                    <ColorPicker
                      color={activeStop.color}
                      updateColor={(c) =>
                        updateStop(activeStop.id, { color: c })
                      }
                    />
                  )}
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </>
  );
}
interface ColorPickerProps {
  color: string;
  updateColor: (newColor: string) => void;
}
export function ColorPicker({ color, updateColor }: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(color);
  useEffect(() => {
    setHexInput(color);
  }, [color]);
  return (
    <div className="space-y-2">
      <div className="flex justify-center items-center h-50">
        <HexColorPicker
          className="w-64 h-48"
          color={color}
          onChange={(newColor) => {
            updateColor(newColor);
          }}
        />
      </div>

      <div className="flex gap-2 items-center">
        <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
          <div
            className="p-3 w-6 h-6 rounded-full border border-gray-300"
            style={{ backgroundColor: color }}
          />
          <Input
            type="text"
            value={hexInput}
            onChange={(e) => {
              const value = e.target.value.toLowerCase();
              setHexInput(value);
              // Only update color if it's a valid complete hex
              if (/^#[0-9A-F]{6}$/i.test(value)) {
                updateColor(value);
              }
            }}
            onBlur={() => {
              // Reset to current color if invalid on blur
              if (!/^#[0-9A-F]{6}$/i.test(hexInput)) {
                setHexInput(color);
              }
            }}
            className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            placeholder="#000000"
            maxLength={7}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={(e) => {
            e.stopPropagation();
            if ("EyeDropper" in window) {
              const eyeDropper = new (window as any).EyeDropper();
              eyeDropper
                .open()
                .then((result: any) => {
                  updateColor(result.sRGBHex);
                })
                .catch((error: any) => {
                  console.log("User canceled or error:", error);
                });
            } else {
              console.log("EyeDropper API not supported");
              alert("Color picker not supported in this browser");
            }
          }}
        >
          <Pipette className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
