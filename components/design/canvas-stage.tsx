"use client";
import { useDesignStore } from "@/store/design-store";
import { ModelSelector } from "./model-selector";
import { SizeForm, MaterialPicker } from "./size-material-form";
import { TextEditor } from "./text-editor";
import { ProjectPanel } from "./project-panel";
import Uploader from "./uploader";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import DielineStage from "../two/dieline-stage";
import ThreePreview from "../three/preview";
export default function CanvasStage() {
  const mode = useDesignStore((s) => s.mode);
  const active = useDesignStore((s) => s.activePanel);
  const isVisible = useDesignStore((s) => s.isVisible);
  const setIsVisible = useDesignStore((s) => s.setIsVisible);
  return (
    <div className="relative h-[calc(100dvh-96px)]">
      {mode === "2d" &&(<div className={cn("absolute left-3 top-3", isVisible ? "z-20" : "-z-10")}>
        <Button
          size="sm"
          variant="secondary"
          className="mb-2 shadow-md"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? "Hide Panel" : "Show Panel"}
        </Button>
        <div
          className={cn(
            "transition-all duration-300 ease-in-out rounded-md border bg-background/95 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/75 w-[320px]",
            isVisible
              ? "opacity-100 translate-x-0"
              : "-z-10 opacity-0 -translate-x-[340px] pointer-events-none"
          )}
        >
          {active === "model" && <ModelSelector />}
          {active === "size" && <SizeForm />}
          {active === "material" && <MaterialPicker />}
          {active === "upload" && <Uploader />}
          {active === "text" && <TextEditor />}
          {active === "project" && <ProjectPanel />}
        </div>
      </div>)}
      <div className="z-10 absolute right-3 top-3 z-0 flex items-center gap-2">
        <ModeToggle />
      </div>
      {mode === "2d" ? <DielineStage /> : <ThreePreview />}
    </div>
  );
}
function ModeToggle() {
  const mode = useDesignStore((s) => s.mode);
  const setMode = useDesignStore((s) => s.setMode);
  return (
    <div className="inline-flex overflow-hidden rounded-md border bg-background">
      <button
        className={`px-3 py-1.5 text-xs ${
          mode === "2d" ? "bg-primary text-primary-foreground" : "cursor-pointer"
        }`}
        onClick={() => setMode("2d")}
        aria-pressed={mode === "2d"}
      >
        2D
      </button>
      <button
        className={`px-3 py-1.5 text-xs ${
          mode === "3d" ? "bg-primary text-primary-foreground" : "cursor-pointer"
        }`}
        onClick={() => setMode("3d")}
        aria-pressed={mode === "3d"}
      >
        3D
      </button>
    </div>
  );
}