import { useDesignStore } from "@/store/design-store";
import React from "react";
import { Button } from "../ui/button";
export default function SideOption() {
  const model = useDesignStore((s) => s.model);
  const side = useDesignStore((s) => s.side);
  const setSide = useDesignStore((s) => s.setSide);
  if (model === "shopping") return <></>;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-12/10 z-50 backdrop-blur-md bg-white/80 border shadow-xl rounded-xl">
      <div className="flex rounded-lg overflow-hidden shadow-lg border bg-background">
        {/* {material[side].id === "brown_kraft" || material[side].id === "white_kraft" ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={side === "inner" ? "secondary" : "default"}
                  className="rounded-none"
                  // disabled
                >
                  Sisi Dalam
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Material Brown Kraft atau White Kraft hanya bisa cetak sisi luar
              </TooltipContent>
            </Tooltip>
          ) : ( */}
        <Button
          variant={side === "outer" ? "default" : "secondary"}
          onClick={() => {
            if (side !== "outer") {
              // clearSelection();
              setSide("outer");
            }
          }}
          className={`rounded-none ${side === "outer" ? "" : "cursor-pointer"}`}
          // disabled={side === "outer"}
        >
          Sisi Luar
        </Button>
        <Button
          variant={side === "inner" ? "default" : "secondary"}
          onClick={() => {
            if (side !== "inner") {
              // clearSelection();
              setSide("inner");
            }
          }}
          className={`rounded-none ${side === "inner" ? "" : "cursor-pointer"}`}
          // disabled={side === "inner"}
        >
          Sisi Dalam
        </Button>
        {/* )} */}
      </div>
    </div>
  );
}
